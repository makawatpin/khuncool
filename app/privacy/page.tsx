import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว | khuncool",
  description:
    "นโยบายความเป็นส่วนตัวของ khuncool.com ข้อมูลที่จัดเก็บ วิธีใช้คุกกี้ และสิทธิ์ของผู้ใช้งานตาม PDPA",
  alternates: {
    canonical: "https://www.khuncool.com/privacy",
  },
};

const SECTIONS = [
  {
    head: "ข้อมูลที่เราจัดเก็บ",
    body: "เครื่องมือส่วนใหญ่บนเว็บนี้ (เช่น สุ่มชื่อ แบ่งกลุ่ม จับเวลา กระดานคะแนน) บันทึกข้อมูลที่คุณกรอกไว้ในเบราว์เซอร์ของเครื่องคุณเองเท่านั้น (localStorage) เราไม่เก็บรายชื่อนักเรียนหรือข้อมูลที่กรอกไว้บนเซิร์ฟเวอร์ของเรา หากคุณสมัครสมาชิกเพื่อใช้ระบบซิงก์ข้อมูล เราจะจัดเก็บอีเมลและข้อมูลบัญชีที่จำเป็นสำหรับการเข้าสู่ระบบเท่านั้น",
  },
  {
    head: "เครื่องวัดเสียงในห้องเรียน",
    body: "หน้าเครื่องวัดเสียงในห้องเรียนใช้ไมโครโฟนของอุปกรณ์เพื่อประมวลผลระดับความดังแบบเรียลไทม์ในเครื่องของคุณเท่านั้น เราไม่มีการอัดเสียง บันทึกเสียง หรือส่งข้อมูลเสียงออกไปนอกเครื่องแต่อย่างใด",
  },
  {
    head: "คุกกี้",
    body: "เราใช้คุกกี้เพื่อให้เว็บใช้งานได้ดีขึ้น จดจำการตั้งค่าของคุณ วิเคราะห์การเข้าใช้งาน และแสดงโฆษณาตามความสนใจ คุณสามารถเลือกยอมรับคุกกี้ทั้งหมดหรือเฉพาะที่จำเป็นได้จากแบนเนอร์คุกกี้เมื่อเข้าใช้งานครั้งแรก",
  },
  {
    head: "การแบ่งปันข้อมูล",
    body: "เราไม่ขายหรือแบ่งปันข้อมูลส่วนบุคคลของคุณให้บุคคลที่สามเพื่อวัตถุประสงค์ทางการตลาด ข้อมูลบัญชีผู้ใช้จัดเก็บผ่านผู้ให้บริการที่เชื่อถือได้ซึ่งใช้เพื่อการยืนยันตัวตนและซิงก์ข้อมูลของคุณเองเท่านั้น",
  },
  {
    head: "สิทธิ์ของผู้ใช้งาน",
    body: "คุณสามารถขอดู แก้ไข หรือลบข้อมูลบัญชีของคุณได้ทุกเมื่อ โดยติดต่อเราผ่านอีเมลด้านล่าง สำหรับข้อมูลที่บันทึกไว้ในเบราว์เซอร์ (เช่น รายชื่อนักเรียน) คุณสามารถล้างได้เองผ่านการล้างข้อมูลเว็บไซต์ในเบราว์เซอร์ของคุณ",
  },
  {
    head: "การเปลี่ยนแปลงนโยบาย",
    body: "เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราวเพื่อให้สอดคล้องกับการให้บริการและกฎหมายที่เกี่ยวข้อง การเปลี่ยนแปลงจะมีผลทันทีที่เผยแพร่บนหน้านี้",
  },
];

export default function PrivacyPage() {
  return (
    <main className="flex-1 w-full max-w-[1160px] mx-auto bg-white">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-4 pt-3.5 text-[11.5px] text-ink-faint md:gap-[7px] md:px-8 md:pt-[18px] md:text-[12.5px]">
        <Link href="/" className="text-ink-faint">
          หน้าแรก
        </Link>
        <span>›</span>
        <span className="font-semibold text-ink-secondary">
          นโยบายความเป็นส่วนตัว
        </span>
      </div>

      {/* Header */}
      <div className="px-4 pb-3 pt-3 md:px-8 md:pb-4 md:pt-4">
        <h1 className="m-0 mb-1.5 text-[22px] leading-[1.32] md:mb-2 md:text-[28px]">
          นโยบายความเป็นส่วนตัว
        </h1>
        <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-secondary md:text-[14.5px] md:leading-[1.7]">
          เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ นโยบายนี้อธิบายว่าเราจัดเก็บและใช้ข้อมูลอย่างไรเมื่อคุณใช้งาน khuncool.com
        </p>
      </div>

      {/* Sections */}
      <div className="border-t border-border px-4 py-6 md:px-8 md:py-9">
        <div className="flex flex-col gap-5 md:max-w-[68ch] md:gap-6">
          {SECTIONS.map((s) => (
            <div key={s.head}>
              <h2 className="m-0 mb-1.5 text-[15px] font-bold md:text-lg">
                {s.head}
              </h2>
              <p className="m-0 text-[13.5px] leading-[1.75] text-ink-secondary md:text-[14.5px] md:leading-[1.8]">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="border-t border-border bg-surface-light px-4 py-6 md:px-8 md:py-9">
        <h2 className="m-0 mb-3 text-lg md:mb-4 md:text-2xl">
          ติดต่อเรื่องข้อมูลส่วนตัว
        </h2>
        <div className="mt-3 max-w-[62ch] rounded-2xl border border-border bg-surface-card p-3.5 md:p-4">
          <p className="m-0 text-[13.5px] leading-[1.7] text-ink-secondary md:text-[14.5px] md:leading-[1.75]">
            หากมีคำถามเกี่ยวกับข้อมูลส่วนตัวของคุณ ติดต่อได้ที่{" "}
            <a
              href="mailto:khuncoolhub@gmail.com"
              className="font-semibold text-primary underline"
            >
              khuncoolhub@gmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
