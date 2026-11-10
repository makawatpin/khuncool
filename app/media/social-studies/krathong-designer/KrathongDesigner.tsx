"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStage } from "../../_stage/useStage";
import { KcSfx } from "@/lib/kcSfx";
import styles from "./KrathongDesigner.module.css";
import {
  CANDLES, CENTERS, DEFAULT_DESIGN, FLOWERS, MATERIALS, PETALS, SHAPES, STEPS, TRIMS, WISHES,
  fillSlots, flowerCount, labelOf, normalize, shapeLocked, toggleSlot,
  type CandleColor, type FlowerKind, type KrathongDesign, type Option,
} from "./designOptions";
import type { DesignerScene, ThumbFocus } from "./three/designerScene";
import type { LayerKey } from "./three/buildKrathong";

const LAST = STEPS.length - 1;
const WAX_SWATCH: Record<CandleColor, string> = { white: "#f7efd8", yellow: "#f6d36b", pink: "#f6b3c8" };

function changedLayer(a: KrathongDesign, b: KrathongDesign): LayerKey | "all" | null {
  if (a.material !== b.material || a.shape !== b.shape) return "all";
  if (a.petals !== b.petals) return "petals";
  if (a.trim !== b.trim) return "trim";
  if (a.center !== b.center) return "center";
  if (a.candle !== b.candle || a.incense !== b.incense) return "candle";
  if (a.flowers.some((f, i) => f !== b.flowers[i])) return "flowers";
  return null;
}

function Cards<T extends string>({ list, value, onPick, thumb, label }: {
  list: Option<T>[]; value: T | null; onPick: (id: T) => void; thumb: (id: T) => string | undefined; label: string;
}) {
  return (
    <div className={styles.cards} role="radiogroup" aria-label={label}>
      {list.map((o) => {
        const src = thumb(o.id);
        const on = value === o.id;
        return (
          <button key={o.id} type="button" role="radio" aria-checked={on} className={`${styles.card} ${on ? styles.cardOn : ""}`} onClick={() => onPick(o.id)}>
            <span className={styles.thumb} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
              {src ? <img src={src} alt="" draggable={false} /> : <span className={styles.shimmer} />}
            </span>
            <span className={styles.cardLabel}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Chips<T extends string>({ list, value, onPick, label, disabled, swatch }: {
  list: Option<T>[]; value: T; onPick: (id: T) => void; label: string; disabled?: boolean; swatch?: (id: T) => string;
}) {
  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>{label}</span>
      <div className={styles.chips} role="radiogroup" aria-label={label}>
        {list.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={value === o.id} disabled={disabled} className={`${styles.chip} ${value === o.id ? styles.chipOn : ""}`} onClick={() => onPick(o.id)}>
            {swatch && <span className={styles.swatch} style={{ background: swatch(o.id) }} aria-hidden="true" />}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function KrathongDesigner() {
  const { stageProps, isFull, toggle } = useStage<HTMLDivElement>();
  const hostRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<DesignerScene | null>(null);
  const shownRef = useRef<KrathongDesign>(DEFAULT_DESIGN);

  const [design, setDesign] = useState<KrathongDesign>(DEFAULT_DESIGN);
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [brush, setBrush] = useState<FlowerKind | null>("marigold");
  const [lit, setLit] = useState(false);
  const [wish, setWish] = useState<string>(WISHES[0]);
  const [name, setName] = useState("");
  const [floated, setFloated] = useState(false);
  const [cardOpen, setCardOpen] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [live, setLive] = useState("");
  const slotTapRef = useRef<(slot: number) => void>(() => {});

  // ---------------------------------------------------------- scene
  useEffect(() => {
    let cancelled = false;
    let scene: DesignerScene | null = null;
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    void import("./three/designerScene").then(({ createDesignerScene }) => {
      if (cancelled) return;
      scene = createDesignerScene(host, {
        reducedMotion: reduced,
        events: { onSlotTap: (i) => slotTapRef.current(i), onFailure: () => setFailed(true) },
      });
      if (!scene) return;
      sceneRef.current = scene;
      if (process.env.NODE_ENV !== "production") (window as unknown as { __krathong?: DesignerScene }).__krathong = scene;
      scene.setDesign(shownRef.current, "all");
      scene.setFocus(0);
      requestAnimationFrame(() => setReady(true));
    }).catch(() => setFailed(true));
    return () => {
      cancelled = true;
      scene?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setMuted(KcSfx.isMuted()), 0);
    return () => window.clearTimeout(t);
  }, []);

  // keep the 3D view centred in the space the panel leaves free
  useEffect(() => {
    const panel = panelRef.current, host = hostRef.current;
    // on the river the panel is gone and the whole stage belongs to the view
    if (floated || !panel || !host) { sceneRef.current?.setInsetBottom(0); return; }
    const sync = () => {
      const hb = host.getBoundingClientRect(), pb = panel.getBoundingClientRect();
      sceneRef.current?.setInsetBottom(floated ? 0 : Math.max(0, hb.bottom - pb.top));
    };
    const ro = new ResizeObserver(sync);
    ro.observe(panel);
    ro.observe(host);
    sync();
    return () => ro.disconnect();
  }, [floated, ready]);

  // ---------------------------------------------------------- design changes
  const apply = useCallback((next: KrathongDesign, slot?: number) => {
    const n = normalize(next);
    const layer = changedLayer(shownRef.current, n);
    shownRef.current = n;
    setDesign(n);
    if (layer) sceneRef.current?.setDesign(n, layer, slot);
  }, []);

  const say = (text: string) => setLive(text);

  useEffect(() => {
    slotTapRef.current = (slot: number) => {
      const next = toggleSlot(shownRef.current, slot, brush);
      KcSfx.play(next.flowers[slot] ? "pop" : "tick");
      apply(next, slot);
      setLive(next.flowers[slot] ? `วาง${labelOf(FLOWERS, next.flowers[slot]!)}ที่ช่อง ${slot + 1}` : `เอาดอกไม้ช่อง ${slot + 1} ออก`);
    };
  }, [brush, apply]);

  const goStep = useCallback((s: number) => {
    const target = Math.max(0, Math.min(LAST, s));
    setStep(target);
    setReached((r) => Math.max(r, target));
    sceneRef.current?.setFocus(target);
    sceneRef.current?.setSlotsActive(target === 3);
    KcSfx.play("click");
    say(`ขั้นที่ ${target + 1} ${STEPS[target].title}`);
  }, []);

  // ---------------------------------------------------------- thumbnails
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !ready || floated) return;
    const jobs: [string, KrathongDesign, ThumbFocus][] = [];
    const key = (d: KrathongDesign, f: ThumbFocus) => `${f}|${JSON.stringify(d)}`;
    if (step === 0) MATERIALS.forEach((m) => { const d = normalize({ ...design, material: m.id }); jobs.push([key(d, "whole"), d, "whole"]); });
    if (step === 1) PETALS.forEach((p) => { const d = { ...design, petals: p.id }; jobs.push([key(d, "whole"), d, "whole"]); });
    if (step === 2) CENTERS.forEach((c) => { const d = { ...design, center: c.id }; jobs.push([key(d, "center"), d, "center"]); });
    if (step === 3) FLOWERS.forEach((f) => jobs.push([`flower:${f.id}`, design, `flower:${f.id}` as ThumbFocus]));
    const todo = jobs.filter(([k]) => !(k in thumbs));
    if (!todo.length) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      todo.forEach(([k, d, f]) => {
        void scene.thumbnail(d, f).then((url) => { if (!cancelled && url) setThumbs((m) => ({ ...m, [k]: url })); });
      });
    }, 220);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [step, design, ready, floated, thumbs]);

  const thumbFor = (d: KrathongDesign, f: ThumbFocus) => thumbs[f.startsWith("flower:") ? f : `${f}|${JSON.stringify(d)}`];

  // ---------------------------------------------------------- actions
  const light = () => {
    if (lit) return;
    setLit(true);
    sceneRef.current?.setLit(true);
    KcSfx.play("star");
    say("จุดเทียนแล้ว");
  };

  const floatIt = () => {
    if (!lit) { setLit(true); sceneRef.current?.setLit(true); }
    const label = name.trim() ? `กระทงของ${name.trim()}` : "";
    sceneRef.current?.setSlotsActive(false);
    sceneRef.current?.float(label);
    setFloated(true);
    setCardOpen(true);
    KcSfx.play("win");
    say(`ลอยกระทงแล้ว คำอธิษฐาน ${wish}`);
  };

  const newKrathong = () => {
    sceneRef.current?.backToStudio();
    shownRef.current = DEFAULT_DESIGN;
    setDesign(DEFAULT_DESIGN);
    sceneRef.current?.setDesign(DEFAULT_DESIGN, "all");
    setLit(false);
    setFloated(false);
    setName("");
    setWish(WISHES[0]);
    setStep(0);
    setReached(0);
    KcSfx.play("whoosh");
    say("เริ่มทำกระทงใบใหม่");
  };

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    KcSfx.setMuted(next);
    if (!next) KcSfx.play("click");
  };

  // ---------------------------------------------------------- render
  const pickSfx = () => KcSfx.play("pop");
  let note = "";
  let body: React.ReactNode = null;
  if (step === 0) {
    note = MATERIALS.find((m) => m.id === design.material)!.note;
    body = <>
      <Cards label="วัสดุฐาน" list={MATERIALS} value={design.material} thumb={(id) => thumbFor(normalize({ ...design, material: id }), "whole")} onPick={(id) => { pickSfx(); apply({ ...design, material: id }); say(`ฐาน${labelOf(MATERIALS, id)}`); }} />
      <Chips label={shapeLocked(design.material) ? "รูปทรง (กะลาเป็นทรงกลม)" : "รูปทรง"} list={SHAPES} value={design.shape} disabled={shapeLocked(design.material)} onPick={(id) => { pickSfx(); apply({ ...design, shape: id }); say(`ทรง${labelOf(SHAPES, id)}`); }} />
    </>;
  } else if (step === 1) {
    note = PETALS.find((p) => p.id === design.petals)!.note;
    body = <>
      <Cards label="ลายกลีบ" list={PETALS} value={design.petals} thumb={(id) => thumbFor({ ...design, petals: id }, "whole")} onPick={(id) => { pickSfx(); apply({ ...design, petals: id }); say(labelOf(PETALS, id)); }} />
      <Chips label="ลูกปัดรอบฐาน" list={TRIMS} value={design.trim} onPick={(id) => { pickSfx(); apply({ ...design, trim: id }); say(labelOf(TRIMS, id)); }} />
    </>;
  } else if (step === 2) {
    note = CENTERS.find((c) => c.id === design.center)!.note;
    body = <Cards label="ยอดกระทง" list={CENTERS} value={design.center} thumb={(id) => thumbFor({ ...design, center: id }, "center")} onPick={(id) => { pickSfx(); apply({ ...design, center: id }); say(labelOf(CENTERS, id)); }} />;
  } else if (step === 3) {
    note = brush ? `แตะวงกลมรอบขอบกระทงเพื่อวาง${labelOf(FLOWERS, brush)} · แตะซ้ำเพื่อเอาออก` : "แตะดอกไม้บนกระทงเพื่อเอาออก";
    body = <>
      <div className={styles.cards} role="radiogroup" aria-label="เลือกดอกไม้">
        {FLOWERS.map((f) => {
          const src = thumbFor(design, `flower:${f.id}`);
          return (
            <button key={f.id} type="button" role="radio" aria-checked={brush === f.id} className={`${styles.card} ${brush === f.id ? styles.cardOn : ""}`} onClick={() => { KcSfx.play("tick"); setBrush(f.id); }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
              <span className={styles.thumb} aria-hidden="true">{src ? <img src={src} alt="" draggable={false} /> : <span className={styles.shimmer} />}</span>
              <span className={styles.cardLabel}>{f.label}</span>
            </button>
          );
        })}
        <button type="button" role="radio" aria-checked={brush === null} className={`${styles.card} ${brush === null ? styles.cardOn : ""}`} onClick={() => { KcSfx.play("tick"); setBrush(null); }}>
          <span className={`${styles.thumb} ${styles.eraser}`} aria-hidden="true">⌫</span>
          <span className={styles.cardLabel}>เอาออก</span>
        </button>
      </div>
      <div className={styles.group}>
        <span className={styles.groupLabel}>วางทีเดียวหลายช่อง · {flowerCount(design)}/{design.flowers.length}</span>
        <div className={styles.chips}>
          <button type="button" className={styles.chip} onClick={() => { KcSfx.play("pop"); apply(fillSlots(design, brush, 1)); say(brush ? `ใส่${labelOf(FLOWERS, brush)}ทุกช่อง` : "เอาดอกไม้ออกทั้งหมด"); }}>{brush ? "ใส่ทุกช่อง" : "ล้างทุกช่อง"}</button>
          <button type="button" className={styles.chip} onClick={() => { KcSfx.play("pop"); apply(fillSlots(design, brush, 2)); say(brush ? `ใส่${labelOf(FLOWERS, brush)}เว้นช่อง` : "เอาออกเว้นช่อง"); }}>เว้นช่อง</button>
          <button type="button" className={styles.chip} onClick={() => { KcSfx.play("tick"); apply(fillSlots(design, null, 1)); say("ล้างดอกไม้ทั้งหมด"); }}>ล้างทั้งหมด</button>
        </div>
      </div>
    </>;
  } else if (step === 4) {
    note = lit ? "เปลวเทียนส่องสว่าง พร้อมอธิษฐานแล้ว" : "เลือกสีเทียน แล้วกดจุดเทียน";
    body = <>
      <Chips label="สีเทียน" list={CANDLES} value={design.candle} swatch={(id) => WAX_SWATCH[id]} onPick={(id) => { pickSfx(); apply({ ...design, candle: id }); say(labelOf(CANDLES, id)); }} />
      <div className={styles.group}>
        <span className={styles.groupLabel}>ธูป</span>
        <div className={styles.chips}>
          <button type="button" role="switch" aria-checked={design.incense} className={`${styles.chip} ${design.incense ? styles.chipOn : ""}`} onClick={() => { pickSfx(); apply({ ...design, incense: !design.incense }); say(design.incense ? "เอาธูปออก" : "ปักธูป 3 ดอก"); }}>ธูป 3 ดอก</button>
        </div>
      </div>
      <button type="button" className={`${styles.lightBtn} ${lit ? styles.lightOn : ""}`} onClick={light} disabled={lit}>{lit ? "🔥 จุดแล้ว" : "🔥 จุดเทียน"}</button>
    </>;
  } else {
    note = "กระทงของทุกคนจะลอยอยู่ในแม่น้ำเดียวกัน";
    body = <>
      <div className={styles.group}>
        <span className={styles.groupLabel}>คำอธิษฐาน</span>
        <div className={styles.chips} role="radiogroup" aria-label="คำอธิษฐาน">
          {WISHES.map((w) => (
            <button key={w} type="button" role="radio" aria-checked={wish === w} className={`${styles.chip} ${wish === w ? styles.chipOn : ""}`} onClick={() => { KcSfx.play("tick"); setWish(w); }}>{w}</button>
          ))}
        </div>
      </div>
      <label className={styles.group}>
        <span className={styles.groupLabel}>ชื่อเจ้าของกระทง (ไม่ใส่ก็ได้)</span>
        <input className={styles.nameInput} value={name} maxLength={16} placeholder="เช่น ต้นกล้า" onChange={(e) => setName(e.target.value)} />
      </label>
    </>;
  }

  const nextBlocked = step === 4 && !lit;

  return (
    <div {...stageProps} className="kc-stage">
      <div className={`kc-stage-body ${styles.shell} ${floated ? styles.night : ""}`} style={{ borderRadius: 20 }}>
        <div ref={hostRef} className={`${styles.canvas} ${ready ? styles.canvasReady : ""}`} />

        <header className={styles.top}>
          <div className={styles.title}>
            <span className={styles.kicker}>{floated ? "คืนวันเพ็ญเดือนสิบสอง" : `ขั้นที่ ${step + 1} จาก ${STEPS.length}`}</span>
            <span className={styles.titleText}>{floated ? "ลอยกระทง" : STEPS[step].title}</span>
          </div>
          {!floated && (
            <ol className={styles.steps} aria-label="ขั้นตอน">
              {STEPS.map((s, i) => (
                <li key={s.key}>
                  <button type="button" className={`${styles.stepDot} ${i === step ? styles.stepNow : i <= reached ? styles.stepDone : ""}`} disabled={i > reached} aria-current={i === step ? "step" : undefined} aria-label={`ขั้นที่ ${i + 1} ${s.title}`} onClick={() => goStep(i)}>
                    {i + 1}
                  </button>
                </li>
              ))}
            </ol>
          )}
          <div className={styles.chrome}>
            <button type="button" className={`kc-tap-chrome ${styles.round}`} onClick={toggleSound} aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"}>{muted ? "🔇" : "🔊"}</button>
            <button type="button" className={`kc-tap-chrome ${styles.round}`} onClick={toggle} aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}>⛶</button>
          </div>
        </header>

        {!floated && (
          <section ref={panelRef} className={styles.panel} aria-label={STEPS[step].title}>
            <div className={styles.options}>{body}</div>
            <div className={styles.foot}>
              <p className={styles.note}><span aria-hidden="true">💡 </span>{note}</p>
              <div className={styles.nav}>
                <button type="button" className={`kc-tap ${styles.back}`} onClick={() => goStep(step - 1)} disabled={step === 0}>‹ ย้อนกลับ</button>
                {step < LAST
                  ? <button type="button" className={`kc-tap ${styles.next}`} onClick={() => goStep(step + 1)} disabled={nextBlocked}>{nextBlocked ? "จุดเทียนก่อน" : "ถัดไป ›"}</button>
                  : <button type="button" className={`kc-tap ${styles.next} ${styles.floatBtn}`} onClick={floatIt}>🪷 ลอยกระทง</button>}
              </div>
            </div>
          </section>
        )}

        {floated && cardOpen && (
          <section className={styles.endCard} aria-label="ลอยกระทงแล้ว">
            <p className={styles.endKicker}>{name.trim() ? `กระทงของ${name.trim()}` : "กระทงของเรา"} ลอยไปแล้ว</p>
            <p className={styles.endWish}>“{wish}”</p>
            <div className={styles.endBtns}>
              <button type="button" className={`kc-tap ${styles.next}`} onClick={newKrathong}>ทำกระทงใบใหม่</button>
              <button type="button" className={`kc-tap ${styles.back}`} onClick={() => setCardOpen(false)}>ดูแม่น้ำต่อ</button>
            </div>
          </section>
        )}
        {floated && !cardOpen && (
          <button type="button" className={`kc-tap ${styles.next} ${styles.again}`} onClick={newKrathong}>ทำกระทงใบใหม่</button>
        )}

        {failed && (
          <div className={styles.failed} role="alert">
            <p>เครื่องนี้เปิดภาพ 3 มิติไม่ได้</p>
            <p className={styles.failedSub}>ลองเปิดด้วย Chrome หรือ Edge รุ่นล่าสุด</p>
          </div>
        )}
        <p className={styles.srOnly} role="status" aria-live="polite">{live}</p>
      </div>
    </div>
  );
}
