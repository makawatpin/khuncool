"use client";

import { useCallback } from "react";
import * as XLSX from "xlsx";
import { statusOption, type DailyCheckConfig } from "@/lib/dailyCheck/config";
import { positiveKeys, printCheckMonth } from "@/lib/dailyCheck/print";
import {
  fromIsoDate,
  isWeekend,
  monthDays,
  monthSchoolDays,
  monthSummary,
  shiftMonth,
  type CheckDays,
  type CheckStatus,
} from "@/lib/dailyCheck/days";

const WEEKDAY = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];


type Props = {
  config: DailyCheckConfig;
  students: string[];
  days: CheckDays;
  holidays: string[];
  room: string;
  month: string;
  today: string;
  onMonthChange: (month: string) => void;
  /** Opens one day in the daily view, to fill it in or fix it. */
  onPickDay: (iso: string) => void;
};

export default function MonthView({
  config,
  students,
  days,
  holidays,
  room,
  month,
  today,
  onMonthChange,
  onPickDay,
}: Props) {
  const allDays = monthDays(month);
  const schoolDays = monthSchoolDays(month);
  const positive = positiveKeys(config);
  const { recordedDays, perStudent } = monthSummary(days, month, students, holidays, positive);
  const negative = config.statuses.filter((s) => !s.positive);
  // A status's mark in its own colour; a non-positive one also gets a tint.
  const cellStyle = (key: CheckStatus) => {
    const o = statusOption(config, key);
    return o ? { color: o.color, background: o.positive ? undefined : `${o.color}14` } : undefined;
  };
  const isHoliday = (d: string) => holidays.includes(d);
  const monthHolidays = schoolDays.filter(isHoliday).length;
  const [y, m] = month.split("-").map(Number);
  const monthText = new Date(y, m - 1, 1).toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
  const canGoNext = shiftMonth(month, 1) <= today.slice(0, 7);
  // Students with more than three non-positive days this month.
  const watch = students.filter(
    (_, i) => negative.reduce((n, s) => n + (perStudent[i].counts[s.key] ?? 0), 0) > 3,
  );

  const exportExcel = useCallback(() => {
    const head: (string | number)[] = ["เลขที่", "ชื่อ-สกุล"];
    allDays.forEach((d) => head.push(Number(d.slice(8))));
    config.statuses.forEach((st) => head.push(st.label));
    head.push("%");
    const rows: (string | number)[][] = [head];
    students.forEach((name, i) => {
      const row: (string | number)[] = [i + 1, name];
      allDays.forEach((d) => {
        const off = isWeekend(d) || holidays.includes(d);
        const s = off ? undefined : days[d]?.[name];
        row.push(off ? "-" : (statusOption(config, s ?? null)?.mark ?? ""));
      });
      const t = perStudent[i];
      config.statuses.forEach((st) => row.push(t.counts[st.key] ?? 0));
      row.push(t.percent ?? "");
      rows.push(row);
    });
    rows.push([]);
    rows.push(["ห้อง", room]);
    rows.push(["เดือน", monthText]);
    rows.push(["หมายเหตุ", "- = เสาร์-อาทิตย์หรือวันหยุด (ไม่นับใน %)"]);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 6 }, { wch: 28 }, ...allDays.map(() => ({ wch: 4 })), ...config.statuses.map(() => ({ wch: 5 })), { wch: 5 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${config.fileStem}รายเดือน`);
    XLSX.writeFile(wb, `${config.fileStem}_${room || "ห้อง"}_${month.replace("-", "")}.xlsx`);
  }, [config, allDays, students, days, holidays, perStudent, room, month, monthText]);

  const navBtn =
    "flex h-11 w-11 flex-none items-center justify-center rounded-[10px] border border-[#D3D8E1] bg-white text-xl font-semibold hover:bg-surface-light disabled:cursor-not-allowed disabled:opacity-35 md:h-10 md:w-10";
  const actionBtn =
    "flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#D3D8E1] bg-white px-3.5 py-2.5 text-[13px] font-semibold hover:border-[#C6C9FB] hover:bg-surface-light";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <div className="flex flex-1 items-center gap-1.5">
          <button type="button" onClick={() => onMonthChange(shiftMonth(month, -1))} aria-label="เดือนก่อนหน้า" className={navBtn}>
            ‹
          </button>
          <div className="min-w-[124px] text-center">
            <div className="text-sm font-semibold md:text-[15px]">{monthText}</div>
            <div className="text-[11px] text-[#7C8494]">
              บันทึกแล้ว {recordedDays.length}/{schoolDays.length - monthHolidays} วัน
              {monthHolidays > 0 && ` · หยุด ${monthHolidays} วัน`}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
            disabled={!canGoNext}
            aria-label="เดือนถัดไป"
            className={navBtn}
          >
            ›
          </button>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={exportExcel} className={actionBtn}>
            📊 Excel
          </button>
          <button
            type="button"
            onClick={() => printCheckMonth(config, room, students, month, days, holidays)}
            className={actionBtn}
          >
            🖨️ พิมพ์
          </button>
        </div>
      </div>

      {watch.length > 0 && (
        <div className="mb-3 rounded-xl border border-[#F1C0C0] bg-[#FEF4F4] px-3.5 py-2.5 text-[12.5px] leading-[1.6] text-[#9B1C1C] md:text-[13.5px]">
          <b>ควรติดตาม</b> ({config.watchLabel}): {watch.join(", ")}
        </div>
      )}

      {students.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-[#D3D8E1] bg-surface-light p-8 text-center text-[13.5px] text-[#7C8494]">
          ยังไม่มีรายชื่อนักเรียน
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E8EE]">
          <table className="w-full border-collapse text-[12.5px] md:text-[13px]">
            <thead>
              <tr className="bg-surface-light">
                <th className="sticky left-0 z-10 min-w-[132px] border-b border-r border-[#E5E8EE] bg-surface-light px-2.5 py-2 text-left font-semibold md:min-w-[190px]">
                  ชื่อ-สกุล
                </th>
                {allDays.map((d) => {
                  const recorded = !!days[d];
                  if (isWeekend(d)) {
                    return (
                      <th
                        key={d}
                        className="min-w-[30px] border-b border-[#E5E8EE] bg-[#D9DDE4] text-[#7C8494] font-normal leading-tight"
                      >
                        <span className="block text-[10px]">{WEEKDAY[fromIsoDate(d).getDay()]}</span>
                        <span className="block">{Number(d.slice(8))}</span>
                      </th>
                    );
                  }
                  const holiday = isHoliday(d);
                  return (
                    <th key={d} className={`border-b border-[#E5E8EE] p-0 font-normal ${holiday ? "bg-[#D9DDE4]" : ""}`}>
                      <button
                        type="button"
                        onClick={() => onPickDay(d)}
                        title={`เปิดบันทึกวันที่ ${Number(d.slice(8))}`}
                        className={`flex h-11 w-9 flex-col items-center justify-center leading-tight hover:bg-[#EEF1FE] ${
                          holiday
                            ? "text-[#7C8494]"
                            : d === today
                              ? "bg-[#E1E3FD] font-bold text-primary"
                              : recorded
                                ? "text-ink"
                                : "text-[#A9B0BE]"
                        }`}
                      >
                        <span className="text-[10px]">{holiday ? "หยุด" : WEEKDAY[fromIsoDate(d).getDay()]}</span>
                        <span>{Number(d.slice(8))}</span>
                      </button>
                    </th>
                  );
                })}
                <th className="border-b border-l border-[#E5E8EE] px-2 py-2 font-semibold">{config.percentLabel}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((name, i) => {
                const t = perStudent[i];
                return (
                  <tr key={i} className="border-b border-[#F0F2F5] last:border-b-0">
                    <td className="sticky left-0 z-10 max-w-[132px] truncate border-r border-[#E5E8EE] bg-white px-2.5 py-1.5 md:max-w-[190px]">
                      <span className="mr-1.5 font-mono text-[11px] text-[#A9B0BE]">{i + 1}</span>
                      {name}
                    </td>
                    {allDays.map((d) => {
                      if (isWeekend(d)) {
                        return <td key={d} aria-label="เสาร์-อาทิตย์" className="h-9 min-w-[30px] bg-[#D9DDE4]" />;
                      }
                      if (isHoliday(d)) {
                        return <td key={d} aria-label="วันหยุด" className="h-9 w-9 bg-[#D9DDE4]" />;
                      }
                      const s = days[d]?.[name];
                      return (
                        <td key={d} className="h-9 w-9 text-center text-[15px] font-bold" style={s ? cellStyle(s) : undefined}>
                          {statusOption(config, s ?? null)?.mark ?? ""}
                        </td>
                      );
                    })}
                    <td
                      className={`border-l border-[#E5E8EE] px-2 text-center font-mono font-semibold ${
                        t.percent !== null && t.percent < 80 ? "text-[#DC2626]" : ""
                      }`}
                    >
                      {t.percent ?? "–"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2.5 text-[11.5px] leading-[1.6] text-[#A9B0BE]">
        {config.statuses.map((st) => `${st.mark} ${st.label}`).join(" · ")} · ช่องว่าง = ยังไม่ได้บันทึก · ช่องสีเทา = เสาร์-อาทิตย์และวันหยุด · แตะวันที่ด้านบนเพื่อเปิดบันทึกวันนั้น
      </p>
    </div>
  );
}
