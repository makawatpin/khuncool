// สร้างภาพปก "ออกแบบกระทงของฉัน 3 มิติ" (1200×675 webp) จากฉาก 3 มิติจริงของเกม
// ต้องเปิด dev server ไว้ก่อน แล้วรัน:
//   BASE_URL=http://localhost:3000 node scripts/make-krathong-designer-cover.mjs
import { chromium } from "playwright";
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.join(ROOT, "public", "assets", "game-covers", "krathong-designer.webp");

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 1.5 });
await page.goto(`${BASE_URL}/media/social-studies/krathong-designer`, { waitUntil: "networkidle" });
// hide the interface so the cover is the krathong alone
await page.addStyleTag({ content: ".kc-stage header, .kc-stage section { visibility: hidden !important }" });
const stage = page.locator(".kc-stage");
await stage.scrollIntoViewIfNeeded();
await page.waitForTimeout(6000);
// dev-only hook: give the whole stage to the 3D view and frame it closer
await page.evaluate(() => { const k = window.__krathong; k.setInsetBottom(0); k.setFocus(2); });
await page.waitForTimeout(3500);
const png = await stage.screenshot();
const meta = await sharp(png).metadata();
const m = Math.round(meta.width * 0.03);
await sharp(png)
  .extract({ left: m, top: m, width: meta.width - 2 * m, height: meta.height - 2 * m })
  .resize(1200, 675, { fit: "cover" })
  .webp({ quality: 82 })
  .toFile(OUT);
await browser.close();
console.log("wrote", path.relative(ROOT, OUT));
