// Brand tokens copied from the site's app/globals.css so the video matches it.
export const C = {
  primary: "#5c5ee6",
  primaryDark: "#3f3fc4",
  accent: "#14b79a",
  ink: "#1a1d26",
  inkSoft: "#5a6273",
  paper: "#f6f7fb",
  white: "#ffffff",
  sun: "#ffc83d",
  pink: "#ff6b9a",
};

export const GRADIENT = `linear-gradient(150deg, ${C.primary} 0%, #4f7fe0 45%, ${C.accent} 100%)`;

export const FONT = "Anuphan, 'Segoe UI Emoji', sans-serif";
export const FONT_LATIN = "Fredoka, Anuphan, 'Segoe UI Emoji', sans-serif";

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// TikTok / Reels overlay-safe area: keep text out of the top 10%, the bottom
// 20% and the right-hand 15% where the like/comment/share buttons sit.
export const SAFE = { top: 200, bottom: H - 400, left: 60, right: W - 170 };
