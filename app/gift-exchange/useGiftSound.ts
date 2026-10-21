"use client";

import { useCallback, useEffect, useRef } from "react";

export type GiftSound = "tick" | "fanfare" | "drumroll" | "pop" | "celebrate" | "finale";

const MUSIC_LOOP_SECONDS = 8;
const MUSIC_VOLUME = 0.2;
const EIGHTH = 0.25; // 120 BPM

// ทำนองแต่งเองสำหรับเครื่องมือนี้ (ไม่ใช่เพลงที่มีลิขสิทธิ์) — [เริ่ม(ตัวเขบ็ต), ยาว, ความถี่]
const MELODY: [number, number, number][] = [
  [0, 2, 659.25], [2, 1, 783.99], [3, 1, 880], [4, 2, 783.99], [6, 2, 659.25],
  [8, 2, 493.88], [10, 1, 659.25], [11, 1, 783.99], [12, 3, 987.77], [15, 1, 880],
  [16, 2, 880], [18, 1, 1046.5], [19, 1, 880], [20, 2, 698.46], [22, 2, 880],
  [24, 1, 783.99], [25, 1, 698.46], [26, 1, 587.33], [27, 1, 493.88], [28, 2, 587.33], [30, 2, 783.99],
];

// C · Em · F · G คอร์ดละ 1 ห้อง
const CHORDS = [
  { bass: 130.81, pad: [261.63, 329.63, 392] },
  { bass: 82.41, pad: [329.63, 392, 493.88] },
  { bass: 87.31, pad: [349.23, 440, 523.25] },
  { bass: 98, pad: [392, 493.88, 587.33] },
];

/** เพลงเทศกาลวนลูป: ระฆังเล่นทำนอง + กระดิ่งเลื่อน + เบส + pad */
function createMusic(ctx: AudioContext): AudioBuffer {
  const rate = ctx.sampleRate;
  const frames = Math.floor(rate * MUSIC_LOOP_SECONDS);
  const buffer = ctx.createBuffer(2, frames, rate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const add = (start: number, dur: number, pan: number, sample: (t: number) => number) => {
    const first = Math.floor(start * rate);
    const count = Math.min(Math.floor(dur * rate), frames - first);
    const l = Math.sqrt((1 - pan) / 2);
    const r = Math.sqrt((1 + pan) / 2);
    for (let i = 0; i < count; i++) {
      const v = sample(i / rate);
      left[first + i] += v * l;
      right[first + i] += v * r;
    }
  };

  // ระฆัง (glockenspiel): sine + partial ไม่ลงตัว 2.76 เท่า ที่หายเร็วกว่า
  const bell = (start: number, dur: number, f: number, vol: number, pan: number) =>
    add(start, dur + 0.4, pan, (t) => {
      const attack = Math.min(1, t / 0.004);
      const a = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 3.2);
      const b = Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 9) * 0.35;
      return (a + b) * attack * vol;
    });

  MELODY.forEach(([at, len, f], i) => bell(at * EIGHTH, len * EIGHTH, f, 0.11, i % 2 ? 0.25 : -0.25));

  CHORDS.forEach((chord, bar) => {
    const barStart = bar * 2;
    chord.pad.forEach((f, i) =>
      add(barStart, 1.95, (i - 1) * 0.5, (t) => {
        const env = Math.min(1, t / 0.12) * Math.min(1, (1.95 - t) / 0.25);
        return (Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 0.5 * t) * 0.2) * env * 0.022;
      }),
    );
    for (let beat = 0; beat < 4; beat++) {
      add(barStart + beat * 0.5, 0.4, -0.05, (t) => {
        const env = Math.min(1, t / 0.01) * Math.exp(-t * 6);
        return Math.sin(2 * Math.PI * chord.bass * t) * env * 0.12;
      });
    }
  });

  // กระดิ่งเลื่อน: noise ย่านสูงสั้นๆ ทุกเขบ็ต จังหวะยกดังกว่า
  for (let step = 0; step < 32; step++) {
    const vol = step % 2 ? 0.05 : 0.025;
    add(step * EIGHTH, 0.08, step % 4 < 2 ? 0.4 : -0.4, (t) => {
      const n = Math.random() * 2 - 1;
      const ring = Math.sin(2 * Math.PI * 7200 * t) * 0.5;
      return (n * 0.6 + ring) * Math.exp(-t * 55) * vol;
    });
  }

  for (let i = 0; i < frames; i++) {
    left[i] = Math.tanh(left[i] * 1.2) * 0.8;
    right[i] = Math.tanh(right[i] * 1.2) * 0.8;
  }
  return buffer;
}

export function useGiftSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  const musicBufferRef = useRef<AudioBuffer | null>(null);
  const musicSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    return () => {
      try {
        musicSourceRef.current?.stop();
      } catch {
        /* หยุดไปแล้ว */
      }
      musicSourceRef.current = null;
      musicGainRef.current = null;
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  const context = useCallback((): AudioContext | null => {
    if (!ctxRef.current) {
      try {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current = new Ctor();
      } catch {
        ctxRef.current = null;
      }
    }
    const ctx = ctxRef.current;
    if (ctx?.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }, []);

  const noise = useCallback((ctx: AudioContext): AudioBuffer => {
    if (!noiseRef.current || noiseRef.current.sampleRate !== ctx.sampleRate) {
      const len = Math.floor(ctx.sampleRate * 1.4);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      noiseRef.current = buf;
    }
    return noiseRef.current;
  }, []);

  const stopMusic = useCallback(() => {
    const ctx = ctxRef.current;
    const source = musicSourceRef.current;
    const gain = musicGainRef.current;
    if (!ctx || !source) return;
    musicSourceRef.current = null;
    musicGainRef.current = null;
    if (gain) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    }
    try {
      source.stop(ctx.currentTime + 0.34);
    } catch {
      /* จบพร้อมกันพอดี */
    }
  }, []);

  /** ผู้เรียกตัดสินเองว่าเสียงเปิดอยู่ไหม (enabledRef อัปเดตหลัง render ช้าไปหนึ่งจังหวะ
   *  ตอนครูเพิ่งกดเปิดเสียง) — `play` ยังเช็ก enabledRef ตามปกติ */
  const startMusic = useCallback(() => {
    if (musicSourceRef.current) return;
    const ctx = context();
    if (!ctx) return;
    if (!musicBufferRef.current || musicBufferRef.current.sampleRate !== ctx.sampleRate) {
      musicBufferRef.current = createMusic(ctx);
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = musicBufferRef.current;
    source.loop = true;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(MUSIC_VOLUME, ctx.currentTime + 0.5);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.onended = () => {
      if (musicSourceRef.current === source) {
        musicSourceRef.current = null;
        musicGainRef.current = null;
      }
    };
    musicSourceRef.current = source;
    musicGainRef.current = gain;
    source.start();
  }, [context]);

  useEffect(() => {
    if (!enabled) stopMusic();
  }, [enabled, stopMusic]);

  /** หรี่เพลงลงช่วง `seconds` แล้วค่อยๆ กลับ */
  const duck = useCallback((ctx: AudioContext, start: number, seconds: number) => {
    const gain = musicGainRef.current;
    if (!gain) return;
    gain.gain.cancelScheduledValues(start);
    gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), start);
    gain.gain.exponentialRampToValueAtTime(0.03, start + 0.25);
    gain.gain.setValueAtTime(0.03, start + seconds);
    gain.gain.exponentialRampToValueAtTime(MUSIC_VOLUME, start + seconds + 0.9);
  }, []);

  const tone = useCallback(
    (
      ctx: AudioContext,
      f: number,
      start: number,
      dur: number,
      type: OscillatorType,
      vol: number,
      dest: AudioNode = ctx.destination,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    },
    [],
  );

  /** ทุกเสียงฉลองผ่าน compressor ตัวเดียว ซ้อนโน้ตหลายตัวได้โดยไม่แตก */
  const bus = useCallback((ctx: AudioContext, start: number, level: number) => {
    const comp = ctx.createDynamicsCompressor();
    const master = ctx.createGain();
    comp.threshold.setValueAtTime(-18, start);
    comp.ratio.setValueAtTime(5, start);
    master.gain.setValueAtTime(level, start);
    master.connect(comp);
    comp.connect(ctx.destination);
    return master;
  }, []);

  const brassChord = useCallback(
    (ctx: AudioContext, dest: AudioNode, start: number, freqs: number[], dur: number) => {
      freqs.forEach((f, i) => {
        tone(ctx, f, start + i * 0.01, dur, "triangle", 0.09, dest);
        tone(ctx, f / 2, start + i * 0.01, dur * 0.7, "sawtooth", 0.02, dest);
      });
    },
    [tone],
  );

  const play = useCallback(
    (kind: GiftSound, durationMs = 0) => {
      if (!enabledRef.current) return;
      const ctx = context();
      if (!ctx) return;
      const t = ctx.currentTime;

      switch (kind) {
        case "tick":
          tone(ctx, 1100, t, 0.045, "square", 0.045);
          break;

        // "ตะ-ตะ-ต๊าาา" ตอนได้คนเริ่ม
        case "fanfare": {
          const out = bus(ctx, t, 0.7);
          brassChord(ctx, out, t, [392], 0.12);
          brassChord(ctx, out, t + 0.15, [392], 0.12);
          brassChord(ctx, out, t + 0.3, [523.25, 659.25, 783.99], 0.9);
          break;
        }

        // กลองรัวเร่งขึ้นและดังขึ้นตลอดช่วงลุ้น ยาวเท่าที่ผู้เรียกบอก
        case "drumroll": {
          const dur = Math.max(0.3, durationMs / 1000);
          duck(ctx, t, dur);
          const out = bus(ctx, t, 0.9);
          const filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(2200, t);
          filter.Q.setValueAtTime(0.8, t);
          filter.connect(out);
          let at = 0;
          let step = 0.075;
          let hit = 0;
          while (at < dur) {
            const progress = at / dur;
            const src = ctx.createBufferSource();
            const g = ctx.createGain();
            src.buffer = noise(ctx);
            const vol = 0.05 + 0.2 * progress ** 1.5;
            g.gain.setValueAtTime(vol, t + at);
            g.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.05);
            src.connect(g);
            g.connect(filter);
            src.start(t + at, Math.random(), 0.06);
            if (hit % 4 === 0) tone(ctx, 110, t + at, 0.12, "sine", 0.06 + 0.1 * progress, out);
            hit++;
            step = Math.max(0.028, step * 0.97);
            at += step;
          }
          break;
        }

        // "ปัง!" ตอนฝาระเบิด: กลองใหญ่ดิ่งลง + ฉาบ
        case "pop": {
          const out = bus(ctx, t, 0.85);
          const boom = ctx.createOscillator();
          const bg = ctx.createGain();
          boom.type = "sine";
          boom.frequency.setValueAtTime(170, t);
          boom.frequency.exponentialRampToValueAtTime(42, t + 0.5);
          bg.gain.setValueAtTime(0.4, t);
          bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
          boom.connect(bg);
          bg.connect(out);
          boom.start(t);
          boom.stop(t + 0.72);
          const crash = ctx.createBufferSource();
          const hp = ctx.createBiquadFilter();
          const cg = ctx.createGain();
          crash.buffer = noise(ctx);
          hp.type = "highpass";
          hp.frequency.setValueAtTime(3000, t);
          cg.gain.setValueAtTime(0.22, t);
          cg.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
          crash.connect(hp);
          hp.connect(cg);
          cg.connect(out);
          crash.start(t, 0, 1.25);
          break;
        }

        // แตรเฉลิมฉลองตอนเผยชื่อ: ไล่ขึ้นแล้วค้างคอร์ด + ประกาย
        case "celebrate": {
          const out = bus(ctx, t, 0.75);
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
            tone(ctx, f, t + i * 0.07, 0.35, "triangle", 0.1, out),
          );
          brassChord(ctx, out, t + 0.3, [523.25, 659.25, 783.99], 1.2);
          [1318.51, 1567.98, 2093].forEach((f, i) =>
            tone(ctx, f, t + 0.42 + i * 0.09, 0.4, "sine", 0.06, out),
          );
          break;
        }

        // กล่องสุดท้าย: สองวลี ปิดด้วยคอร์ดยาว
        case "finale": {
          const out = bus(ctx, t, 0.85);
          [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) =>
            tone(ctx, f, t + i * 0.08, 0.32, "triangle", 0.1, out),
          );
          brassChord(ctx, out, t + 0.45, [349.23, 440, 523.25], 0.5);
          brassChord(ctx, out, t + 0.95, [392, 493.88, 587.33], 0.5);
          brassChord(ctx, out, t + 1.45, [523.25, 659.25, 783.99, 1046.5], 1.8);
          [1567.98, 2093, 2637].forEach((f, i) =>
            tone(ctx, f, t + 1.5 + i * 0.1, 0.5, "sine", 0.06, out),
          );
          break;
        }
      }
    },
    [brassChord, bus, context, duck, noise, tone],
  );

  return { play, startMusic, stopMusic };
}
