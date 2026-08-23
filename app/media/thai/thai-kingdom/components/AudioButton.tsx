"use client";

import { useRef, useState } from "react";
import styles from "../ThaiKingdomApp.module.css";

function speakFallback(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "th-TH";
  utterance.rate = .72;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

export default function AudioButton({ src, text, compact = false, disabled = false, label = "ฟังเสียง" }: { src?: string; text: string; compact?: boolean; disabled?: boolean; label?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const play = () => {
    if (disabled) return;
    if (!src) { speakFallback(text); return; }
    audioRef.current?.pause();
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.onplay = () => setPlaying(true);
    audio.onended = () => setPlaying(false);
    audio.onerror = () => { setPlaying(false); speakFallback(text); };
    audio.play().catch(() => speakFallback(text));
  };
  return <button type="button" className={`kc-tap ${styles.audioButton} ${compact ? styles.audioCompact : ""}`} onClick={play} disabled={disabled} aria-label={`${label} ${text}`}>{playing ? "🔉" : "🔊"}<span>{compact ? "ฟัง" : label}</span></button>;
}
