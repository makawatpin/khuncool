import type { ChoiceQuestion, LessonSlide, PaintQuestion, QuizQuestion } from "./types";

/**
 * เนื้อหาทั้งหมดของสื่อนี้ — ตายตัว ไม่สุ่ม
 *
 * ครูฉายจอหน้าชั้นและเดินตามลำดับ ความคาดเดาได้สำคัญกว่าความหลากหลาย
 * และการไม่สุ่มทำให้ audit ไม่ต้อง sweep seed
 */

export const LESSON_SLIDES: LessonSlide[] = [
  {
    id: "equal-parts",
    title: "แบ่งเท่า ๆ กันคืออะไร",
    fraction: null,
    steps: [
      {
        caption: "นี่คือพิซซ่า 1 ถาด เราเรียกทั้งถาดนี้ว่า 1 ทั้งหมด",
        shapes: [{ shape: "circle", parts: 1, filled: [] }],
        reveal: "none",
      },
      {
        caption: "ตัดครึ่งให้สองชิ้นเท่ากันพอดี แบบนี้แบ่งเท่า ๆ กัน ใช้ได้",
        shapes: [{ shape: "circle", parts: 2, filled: [] }],
        reveal: "none",
        highlight: "all",
      },
      {
        caption: "แต่ถ้าตัดแล้วชิ้นไม่เท่ากัน แบบนี้ยังไม่ใช่เศษส่วนนะ",
        shapes: [
          { shape: "bar", parts: 2, filled: [] },
          { shape: "bar", parts: 2, filled: [], unequal: true },
        ],
        reveal: "none",
      },
    ],
  },
  {
    id: "one-half",
    title: "ครึ่งหนึ่ง",
    fraction: { numerator: 1, denominator: 2 },
    steps: [
      {
        caption: "เค้ก 1 ก้อน ตัดออกเป็น 2 ชิ้นเท่ากัน",
        shapes: [{ shape: "circle", parts: 2, filled: [] }],
        reveal: "none",
      },
      {
        caption: "ระบายสีไว้ 1 ชิ้น",
        shapes: [{ shape: "circle", parts: 2, filled: [0] }],
        reveal: "denominator",
        highlight: "all",
      },
      {
        caption: "เขียนได้ว่า 1 ส่วน 2 อ่านว่า หนึ่งส่วนสอง หรือ ครึ่งหนึ่ง",
        shapes: [{ shape: "circle", parts: 2, filled: [0] }],
        reveal: "full",
        highlight: "filled",
      },
    ],
  },
  {
    id: "one-quarter",
    title: "หนึ่งส่วนสี่",
    fraction: { numerator: 1, denominator: 4 },
    steps: [
      {
        caption: "ช็อกโกแลตแท่งนี้หักได้ 4 ชิ้นเท่ากัน",
        shapes: [{ shape: "bar", parts: 4, filled: [] }],
        reveal: "none",
      },
      {
        caption: "กินไป 1 ชิ้น",
        shapes: [{ shape: "bar", parts: 4, filled: [0] }],
        reveal: "denominator",
        highlight: "all",
      },
      {
        caption: "เขียนได้ว่า 1 ส่วน 4 — ไม่ใช่พิซซ่าก็เป็นเศษส่วนได้",
        shapes: [{ shape: "bar", parts: 4, filled: [0] }],
        reveal: "full",
        highlight: "filled",
      },
    ],
  },
  {
    id: "parts-meaning",
    title: "ตัวเศษ ตัวส่วน บอกอะไร",
    fraction: { numerator: 3, denominator: 5 },
    steps: [
      {
        caption: "แท่งนี้แบ่ง 5 ส่วน ระบายไว้ 3 ส่วน",
        shapes: [{ shape: "bar", parts: 5, filled: [0, 1, 2] }],
        reveal: "none",
      },
      {
        caption: "ตัวเลขข้างล่างคือ ตัวส่วน บอกว่าแบ่งทั้งหมดกี่ส่วน — นับได้ 5",
        shapes: [{ shape: "bar", parts: 5, filled: [0, 1, 2] }],
        reveal: "denominator",
        highlight: "all",
      },
      {
        caption: "ตัวเลขข้างบนคือ ตัวเศษ บอกว่าเอามากี่ส่วน — นับได้ 3",
        shapes: [{ shape: "bar", parts: 5, filled: [0, 1, 2] }],
        reveal: "full",
        highlight: "filled",
      },
    ],
  },
  {
    id: "same-fraction",
    title: "รูปเดียวกัน เขียนได้แบบเดียว",
    fraction: { numerator: 1, denominator: 2 },
    steps: [
      {
        caption: "วงกลมใบนี้ระบายไว้ครึ่งหนึ่ง",
        shapes: [{ shape: "circle", parts: 2, filled: [0] }],
        reveal: "none",
      },
      {
        caption: "แท่งกับสี่เหลี่ยมก็ระบายไว้ครึ่งหนึ่งเหมือนกัน",
        shapes: [
          { shape: "circle", parts: 2, filled: [0] },
          { shape: "bar", parts: 2, filled: [0] },
          { shape: "square", parts: 2, filled: [0] },
        ],
        reveal: "none",
      },
      {
        caption: "รูปต่างกันแต่เขียนเป็นเศษส่วนได้เหมือนกันหมด คือ 1 ส่วน 2",
        shapes: [
          { shape: "circle", parts: 2, filled: [0] },
          { shape: "bar", parts: 2, filled: [0] },
          { shape: "square", parts: 2, filled: [0] },
        ],
        reveal: "full",
        highlight: "filled",
      },
    ],
  },
];

export const CHOICE_QUESTIONS: ChoiceQuestion[] = [
  {
    id: "c1",
    numerator: 1,
    denominator: 2,
    options: [
      { shape: "circle", parts: 2, filled: [0] },
      { shape: "circle", parts: 4, filled: [0] },
      { shape: "circle", parts: 3, filled: [0] },
    ],
    answerIndex: 0,
    explain: "แบ่ง 2 ส่วน ระบาย 1 ส่วน จึงเป็น 1 ส่วน 2",
  },
  {
    id: "c2",
    numerator: 1,
    denominator: 4,
    options: [
      { shape: "bar", parts: 3, filled: [0] },
      { shape: "bar", parts: 4, filled: [0] },
      { shape: "bar", parts: 4, filled: [0, 1] },
    ],
    answerIndex: 1,
    explain: "ต้องแบ่ง 4 ส่วน และระบายแค่ 1 ส่วน",
  },
  {
    id: "c3",
    numerator: 1,
    denominator: 3,
    options: [
      { shape: "bar", parts: 3, filled: [0], unequal: true },
      { shape: "bar", parts: 4, filled: [0] },
      { shape: "bar", parts: 3, filled: [0] },
    ],
    answerIndex: 2,
    explain: "รูปแรกแบ่งไม่เท่ากันจึงใช้ไม่ได้ ต้องแบ่งเท่ากัน 3 ส่วนแล้วระบาย 1 ส่วน",
  },
  {
    id: "c4",
    numerator: 3,
    denominator: 4,
    options: [
      { shape: "square", parts: 4, filled: [0, 1, 2] },
      { shape: "square", parts: 4, filled: [0] },
      { shape: "square", parts: 3, filled: [0, 1, 2] },
    ],
    answerIndex: 0,
    explain: "แบ่ง 4 ส่วน ระบาย 3 ส่วน จึงเป็น 3 ส่วน 4",
  },
  {
    id: "c5",
    numerator: 2,
    denominator: 5,
    options: [
      { shape: "bar", parts: 5, filled: [0, 1, 2] },
      { shape: "bar", parts: 5, filled: [0, 1] },
      { shape: "bar", parts: 2, filled: [0] },
    ],
    answerIndex: 1,
    explain: "แบ่ง 5 ส่วน ระบาย 2 ส่วน — นับสีให้ครบก่อนตอบ",
  },
  {
    id: "c6",
    numerator: 4,
    denominator: 6,
    options: [
      { shape: "circle", parts: 6, filled: [0, 1, 2] },
      { shape: "bar", parts: 6, filled: [0, 1, 2, 3], unequal: true },
      { shape: "circle", parts: 6, filled: [0, 1, 2, 3] },
    ],
    answerIndex: 2,
    explain: "แบ่งเท่ากัน 6 ส่วน แล้วระบาย 4 ส่วน",
  },
];

export const PAINT_QUESTIONS: PaintQuestion[] = [
  { id: "p1", numerator: 1, denominator: 2, shape: "bar", explain: "แบ่ง 2 ส่วน ระบาย 1 ส่วน" },
  { id: "p2", numerator: 1, denominator: 3, shape: "circle", explain: "แบ่ง 3 ส่วน ระบาย 1 ส่วน" },
  { id: "p3", numerator: 2, denominator: 4, shape: "square", explain: "แบ่ง 4 ส่วน ระบาย 2 ส่วน" },
  { id: "p4", numerator: 3, denominator: 4, shape: "bar", explain: "แบ่ง 4 ส่วน ระบาย 3 ส่วน" },
  { id: "p5", numerator: 2, denominator: 5, shape: "bar", explain: "แบ่ง 5 ส่วน ระบาย 2 ส่วน" },
  { id: "p6", numerator: 5, denominator: 6, shape: "circle", explain: "แบ่ง 6 ส่วน ระบาย 5 ส่วน" },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "รูปไหนถูกแบ่งเท่า ๆ กัน",
    shapes: [
      { shape: "bar", parts: 3, filled: [] },
      { shape: "bar", parts: 3, filled: [], unequal: true },
    ],
    answer: "รูปแรก",
    note: "รูปที่สองแต่ละชิ้นกว้างไม่เท่ากัน จึงเขียนเป็นเศษส่วนไม่ได้",
  },
  {
    id: "q2",
    question: "รูปนี้ระบายไว้เท่าไรของทั้งหมด",
    shapes: [{ shape: "circle", parts: 2, filled: [0] }],
    answer: "ครึ่งหนึ่ง หรือ 1 ส่วน 2",
    note: "แบ่ง 2 ส่วนเท่ากัน ระบายไว้ 1 ส่วน",
  },
  {
    id: "q3",
    question: "แท่งนี้แบ่งทั้งหมดกี่ส่วน",
    shapes: [{ shape: "bar", parts: 4, filled: [0] }],
    answer: "4 ส่วน",
    note: "จำนวนส่วนทั้งหมดคือตัวส่วน เขียนไว้ข้างล่างเส้นคั่น",
  },
  {
    id: "q4",
    question: "รูปนี้เขียนเป็นเศษส่วนว่าอย่างไร",
    shapes: [{ shape: "square", parts: 4, filled: [0, 1, 2] }],
    answer: "3 ส่วน 4",
    note: "ระบาย 3 ส่วนจากทั้งหมด 4 ส่วน ตัวเศษคือ 3 ตัวส่วนคือ 4",
  },
  {
    id: "q5",
    question: "ตัวเศษของ 2 ส่วน 5 คือเลขอะไร และบอกอะไรเรา",
    shapes: [{ shape: "bar", parts: 5, filled: [0, 1] }],
    answer: "คือ 2 บอกว่าเราเอามา 2 ส่วน",
    note: "ตัวเศษอยู่ข้างบนเส้นคั่น บอกจำนวนส่วนที่เราเอามา",
  },
  {
    id: "q6",
    question: "สองรูปนี้ระบายไว้เท่ากันไหม",
    shapes: [
      { shape: "circle", parts: 2, filled: [0] },
      { shape: "square", parts: 2, filled: [0] },
    ],
    answer: "เท่ากัน ทั้งคู่คือครึ่งหนึ่ง",
    note: "รูปทรงต่างกันได้ แต่ถ้าแบ่งเท่ากันและระบายเท่ากัน ก็เป็นเศษส่วนเดียวกัน",
  },
  {
    id: "q7",
    question: "รูปนี้ยังไม่ได้ระบายอยู่กี่ส่วน",
    shapes: [{ shape: "bar", parts: 6, filled: [0, 1, 2, 3] }],
    answer: "2 ส่วน หรือ 2 ส่วน 6",
    note: "ทั้งหมด 6 ส่วน ระบายไปแล้ว 4 ส่วน จึงเหลือ 2 ส่วน",
  },
  {
    id: "q8",
    question: "แม่ทำขนมมา 1 ถาด ตัดแบ่งเท่า ๆ กันให้เพื่อน 4 คน แต่ละคนจะได้ขนมเท่าไรของทั้งถาด",
    shapes: [{ shape: "circle", parts: 4, filled: [0] }],
    answer: "คนละ 1 ส่วน 4",
    note: "แบ่งเท่ากัน 4 ส่วน คนหนึ่งได้ 1 ส่วน จึงเป็น 1 ส่วน 4 ของทั้งถาด",
  },
];
