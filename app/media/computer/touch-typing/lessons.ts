export type Lesson = {
  id: string;
  title: string;
  description: string;
  newKeys: string[];
  drills: string[];
  passAccuracy: number;
  suggestedWpm?: number;
};

export const LESSONS: Lesson[] = [
  { id: "home-left", title: "1. มือซ้ายแถวเหย้า", description: "เริ่มวางนิ้วซ้ายให้ถูกตำแหน่ง", newKeys: ["KeyA", "KeyS", "KeyD", "KeyF"], drills: ["ฟฟ หห กก ดด ฟห กด ฟก หด"], passAccuracy: 90 },
  { id: "home-right", title: "2. มือขวาแถวเหย้า", description: "เติมมือขวาและเริ่มพิมพ์คำสั้น", newKeys: ["KeyJ", "KeyK", "KeyL", "Semicolon"], drills: ["่่ าา สส วว กา ดา หา สา"], passAccuracy: 90 },
  { id: "home-reach", title: "3. นิ้วชี้เอื้อม", description: "เอื้อมนิ้วชี้โดยกลับมาที่แถวเหย้า", newKeys: ["KeyG", "KeyH"], drills: ["ว่า ก้า เก่า เส้า ได้ กา ว่า"], passAccuracy: 90 },
  { id: "top-left", title: "4. แถวบนมือซ้าย", description: "ฝึก ไ ำ พ ะ ด้วยมือซ้าย", newKeys: ["KeyW", "KeyE", "KeyR", "KeyT"], drills: ["ไป พา พี่ ที่ มี ไม่ ไปมา"], passAccuracy: 90 },
  { id: "top-right", title: "5. แถวบนมือขวา", description: "ฝึก ั ี ร น ย ด้วยมือขวา", newKeys: ["KeyY", "KeyU", "KeyI", "KeyO", "KeyP"], drills: ["พี่ ยา นา มี รา ไป ไม่"], passAccuracy: 90 },
  { id: "bottom-left", title: "6. แถวล่างมือซ้าย", description: "ฝึก ผ ป แ อ และ ิ", newKeys: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB"], drills: ["พ่อ แม่ ป้า อา ผ้า ไปมา"], passAccuracy: 90 },
  { id: "bottom-right", title: "7. แถวล่างมือขวา", description: "ฝึก ื ท ม ใ ฝ", newKeys: ["KeyN", "KeyM", "Comma", "Period", "Slash"], drills: ["แม่ ที่ อา ใน ผม ใหม่"], passAccuracy: 90 },
  { id: "numbers", title: "8. ตัวเลขและอักขระ", description: "เอื้อมแถวตัวเลขโดยไม่ยกทั้งมือ", newKeys: ["KeyQ", "Digit1", "Digit2", "Digit8", "Digit9", "Digit0"], drills: ["ไป ๆ มา ๆ ทำซ้ำ ๑ ๒ ๕ ๖ ๗"], passAccuracy: 90, suggestedWpm: 8 },
  { id: "shift", title: "9. ปุ่ม Shift", description: "ใช้นิ้วก้อยข้างตรงข้ามกับตัวอักษร", newKeys: ["ShiftLeft", "ShiftRight", "KeyC", "KeyV", "KeyK", "KeyI", "KeyP"], drills: ["ฉัน ฮา ภาษา โค้ด ณ ญ"], passAccuracy: 90, suggestedWpm: 8 },
  { id: "review", title: "10. ทบทวนรวม", description: "พิมพ์ประโยคสั้นจากวิทยาการคำนวณ", newKeys: [], drills: ["คิดก่อนพิมพ์ ตรวจคำให้ถูก ทำซ้ำอย่างเป็นขั้นตอน"], passAccuracy: 90, suggestedWpm: 10 },
];

