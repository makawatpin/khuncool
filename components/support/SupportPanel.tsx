"use client";

import Image from "next/image";
import { useId, useMemo, useRef, useState } from "react";
import QrCode from "@/components/QrCode";
import { buildPromptPayPayload } from "@/lib/promptpay";
import { SUPPORT_MESSAGE_MAX, SUPPORT_NAME_MAX } from "@/lib/support/message";

type FormState = "idle" | "sending" | "sent" | "error" | "full";

const INPUT =
  "w-full rounded-[11px] border border-border-strong bg-surface-card px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/20";
const LABEL = "mb-1.5 block text-xs font-semibold text-ink-secondary";

/** The PromptPay payload, or null when the ID is unset or malformed. A bad
 *  env value must hide the QR, never break the sheet. */
function usePromptPayPayload(): string | null {
  return useMemo(() => {
    const id = process.env.NEXT_PUBLIC_PROMPTPAY_ID;
    if (!id) return null;
    try {
      return buildPromptPayPayload(id);
    } catch {
      return null;
    }
  }, []);
}

/** Shared by the sheet and the /support page; only the outer spacing differs. */
export default function SupportPanel({
  variant,
  headingId,
}: {
  variant: "sheet" | "page";
  headingId?: string;
}) {
  const fallbackId = useId();
  const titleId = headingId ?? fallbackId;
  const payload = usePromptPayPayload();

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<FormState>("idle");

  // State updates land on the next render, so a fast double tap could pass a
  // state check twice. The ref flips synchronously: one tap, one row.
  const inFlight = useRef(false);
  const canSend = message.trim().length > 0 && state !== "sending";

  const send = async () => {
    if (!canSend || inFlight.current) return;
    inFlight.current = true;
    setState("sending");
    try {
      const res = await fetch("/api/support/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      if (res.ok) {
        setName("");
        setMessage("");
        setState("sent");
      } else {
        setState(res.status === 429 ? "full" : "error");
      }
    } catch {
      setState("error");
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <div className={variant === "page" ? "mx-auto max-w-[440px]" : ""}>
      <div className="mb-3.5 flex items-center gap-2.5 pr-10">
        <Image
          src="/assets/khuncool-logo.webp"
          alt=""
          width={40}
          height={40}
          className="flex-none object-contain"
        />
        <div className="min-w-0">
          <h2 id={titleId} className="m-0 text-base font-bold leading-snug text-ink">
            เลี้ยงกาแฟคุณคูล
          </h2>
          <p className="m-0 text-xs text-ink-secondary">ขอบคุณที่แวะมาช่วยกันครับ</p>
        </div>
      </div>

      <p className="mb-3.5 rounded-btn border border-border bg-surface-light px-3 py-2 text-center text-[12.5px] leading-relaxed text-ink-secondary">
        เท่าไหร่ก็ได้ครับ ช่วยให้เว็บอยู่ต่อได้ก็ดีใจแล้ว
      </p>

      {payload && (
        <div className="mb-4 flex flex-col items-center gap-2 rounded-card border border-border bg-surface-light p-3">
          <div className="overflow-hidden rounded-lg bg-white">
            <QrCode value={payload} size={168} label="QR พร้อมเพย์สำหรับเลี้ยงกาแฟคุณคูล" />
          </div>
          <p className="m-0 text-center text-[12.5px] text-ink-secondary">
            เปิดแอปธนาคาร สแกน แล้วใส่ยอดที่อยากให้
          </p>
        </div>
      )}

      {state === "sent" ? (
        <div className="mb-3 rounded-[10px] bg-success-bg px-3 py-3 text-center text-[13px] font-medium text-success">
          ส่งแล้ว ขอบคุณมากครับ 💜
        </div>
      ) : (
        <>
          <div className="mb-3">
            <label htmlFor={`${titleId}-name`} className={LABEL}>
              ชื่อ <span className="font-normal text-ink-faint">(ไม่ใส่ก็ได้)</span>
            </label>
            <input
              id={`${titleId}-name`}
              value={name}
              maxLength={SUPPORT_NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              className={INPUT}
            />
          </div>
          <div className="mb-2.5">
            <label htmlFor={`${titleId}-message`} className={LABEL}>
              ข้อความ
            </label>
            <textarea
              id={`${titleId}-message`}
              value={message}
              rows={3}
              maxLength={SUPPORT_MESSAGE_MAX}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="อยากบอกอะไร หรืออยากให้ทำเครื่องมืออะไรเพิ่ม บอกได้เลยครับ"
              className={`${INPUT} resize-none`}
            />
          </div>

          <p className="mb-3 rounded-[9px] bg-[#F2F2FD] px-2.5 py-2 text-[12px] leading-relaxed text-primary">
            อยากได้เครื่องมือหรือสื่อแบบไหนเพิ่ม แจ้งมาได้เลยนะครับ{" "}
            <b className="font-bold">ไม่ต้องโอนก็ส่งมาได้</b>
          </p>

          {state === "full" && (
            <div role="alert" className="mb-3 rounded-[10px] bg-error-bg px-3 py-2 text-[12.5px] font-medium text-error">
              ตอนนี้กล่องข้อความเต็มชั่วคราว ลองใหม่ภายหลังนะครับ
            </div>
          )}
          {state === "error" && (
            <div role="alert" className="mb-3 rounded-[10px] bg-error-bg px-3 py-2 text-[12.5px] font-medium text-error">
              ส่งไม่สำเร็จ ลองใหม่อีกครั้งนะครับ
            </div>
          )}

          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            className="w-full rounded-btn bg-primary py-3 text-[14.5px] font-semibold text-white shadow-cta transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {state === "sending" ? "กำลังส่ง…" : "ส่งข้อความ"}
          </button>
        </>
      )}

      <div className="mt-3.5 flex flex-col gap-1.5 text-[11px] leading-relaxed text-ink-faint">
        <p className="m-0">
          ข้อความที่ส่งมาอาจถูกนำไปขึ้นหน้าขอบคุณที่ /support ถ้าไม่อยากให้ขึ้นชื่อ เว้นช่องชื่อไว้ได้
        </p>
        <p className="m-0">
          เป็นการให้ด้วยความสมัครใจ ไม่ใช่การซื้อสินค้า ไม่มีการคืนเงิน
          และไม่ได้ปลดล็อกอะไรเพิ่มในเว็บ เครื่องมือทุกตัวฟรีเหมือนเดิม
        </p>
      </div>
    </div>
  );
}
