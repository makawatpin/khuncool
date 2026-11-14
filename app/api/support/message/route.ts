import { NextResponse } from "next/server";
import { submitSupportMessage } from "@/lib/support/message";
import { createSupportStore } from "@/lib/support/store";

/** Public: a teacher's message from the เลี้ยงกาแฟ sheet. Nothing about the
 *  sender is stored beyond what they typed. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const result = await submitSupportMessage(createSupportStore(), body);
    if (result === "invalid") return NextResponse.json({ error: "invalid" }, { status: 400 });
    if (result === "queue_full") {
      return NextResponse.json({ error: "queue_full" }, { status: 429 });
    }
    return NextResponse.json({});
  } catch (error) {
    console.error(
      "support message failed:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
