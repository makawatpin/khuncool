export type SortKind = "hardware" | "software";

export type SortItem = {
  id: string;
  name: string;
  english: string;
  icon: string;
  kind: SortKind;
  hint: string;
};

export const SORT_ITEMS: SortItem[] = [
  { id: "keyboard", name: "แป้นพิมพ์", english: "Keyboard", icon: "⌨️", kind: "hardware", hint: "อุปกรณ์สำหรับพิมพ์ข้อมูล" },
  { id: "mouse", name: "เมาส์", english: "Mouse", icon: "🖱️", kind: "hardware", hint: "อุปกรณ์สำหรับชี้และคลิก" },
  { id: "monitor", name: "จอภาพ", english: "Monitor", icon: "🖥️", kind: "hardware", hint: "อุปกรณ์แสดงผลที่มองเห็นและจับต้องได้" },
  { id: "printer", name: "เครื่องพิมพ์", english: "Printer", icon: "🖨️", kind: "hardware", hint: "อุปกรณ์พิมพ์งานลงบนกระดาษ" },
  { id: "cpu", name: "หน่วยประมวลผล", english: "Processor (CPU)", icon: "🧠", kind: "hardware", hint: "ชิ้นส่วนที่คำนวณคำสั่งของคอมพิวเตอร์" },
  { id: "camera", name: "เว็บแคม", english: "Webcam", icon: "📷", kind: "hardware", hint: "อุปกรณ์รับภาพเข้าสู่คอมพิวเตอร์" },
  { id: "speaker", name: "ลำโพง", english: "Speaker", icon: "🔊", kind: "hardware", hint: "อุปกรณ์ส่งเสียงออกจากคอมพิวเตอร์" },
  { id: "microphone", name: "ไมโครโฟน", english: "Microphone", icon: "🎙️", kind: "hardware", hint: "อุปกรณ์รับเสียงเข้าสู่คอมพิวเตอร์" },
  { id: "usb-drive", name: "แฟลชไดรฟ์", english: "USB Flash Drive", icon: "💾", kind: "hardware", hint: "อุปกรณ์ขนาดเล็กสำหรับเก็บและย้ายข้อมูล" },
  { id: "scanner", name: "เครื่องสแกน", english: "Scanner", icon: "📠", kind: "hardware", hint: "อุปกรณ์นำภาพจากกระดาษเข้าสู่คอมพิวเตอร์" },
  { id: "browser", name: "เว็บเบราว์เซอร์", english: "Web Browser", icon: "🌐", kind: "software", hint: "โปรแกรมสำหรับเปิดเว็บไซต์" },
  { id: "paint", name: "โปรแกรมวาดภาพ", english: "Drawing Program", icon: "🎨", kind: "software", hint: "ชุดคำสั่งสำหรับสร้างและระบายสีภาพ" },
  { id: "game", name: "เกมคอมพิวเตอร์", english: "Computer Game", icon: "🎮", kind: "software", hint: "โปรแกรมที่สร้างความสนุกบนอุปกรณ์" },
  { id: "os", name: "ระบบปฏิบัติการ", english: "Operating System", icon: "⚙️", kind: "software", hint: "ซอฟต์แวร์หลักที่ควบคุมเครื่อง" },
  { id: "editor", name: "โปรแกรมพิมพ์งาน", english: "Word Processor", icon: "📝", kind: "software", hint: "โปรแกรมสำหรับสร้างเอกสาร" },
  { id: "antivirus", name: "แอนติไวรัส", english: "Antivirus", icon: "🛡️", kind: "software", hint: "โปรแกรมช่วยตรวจจับภัยคุกคาม" },
  { id: "calculator", name: "โปรแกรมเครื่องคิดเลข", english: "Calculator", icon: "🧮", kind: "software", hint: "โปรแกรมสำหรับคำนวณตัวเลข" },
  { id: "presentation", name: "โปรแกรมนำเสนอ", english: "Presentation Program", icon: "📊", kind: "software", hint: "โปรแกรมสำหรับสร้างสไลด์นำเสนอ" },
  { id: "media-player", name: "โปรแกรมเล่นสื่อ", english: "Media Player", icon: "🎬", kind: "software", hint: "โปรแกรมสำหรับเปิดเพลงและวิดีโอ" },
  { id: "email", name: "โปรแกรมอีเมล", english: "Email Application", icon: "✉️", kind: "software", hint: "โปรแกรมสำหรับรับและส่งจดหมายอิเล็กทรอนิกส์" },
];
