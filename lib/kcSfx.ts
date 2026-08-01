import type { MouseEvent as ReactMouseEvent } from "react";

// khuncool sound kit — WebAudio only, no assets. Ported from kc-sfx.js
// (Khuncool Design System) so every /media game can share one implementation.
//
// Usage: import { KcSfx } from "@/lib/kcSfx"; KcSfx.play("correct");
// Call KcSfx.unlock() is wired automatically on the first pointer/key gesture.

type SfxName =
  | "hover"
  | "tick"
  | "click"
  | "pop"
  | "drop"
  | "whoosh"
  | "correct"
  | "combo"
  | "star"
  | "wrong"
  | "lose"
  | "win";

const NOTE = {
  C4: 261.6,
  D4: 293.7,
  E4: 329.6,
  F4: 349.2,
  G4: 392,
  A4: 440,
  B4: 493.9,
  C5: 523.3,
  D5: 587.3,
  E5: 659.3,
  G5: 784,
  A5: 880,
  C6: 1046.5,
  E6: 1318.5,
  G6: 1568,
};

type ToneOpts = {
  f: number;
  f2?: number;
  dur?: number;
  v?: number;
  type?: OscillatorType;
  at?: number;
  bus?: GainNode;
};

class KcSfxEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private bgmBus: GainNode | null = null;
  private muted = false;
  private bgmOn = true;
  private bgmTimer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private started = false;
  private unlockBound = false;

  private readonly CHORDS: [number, number[]][] = [
    [NOTE.C4, [NOTE.C5, NOTE.E5, NOTE.G5]],
    [NOTE.A4 / 2, [NOTE.A4, NOTE.C5, NOTE.E5]],
    [NOTE.F4, [NOTE.F4, NOTE.A4, NOTE.C5]],
    [NOTE.G4, [NOTE.G4, NOTE.B4, NOTE.D5]],
  ];

  private readonly SFX: Record<SfxName, () => void> = {
    hover: () => this.tone({ f: NOTE.E5, dur: 0.06, v: 0.07, type: "sine" }),
    tick: () => this.tone({ f: NOTE.A4, dur: 0.05, v: 0.1, type: "square" }),
    click: () =>
      this.tone({ f: NOTE.E5, f2: NOTE.A5, dur: 0.1, v: 0.22, type: "triangle" }),
    pop: () => this.tone({ f: 300, f2: 900, dur: 0.12, v: 0.22, type: "sine" }),
    drop: () => {
      this.tone({ f: 520, f2: 200, dur: 0.16, v: 0.24, type: "triangle" });
      this.noise(0.09, 0.08, 1400);
    },
    whoosh: () => this.noise(0.3, 0.12, 500),
    correct: () =>
      [NOTE.C5, NOTE.E5, NOTE.G5].forEach((f, i) =>
        this.tone({ f, dur: 0.22, v: 0.26, at: i * 0.075, type: "triangle" }),
      ),
    combo: () =>
      [NOTE.G5, NOTE.C6, NOTE.E6, NOTE.G6].forEach((f, i) =>
        this.tone({ f, dur: 0.2, v: 0.22, at: i * 0.06, type: "triangle" }),
      ),
    star: () =>
      [NOTE.E6, NOTE.G6].forEach((f, i) =>
        this.tone({ f, dur: 0.18, v: 0.18, at: i * 0.08, type: "sine" }),
      ),
    wrong: () => this.tone({ f: 230, f2: 130, dur: 0.3, v: 0.22, type: "sawtooth" }),
    lose: () =>
      [330, 260, 200].forEach((f, i) =>
        this.tone({ f, dur: 0.28, v: 0.2, at: i * 0.13, type: "triangle" }),
      ),
    win: () =>
      [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.G5, NOTE.C6].forEach((f, i) =>
        this.tone({ f, dur: 0.3, v: 0.24, at: i * 0.11, type: "triangle" }),
      ),
  };

  private init(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === "undefined") return null;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    this.muted = window.localStorage.getItem("kc-sfx-muted") === "1";
    this.bgmOn = window.localStorage.getItem("kc-bgm-on") !== "0";
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.5;
    this.sfxBus.connect(this.master);
    this.bgmBus = this.ctx.createGain();
    this.bgmBus.gain.value = 0.0;
    this.bgmBus.connect(this.master);
    return this.ctx;
  }

  private resume() {
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }

  private tone(o: ToneOpts) {
    const ctx = this.init();
    if (!ctx || !this.sfxBus) return;
    this.resume();
    const t = ctx.currentTime + (o.at || 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || "sine";
    osc.frequency.setValueAtTime(o.f, t);
    const dur = o.dur ?? 0.15;
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
    const vol = o.v ?? 0.3;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(o.bus || this.sfxBus);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  private noise(dur: number, vol: number, hp: number) {
    const ctx = this.init();
    if (!ctx || !this.sfxBus) return;
    this.resume();
    const t = ctx.currentTime;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = hp || 900;
    const g = ctx.createGain();
    g.gain.value = vol || 0.14;
    src.connect(f);
    f.connect(g);
    g.connect(this.sfxBus);
    src.start(t);
  }

  private bgmStep = () => {
    if (!this.ctx || !this.bgmBus) return;
    const bar = Math.floor(this.step / 8) % 4;
    const ch = this.CHORDS[bar];
    const i = this.step % 8;
    if (i === 0) this.tone({ f: ch[0] / 2, dur: 0.5, v: 0.5, type: "sine", bus: this.bgmBus });
    const arp = ch[1][[0, 1, 2, 1, 0, 2, 1, 2][i]];
    this.tone({ f: arp, dur: 0.28, v: 0.16, type: "triangle", bus: this.bgmBus });
    if (i === 4) this.tone({ f: arp * 2, dur: 0.16, v: 0.06, type: "sine", bus: this.bgmBus });
    this.step++;
  };

  bgm(on: boolean) {
    this.bgmOn = on;
    if (typeof window !== "undefined") window.localStorage.setItem("kc-bgm-on", on ? "1" : "0");
    const ctx = this.init();
    if (!ctx || !this.bgmBus) return;
    this.resume();
    this.bgmBus.gain.cancelScheduledValues(ctx.currentTime);
    this.bgmBus.gain.linearRampToValueAtTime(on ? 0.5 : 0, ctx.currentTime + 0.6);
    if (on && !this.bgmTimer) this.bgmTimer = setInterval(this.bgmStep, 260);
    if (!on && this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  isBgm() {
    return this.bgmOn;
  }

  isMuted() {
    return this.muted;
  }

  setMuted(b: boolean) {
    this.muted = b;
    if (typeof window !== "undefined") window.localStorage.setItem("kc-sfx-muted", b ? "1" : "0");
    const ctx = this.init();
    if (!ctx || !this.master) return;
    this.master.gain.linearRampToValueAtTime(b ? 0 : 1, ctx.currentTime + 0.15);
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  play(name: SfxName) {
    if (this.muted) return;
    this.SFX[name]?.();
  }

  unlock = () => {
    if (this.started) {
      this.resume();
      return;
    }
    this.started = true;
    this.init();
    this.resume();
    if (this.bgmOn) this.bgm(true);
  };

  bindAutoUnlock() {
    if (this.unlockBound || typeof window === "undefined") return;
    this.unlockBound = true;
    (["pointerdown", "keydown", "touchstart"] as const).forEach((evt) => {
      window.addEventListener(evt, this.unlock, { once: true, passive: true });
    });
  }
}

export const KcSfx = new KcSfxEngine();

if (typeof window !== "undefined") {
  KcSfx.bindAutoUnlock();
}

/**
 * Delegated `onMouseOver` handler for a game's root element that plays the
 * "hover" sound the first time the pointer enters any enabled `<button>` —
 * the source design's `onMouseEnter="{{ hoverSfx }}"` on nearly every
 * button, restored here once instead of on each individual button.
 */
export function hoverSfxDelegate(e: ReactMouseEvent) {
  const target = e.target as HTMLElement;
  const btn = target.closest("button");
  if (!btn || btn.hasAttribute("disabled")) return;
  const related = e.relatedTarget as Node | null;
  if (related && btn.contains(related)) return;
  KcSfx.play("hover");
}

/** Speak an English word/phrase via the browser's speech synthesis, best-effort. */
export function speakEnglish(text: string, slow = false) {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = slow ? 0.7 : 0.85;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}
