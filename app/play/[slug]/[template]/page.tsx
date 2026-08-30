import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MysteryBoardApp from "@/app/mystery-board/MysteryBoardApp";
import QuestionApp from "@/app/random-question/QuestionApp";
import { isShareTemplate, type SharedContentSet } from "@/lib/contentSets/types";
import { createPublicServerClient } from "@/lib/supabase/publicServerClient";
import type { BoardSize, Theme } from "@/app/mystery-board/boardModel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "กิจกรรมที่แชร์ | KhunCool",
  description: "เปิดกิจกรรมห้องเรียนที่ครูแชร์ผ่าน KhunCool",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ slug: string; template: string }> };

function cleanItems(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").slice(0, 200);
}

export default async function SharedActivityPage({ params }: PageProps) {
  const { slug, template } = await params;
  if (!/^[23456789abcdefghjkmnpqrstuvwxyz]{10}$/.test(slug) || !isShareTemplate(template)) notFound();

  const { data, error } = await createPublicServerClient()
    .from("kc_content_sets")
    .select("slug,title,kind,items,default_template,template_config")
    .eq("slug", slug)
    .eq("default_template", template)
    .in("visibility", ["unlisted", "public"])
    .maybeSingle();

  if (error || !data) notFound();
  const set = data as SharedContentSet;
  const items = cleanItems(set.items);
  const config = set.template_config ?? {};
  const boardMode = config.mode === "score" ? "score" : "question";
  if (items.length === 0 && (template === "random-question" || boardMode === "question")) notFound();
  const size = [12, 20, 30].includes(Number(config.size)) ? Number(config.size) as BoardSize : 20;
  const theme = ["daylight", "space", "treasure", "neon"].includes(String(config.theme))
    ? String(config.theme) as Theme
    : "daylight";

  return (
    <main className="mx-auto w-full max-w-[1160px] flex-1 bg-white px-4 pb-10 pt-5 md:px-8">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-primary">กิจกรรมที่แชร์ผ่าน KhunCool</p>
          <h1 className="mb-1 mt-1 text-2xl">{set.title}</h1>
          <p className="m-0 text-sm text-ink-secondary">เปิดเล่นได้ทันที การแก้ไขในหน้านี้จะไม่เปลี่ยนต้นฉบับของครู</p>
        </div>
        <Link href={template === "random-question" ? "/random-question" : "/mystery-board"} className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-primary no-underline">
          สร้างชุดของฉัน
        </Link>
      </div>
      {template === "random-question" ? (
        <QuestionApp initialQuestions={items} />
      ) : (
        <MysteryBoardApp
          isShared
          initialSettings={{
            mode: boardMode,
            questions: items,
            size,
            theme,
            soundOn: typeof config.soundOn === "boolean" ? config.soundOn : true,
          }}
        />
      )}
    </main>
  );
}
