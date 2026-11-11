"use client";

import { useEffect, useRef, useState } from "react";
import { KcSfx } from "@/lib/kcSfx";
import styles from "./KrathongDesigner.module.css";
import type { DesignerScene } from "./three/designerScene";
import {
  MESSAGE_MAX, VIDEO_SECONDS, canShareFile, composeImage, defaultMessage, download, fileName, loadAssets, recordVideo,
  render3d, share, toJpeg, videoFormat, type KeepsakeAssets, type KeepsakeBg, type KeepsakeInfo,
} from "./keepsake";

interface Props {
  scene: DesignerScene;
  name: string;
  isFull: boolean;
  onToggleFull(): void;
  onClose(): void;
}

interface Made { blob: Blob; url: string; file: File }

const BGS: { id: KeepsakeBg; label: string }[] = [
  { id: "river", label: "คืนลอยกระทง" },
  { id: "studio", label: "พื้นสีชมพู" },
];

export default function SaveDialog({ scene, name, isFull, onToggleFull, onClose }: Props) {
  const [message, setMessage] = useState(() => defaultMessage(name));
  const [bg, setBg] = useState<KeepsakeBg>("river");
  const [image, setImage] = useState<Made | null>(null);
  const [video, setVideo] = useState<Made | null>(null);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [note, setNote] = useState("");
  const shots = useRef<Partial<Record<KeepsakeBg, HTMLCanvasElement>>>({});
  const assets = useRef<KeepsakeAssets | null>(null);
  const [fmt] = useState(() => videoFormat());
  const info: KeepsakeInfo = { message, bg };

  // redraw the poster as the child types; the 3D frame is rendered once per background
  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(async () => {
      assets.current ??= await loadAssets();
      let shot = shots.current[bg];
      if (!shot) { shot = render3d(scene, bg); shots.current[bg] = shot; }
      const blob = await toJpeg(composeImage(shot, { message, bg }, assets.current));
      if (cancelled) return;
      const made = { blob, url: URL.createObjectURL(blob), file: new File([blob], fileName({ message, bg }, "jpg"), { type: "image/jpeg" }) };
      setImage((prev) => { if (prev) URL.revokeObjectURL(prev.url); return made; });
    }, 260);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, [scene, message, bg]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !recording) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, recording]);

  // a finished video no longer matches once the text or background changes
  const edited = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setVideo((prev) => { if (prev) URL.revokeObjectURL(prev.url); return null; });
  };

  const makeVideo = async () => {
    if (recording || !fmt) return;
    KcSfx.play("click");
    setRecording(true);
    setProgress(0);
    setNote("");
    try {
      assets.current ??= await loadAssets();
      const { blob, ext } = await recordVideo(scene, info, assets.current, setProgress);
      const made = { blob, url: URL.createObjectURL(blob), file: new File([blob], fileName(info, ext), { type: blob.type }) };
      setVideo((prev) => { if (prev) URL.revokeObjectURL(prev.url); return made; });
      KcSfx.play("star");
    } catch {
      setNote("สร้างวิดีโอไม่สำเร็จ ลองใหม่อีกครั้ง หรือดาวน์โหลดเป็นรูปแทน");
    } finally {
      setRecording(false);
    }
  };

  const save = (m: Made | null) => { if (!m) return; KcSfx.play("pop"); download(m.blob, m.file.name); };
  const send = async (m: Made | null) => { if (!m) return; KcSfx.play("pop"); await share(m.file, info); };
  const canShareImage = !!image && canShareFile(image.file);
  const canShareVideo = !!video && canShareFile(video.file);
  const ext = fmt?.ext ?? "mp4";

  return (
    <div className={styles.saveBackdrop} role="dialog" aria-modal="true" aria-labelledby="kd-save-title">
      <div className={styles.saveCard}>
        <div className={styles.savePreview}>
          {/* eslint-disable-next-line @next/next/no-img-element -- generated blob URL */}
          {image ? <img src={image.url} alt={`ตัวอย่างผลงาน ${message}`} /> : <span className={styles.shimmer} />}
          {recording && (
            <div className={styles.recording} role="status" aria-live="polite">
              <span>กำลังถ่ายวิดีโอ {Math.round(progress * VIDEO_SECONDS)}/{VIDEO_SECONDS} วิ</span>
              <span className={styles.bar}><i style={{ width: `${progress * 100}%` }} /></span>
            </div>
          )}
        </div>

        <div className={styles.saveForm}>
          <div className={styles.saveHead}>
            <h2 id="kd-save-title" className={styles.saveTitle}>บันทึกผลงาน</h2>
            <div className={styles.saveTools}>
              {/* the stage toolbar is behind the dialog, so fullscreen is offered here too */}
              <button type="button" className={`kc-tap-chrome ${styles.round} ${styles.saveClose}`} onClick={onToggleFull} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>⛶</button>
              <button type="button" className={`kc-tap-chrome ${styles.round} ${styles.saveClose}`} onClick={onClose} disabled={recording} aria-label="ปิด">✕</button>
            </div>
          </div>

          <label className={styles.field}>
            <span className={styles.groupLabel}>ข้อความ · {message.length}/{MESSAGE_MAX}</span>
            <input className={styles.nameInput} value={message} maxLength={MESSAGE_MAX} placeholder="พิมพ์ข้อความที่อยากให้ขึ้นด้านบน" disabled={recording} onChange={(e) => edited(setMessage)(e.target.value)} />
          </label>
          <div className={styles.field}>
            <span className={styles.groupLabel}>ฉากหลัง</span>
            <div className={styles.chips} role="radiogroup" aria-label="ฉากหลัง">
              {BGS.map((b) => (
                <button key={b.id} type="button" role="radio" aria-checked={bg === b.id} disabled={recording} className={`${styles.chip} ${bg === b.id ? styles.chipOn : ""}`} onClick={() => { KcSfx.play("tick"); edited(setBg)(b.id); }}>{b.label}</button>
              ))}
            </div>
          </div>

          <div className={styles.saveActions}>
            <span className={styles.groupLabel}>รูปภาพ</span>
            <div className={styles.saveRow}>
              <button type="button" className={`kc-tap ${styles.next}`} disabled={!image || recording} onClick={() => save(image)}>⬇ ดาวน์โหลดรูป</button>
              {canShareImage && <button type="button" className={`kc-tap ${styles.back}`} disabled={recording} onClick={() => void send(image)}>แชร์รูป</button>}
            </div>
          </div>

          <div className={styles.saveActions}>
            <span className={styles.groupLabel}>วิดีโอ {VIDEO_SECONDS} วินาที</span>
            {!fmt ? (
              <p className={styles.saveNote}>เบราว์เซอร์นี้ยังสร้างวิดีโอไม่ได้ ลองเปิดด้วย Chrome หรือ Safari รุ่นล่าสุด</p>
            ) : video ? (
              <div className={styles.saveRow}>
                <button type="button" className={`kc-tap ${styles.next}`} onClick={() => save(video)}>⬇ ดาวน์โหลดวิดีโอ (.{ext})</button>
                {canShareVideo && <button type="button" className={`kc-tap ${styles.back}`} onClick={() => void send(video)}>แชร์วิดีโอ</button>}
              </div>
            ) : (
              <div className={styles.saveRow}>
                <button type="button" className={`kc-tap ${styles.back}`} disabled={recording} onClick={() => void makeVideo()}>{recording ? "กำลังสร้าง…" : "🎬 สร้างวิดีโอ"}</button>
              </div>
            )}
          </div>
          {note && <p className={styles.saveNote} role="alert">{note}</p>}
        </div>
      </div>
    </div>
  );
}
