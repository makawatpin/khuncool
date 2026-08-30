"use client";

import { useState } from "react";
import { useAdminFetch } from "../useAdminFetch";
import { ErrorCard, ListSkeleton } from "./ErrorCard";
import type { AgendaItem, CategoryKey } from "@/lib/teacher-calendar/types";

interface CalendarResponse {
  today: string;
  agenda: AgendaItem[];
  month: {
    year: number;
    month: number;
    days: { date: string; items: AgendaItem[] }[];
  };
}

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  holiday: "วันสำคัญ",
  paperwork: "เอกสาร",
  evaluation: "ประเมิน",
  exam: "สอบ",
  competition: "แข่งขัน",
  career: "อาชีพ",
  term: "ภาคเรียน",
};

const CATEGORY_DOT: Record<CategoryKey, string> = {
  holiday: "bg-primary",
  paperwork: "bg-amber-500",
  evaluation: "bg-violet-500",
  exam: "bg-rose-500",
  competition: "bg-emerald-500",
  career: "bg-sky-500",
  term: "bg-slate-500",
};

const STATUS_LABEL: Record<AgendaItem["status"], string> = {
  overdue: "เลยกำหนดลงแล้ว",
  "act-now": "ถึงเวลาเริ่มทำ",
  upcoming: "ยังไม่ถึงเวลา",
  passed: "ผ่านไปแล้ว",
  unknown: "ยังไม่มีข้อมูลวันที่",
};

const STATUS_CLASS: Record<AgendaItem["status"], string> = {
  overdue: "bg-error-bg text-error border-error-border",
  "act-now": "bg-amber-500/10 text-amber-600 border-amber-500/30",
  upcoming: "bg-surface-panel text-ink-muted border-border",
  passed: "bg-surface-panel text-ink-faint border-border",
  unknown: "bg-surface-panel text-ink-faint border-border",
};

function formatThaiDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function AgendaRow({ item }: { item: AgendaItem }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
      >
        <span className={`h-2 w-2 flex-none rounded-full ${CATEGORY_DOT[item.category]}`} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-ink">{item.title}</span>
          <span className="block text-xs text-ink-muted">
            {CATEGORY_LABEL[item.category]}
            {item.resolvedDate && (
              <>
                {" · "}
                {item.precision === "approx" ? "ราว " : ""}
                {formatThaiDate(item.resolvedDate)}
              </>
            )}
            {item.daysUntilPublishBy !== null && (
              <>{" · "}เหลืออีก {item.daysUntilPublishBy} วันถึงกำหนดลง</>
            )}
          </span>
        </span>
        <span
          className={`flex-none whitespace-nowrap rounded-full border px-2 py-0.5 text-xs ${STATUS_CLASS[item.status]}`}
        >
          {STATUS_LABEL[item.status]}
        </span>
      </button>
      {open && (
        <div className="border-t border-border px-3 py-2.5 text-sm">
          {item.note && <p className="mb-2 text-xs text-ink-faint">{item.note}</p>}
          {item.searchTerms.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {item.searchTerms.map((term) => (
                <span
                  key={term}
                  className="rounded-full bg-surface-panel px-2 py-0.5 text-xs text-ink-muted"
                >
                  {term}
                </span>
              ))}
            </div>
          )}
          {item.contentIdeas.length > 0 && (
            <ul className="list-inside list-disc space-y-0.5 text-xs text-ink-muted">
              {item.contentIdeas.map((idea) => (
                <li key={idea}>{idea}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

const CATEGORIES: CategoryKey[] = [
  "holiday",
  "paperwork",
  "evaluation",
  "exam",
  "competition",
  "career",
  "term",
];

const WEEKDAY_LABELS = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

function MonthGrid({
  data,
  activeCategories,
  selectedDate,
  onSelectDate,
}: {
  data: CalendarResponse["month"];
  activeCategories: Set<CategoryKey>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}) {
  const firstOfMonth = new Date(Date.UTC(data.year, data.month - 1, 1));
  const firstWeekday = firstOfMonth.getUTCDay() === 0 ? 7 : firstOfMonth.getUTCDay();
  const leadingBlanks = firstWeekday - 1;

  const todayIso = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

  return (
    <div className="grid grid-cols-7 gap-1">
      {WEEKDAY_LABELS.map((w) => (
        <div key={w} className="pb-1 text-center text-xs text-ink-faint">
          {w}
        </div>
      ))}
      {Array.from({ length: leadingBlanks }).map((_, i) => (
        <div key={`blank-${i}`} />
      ))}
      {data.days.map((day) => {
        const items = day.items.filter((it) => activeCategories.has(it.category));
        const isToday = day.date === todayIso;
        const isSelected = day.date === selectedDate;
        const dayNum = Number(day.date.slice(-2));
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelectDate(day.date)}
            className={`flex min-h-[3.5rem] flex-col items-start rounded-md border p-1.5 text-left ${
              isSelected
                ? "border-primary bg-primary/5"
                : isToday
                  ? "border-primary/50"
                  : "border-border"
            }`}
          >
            <span className="text-xs text-ink-muted">{dayNum}</span>
            <span className="mt-1 flex flex-wrap gap-0.5">
              {items.slice(0, 3).map((it) => (
                <span key={it.id} className={`h-1.5 w-1.5 rounded-full ${CATEGORY_DOT[it.category]}`} />
              ))}
              {items.length > 3 && (
                <span className="text-[10px] text-ink-faint">+{items.length - 3}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function CalendarTab() {
  const [viewMonth, setViewMonth] = useState<{ year: number; month: number } | null>(null);
  const path = viewMonth
    ? `/api/admin/calendar?month=${viewMonth.year}-${String(viewMonth.month).padStart(2, "0")}`
    : "/api/admin/calendar";
  const state = useAdminFetch<CalendarResponse>(path);
  const [activeCategories, setActiveCategories] = useState<Set<CategoryKey>>(
    new Set(CATEGORIES)
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (state.status === "loading") return <ListSkeleton />;
  if (state.status === "error") return <ErrorCard message={state.error} />;

  const { agenda, month } = state.data;

  function toggleCategory(cat: CategoryKey) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function goToMonth(delta: number) {
    setSelectedDate(null);
    const base = viewMonth ?? { year: month.year, month: month.month };
    let nextMonth = base.month + delta;
    let nextYear = base.year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    setViewMonth({ year: nextYear, month: nextMonth });
  }

  function goToCurrentMonth() {
    setSelectedDate(null);
    setViewMonth(null);
  }

  const selectedDay = selectedDate ? month.days.find((d) => d.date === selectedDate) : null;
  const filteredAgenda = agenda.filter((a) => activeCategories.has(a.category));

  return (
    <div className="space-y-6">
      <div className="rounded-[--radius-card] border border-border bg-surface-card p-3">
        <p className="mb-2 px-1 text-xs text-ink-muted">ต้องทำตอนนี้</p>
        {filteredAgenda.length === 0 ? (
          <p className="px-1 py-4 text-center text-sm text-ink-faint">
            ไม่มีรายการที่ต้องเตรียมในช่วงนี้
          </p>
        ) : (
          <ul className="space-y-1.5">
            {filteredAgenda.map((item) => (
              <AgendaRow key={`${item.id}-${item.year}`} item={item} />
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-[--radius-card] border border-border bg-surface-card p-3">
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              aria-label="เดือนก่อนหน้า"
              className="rounded-md border border-border px-2 py-1 text-xs text-ink-muted hover:bg-surface-panel"
            >
              ‹
            </button>
            <span className="min-w-[7rem] text-center text-sm text-ink">
              {new Date(Date.UTC(month.year, month.month - 1, 1)).toLocaleDateString("th-TH", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </span>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              aria-label="เดือนถัดไป"
              className="rounded-md border border-border px-2 py-1 text-xs text-ink-muted hover:bg-surface-panel"
            >
              ›
            </button>
          </div>
          {viewMonth && (
            <button
              type="button"
              onClick={goToCurrentMonth}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-ink-muted hover:bg-surface-panel"
            >
              กลับเดือนนี้
            </button>
          )}
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5 px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                activeCategories.has(cat)
                  ? "border-border bg-surface-panel text-ink"
                  : "border-border text-ink-faint opacity-50"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${CATEGORY_DOT[cat]}`} />
              {CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>

        <MonthGrid
          data={month}
          activeCategories={activeCategories}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d === selectedDate ? null : d)}
        />

        {selectedDay && (
          <div className="mt-3 border-t border-border pt-3">
            {selectedDay.items.filter((it) => activeCategories.has(it.category)).length === 0 ? (
              <p className="px-1 text-sm text-ink-faint">ไม่มีรายการในวันนี้</p>
            ) : (
              <ul className="space-y-1.5">
                {selectedDay.items
                  .filter((it) => activeCategories.has(it.category))
                  .map((item) => (
                    <AgendaRow key={item.id} item={item} />
                  ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
