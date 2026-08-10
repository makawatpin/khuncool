"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useStage } from "../../_stage/useStage";
import styles from "./ScienceLabGame.module.css";

type Difficulty = "easy" | "medium" | "hard";
type Question = { topic: string; situation: string; question: string; options: string[]; answer: number; icon: string; explain: string };

const BANK: Record<Difficulty, Question[]> = {
  easy: [
    { topic:"สสาร",icon:"💧",situation:"ถังน้ำในห้องทดลองมีทรายปะปน",question:"ควรใช้อุปกรณ์ใดแยกทรายออกจากน้ำ?",options:["กระดาษกรอง","แม่เหล็ก","เทอร์โมมิเตอร์","แว่นขยาย"],answer:0,explain:"กระดาษกรองให้ของเหลวผ่าน แต่กักเม็ดทรายไว้" },
    { topic:"สิ่งมีชีวิต",icon:"🌱",situation:"ต้นกล้าในโดมทดลองเริ่มเหี่ยว",question:"สิ่งใดจำเป็นต่อการสร้างอาหารของพืช?",options:["แสงแดด","เสียง","ดินเหนียวเท่านั้น","ลมแรง"],answer:0,explain:"พืชใช้พลังงานแสงในการสังเคราะห์ด้วยแสง" },
    { topic:"แรง",icon:"🧲",situation:"ตะปูเหล็กตกอยู่ใต้โต๊ะทดลอง",question:"อุปกรณ์ใดหยิบตะปูได้โดยไม่ใช้มือ?",options:["แม่เหล็ก","หลอดแก้ว","ยางลบ","กระดาษ"],answer:0,explain:"แม่เหล็กออกแรงดึงดูดวัตถุที่ทำจากเหล็ก" },
    { topic:"โลกและอวกาศ",icon:"☀️",situation:"ระบบจำลองดาวเคราะห์หยุดทำงาน",question:"ดาวเคราะห์ใดอยู่ใกล้ดวงอาทิตย์ที่สุด?",options:["ดาวพุธ","โลก","ดาวอังคาร","ดาวเสาร์"],answer:0,explain:"ดาวพุธเป็นดาวเคราะห์ลำดับแรกจากดวงอาทิตย์" },
    { topic:"ร่างกาย",icon:"🫁",situation:"หุ่นจำลองร่างกายต้องเติมก๊าซสำคัญ",question:"มนุษย์หายใจนำก๊าซใดไปใช้?",options:["ออกซิเจน","คาร์บอนไดออกไซด์","ฮีเลียม","ไฮโดรเจน"],answer:0,explain:"ร่างกายใช้ออกซิเจนในการหายใจระดับเซลล์" },
    { topic:"พลังงาน",icon:"🔦",situation:"ไฟฉายฉุกเฉินดับกลางห้องทดลอง",question:"พลังงานในถ่านไฟฉายเปลี่ยนเป็นพลังงานใด?",options:["แสง","ลม","เสียงอย่างเดียว","พลังงานนิวเคลียร์"],answer:0,explain:"พลังงานเคมีในถ่านเปลี่ยนเป็นไฟฟ้าและแสง" },
    { topic:"วัสดุ",icon:"⚡",situation:"ต้องต่อวงจรไฟเตือนฉุกเฉิน",question:"วัสดุใดนำไฟฟ้าได้ดีที่สุด?",options:["ทองแดง","ไม้","ยาง","แก้ว"],answer:0,explain:"ทองแดงเป็นโลหะและเป็นตัวนำไฟฟ้าที่ดี" },
    { topic:"สิ่งมีชีวิต",icon:"🐋",situation:"ระบบจำแนกสัตว์แจ้งเตือนข้อมูลผิด",question:"สัตว์ชนิดใดเลี้ยงลูกด้วยนม?",options:["วาฬ","ปลาฉลาม","ปลาหมึก","ปลาการ์ตูน"],answer:0,explain:"วาฬหายใจด้วยปอดและเลี้ยงลูกด้วยนม" },
    { topic:"สสาร",icon:"🧊",situation:"น้ำแข็งในตู้ทดลองกำลังละลาย",question:"การละลายเปลี่ยนสถานะจากอะไรเป็นอะไร?",options:["ของแข็งเป็นของเหลว","ของเหลวเป็นแก๊ส","แก๊สเป็นของแข็ง","ของเหลวเป็นของแข็ง"],answer:0,explain:"การหลอมเหลวคือของแข็งได้รับความร้อนจนเป็นของเหลว" },
    { topic:"แรง",icon:"🍎",situation:"ผลไม้จำลองหล่นจากแขนกล",question:"แรงใดดึงวัตถุลงสู่พื้น?",options:["แรงโน้มถ่วง","แรงแม่เหล็ก","แรงไฟฟ้า","แรงลอยตัว"],answer:0,explain:"แรงโน้มถ่วงของโลกดึงวัตถุเข้าหาศูนย์กลางโลก" },
  ],
  medium: [
    { topic:"สสาร",icon:"☁️",situation:"ไอน้ำร้อนกำลังเต็มห้องทดลอง",question:"ต้องทำอย่างไรให้ไอน้ำควบแน่นเร็วขึ้น?",options:["ทำให้เย็นลง","เพิ่มความร้อน","เพิ่มแสง","เขย่าภาชนะ"],answer:0,explain:"เมื่อไอน้ำสูญเสียความร้อนจะควบแน่นเป็นหยดน้ำ" },
    { topic:"ระบบนิเวศ",icon:"🐝",situation:"จำนวนผึ้งในโดมระบบนิเวศลดลง",question:"ผลกระทบใดมีโอกาสเกิดขึ้นก่อน?",options:["พืชผสมเกสรลดลง","น้ำทะเลเพิ่มทันที","หินละลาย","แรงโน้มถ่วงลดลง"],answer:0,explain:"ผึ้งช่วยถ่ายละอองเรณู การลดลงจึงกระทบการผสมเกสร" },
    { topic:"ไฟฟ้า",icon:"🔌",situation:"หลอดไฟในวงจรอนุกรมดวงหนึ่งขาด",question:"หลอดไฟดวงอื่นจะเป็นอย่างไร?",options:["ดับทั้งหมด","สว่างขึ้น","ไม่เปลี่ยนแปลง","เปลี่ยนสี"],answer:0,explain:"วงจรอนุกรมมีทางเดินกระแสเส้นเดียว เมื่อขาดวงจรจึงเปิด" },
    { topic:"แรง",icon:"🛝",situation:"ต้องเลื่อนลังอุปกรณ์หนักขึ้นรถ",question:"เครื่องกลอย่างง่ายใดช่วยออกแรงน้อยลง?",options:["พื้นเอียง","สปริง","เทอร์โมมิเตอร์","เลนส์"],answer:0,explain:"พื้นเอียงเพิ่มระยะทางเพื่อช่วยลดแรงที่ต้องใช้" },
    { topic:"โลก",icon:"🌍",situation:"สถานีอากาศตรวจพบกลางวันและกลางคืน",question:"ปรากฏการณ์นี้เกิดจากอะไร?",options:["โลกหมุนรอบตัวเอง","โลกหยุดนิ่ง","ดวงจันทร์หมุนรอบโลก","ฤดูกาลเปลี่ยน"],answer:0,explain:"โลกหมุนรอบตัวเองทำให้แต่ละด้านรับแสงสลับกัน" },
    { topic:"ร่างกาย",icon:"❤️",situation:"เซนเซอร์ชีพจรของนักวิจัยทำงาน",question:"อวัยวะใดสูบฉีดเลือดไปทั่วร่างกาย?",options:["หัวใจ","ปอด","กระเพาะอาหาร","ไต"],answer:0,explain:"หัวใจบีบตัวเพื่อส่งเลือดผ่านหลอดเลือด" },
    { topic:"แสง",icon:"🌈",situation:"ลำแสงขาวผ่านปริซึมแก้ว",question:"จะสังเกตเห็นอะไร?",options:["แสงแยกเป็นหลายสี","แสงหายไป","เกิดเสียงดัง","แก้วกลายเป็นโลหะ"],answer:0,explain:"ปริซึมหักเหแสงแต่ละความยาวคลื่นต่างกันจึงเกิดสเปกตรัม" },
    { topic:"สารละลาย",icon:"🧂",situation:"ต้องการให้เกลือละลายในน้ำเร็วขึ้น",question:"วิธีใดช่วยได้ดีที่สุด?",options:["คนและใช้น้ำอุ่น","แช่แข็ง","วางนิ่ง ๆ","เติมทราย"],answer:0,explain:"การคนเพิ่มการสัมผัสและความร้อนช่วยให้อนุภาคเคลื่อนที่เร็วขึ้น" },
    { topic:"อาหาร",icon:"🥬",situation:"ต้องทดสอบอาหารที่ให้พลังงานหลัก",question:"สารอาหารใดเป็นแหล่งพลังงานหลักของร่างกาย?",options:["คาร์โบไฮเดรต","วิตามิน","เกลือแร่","น้ำ"],answer:0,explain:"คาร์โบไฮเดรตถูกย่อยเป็นกลูโคสเพื่อใช้เป็นพลังงาน" },
    { topic:"อวกาศ",icon:"🌙",situation:"โมเดลดวงจันทร์แสดงรูปร่างเปลี่ยนทุกคืน",question:"ข้างขึ้นข้างแรมเกิดจากอะไร?",options:["ตำแหน่งดวงจันทร์เทียบโลกและดวงอาทิตย์","ดวงจันทร์เปลี่ยนรูปร่าง","เมฆบังเสมอ","โลกหยุดหมุน"],answer:0,explain:"เราเห็นส่วนสว่างของดวงจันทร์ต่างกันตามตำแหน่งโคจร" },
  ],
  hard: [
    { topic:"การทดลอง",icon:"🧪",situation:"ต้องทดสอบว่าปุ๋ยชนิดใหม่ทำให้พืชโตเร็วหรือไม่",question:"ตัวแปรใดควรเปลี่ยนเพียงอย่างเดียว?",options:["ชนิดของปุ๋ย","ปริมาณน้ำและแสงพร้อมกัน","ชนิดพืชทุกกระถาง","ขนาดกระถางทุกใบ"],answer:0,explain:"การทดลองที่ยุติธรรมเปลี่ยนตัวแปรต้นเพียงตัวเดียว" },
    { topic:"ความหนาแน่น",icon:"⚖️",situation:"วัตถุสองชิ้นมีขนาดเท่ากันแต่มวลต่างกัน",question:"ชิ้นที่มีมวลมากกว่าจะมีสมบัติใด?",options:["ความหนาแน่นมากกว่า","ปริมาตรมากกว่าเสมอ","ไม่มีน้ำหนัก","อุณหภูมิสูงกว่าเสมอ"],answer:0,explain:"เมื่อปริมาตรเท่ากัน ชิ้นที่มีมวลมากย่อมมีความหนาแน่นมากกว่า" },
    { topic:"วงจรไฟฟ้า",icon:"💡",situation:"ต้องการให้หลอดสองดวงทำงานแยกกัน",question:"ควรต่อวงจรแบบใด?",options:["วงจรขนาน","วงจรอนุกรม","วงจรเปิด","ไม่ใช้แหล่งกำเนิดไฟฟ้า"],answer:0,explain:"วงจรขนานมีหลายแขนง อุปกรณ์จึงทำงานแยกกันได้" },
    { topic:"ระบบนิเวศ",icon:"🦅",situation:"ผู้ล่าสูงสุดหายไปจากสายใยอาหาร",question:"ประชากรเหยื่อมีแนวโน้มอย่างไรในระยะแรก?",options:["เพิ่มขึ้น","สูญพันธุ์ทันที","ไม่เปลี่ยนแน่นอน","กลายเป็นผู้ผลิต"],answer:0,explain:"แรงกดดันจากการล่าลดลง ทำให้ประชากรเหยื่อมีแนวโน้มเพิ่ม" },
    { topic:"ความร้อน",icon:"🌡️",situation:"ช้อนโลหะและช้อนไม้อยู่ในน้ำร้อน",question:"ทำไมช้อนโลหะจึงร้อนถึงด้ามเร็วกว่า?",options:["โลหะนำความร้อนได้ดี","ไม้สร้างความเย็น","โลหะไม่มีมวล","น้ำไม่ถ่ายเทความร้อน"],answer:0,explain:"โลหะมีการนำความร้อนดีกว่าไม้" },
    { topic:"แรงดัน",icon:"🎈",situation:"ลูกโป่งถูกนำขึ้นที่สูงซึ่งความดันอากาศต่ำลง",question:"ลูกโป่งมีแนวโน้มเปลี่ยนอย่างไร?",options:["ขยายใหญ่ขึ้น","หดจนเล็กลงเสมอ","มวลเพิ่ม","กลายเป็นของเหลว"],answer:0,explain:"ความดันภายนอกลดลง ก๊าซภายในจึงขยายตัว" },
    { topic:"พันธุกรรม",icon:"🧬",situation:"กำลังจำแนกลักษณะของสิ่งมีชีวิต",question:"ลักษณะใดถ่ายทอดทางพันธุกรรมได้ชัดเจน?",options:["หมู่เลือด","แผลเป็น","ทักษะปั่นจักรยาน","ภาษาที่พูด"],answer:0,explain:"หมู่เลือดถูกกำหนดโดยยีนที่ได้รับจากพ่อแม่" },
    { topic:"อวกาศ",icon:"🪐",situation:"ยานสำรวจต้องไปยังดาวเคราะห์วงแหวนเด่นชัด",question:"ควรตั้งเส้นทางไปดาวเคราะห์ดวงใด?",options:["ดาวเสาร์","ดาวศุกร์","ดาวพุธ","ดาวอังคาร"],answer:0,explain:"ดาวเสาร์มีระบบวงแหวนกว้างและเห็นเด่นชัด" },
    { topic:"กรด–เบส",icon:"🧫",situation:"สารไม่ทราบชนิดทำให้กระดาษลิตมัสสีน้ำเงินเป็นแดง",question:"สารนี้น่าจะมีสมบัติใด?",options:["เป็นกรด","เป็นเบส","เป็นโลหะเสมอ","เป็นแก๊สเฉื่อย"],answer:0,explain:"กรดเปลี่ยนลิตมัสสีน้ำเงินให้เป็นสีแดง" },
    { topic:"พลังงาน",icon:"☀️",situation:"แผงโซลาร์เซลล์จ่ายไฟให้สถานีวิจัย",question:"เกิดการเปลี่ยนพลังงานแบบใด?",options:["แสงเป็นไฟฟ้า","ไฟฟ้าเป็นแสงเท่านั้น","เคมีเป็นนิวเคลียร์","เสียงเป็นความร้อน"],answer:0,explain:"เซลล์แสงอาทิตย์เปลี่ยนพลังงานแสงเป็นพลังงานไฟฟ้า" },
  ],
};

const shuffle = <T,>(items:T[]) => { const result=[...items]; for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];} return result; };
function sceneFor(topic:string){
  if(/อวกาศ|โลก/.test(topic))return "space";
  if(/สิ่งมีชีวิต|ระบบนิเวศ|พันธุกรรม/.test(topic))return "life";
  if(/ไฟฟ้า|วงจร|พลังงาน|แสง/.test(topic))return "electric";
  if(/แรง|ความหนาแน่น|แรงดัน/.test(topic))return "force";
  if(/ร่างกาย|อาหาร/.test(topic))return "body";
  return "chemistry";
}
function optionIcon(option:string){
  const icons:[RegExp,string][]=[
    [/กระดาษกรอง/,"🧻"],[/แม่เหล็ก|แรงแม่เหล็ก/,"🧲"],[/เทอร์โมมิเตอร์|อุณหภูมิ|ความร้อน/,"🌡️"],[/แว่นขยาย|เลนส์/,"🔍"],
    [/แสงแดด|พลังงานแสง|แสงเป็น|เพิ่มแสง/,"☀️"],[/เสียง/,"🔊"],[/ดิน|กระถาง/,"🪴"],[/ลม/,"💨"],[/ตะปู|เหล็ก|โลหะ/,"🔩"],[/หลอดแก้ว|แก้ว/,"🧪"],[/ยาง/,"🛞"],[/กระดาษ/,"📄"],
    [/ดาวพุธ/,"☄️"],[/โลก/,"🌍"],[/ดาวอังคาร/,"🔴"],[/ดาวเสาร์|วงแหวน/,"🪐"],[/ดาวศุกร์/,"🟠"],[/ดวงจันทร์/,"🌙"],[/ดวงอาทิตย์/,"☀️"],[/ฤดูกาล/,"🍂"],
    [/ออกซิเจน/,"🫁"],[/คาร์บอนไดออกไซด์/,"🌫️"],[/ฮีเลียม/,"🎈"],[/ไฮโดรเจน/,"💧"],[/หัวใจ/,"❤️"],[/ปอด/,"🫁"],[/กระเพาะ/,"🍽️"],[/ไต/,"🫘"],[/หมู่เลือด/,"🩸"],[/แผลเป็น/,"🩹"],[/ปั่นจักรยาน/,"🚲"],[/ภาษา/,"💬"],
    [/ทองแดง|ตัวนำ|วงจร|ไฟฟ้า/,"🔌"],[/ไม้/,"🪵"],[/หลอดไฟ|สว่าง|ดับทั้งหมด/,"💡"],[/วงจรขนาน/,"🔀"],[/วงจรอนุกรม/,"➿"],[/วงจรเปิด/,"⛓️‍💥"],[/แหล่งกำเนิด/,"🔋"],[/นิวเคลียร์/,"☢️"],
    [/วาฬ/,"🐋"],[/ฉลาม/,"🦈"],[/ปลาหมึก/,"🦑"],[/ปลาการ์ตูน/,"🐠"],[/ผึ้ง|ผสมเกสร/,"🐝"],[/ผู้ผลิต/,"🌿"],[/ประชากร|เพิ่มขึ้น/,"📈"],[/สูญพันธุ์/,"💀"],
    [/ของแข็ง/,"🧊"],[/ของเหลว/,"💧"],[/แก๊ส|ไอน้ำ/,"☁️"],[/ทำให้เย็น|แช่แข็ง|ความเย็น/,"❄️"],[/เพิ่มความร้อน|น้ำอุ่น/,"🔥"],[/เขย่า|คนและ/,"🥄"],[/วางนิ่ง/,"⏸️"],[/เติมทราย|ทราย/,"🏖️"],
    [/แรงโน้มถ่วง/,"🍎"],[/แรงไฟฟ้า/,"⚡"],[/แรงลอยตัว/,"🛟"],[/พื้นเอียง/,"🛝"],[/สปริง/,"〰️"],[/ความหนาแน่น/,"⚖️"],[/ปริมาตร/,"📦"],[/น้ำหนัก|มวล/,"🏋️"],[/ขยายใหญ่/,"🎈"],[/หด/,"🤏"],
    [/คาร์โบไฮเดรต/,"🍚"],[/วิตามิน/,"🍊"],[/เกลือแร่/,"🥬"],[/^น้ำ$|น้ำทะเล/,"💧"],[/ชนิดของปุ๋ย|ปุ๋ย/,"🌱"],[/ปริมาณน้ำและแสง/,"🌦️"],[/ชนิดพืช/,"🌿"],[/ขนาดกระถาง/,"🪴"],
    [/ปริซึม|หลายสี|สเปกตรัม/,"🌈"],[/แสงหาย/,"🌑"],[/เสียงดัง/,"📢"],[/เป็นกรด|กรด/,"🍋"],[/เป็นเบส|เบส/,"🧼"],[/แก๊สเฉื่อย/,"🎈"],[/หยุดนิ่ง|ไม่เปลี่ยน/,"⏸️"],[/เมฆบัง/,"☁️"],
  ];
  return icons.find(([pattern])=>pattern.test(option))?.[1]??"🔬";
}

export default function ScienceLabGame(){
  const { isFull,stageProps,toggle }=useStage<HTMLDivElement>();
  const [screen,setScreen]=useState<"intro"|"setup"|"game">("intro");
  const [difficulty,setDifficulty]=useState<Difficulty>("easy"); const [duration,setDuration]=useState(45); const [muted,setMuted]=useState(false);
  const [order,setOrder]=useState<number[]>([]); const [position,setPosition]=useState(0); const [optionOrder,setOptionOrder]=useState([0,1,2,3]);
  const [time,setTime]=useState(45); const [score,setScore]=useState(0); const [lives,setLives]=useState(3); const [correct,setCorrect]=useState(0);
  const [status,setStatus]=useState<"ready"|"playing"|"checking"|"won"|"lost"|"complete"|"gameover">("ready"); const [picked,setPicked]=useState<number|null>(null);
  const tick=useRef(-1); const source=BANK[difficulty][order[position]??0];
  const question=useMemo(()=>({...source,options:optionOrder.map(i=>source.options[i]),answer:optionOrder.indexOf(source.answer)}),[source,optionOrder]);
  const sceneMode=sceneFor(question.topic);
  const tone=useCallback((kind:"tick"|"ok"|"bad")=>{if(muted)return;const C=window.AudioContext||(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type=kind==="bad"?"sawtooth":"sine";o.frequency.setValueAtTime(kind==="tick"?700:kind==="ok"?520:120,c.currentTime);if(kind==="ok")o.frequency.exponentialRampToValueAtTime(1100,c.currentTime+.35);g.gain.setValueAtTime(.08,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.45);o.start();o.stop(c.currentTime+.46);o.onended=()=>c.close();},[muted]);
  const launch=()=>{const next=shuffle(Array.from({length:10},(_,i)=>i));setOrder(next);setPosition(0);setOptionOrder(shuffle([0,1,2,3]));setScore(0);setLives(3);setCorrect(0);setTime(duration);setPicked(null);setStatus("playing");tick.current=-1;setScreen("game");};
  const advance=()=>{if(position===9){setStatus("complete");return;}setPosition(v=>v+1);setOptionOrder(shuffle([0,1,2,3]));setTime(duration);setPicked(null);setStatus("playing");tick.current=-1;};
  useEffect(()=>{if(status!=="playing")return;const id=window.setInterval(()=>setTime(v=>{if(v<=1){setLives(x=>Math.max(0,x-1));setStatus("lost");tone("bad");return 0;}if(v<=10&&tick.current!==v){tick.current=v;tone("tick");}return v-1;}),1000);return()=>clearInterval(id);},[status,tone]);
  const choose=(index:number)=>{if(status!=="playing")return;setPicked(index);setStatus("checking");tone("tick");setTimeout(()=>{if(index===question.answer){setScore(v=>v+100+time*2);setCorrect(v=>v+1);setStatus("won");tone("ok");}else{setLives(v=>Math.max(0,v-1));setStatus("lost");tone("bad");}},900);};
  const endOrAdvance=()=>lives===0?setStatus("gameover"):advance();
  return <div {...stageProps} className={`kc-stage ${styles.shell}`}><div className={`kc-stage-body ${styles.game} ${styles[status]}`}>
    <div className={styles.grid}/><div className={styles.glow}/><div className={styles.bubbles}>{Array.from({length:18},(_,i)=><i key={i} style={{"--x":`${(i*37)%100}%`,"--d":`${3+(i%5)}s`,"--delay":`${i*-.31}s`} as CSSProperties}/>)}</div>
    <header className={styles.top}><div className={styles.brand}><Image src="/assets/khuncool-logo.webp" width={38} height={38} alt="KhunCool"/><div><b>Science Lab Crisis</b><small>ห้องทดลองฉุกเฉิน</small></div></div><div className={styles.actions}><Link href="/media/science">☰ <span>เมนู</span></Link>{screen==="game"&&<button onClick={()=>setScreen("setup")}>⚙ <span>ตั้งค่า</span></button>}<button onClick={()=>setMuted(v=>!v)} aria-label={muted?"เปิดเสียง":"ปิดเสียง"}>{muted?"🔇":"🔊"}</button><button onClick={toggle} aria-label={isFull?"ออกจากเต็มจอ":"เต็มจอ"}>⛶</button>{screen==="game"&&<div className={styles.hud}><span>{position+1}/10</span><span>{"♥".repeat(lives)}<i>{"♥".repeat(3-lives)}</i></span><b>⭐ {score}</b></div>}</div></header>
    {screen==="intro"&&<main className={styles.intro}><div className={styles.labIcon}><span>🧪</span><i/><i/><i/><b>LAB<br/>07</b><em>🧑‍🔬</em></div><p className={styles.kicker}>THE AMAZING SCIENCE LAB</p><h2>ห้องทดลอง<br/><span>ฉุกเฉิน!</span></h2><p>สวมบทนักวิทยาศาสตร์ วิเคราะห์เหตุการณ์<br/>เลือกอุปกรณ์และกู้แล็บให้ทันเวลา</p><div className={styles.chips}><span>🧬 สิ่งมีชีวิต</span><span>⚡ พลังงาน</span><span>🌍 อวกาศ</span></div><button className={styles.primary} onClick={()=>setScreen("setup")}>รับบัตรนักวิจัย →</button></main>}
    {screen==="setup"&&<main className={styles.setup}><p className={styles.kicker}>MISSION CONTROL</p><h2>ตั้งค่าภารกิจ</h2><p>เลือกระดับและเวลาที่เหมาะกับชั้นเรียน</p><div className={styles.setupGrid}><section><b>ระดับความยาก</b><div>{(["easy","medium","hard"] as Difficulty[]).map(d=><button key={d} className={difficulty===d?styles.selected:""} onClick={()=>setDifficulty(d)}>{d==="easy"?"🌱 ง่าย":d==="medium"?"⚗️ ปานกลาง":"🚨 ท้าทาย"}</button>)}</div></section><section><b>เวลาต่อภารกิจ</b><div>{[30,45,60].map(v=><button key={v} className={duration===v?styles.selected:""} onClick={()=>setDuration(v)}>{v} วินาที</button>)}</div></section></div><div className={styles.setupActions}><button onClick={()=>setScreen("intro")}>← ย้อนกลับ</button><button className={styles.primary} onClick={launch}>เริ่ม 10 ภารกิจ 🧪</button></div></main>}
    {screen==="game"&&<main className={styles.play}><div className={styles.missionLine}><small>CASE FILE {String(position+1).padStart(2,"0")} / 10</small><span>{question.topic}</span><strong>{question.situation}</strong></div><div className={`${styles.labScene} ${styles[`scene_${sceneMode}`]}`}><div className={styles.sceneLabel}>{sceneMode==="space"?"ORBIT SIMULATOR":sceneMode==="life"?"BIO DOME":sceneMode==="electric"?"POWER CIRCUIT":sceneMode==="force"?"FORCE TEST":sceneMode==="body"?"BODY SCANNER":"CHEMISTRY BENCH"}</div><div className={styles.sceneArtwork} aria-hidden="true"><span>{question.icon}</span><i/><i/><i/><i/><b/></div><div className={styles.robotArm}><i/><i/><b>✦</b></div><div className={styles.reactor}><span>{question.icon}</span><i/><i/><b>{status==="checking"?"ANALYZING":status==="won"?"STABLE":"ALERT"}</b></div><div className={styles.flasks}><i>🧪</i><i>⚗️</i><i>🧫</i></div><div className={`${styles.timer} ${time<=10?styles.danger:""}`}><small>TIME</small>{String(time).padStart(2,"0")}</div></div><h2 className={styles.question}><small>เลือกวิธีแก้สถานการณ์</small>{question.question}</h2><div className={styles.options}>{question.options.map((option,index)=><button key={option} disabled={status!=="playing"} onClick={()=>choose(index)} className={`${picked===index?styles.picked:""} ${option.length>15?styles.longOption:""}`}><em className={styles.choiceLetter}>{String.fromCharCode(65+index)}</em><span><i>{optionIcon(option)}</i></span><b>{option}</b><i/></button>)}</div>{status==="checking"&&<div className={styles.scan}><span>กำลังวิเคราะห์คำตอบ</span><i/></div>}</main>}
    {screen==="game"&&(status==="won"||status==="lost"||status==="complete"||status==="gameover")&&<div className={styles.overlay}>{status==="won"?<section className={`${styles.result} ${styles.success}`}><span>✅</span><small>LAB SYSTEM STABILIZED</small><h2>กู้ห้องทดลองสำเร็จ!</h2><p>{question.explain}</p><div><b>+100</b><b>โบนัสเวลา +{time*2}</b></div><button onClick={advance}>{position===9?"ดูสรุปภารกิจ 🏆":"ภารกิจต่อไป"}</button></section>:status==="lost"?<section className={`${styles.result} ${styles.fail}`}><span>💥</span><small>EXPERIMENT FAILED</small><h2>ระบบยังไม่เสถียร</h2><p>คำตอบคือ <b>{question.options[question.answer]}</b><br/>{question.explain}</p><div className={styles.lifeText}>พลังชีวิตคงเหลือ {lives}/3</div><button onClick={endOrAdvance}>{lives===0?"ดูสรุปผล":"ไปภารกิจต่อไป"}</button></section>:<section className={`${styles.result} ${styles.final}`}><span>{status==="complete"?"🏆":"🚨"}</span><small>{status==="complete"?"ALL SYSTEMS SECURED":"LAB SHUTDOWN"}</small><h2>{status==="complete"?"ภารกิจห้องทดลองเสร็จสมบูรณ์!":"พลังชีวิตหมด"}</h2><div className={styles.summary}><b><small>ตอบถูก</small>{correct}/10</b><b><small>คะแนน</small>{score}</b><b><small>เกรด</small>{correct>=9?"S":correct>=7?"A":correct>=5?"B":"C"}</b></div><div className={styles.finalButtons}><button onClick={launch}>เล่นระดับเดิมอีกครั้ง</button><button onClick={()=>{setStatus("ready");setScreen("setup");}}>เลือกระดับใหม่</button></div></section>}</div>}
  </div></div>;
}
