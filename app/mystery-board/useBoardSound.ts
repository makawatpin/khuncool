"use client";

import { useCallback, useEffect, useRef } from "react";

export type SoundKind =
  | "tick"
  | "flip"
  | "charge"
  | "reveal"
  | "jackpot"
  | "bomb"
  | "super";

const MUSIC_LOOP_SECONDS = 8;
const MUSIC_VOLUME = 0.24;

/** สร้างเพลงเกมโชว์ 4 คอร์ดแบบวนลูปไว้ในหน่วยความจำ ไม่ต้องโหลดไฟล์เสียงเพิ่ม */
function createBackgroundMusic(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const frameCount = Math.floor(sampleRate * MUSIC_LOOP_SECONDS);
  const buffer = ctx.createBuffer(2, frameCount, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const addTone = (
    start: number,
    duration: number,
    frequency: number,
    volume: number,
    pan: number,
    color: "bass" | "pluck" | "pad",
  ) => {
    const first = Math.floor(start * sampleRate);
    const count = Math.min(Math.floor(duration * sampleRate), frameCount - first);
    const leftLevel = Math.sqrt((1 - pan) / 2);
    const rightLevel = Math.sqrt((1 + pan) / 2);
    for (let i = 0; i < count; i++) {
      const time = i / sampleRate;
      const attack = Math.min(1, time / (color === "pad" ? 0.08 : 0.012));
      const release = Math.min(1, (duration - time) / (color === "pad" ? 0.2 : 0.08));
      const envelope = attack * Math.max(0, release);
      const phase = Math.PI * 2 * frequency * time;
      const wave =
        color === "bass"
          ? Math.sin(phase) + Math.sin(phase * 2) * 0.18
          : color === "pluck"
            ? Math.sin(phase) + Math.sin(phase * 2) * 0.32 + Math.sin(phase * 3) * 0.12
            : Math.sin(phase) + Math.sin(phase * 0.5) * 0.2;
      const decay = color === "pluck" ? Math.exp(-time * 7) : 1;
      const sample = wave * envelope * decay * volume;
      const index = first + i;
      left[index] += sample * leftLevel;
      right[index] += sample * rightLevel;
    }
  };

  const addKick = (start: number, strong: boolean) => {
    const duration = 0.24;
    const first = Math.floor(start * sampleRate);
    const count = Math.min(Math.floor(duration * sampleRate), frameCount - first);
    for (let i = 0; i < count; i++) {
      const time = i / sampleRate;
      const sweep = 145 * time - (105 / duration) * time * time * 0.5;
      const sample =
        Math.sin(Math.PI * 2 * sweep) * Math.exp(-time * 15) * (strong ? 0.34 : 0.24);
      const index = first + i;
      left[index] += sample;
      right[index] += sample;
    }
  };

  // C · Am · F · G, คอร์ดละ 4 จังหวะที่ 120 BPM
  const progression = [
    { bass: 130.81, notes: [261.63, 329.63, 392] },
    { bass: 110, notes: [220, 261.63, 329.63] },
    { bass: 87.31, notes: [174.61, 220, 261.63] },
    { bass: 98, notes: [196, 246.94, 293.66] },
  ];

  progression.forEach((chord, chordIndex) => {
    const chordStart = chordIndex * 2;
    chord.notes.forEach((frequency, noteIndex) => {
      addTone(chordStart, 1.92, frequency, 0.028, (noteIndex - 1) * 0.45, "pad");
    });
    for (let beat = 0; beat < 4; beat++) {
      const at = chordStart + beat * 0.5;
      addKick(at, beat === 0);
      addTone(at, 0.36, chord.bass, 0.105, -0.08, "bass");
    }
    for (let step = 0; step < 8; step++) {
      const note = chord.notes[step % chord.notes.length] * 2;
      addTone(
        chordStart + step * 0.25,
        0.2,
        note,
        0.075,
        step % 2 === 0 ? -0.5 : 0.5,
        "pluck",
      );
    }
  });

  // soft clip ก่อนเข้ามิกซ์หลัก ป้องกันยอดคลื่นซ้อนกันดังแตก
  for (let i = 0; i < frameCount; i++) {
    left[i] = Math.tanh(left[i] * 1.25) * 0.78;
    right[i] = Math.tanh(right[i] * 1.25) * 0.78;
  }
  return buffer;
}

/**
 * เสียงประกอบกระดาน สร้าง AudioContext ตอนผู้ใช้กดครั้งแรกเท่านั้น
 * (เบราว์เซอร์บล็อกการสร้างก่อนมี user gesture) และปิดตอน unmount
 */
export function useBoardSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  const musicBufferRef = useRef<AudioBuffer | null>(null);
  const musicSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    return () => {
      try {
        musicSourceRef.current?.stop();
      } catch {
        /* source อาจหยุดไปก่อนแล้ว */
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
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        ctxRef.current = new Ctor();
      } catch {
        ctxRef.current = null;
      }
    }
    return ctxRef.current;
  }, []);

  const stopBackground = useCallback(() => {
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
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    }
    try {
      source.stop(ctx.currentTime + 0.32);
    } catch {
      /* source อาจจบพร้อมกันพอดี */
    }
  }, []);

  const startBackground = useCallback(() => {
    if (musicSourceRef.current) return;
    const ctx = context();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    if (!musicBufferRef.current || musicBufferRef.current.sampleRate !== ctx.sampleRate) {
      musicBufferRef.current = createBackgroundMusic(ctx);
    }

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = musicBufferRef.current;
    source.loop = true;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3200, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(MUSIC_VOLUME, ctx.currentTime + 0.45);
    source.connect(filter);
    filter.connect(gain);
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
    if (!enabled) stopBackground();
  }, [enabled, stopBackground]);

  const duckBackground = useCallback((ctx: AudioContext, start: number, hold = 0.72) => {
    const gain = musicGainRef.current;
    if (!gain) return;
    gain.gain.cancelScheduledValues(start);
    gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), start);
    gain.gain.exponentialRampToValueAtTime(0.055, start + 0.035);
    gain.gain.exponentialRampToValueAtTime(MUSIC_VOLUME, start + hold);
  }, []);

  const tone = useCallback(
    (
      ctx: AudioContext,
      freq: number,
      start: number,
      dur: number,
      type: OscillatorType,
      vol: number,
      destination: AudioNode = ctx.destination,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    },
    [],
  );

  /**
   * คอร์ดเฉลยแบบ "ผ่าม" — กลองกระแทกต่ำ + คอร์ดเมเจอร์กว้าง + ประกายไล่ขึ้น
   * ทุกเสียงผ่าน compressor เดียวกัน จึงเพิ่มความแน่นได้โดยไม่แตกเมื่อหลายโน้ตซ้อนกัน
   */
  const revealFanfare = useCallback(
    (ctx: AudioContext, start: number, intensity = 1) => {
      const compressor = ctx.createDynamicsCompressor();
      const master = ctx.createGain();
      compressor.threshold.setValueAtTime(-18, start);
      compressor.knee.setValueAtTime(14, start);
      compressor.ratio.setValueAtTime(5, start);
      compressor.attack.setValueAtTime(0.004, start);
      compressor.release.setValueAtTime(0.28, start);
      master.gain.setValueAtTime(Math.min(0.82, 0.64 * intensity), start);
      master.connect(compressor);
      compressor.connect(ctx.destination);

      // แรงกระแทกช่วงเลขโผล่: ย่านต่ำดิ่งลงเร็วเหมือนกลองใหญ่ในเกมโชว์
      const boom = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boom.type = "sine";
      boom.frequency.setValueAtTime(155, start);
      boom.frequency.exponentialRampToValueAtTime(52, start + 0.38);
      boomGain.gain.setValueAtTime(0.26, start);
      boomGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.62);
      boom.connect(boomGain);
      boomGain.connect(master);
      boom.start(start);
      boom.stop(start + 0.66);

      // ลมหายใจสั้น ๆ ที่หัวเสียง ช่วยให้ "ผ่าม" มีมวลโดยไม่ต้องใช้ไฟล์เสียง
      const noiseLength = Math.floor(ctx.sampleRate * 0.22);
      const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseLength; i++) {
        const fade = 1 - i / noiseLength;
        noiseData[i] = (Math.random() * 2 - 1) * fade * fade;
      }
      const noise = ctx.createBufferSource();
      const noiseFilter = ctx.createBiquadFilter();
      const noiseGain = ctx.createGain();
      noise.buffer = noiseBuffer;
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.setValueAtTime(1100, start);
      noiseGain.gain.setValueAtTime(0.13 * intensity, start);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start(start);

      // C major แบบกว้าง: triangle ให้เนื้อคอร์ด ส่วน sawtooth เบา ๆ ให้กลิ่น brass
      [261.63, 329.63, 392, 523.25].forEach((frequency, index) => {
        tone(
          ctx,
          frequency,
          start + index * 0.008,
          1.25,
          "triangle",
          0.095,
          master,
        );
        tone(
          ctx,
          frequency / 2,
          start + index * 0.008,
          0.82,
          "sawtooth",
          0.022,
          master,
        );
      });

      // หางประกายไต่ขึ้น ทำให้คอร์ดไม่ใช่แค่เสียงกระแทก แต่รู้สึกเป็นดนตรีฉลอง
      [783.99, 1046.5, 1318.51].forEach((frequency, index) => {
        tone(
          ctx,
          frequency,
          start + 0.12 + index * 0.085,
          0.42,
          "sine",
          0.065 * intensity,
          master,
        );
      });
    },
    [tone],
  );

  const play = useCallback(
    (kind: SoundKind, durationMs = 0) => {
      if (!enabledRef.current) return;
      const ctx = context();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const t = ctx.currentTime;

      switch (kind) {
        case "tick":
          tone(ctx, 880, t, 0.05, "square", 0.05);
          break;
        case "flip":
          tone(ctx, 320, t, 0.14, "triangle", 0.12);
          tone(ctx, 640, t + 0.06, 0.16, "triangle", 0.1);
          break;
        // เสียงชาร์จ: โน้ตไต่ระดับขึ้นเรื่อย ๆ ตลอดช่วงลุ้น ปิดท้ายด้วยเสียงตึง
        // ตอนเฉลย ความยาวมาจากผู้เรียกเพื่อให้ตรงกับวงแสงเสมอ
        case "charge": {
          const dur = Math.max(0.2, durationMs / 1000);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.exponentialRampToValueAtTime(900, t + dur);
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.05, t + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.11, t + dur);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + dur + 0.16);
          // ติ๊กถี่ขึ้นเรื่อย ๆ ให้รู้สึกว่าเวลากำลังจะหมด
          let at = 0;
          let step = 0.2;
          while (at < dur - 0.05) {
            tone(ctx, 1200, t + at, 0.03, "square", 0.035);
            step = Math.max(0.05, step * 0.82);
            at += step;
          }
          break;
        }
        case "reveal":
          duckBackground(ctx, t);
          revealFanfare(ctx, t);
          break;
        case "jackpot":
          duckBackground(ctx, t, 1.1);
          revealFanfare(ctx, t, 1.12);
          [523, 659, 784, 1047].forEach((f, i) =>
            tone(ctx, f, t + 0.16 + i * 0.09, 0.36, "triangle", 0.1),
          );
          break;
        case "bomb":
          duckBackground(ctx, t);
          tone(ctx, 180, t, 0.3, "sawtooth", 0.18);
          tone(ctx, 90, t + 0.05, 0.45, "sawtooth", 0.16);
          break;
        // ป้าย 67 — แฟนแฟร์ยาวกว่าแจ็กพอต ไล่สองรอบแล้วปิดด้วยคอร์ดค้าง
        case "super":
          duckBackground(ctx, t, 1.45);
          revealFanfare(ctx, t, 1.24);
          [523, 659, 784, 1047, 1319].forEach((f, i) =>
            tone(ctx, f, t + 0.18 + i * 0.08, 0.3, "triangle", 0.1),
          );
          [784, 1047, 1319, 1568].forEach((f, i) =>
            tone(ctx, f, t + 0.62 + i * 0.07, 0.3, "square", 0.065),
          );
          [1047, 1319, 1568].forEach((f) =>
            tone(ctx, f, t + 0.96, 1.1, "triangle", 0.09),
          );
          break;
      }
    },
    [context, duckBackground, revealFanfare, tone],
  );

  return { play, startBackground, stopBackground };
}
