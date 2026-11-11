/**
 * The keepsake a child takes home: their krathong as a 4:5 poster (good for
 * Facebook, Instagram and LINE) or a 10-second video, with one message of
 * their own across the top and the khuncool logo and address at the bottom.
 *
 * The 3D frame comes from the live scene's capture mode; everything written
 * on top is drawn here with the 2D canvas API.
 */
import type { DesignerScene } from "./three/designerScene";

export type KeepsakeBg = "river" | "studio";

export interface KeepsakeInfo {
  /** the child's own words, shown large across the top; may be empty */
  message: string;
  bg: KeepsakeBg;
}

export const IMAGE_SIZE = { w: 1080, h: 1350 };
export const VIDEO_SIZE = { w: 720, h: 900 };
export const VIDEO_SECONDS = 10;
export const MESSAGE_MAX = 40;
const FONT = 'Anuphan, "Noto Sans Thai", "Sarabun", sans-serif';

export interface KeepsakeAssets { logo: HTMLImageElement | null }

let assetsP: Promise<KeepsakeAssets> | null = null;
export function loadAssets(): Promise<KeepsakeAssets> {
  assetsP ??= (async () => {
    const logo = await new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = "/assets/khuncool-logo.webp";
    });
    // canvas text only uses a web font once it has loaded
    await Promise.all(["700 80px Anuphan", "600 36px Anuphan", "500 36px Anuphan"].map((f) => document.fonts?.load(f, "กระทงabc").catch(() => null)));
    return { logo };
  })();
  return assetsP;
}

/** what the message box starts with, so a child who types nothing still gets a title */
export const defaultMessage = (name: string) => (name.trim() ? `กระทงของ${name.trim()}` : "กระทงของฉัน");

// ------------------------------------------------------------ text helpers

/** Thai has no spaces between words, so break on word boundaries from Intl.Segmenter. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words: string[] = [];
  const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: { granularity: string }) => { segment(s: string): Iterable<{ segment: string }> } }).Segmenter;
  if (Seg) for (const s of new Seg("th", { granularity: "word" }).segment(text)) words.push(s.segment);
  else words.push(...Array.from(text));
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line + w;
    if (ctx.measureText(next).width > maxW && line) {
      lines.push(line.trim());
      line = w.trimStart();
      if (lines.length === maxLines) break;
    } else line = next;
  }
  if (lines.length < maxLines && line.trim()) lines.push(line.trim());
  if (lines.length === maxLines && words.join("").length > lines.join("").length + 1) {
    let last = lines[maxLines - 1];
    while (last && ctx.measureText(last + "…").width > maxW) last = last.slice(0, -1);
    lines[maxLines - 1] = last + "…";
  }
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const seg = (r: number, a: number, b: number) => ease((r - a) / (b - a));

// ------------------------------------------------------------ the poster

/** Draw the whole keepsake. `reveal` 0..1 animates the message in (video); 1 is the finished poster. */
export function drawKeepsake(ctx: CanvasRenderingContext2D, scene3d: CanvasImageSource, info: KeepsakeInfo, assets: KeepsakeAssets, reveal = 1) {
  const { width: w, height: h } = ctx.canvas;
  const s = w / 1080;
  const night = info.bg === "river";
  const message = info.message.trim();

  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(scene3d, 0, 0, w, h);

  // a soft scrim behind the message, and a lighter one behind the logo pill
  if (message) {
    const g = ctx.createLinearGradient(0, 0, 0, h * 0.36);
    g.addColorStop(0, night ? "rgba(4,8,26,.8)" : "rgba(255,247,250,.92)");
    g.addColorStop(1, night ? "rgba(4,8,26,0)" : "rgba(255,247,250,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h * 0.36);
  }
  const gb = ctx.createLinearGradient(0, h * 0.78, 0, h);
  gb.addColorStop(0, night ? "rgba(4,8,26,0)" : "rgba(74,34,51,0)");
  gb.addColorStop(1, night ? "rgba(4,8,26,.6)" : "rgba(74,34,51,.12)");
  ctx.fillStyle = gb;
  ctx.fillRect(0, h * 0.78, w, h * 0.22);

  // the message: as large as fits in two lines
  if (message) {
    const a = seg(reveal, 0.05, 0.45);
    ctx.globalAlpha = a;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    let size = 96 * s;
    let lines: string[] = [];
    for (; size >= 54 * s; size -= 4 * s) {
      ctx.font = `700 ${size}px ${FONT}`;
      lines = wrap(ctx, message, w * 0.84, 3);
      if (lines.length <= 2) break;
    }
    if (lines.length > 2) lines = wrap(ctx, message, w * 0.84, 2);
    const lh = size * 1.22;
    ctx.fillStyle = night ? "#ffffff" : "#4a2233";
    if (night) { ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 20 * s; }
    lines.forEach((l, i) => ctx.fillText(l, w / 2, 70 * s + size + i * lh + (1 - a) * 26 * s));
    ctx.shadowBlur = 0;
  }

  // logo and address, in one glass pill at the bottom
  ctx.globalAlpha = 1;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const ls = 58 * s, pad = 26 * s, gap = 14 * s, sep = 22 * s, ph = 92 * s;
  ctx.font = `700 ${40 * s}px ${FONT}`;
  const wm = ctx.measureText("khuncool").width;
  ctx.font = `600 ${34 * s}px ${FONT}`;
  const wu = ctx.measureText("www.khuncool.com").width;
  const pw = pad + (assets.logo ? ls + gap : 0) + wm + sep * 2 + 2 * s + wu + pad;
  const px = (w - pw) / 2, py = h - 56 * s - ph, cy = py + ph / 2;
  ctx.fillStyle = night ? "rgba(8,14,40,.66)" : "rgba(255,255,255,.88)";
  roundRect(ctx, px, py, pw, ph, ph / 2);
  ctx.fill();
  ctx.lineWidth = 2 * s;
  ctx.strokeStyle = night ? "rgba(255,255,255,.18)" : "rgba(226,85,127,.28)";
  ctx.stroke();
  let x = px + pad;
  if (assets.logo) { ctx.drawImage(assets.logo, x, cy - ls / 2, ls, ls); x += ls + gap; }
  ctx.fillStyle = night ? "#ffffff" : "#4a2233";
  ctx.font = `700 ${40 * s}px ${FONT}`;
  ctx.fillText("khuncool", x, cy);
  x += wm + sep;
  ctx.fillStyle = night ? "rgba(255,255,255,.35)" : "rgba(74,34,51,.25)";
  ctx.fillRect(x, cy - 22 * s, 2 * s, 44 * s);
  x += 2 * s + sep;
  ctx.fillStyle = night ? "#ffe7a8" : "#a3285a";
  ctx.font = `600 ${34 * s}px ${FONT}`;
  ctx.fillText("www.khuncool.com", x, cy);
  ctx.restore();
}

// ------------------------------------------------------------ rendering

/** One still 3D frame, copied out so the message can be redrawn over it without re-rendering. */
export function render3d(scene: DesignerScene, bg: KeepsakeBg): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = IMAGE_SIZE.w;
  out.height = IMAGE_SIZE.h;
  const session = scene.beginCapture({ width: IMAGE_SIZE.w, height: IMAGE_SIZE.h, bg, motion: "still" });
  try {
    // let the opening fireworks rise and burst before taking the shot
    for (let i = 0; i < 62; i++) session.frame(1 / 30, 0, false);
    const c = session.frame(1 / 30, 0, true);
    out.getContext("2d")!.drawImage(c, 0, 0);
  } finally {
    session.end();
  }
  return out;
}

export function composeImage(scene3d: HTMLCanvasElement, info: KeepsakeInfo, assets: KeepsakeAssets): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = IMAGE_SIZE.w;
  c.height = IMAGE_SIZE.h;
  drawKeepsake(c.getContext("2d")!, scene3d, info, assets, 1);
  return c;
}

export const toJpeg = (c: HTMLCanvasElement) => new Promise<Blob>((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92));

export function videoFormat(): { mime: string; ext: "mp4" | "webm" } | null {
  if (typeof MediaRecorder === "undefined" || typeof HTMLCanvasElement === "undefined" || !("captureStream" in HTMLCanvasElement.prototype)) return null;
  const list: [string, "mp4" | "webm"][] = [
    ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "mp4"],
    ["video/mp4;codecs=avc1", "mp4"],
    ["video/mp4", "mp4"],
    ["video/webm;codecs=vp9,opus", "webm"],
    ["video/webm;codecs=vp8,opus", "webm"],
    ["video/webm", "webm"],
  ];
  for (const [mime, ext] of list) if (MediaRecorder.isTypeSupported(mime)) return { mime, ext };
  return null;
}

/** Record the 10-second keepsake in real time: the camera arcs around the krathong while the titles animate in. */
export function recordVideo(scene: DesignerScene, info: KeepsakeInfo, assets: KeepsakeAssets, onProgress: (p: number) => void): Promise<{ blob: Blob; ext: "mp4" | "webm" }> {
  const fmt = videoFormat();
  if (!fmt) return Promise.reject(new Error("video not supported"));
  const out = document.createElement("canvas");
  out.width = VIDEO_SIZE.w;
  out.height = VIDEO_SIZE.h;
  const ctx = out.getContext("2d")!;
  const stream = (out as HTMLCanvasElement & { captureStream(fps?: number): MediaStream }).captureStream(30);
  scene.audioStream()?.getAudioTracks().forEach((t) => stream.addTrack(t));
  const rec = new MediaRecorder(stream, { mimeType: fmt.mime, videoBitsPerSecond: 4_500_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  const session = scene.beginCapture({ width: VIDEO_SIZE.w, height: VIDEO_SIZE.h, bg: info.bg, motion: "orbit" });
  for (let i = 0; i < 36; i++) session.frame(1 / 30, 0, false);
  // draw one frame before recording starts so the video never opens on black
  drawKeepsake(ctx, session.frame(1 / 30, 0), info, assets, 0);

  return new Promise((resolve, reject) => {
    rec.onstop = () => resolve({ blob: new Blob(chunks, { type: fmt.mime.split(";")[0] }), ext: fmt.ext });
    rec.onerror = () => reject(new Error("recording failed"));
    rec.start(250);
    const t0 = performance.now();
    let last = t0;
    const tick = () => {
      try {
        const now = performance.now();
        const el = (now - t0) / 1000;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const p = Math.min(1, el / VIDEO_SECONDS);
        drawKeepsake(ctx, session.frame(dt, p), info, assets, Math.min(1, el / 2.6));
        onProgress(p);
        if (p < 1) requestAnimationFrame(tick);
        else { session.end(); rec.stop(); }
      } catch (e) {
        session.end();
        if (rec.state !== "inactive") rec.stop();
        reject(e);
      }
    };
    requestAnimationFrame(tick);
  });
}

// ------------------------------------------------------------ saving

export function fileName(info: KeepsakeInfo, ext: string): string {
  const name = info.message.trim().replace(/[\\/:*?"<>|\s]+/g, "-").slice(0, 24);
  return `krathong${name ? `-${name}` : ""}-khuncool.${ext}`;
}

export function canShareFile(file: File): boolean {
  try { return typeof navigator !== "undefined" && !!navigator.canShare?.({ files: [file] }); }
  catch { return false; }
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 8000);
}

export async function share(file: File, info: KeepsakeInfo): Promise<boolean> {
  try {
    const title = info.message.trim() || "กระทงของฉัน";
    await navigator.share({ files: [file], title, text: `${title} · www.khuncool.com` });
    return true;
  } catch {
    return false;
  }
}
