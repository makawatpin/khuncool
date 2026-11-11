// Films shots of the live site for the promo, in a headless Chrome at real
// desktop (1920x1080 @2x) or phone (iPhone 13 @3x) size, after pressing the
// page's own "เต็มจอ" button — the same pixels a fullscreen desktop recording
// would show, without taking over the user's screen.
//
// Frames come from Chrome's screencast (lossless-ish JPEGs with timestamps),
// then ffmpeg turns them into constant-30fps H.264 in public/footage/<shot>.mp4.
//
//   node scripts/record.mjs                 all shots
//   SHOTS=d-duck,m-duck node scripts/record.mjs
//
// Playwright is resolved from the site's node_modules (run with NODE_PATH set
// to ../node_modules, as the npm script does).

import { chromium, devices } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.env.BASE ?? "https://khuncool.com";
const OUT = path.resolve("public/footage");
fs.mkdirSync(OUT, { recursive: true });

// Headless Chrome sizes a fullscreen element to the *window*, and screencast
// frames come out at window pixels. So each device gets its own browser whose
// window (in physical pixels, with the scale factor forced) matches the
// viewport — otherwise fullscreen shrinks to the default 800x600 window.
// Scale factors are a frame-rate trade-off. Measured on the duck race with
// the GPU on: 1x ≈ 47 fps, 1.5x (2880x1620) ≈ 35 fps; 2x without GPU ≈ 6 fps.
// 1.5x stays above 30 fps and leaves room to zoom in. DSF env overrides.
const DSF_DESKTOP = Number(process.env.DSF ?? 1.5);
const DSF_MOBILE = Number(process.env.DSF_MOBILE ?? 2);
const DESKTOP = {
  launch: [`--window-size=${1920 * DSF_DESKTOP},${1080 * DSF_DESKTOP}`, `--force-device-scale-factor=${DSF_DESKTOP}`],
  context: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: DSF_DESKTOP },
};
const MOBILE = {
  launch: [`--window-size=${390 * DSF_MOBILE},${844 * DSF_MOBILE}`, `--force-device-scale-factor=${DSF_MOBILE}`],
  context: {
    // iPhone 13/14-sized screen with no browser UI (Playwright's preset is 390x664).
    viewport: { width: 390, height: 844 }, screen: { width: 390, height: 844 },
    deviceScaleFactor: DSF_MOBILE, isMobile: true, hasTouch: true,
    userAgent: devices["iPhone 13"].userAgent,
  },
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// Eased, frame-by-frame scroll (mouse.wheel jumps in one step, which films as a cut).
const smoothScroll = (page, dy, ms) =>
  page.evaluate(([dy, ms]) => new Promise((done) => {
    const y0 = scrollY, t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      scrollTo(0, y0 + dy * ease(t));
      t < 1 ? requestAnimationFrame(step) : done();
    };
    requestAnimationFrame(step);
  }), [dy, ms]);
const btn = (page, name) => page.getByRole("button", { name }).first();
async function fullscreen(page) {
  await btn(page, /เต็มจอ|^⛶$/).click();
  // With an iPhone user agent some stages use a CSS fullscreen fallback (iOS
  // Safari has no Fullscreen API), so a missing fullscreenElement is fine.
  await page.waitForFunction(() => !!document.fullscreenElement, null, { timeout: 2500 }).catch(() => {});
  await wait(900);
}

// Each shot: setup runs before filming starts; film runs while recording.
const SHOTS = {
  "d-home": {
    device: DESKTOP, url: "/",
    film: async (p) => { await wait(1200); await smoothScroll(p, 1300, 4000); await wait(800); },
  },
  "d-media": {
    device: DESKTOP, url: "/media",
    film: async (p) => { await wait(600); await smoothScroll(p, 1100, 3200); await wait(600); },
  },
  "d-duck": {
    device: DESKTOP, url: "/duck-race",
    setup: async (p) => { await btn(p, /ซ่อนตั้งค่า/).click(); await wait(500); await fullscreen(p); },
    film: async (p) => { await wait(800); await btn(p, /ปล่อยเป็ดแข่ง/).click(); await wait(15000); },
  },
  "d-groups": {
    device: DESKTOP, url: "/group-maker",
    setup: fullscreen,
    film: async (p) => { await wait(700); await btn(p, /สุ่มแบ่งกลุ่ม/).click(); await wait(4500); },
  },
  "d-timer": {
    device: DESKTOP, url: "/timer",
    setup: async (p) => { await fullscreen(p); await btn(p, /^1 นาที$/).click(); },
    film: async (p) => { await wait(600); await btn(p, /เริ่มจับเวลา/).click(); await wait(4500); },
  },
  "d-noise": {
    device: DESKTOP, url: "/classroom-noise-meter",
    setup: fullscreen,
    film: async (p) => { await wait(600); await btn(p, /เริ่มวัดเสียง/).click(); await wait(5000); },
  },
  "d-typing": {
    device: DESKTOP, url: "/media/computer/typing-defense",
    setup: fullscreen,
    film: async (p) => { await wait(1800); await btn(p, /เริ่มฝึกพิมพ์/).click(); await wait(4500); },
  },
  "d-bomb": {
    device: DESKTOP, url: "/media/mathematics/math-bomb-defusal",
    setup: fullscreen,
    film: async (p) => { await wait(1800); await btn(p, /ตั้งค่าภารกิจ/).click(); await wait(4000); },
  },
  "d-santa": {
    device: DESKTOP, url: "/media/english/santa-sleigh",
    setup: fullscreen,
    film: async (p) => { await wait(1800); await btn(p, /ออกเดินทาง/).click(); await wait(5000); },
  },
  "d-vocab": {
    device: DESKTOP, url: "/media/english/vocabulary-arcade",
    setup: fullscreen,
    film: async (p) => { await wait(1800); await btn(p, /เลือกหมวดคำศัพท์/).click(); await wait(4000); },
  },
  "d-density": {
    device: DESKTOP, url: "/media/science/density-lab",
    setup: fullscreen,
    film: async (p) => { await wait(1800); await btn(p, /เริ่มการทดลอง/).click(); await wait(4000); },
  },
  "d-thai": {
    device: DESKTOP, url: "/media/thai/thai-kingdom",
    setup: fullscreen,
    film: async (p) => { await wait(1500); await btn(p, /ฝึกทำ/).hover(); await wait(1200); await btn(p, /รถไฟเก็บคำ/).hover(); await wait(1500); },
  },
  "d-attendance": {
    device: DESKTOP, url: "/tools/attendance",
    setup: fullscreen,
    film: async (p) => {
      await wait(700);
      const come = p.getByRole("button", { name: /^มา$/ });
      const n = await come.count();
      for (let i = 0; i < n; i++) { await come.nth(i).click(); await wait(i === 2 ? 250 : 330); }
      await wait(1500);
    },
  },
  "m-home": {
    device: MOBILE, url: "/",
    film: async (p) => { await wait(1500); await smoothScroll(p, 1500, 4500); await wait(800); },
  },
  "m-duck": {
    device: MOBILE, url: "/duck-race",
    // On a phone the settings panel overlays the track; its toggle is the ⚙ button.
    setup: async (p) => {
      await fullscreen(p);
      const gear = btn(p, /ซ่อนตั้งค่า|ตั้งค่า|⚙/);
      if (await gear.isVisible().catch(() => false)) { await gear.click({ timeout: 5000 }).catch(() => {}); await wait(600); }
    },
    film: async (p) => { await wait(800); await btn(p, /ปล่อยเป็ดแข่ง/).click(); await wait(12000); },
  },
  "m-santa": {
    device: MOBILE, url: "/media/english/santa-sleigh",
    setup: fullscreen,
    film: async (p) => { await wait(1800); await btn(p, /ออกเดินทาง/).click(); await wait(4500); },
  },
  "m-attendance": {
    device: MOBILE, url: "/tools/attendance",
    setup: fullscreen,
    film: async (p) => {
      await wait(700);
      const come = p.getByRole("button", { name: /^มา$/ });
      const n = await come.count();
      for (let i = 0; i < n; i++) {
        await come.nth(i).scrollIntoViewIfNeeded();
        await come.nth(i).click();
        await wait(330);
      }
      await wait(1500);
    },
  },
  "m-timer": {
    device: MOBILE, url: "/timer",
    setup: async (p) => { await fullscreen(p); await btn(p, /^1 นาที$/).click(); },
    film: async (p) => { await wait(600); await btn(p, /เริ่มจับเวลา/).click(); await wait(4000); },
  },
};

// Headless Chrome otherwise renders on the CPU (SwiftShader); the real GPU
// keeps canvas/WebGL games smooth while filming. GPU=0 turns this off.
const GPU_ARGS = ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"];
const browsers = new Map();
async function browserFor(device) {
  if (!browsers.has(device)) {
    browsers.set(device, await chromium.launch({
      args: [...device.launch, ...(process.env.GPU === "0" ? [] : GPU_ARGS), "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"],
    }));
  }
  return browsers.get(device);
}

async function film(name, shot) {
  const browser = await browserFor(shot.device);
  const ctx = await browser.newContext({ ...shot.device.context, locale: "th-TH", permissions: ["microphone"] });
  // Essential-cookies-only, so the consent banner never appears on camera.
  await ctx.addInitScript(() => { try { localStorage.setItem("khuncool.cookieConsent", "essential"); } catch {} });
  const page = await ctx.newPage();
  await page.goto(BASE + shot.url, { waitUntil: "networkidle", timeout: 60_000 });
  await wait(1200);
  if (shot.setup) await shot.setup(page);

  const { viewport, deviceScaleFactor } = shot.device.context;
  const vw = viewport.width * deviceScaleFactor;
  const vh = viewport.height * deviceScaleFactor;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `shot-${name}-`));
  const frames = [];
  const cdp = await ctx.newCDPSession(page);
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    const file = path.join(dir, `${String(frames.length).padStart(5, "0")}.jpg`);
    fs.writeFileSync(file, Buffer.from(data, "base64"));
    frames.push({ file, t: metadata.timestamp });
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: vw, maxHeight: vh, everyNthFrame: 1 });
  await wait(300);
  await shot.film(page);
  const end = Date.now() / 1000;
  await cdp.send("Page.stopScreencast");
  await ctx.close();

  if (frames.length < 2) throw new Error(`only ${frames.length} frames captured`);
  // Variable-rate frames -> concat list with per-frame durations -> CFR 30fps.
  const list = frames.map((f, i) => {
    const next = i + 1 < frames.length ? frames[i + 1].t : Math.max(end, f.t + 0.04);
    return `file '${f.file.replaceAll("\\", "/")}'\nduration ${(next - f.t).toFixed(4)}`;
  });
  list.push(`file '${frames.at(-1).file.replaceAll("\\", "/")}'`);
  const listFile = path.join(dir, "list.txt");
  fs.writeFileSync(listFile, list.join("\n"));
  const out = path.join(OUT, `${name}.mp4`);
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", listFile,
    "-vf", `fps=30,scale=${vw}:${vh}:flags=lanczos,format=yuv420p`,
    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-movflags", "+faststart", out,
  ]);
  const span = frames.at(-1).t - frames[0].t;
  console.log(`${name}: ${frames.length} frames over ${span.toFixed(1)}s (~${(frames.length / span).toFixed(0)} fps captured) -> ${path.relative(process.cwd(), out)}`);
  fs.rmSync(dir, { recursive: true, force: true });
}

const wanted = process.env.SHOTS ? process.env.SHOTS.split(",") : Object.keys(SHOTS);
let failed = 0;
for (const name of wanted) {
  if (!SHOTS[name]) { console.log(`unknown shot ${name}`); failed++; continue; }
  try { await film(name, SHOTS[name]); }
  catch (e) { failed++; console.log(`FAILED ${name}: ${e.message.split("\n")[0]}`); }
}
for (const b of browsers.values()) await b.close();
process.exit(failed ? 1 : 0);
