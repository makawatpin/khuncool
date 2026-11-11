/**
 * Fireworks sounds, synthesised with Web Audio so there are no files to load:
 * a rising whistle on launch, and on burst a low thump, a rumbling body of
 * filtered noise, a sharp crack, and for glitter shells a trail of crackles.
 * Each sound is panned left/right to match where the shell is in the sky.
 */

export type BurstSound = "peony" | "ring" | "willow" | "double" | "crackle";

export interface FireworksAudio {
  /** call from a user gesture (the float button) so the browser allows sound */
  resume(): void;
  launch(pan: number): void;
  burst(pan: number, kind: BurstSound): void;
  state(): string;
  /** a live copy of everything this engine plays, for recording */
  stream(): MediaStream | null;
  dispose(): void;
}

export function createFireworksAudio(): FireworksAudio {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let noise: AudioBuffer | null = null;
  let tap: MediaStreamAudioDestinationNode | null = null;

  function init(): AudioContext | null {
    if (ctx) return ctx;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 8;
    master.connect(comp).connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  const clampPan = (p: number) => Math.max(-0.9, Math.min(0.9, p));

  function out(pan: number): AudioNode {
    const p = ctx!.createStereoPanner();
    p.pan.value = clampPan(pan);
    p.connect(master!);
    return p;
  }

  function noiseBurst(dest: AudioNode, at: number, dur: number, gain: number, filter: BiquadFilterType, f0: number, f1 = f0) {
    const c = ctx!;
    const src = c.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const flt = c.createBiquadFilter();
    flt.type = filter;
    flt.frequency.setValueAtTime(f0, at);
    flt.frequency.exponentialRampToValueAtTime(Math.max(40, f1), at + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(flt).connect(g).connect(dest);
    src.start(at, Math.random() * 1.5, dur + 0.05);
  }

  const ready = () => !!ctx && ctx.state === "running";

  return {
    resume() {
      const c = init();
      if (c && c.state !== "running") void c.resume();
    },
    launch(pan) {
      if (!ready()) return;
      const c = ctx!, at = c.currentTime, dest = out(pan);
      const osc = c.createOscillator();
      osc.type = "triangle";
      const f = 520 + Math.random() * 200;
      osc.frequency.setValueAtTime(f, at);
      osc.frequency.exponentialRampToValueAtTime(f * 2.6, at + 0.85);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.035, at + 0.1);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
      osc.connect(g).connect(dest);
      osc.start(at);
      osc.stop(at + 0.95);
      noiseBurst(dest, at, 0.7, 0.05, "bandpass", 3200, 5200);
    },
    burst(pan, kind) {
      if (!ready()) return;
      const c = ctx!, at = c.currentTime + 0.12, dest = out(pan);
      const big = kind === "double" || kind === "willow";
      // thump
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(82, at);
      osc.frequency.exponentialRampToValueAtTime(34, at + 0.5);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(big ? 0.9 : 0.7, at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.65);
      osc.connect(g).connect(dest);
      osc.start(at);
      osc.stop(at + 0.7);
      // body and crack
      noiseBurst(dest, at, big ? 2.0 : 1.5, 0.75, "lowpass", 1600, 160);
      noiseBurst(dest, at, 0.09, 0.35, "highpass", 1800);
      // crackles
      if (kind === "crackle" || kind === "willow") {
        const n = kind === "crackle" ? 34 : 16;
        for (let i = 0; i < n; i++) noiseBurst(dest, at + 0.35 + Math.random() * 1.5, 0.018 + Math.random() * 0.02, 0.1 + Math.random() * 0.12, "highpass", 2600 + Math.random() * 2400);
      }
    },
    state() { return ctx?.state ?? "none"; },
    stream() {
      if (!ctx || !master || ctx.state !== "running") return null;
      if (!tap) {
        tap = ctx.createMediaStreamDestination();
        master.connect(tap);
      }
      return tap.stream;
    },
    dispose() {
      void ctx?.close();
      ctx = null;
    },
  };
}
