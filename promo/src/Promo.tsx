import { makeReel, type ReelConfig } from "./Reel";
import { Classroom, Cta, Duck, Games, Hook, Reveal, SCENE_SFX, Screens, Tools } from "./scenes/scenes";

/** Video 1: the khuncool.com overview promo. */
export const PROMO: ReelConfig = {
  id: "promo",
  scenes: [
    { id: "hook", component: Hook, minSeconds: 2.6, punch: 0 },
    { id: "reveal", component: Reveal, minSeconds: 4.6 },
    { id: "duck", component: Duck, minSeconds: 5.0 },
    { id: "tools", component: Tools, minSeconds: 4.2 },
    { id: "games", component: Games, minSeconds: 5.4 },
    { id: "screens", component: Screens, minSeconds: 4.0 },
    { id: "classroom", component: Classroom, minSeconds: 4.2 },
    { id: "cta", component: Cta, minSeconds: 5.6 },
  ].map((s) => ({ ...s, sfx: SCENE_SFX[s.id] })),
  // Reveal and CTA open on their own white flash, so they get the flash; the rest alternate.
  transitions: ["flash", "flash", "wipe", "circle", "wipe", "circle", "wipe", "flash"],
};

export const Promo = makeReel(PROMO);
