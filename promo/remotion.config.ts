import { Config } from "@remotion/cli/config";
import os from "node:os";
import path from "node:path";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(18);
Config.setPixelFormat("yuv420p");
// Render with the GPU (GTX 1080 Ti) instead of SwiftShader.
Config.setChromiumOpenGlRenderer("angle");
// Reuse Playwright's already-downloaded headless shell instead of fetching another Chrome.
Config.setBrowserExecutable(
  path.join(
    process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"),
    "ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe",
  ),
);
