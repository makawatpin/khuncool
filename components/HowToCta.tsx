"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useAccountSheet } from "./AccountSheet";

/**
 * Closing call to action for the /tools walkthrough. Steps 3 and 4 promise
 * "sign up to keep it" and "share a link", so the section needs somewhere to
 * act on that — otherwise it describes features with no way in.
 *
 * Signed-in teachers are not asked to sign up again: they get the roster page
 * instead, which is where both promises actually cash out.
 */
export default function HowToCta() {
  const { user, ready } = useAuth();
  const { openAccountSheet } = useAccountSheet();

  return (
    <div className="mt-6 flex flex-col items-center gap-2.5 md:mt-8">
      {/* Height is fixed across all three states so the section doesn't shift
          when auth resolves. */}
      <div className="flex h-[46px] items-center md:h-[50px]">
        {!ready ? (
          <div
            aria-hidden="true"
            className="h-full w-[240px] rounded-btn bg-[#EDEEF7] md:w-[280px]"
          />
        ) : user ? (
          <Link
            href="/classrooms"
            className="flex h-full items-center rounded-btn bg-primary px-7 text-sm font-semibold text-white no-underline shadow-cta hover:bg-primary-hover md:px-9 md:text-base"
          >
            ไปที่ห้องเรียนของฉัน
          </Link>
        ) : (
          <button
            type="button"
            onClick={openAccountSheet}
            className="h-full rounded-btn bg-primary px-7 text-sm font-semibold text-white shadow-cta hover:bg-primary-hover md:px-9 md:text-base"
          >
            สมัครฟรี เก็บรายชื่อไว้ใช้ซ้ำ
          </button>
        )}
      </div>

      <p className="m-0 text-center text-[11.5px] leading-[1.6] text-ink-muted md:text-xs">
        {ready && user
          ? "สร้างห้องและวางรายชื่อครั้งเดียว แล้วเรียกใช้ได้จากทุกเครื่องมือ"
          : "ไม่สมัครก็ใช้เครื่องมือได้ครบทุกตัว การสมัครมีไว้เพื่อเก็บข้อมูลไว้ใช้ซ้ำเท่านั้น"}
      </p>
    </div>
  );
}
