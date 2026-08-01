"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { KcSfx, speakEnglish, hoverSfxDelegate } from "@/lib/kcSfx";
import GameBackdrop from "../GameBackdrop";
import { useFullscreen } from "../useFullscreen";

type Sample = [string, string];

type Question = {
  en: string;
  th: string;
  w: string[];
  s: Sample[];
};

type Topic = {
  key: string;
  th: string;
  en: string;
  icon: string;
  color: string;
  chip: string;
  blob: string;
  qs: Question[];
};

type DeckQuestion = Question & { tk: string };

const TOPICS: Topic[] = [
  {
    key: "me",
    th: "เกี่ยวกับตัวฉัน",
    en: "About Me",
    icon: "🙋",
    color: "#C43F86",
    chip: "#FCE1EF",
    blob: "#FBD3E8",
    qs: [
      {
        en: "What is your name?",
        th: "เธอชื่ออะไร",
        w: ["name", "My name is"],
        s: [
          ["My name is Ploy.", "ฉันชื่อพลอย"],
          ["I'm Ploy. Nice to meet you.", "ฉันชื่อพลอย ยินดีที่ได้รู้จัก"],
        ],
      },
      {
        en: "How old are you?",
        th: "เธออายุเท่าไหร่",
        w: ["years old", "I am"],
        s: [
          ["I am ten years old.", "ฉันอายุสิบขวบ"],
          ["I'm eleven.", "ฉันอายุสิบเอ็ด"],
        ],
      },
      {
        en: "Where do you live?",
        th: "เธออาศัยอยู่ที่ไหน",
        w: ["live in", "near"],
        s: [
          ["I live in Chiang Mai.", "ฉันอยู่ที่เชียงใหม่"],
          ["I live near the school.", "ฉันอยู่ใกล้โรงเรียน"],
        ],
      },
      {
        en: "What can you do well?",
        th: "เธอทำอะไรได้เก่ง",
        w: ["can", "very well"],
        s: [
          ["I can swim very well.", "ฉันว่ายน้ำได้เก่งมาก"],
          ["I can draw cats.", "ฉันวาดรูปแมวได้"],
        ],
      },
      {
        en: "What do you want to be?",
        th: "โตขึ้นอยากเป็นอะไร",
        w: ["want to be", "because"],
        s: [
          ["I want to be a doctor.", "ฉันอยากเป็นหมอ"],
          [
            "I want to be a teacher because I like kids.",
            "ฉันอยากเป็นครูเพราะฉันชอบเด็ก",
          ],
        ],
      },
      {
        en: "How do you feel today?",
        th: "วันนี้รู้สึกอย่างไร",
        w: ["happy", "tired", "excited"],
        s: [
          ["I feel happy today.", "วันนี้ฉันรู้สึกมีความสุข"],
          ["I'm a little tired.", "ฉันเหนื่อยนิดหน่อย"],
        ],
      },
      {
        en: "What is your nickname?",
        th: "ชื่อเล่นของเธอคืออะไร",
        w: ["nickname", "call me"],
        s: [
          ["My nickname is Ploy.", "ชื่อเล่นของฉันคือพลอย"],
          ["Everyone calls me Nine.", "ทุกคนเรียกฉันว่าไนน์"],
        ],
      },
      {
        en: "When is your birthday?",
        th: "วันเกิดของเธอคือวันไหน",
        w: ["birthday", "in"],
        s: [
          ["My birthday is in May.", "วันเกิดฉันอยู่ในเดือนพฤษภาคม"],
          ["It's on June 3rd.", "วันที่ 3 มิถุนายน"],
        ],
      },
      {
        en: "What are you good at?",
        th: "เธอถนัดอะไร",
        w: ["good at"],
        s: [
          ["I'm good at running.", "ฉันถนัดวิ่ง"],
          ["I'm good at math.", "ฉันเก่งเลข"],
        ],
      },
      {
        en: "What makes you smile?",
        th: "อะไรทำให้เธอยิ้ม",
        w: ["makes me", "happy"],
        s: [
          ["My dog makes me smile.", "หมาของฉันทำให้ฉันยิ้ม"],
          ["Playing with friends makes me happy.", "การเล่นกับเพื่อนทำให้ฉันมีความสุข"],
        ],
      },
      {
        en: "What is your favourite day? Why?",
        th: "วันโปรดของเธอคือวันอะไร เพราะอะไร",
        w: ["favourite day", "because"],
        s: [
          ["Saturday, because I don't go to school.", "วันเสาร์ เพราะไม่ต้องไปโรงเรียน"],
          ["Friday is my favourite day.", "วันศุกร์เป็นวันโปรดของฉัน"],
        ],
      },
      {
        en: "Tell me three words about you.",
        th: "บอกสามคำเกี่ยวกับตัวเธอ",
        w: ["I am", "and"],
        s: [
          ["I am kind, funny and brave.", "ฉันใจดี ตลก และกล้าหาญ"],
          ["I am small but strong.", "ฉันตัวเล็กแต่แข็งแรง"],
        ],
      },
    ],
  },
  {
    key: "family",
    th: "ครอบครัว",
    en: "Family",
    icon: "👨‍👩‍👧",
    color: "#7A5AF8",
    chip: "#E9E4FE",
    blob: "#DAD2FC",
    qs: [
      {
        en: "How many people are in your family?",
        th: "ครอบครัวเธอมีกี่คน",
        w: ["there are", "people"],
        s: [
          ["There are four people in my family.", "ครอบครัวฉันมีสี่คน"],
          ["We are five.", "เรามีห้าคน"],
        ],
      },
      {
        en: "Who do you play with at home?",
        th: "ที่บ้านเธอเล่นกับใคร",
        w: ["play with", "my sister"],
        s: [
          ["I play with my little brother.", "ฉันเล่นกับน้องชาย"],
          ["I play with my cousin.", "ฉันเล่นกับลูกพี่ลูกน้อง"],
        ],
      },
      {
        en: "What does your mother do?",
        th: "แม่ของเธอทำงานอะไร",
        w: ["She is a", "works"],
        s: [
          ["She is a nurse.", "แม่เป็นพยาบาล"],
          ["My mother works at a shop.", "แม่ทำงานที่ร้านค้า"],
        ],
      },
      {
        en: "What do you do together on Sunday?",
        th: "วันอาทิตย์ทำอะไรด้วยกัน",
        w: ["we", "together"],
        s: [
          ["We cook together.", "เราทำอาหารด้วยกัน"],
          ["We go to the temple.", "เราไปวัดกัน"],
        ],
      },
      {
        en: "Who helps you with homework?",
        th: "ใครช่วยเธอทำการบ้าน",
        w: ["helps me"],
        s: [
          ["My sister helps me.", "พี่สาวช่วยฉัน"],
          ["My father helps me with math.", "พ่อช่วยฉันเรื่องเลข"],
        ],
      },
      {
        en: "Do you have any pets?",
        th: "เธอมีสัตว์เลี้ยงไหม",
        w: ["I have", "pet"],
        s: [
          ["I have a cat named Meaw.", "ฉันมีแมวชื่อเหมียว"],
          ["No, I don't have a pet.", "ไม่ ฉันไม่มีสัตว์เลี้ยง"],
        ],
      },
      {
        en: "What does your father do?",
        th: "พ่อของเธอทำงานอะไร",
        w: ["He is a", "works"],
        s: [
          ["He is a farmer.", "พ่อเป็นชาวนา"],
          ["My father works in a factory.", "พ่อทำงานในโรงงาน"],
        ],
      },
      {
        en: "How do you help at home?",
        th: "เธอช่วยงานบ้านอย่างไร",
        w: ["I help", "wash"],
        s: [
          ["I wash the dishes.", "ฉันล้างจาน"],
          ["I help my mom clean the house.", "ฉันช่วยแม่ทำความสะอาดบ้าน"],
        ],
      },
      {
        en: "Who is the funniest in your family?",
        th: "ใครตลกที่สุดในครอบครัว",
        w: ["funniest", "because"],
        s: [
          ["My brother is the funniest.", "พี่ชายตลกที่สุด"],
          ["My dad, because he sings badly.", "พ่อ เพราะร้องเพลงเพี้ยน"],
        ],
      },
      {
        en: "Where does your family go on holiday?",
        th: "ครอบครัวเธอไปเที่ยวที่ไหน",
        w: ["we go to"],
        s: [
          ["We go to the beach.", "เราไปทะเล"],
          ["We visit my grandma.", "เราไปหาคุณยาย"],
        ],
      },
    ],
  },
  {
    key: "school",
    th: "โรงเรียน",
    en: "School",
    icon: "🏫",
    color: "#0E9F8E",
    chip: "#D6F5EF",
    blob: "#BFEFE6",
    qs: [
      {
        en: "What is your favourite subject?",
        th: "วิชาโปรดของเธอคืออะไร",
        w: ["favourite", "subject"],
        s: [
          ["My favourite subject is English.", "วิชาโปรดของฉันคือภาษาอังกฤษ"],
          ["I like art best.", "ฉันชอบวิชาศิลปะที่สุด"],
        ],
      },
      {
        en: "How do you go to school?",
        th: "เธอไปโรงเรียนอย่างไร",
        w: ["by bus", "walk"],
        s: [
          ["I go to school by bus.", "ฉันไปโรงเรียนโดยรถบัส"],
          ["I walk to school.", "ฉันเดินไปโรงเรียน"],
        ],
      },
      {
        en: "What time does school start?",
        th: "โรงเรียนเริ่มกี่โมง",
        w: ["at", "o'clock"],
        s: [
          ["School starts at eight o'clock.", "โรงเรียนเริ่มแปดโมง"],
          ["It starts at 8:30.", "เริ่มแปดโมงครึ่ง"],
        ],
      },
      {
        en: "What do you do at break time?",
        th: "ช่วงพักเธอทำอะไร",
        w: ["play", "eat"],
        s: [
          ["I play football with my friends.", "ฉันเล่นฟุตบอลกับเพื่อน"],
          ["I eat a snack.", "ฉันกินขนม"],
        ],
      },
      {
        en: "Who is your best friend? Why?",
        th: "เพื่อนสนิทของเธอคือใคร เพราะอะไร",
        w: ["best friend", "because"],
        s: [
          ["My best friend is Nan because she is kind.", "เพื่อนสนิทคือแนน เพราะเธอใจดี"],
          ["He is funny.", "เขาตลก"],
        ],
      },
      {
        en: "What do you eat for lunch at school?",
        th: "มื้อกลางวันที่โรงเรียนกินอะไร",
        w: ["for lunch"],
        s: [
          ["I eat rice and chicken.", "ฉันกินข้าวกับไก่"],
          ["We have noodles on Friday.", "วันศุกร์เรามีก๋วยเตี๋ยว"],
        ],
      },
      {
        en: "Which subject is difficult for you?",
        th: "วิชาไหนยากสำหรับเธอ",
        w: ["difficult", "hard"],
        s: [
          ["Math is difficult for me.", "วิชาเลขยากสำหรับฉัน"],
          ["Science is a bit hard.", "วิทยาศาสตร์ยากนิดหน่อย"],
        ],
      },
      {
        en: "What is your classroom like?",
        th: "ห้องเรียนของเธอเป็นอย่างไร",
        w: ["there is", "big"],
        s: [
          ["My classroom is big and bright.", "ห้องเรียนของฉันใหญ่และสว่าง"],
          ["There are thirty desks.", "มีโต๊ะสามสิบตัว"],
        ],
      },
      {
        en: "What rule do you follow at school?",
        th: "กฎอะไรที่เธอต้องทำตามที่โรงเรียน",
        w: ["we must", "don't"],
        s: [
          ["We must wear a uniform.", "เราต้องใส่ชุดนักเรียน"],
          ["We don't run in the hallway.", "เราไม่วิ่งในทางเดิน"],
        ],
      },
      {
        en: "What club would you like to join?",
        th: "เธออยากเข้าชุมนุมอะไร",
        w: ["I'd like to join"],
        s: [
          ["I'd like to join the music club.", "ฉันอยากเข้าชุมนุมดนตรี"],
          ["I want to join the English club.", "ฉันอยากเข้าชุมนุมภาษาอังกฤษ"],
        ],
      },
    ],
  },
  {
    key: "food",
    th: "อาหาร",
    en: "Food",
    icon: "🍜",
    color: "#E07A1F",
    chip: "#FDEBD6",
    blob: "#FBDCB8",
    qs: [
      {
        en: "What is your favourite food?",
        th: "อาหารโปรดของเธอคืออะไร",
        w: ["favourite food"],
        s: [
          ["My favourite food is fried rice.", "อาหารโปรดของฉันคือข้าวผัด"],
          ["I love mango sticky rice.", "ฉันชอบข้าวเหนียวมะม่วง"],
        ],
      },
      {
        en: "What did you eat for breakfast?",
        th: "มื้อเช้าวันนี้กินอะไร",
        w: ["I ate", "had"],
        s: [
          ["I ate rice soup.", "ฉันกินข้าวต้ม"],
          ["I had milk and bread.", "ฉันกินนมกับขนมปัง"],
        ],
      },
      {
        en: "Can you cook? What can you make?",
        th: "เธอทำอาหารเป็นไหม ทำอะไรได้",
        w: ["can cook", "make"],
        s: [
          ["Yes, I can make an omelette.", "ได้ ฉันทำไข่เจียวได้"],
          ["No, but I can help my mom.", "ไม่ได้ แต่ช่วยแม่ได้"],
        ],
      },
      {
        en: "Do you like spicy food?",
        th: "เธอชอบอาหารเผ็ดไหม",
        w: ["spicy", "a little"],
        s: [
          ["Yes, I love spicy food.", "ชอบ ฉันชอบอาหารเผ็ดมาก"],
          ["Only a little spicy.", "เผ็ดนิดเดียวพอ"],
        ],
      },
      {
        en: "What fruit do you like?",
        th: "เธอชอบผลไม้อะไร",
        w: ["fruit", "because"],
        s: [
          ["I like watermelon because it is sweet.", "ฉันชอบแตงโมเพราะหวาน"],
          ["I like bananas.", "ฉันชอบกล้วย"],
        ],
      },
      {
        en: "What drink do you like?",
        th: "เธอชอบเครื่องดื่มอะไร",
        w: ["drink", "like"],
        s: [
          ["I like orange juice.", "ฉันชอบน้ำส้ม"],
          ["I drink milk every morning.", "ฉันดื่มนมทุกเช้า"],
        ],
      },
      {
        en: "What food don't you like?",
        th: "อาหารอะไรที่เธอไม่ชอบ",
        w: ["don't like", "because"],
        s: [
          ["I don't like onions.", "ฉันไม่ชอบหัวหอม"],
          ["I don't like fish because of the smell.", "ฉันไม่ชอบปลาเพราะกลิ่น"],
        ],
      },
      {
        en: "Where do you eat dinner?",
        th: "เธอกินมื้อเย็นที่ไหน",
        w: ["at home", "with"],
        s: [
          ["I eat dinner at home with my family.", "ฉันกินมื้อเย็นที่บ้านกับครอบครัว"],
          ["Sometimes we eat at the market.", "บางครั้งเรากินที่ตลาด"],
        ],
      },
      {
        en: "What is a famous food in your town?",
        th: "อาหารขึ้นชื่อในเมืองเธอคืออะไร",
        w: ["famous", "from"],
        s: [
          ["Khao soi is famous in my town.", "ข้าวซอยขึ้นชื่อในเมืองฉัน"],
          ["We are famous for grilled chicken.", "เมืองเราขึ้นชื่อเรื่องไก่ย่าง"],
        ],
      },
      {
        en: "Do you like sweet or salty snacks?",
        th: "เธอชอบขนมหวานหรือของเค็ม",
        w: ["prefer", "sweet", "salty"],
        s: [
          ["I prefer sweet snacks.", "ฉันชอบขนมหวานมากกว่า"],
          ["I like salty chips.", "ฉันชอบมันฝรั่งเค็มๆ"],
        ],
      },
    ],
  },
  {
    key: "hobby",
    th: "งานอดิเรก",
    en: "Hobbies",
    icon: "⚽",
    color: "#2E7BE0",
    chip: "#DCEBFC",
    blob: "#C4DDF9",
    qs: [
      {
        en: "What do you do after school?",
        th: "หลังเลิกเรียนเธอทำอะไร",
        w: ["after school"],
        s: [
          ["I ride my bike after school.", "หลังเลิกเรียนฉันขี่จักรยาน"],
          ["I watch cartoons.", "ฉันดูการ์ตูน"],
        ],
      },
      {
        en: "What sport do you like?",
        th: "เธอชอบกีฬาอะไร",
        w: ["sport", "play"],
        s: [
          ["I like badminton.", "ฉันชอบแบดมินตัน"],
          ["I play football every day.", "ฉันเล่นฟุตบอลทุกวัน"],
        ],
      },
      {
        en: "What music do you like?",
        th: "เธอชอบเพลงแบบไหน",
        w: ["listen to", "song"],
        s: [
          ["I listen to Thai pop songs.", "ฉันฟังเพลงป๊อปไทย"],
          ["I like happy songs.", "ฉันชอบเพลงสนุกๆ"],
        ],
      },
      {
        en: "Do you like drawing or singing?",
        th: "เธอชอบวาดรูปหรือร้องเพลง",
        w: ["prefer", "better"],
        s: [
          ["I like drawing better.", "ฉันชอบวาดรูปมากกว่า"],
          ["I prefer singing.", "ฉันชอบร้องเพลงมากกว่า"],
        ],
      },
      {
        en: "What game do you play with friends?",
        th: "เธอเล่นเกมอะไรกับเพื่อน",
        w: ["play", "with my friends"],
        s: [
          ["We play hide and seek.", "เราเล่นซ่อนหา"],
          ["We play tag at school.", "เราเล่นวิ่งไล่จับที่โรงเรียน"],
        ],
      },
      {
        en: "What do you do on weekends?",
        th: "วันหยุดเธอทำอะไร",
        w: ["on weekends"],
        s: [
          ["On weekends I play with my friends.", "วันหยุดฉันเล่นกับเพื่อน"],
          ["I help my parents.", "ฉันช่วยพ่อแม่"],
        ],
      },
      {
        en: "Do you like reading? What books?",
        th: "เธอชอบอ่านหนังสือไหม อ่านแบบไหน",
        w: ["read", "books"],
        s: [
          ["Yes, I read comic books.", "ชอบ ฉันอ่านการ์ตูน"],
          ["I like adventure stories.", "ฉันชอบเรื่องผจญภัย"],
        ],
      },
      {
        en: "What new hobby do you want to try?",
        th: "อยากลองงานอดิเรกใหม่อะไร",
        w: ["want to try", "learn"],
        s: [
          ["I want to try skating.", "ฉันอยากลองเล่นสเก็ต"],
          ["I want to learn guitar.", "ฉันอยากเรียนกีตาร์"],
        ],
      },
      {
        en: "Do you play any instrument?",
        th: "เธอเล่นดนตรีเป็นไหม",
        w: ["play the"],
        s: [
          ["I play the ukulele.", "ฉันเล่นอูคูเลเล่"],
          ["No, but I want to learn.", "ไม่ แต่อยากเรียน"],
        ],
      },
      {
        en: "What cartoon do you like?",
        th: "เธอชอบการ์ตูนเรื่องไหน",
        w: ["cartoon", "because"],
        s: [
          ["I like Doraemon because it's funny.", "ฉันชอบโดราเอมอนเพราะตลก"],
          ["I watch cartoons on Sunday.", "ฉันดูการ์ตูนวันอาทิตย์"],
        ],
      },
    ],
  },
  {
    key: "world",
    th: "รอบตัวเรา",
    en: "Around Us",
    icon: "🌏",
    color: "#8A46C9",
    chip: "#EEE0FB",
    blob: "#E1CCF8",
    qs: [
      {
        en: "What is the weather like today?",
        th: "วันนี้อากาศเป็นอย่างไร",
        w: ["sunny", "rainy", "hot"],
        s: [
          ["It is sunny and hot today.", "วันนี้แดดออกและร้อน"],
          ["It's rainy.", "ฝนตก"],
        ],
      },
      {
        en: "What animal do you like? Why?",
        th: "เธอชอบสัตว์อะไร เพราะอะไร",
        w: ["animal", "because"],
        s: [
          ["I like dogs because they are friendly.", "ฉันชอบหมาเพราะเป็นมิตร"],
          ["I like elephants.", "ฉันชอบช้าง"],
        ],
      },
      {
        en: "Where do you want to travel?",
        th: "เธออยากไปเที่ยวที่ไหน",
        w: ["want to go", "visit"],
        s: [
          ["I want to go to Japan.", "ฉันอยากไปญี่ปุ่น"],
          ["I want to visit the sea.", "ฉันอยากไปทะเล"],
        ],
      },
      {
        en: "What color do you like? Why?",
        th: "เธอชอบสีอะไร เพราะอะไร",
        w: ["color", "because"],
        s: [
          ["I like blue because it is calm.", "ฉันชอบสีฟ้าเพราะดูสบายตา"],
          ["My favourite color is green.", "สีโปรดของฉันคือสีเขียว"],
        ],
      },
      {
        en: "How can we help our school be clean?",
        th: "เราช่วยให้โรงเรียนสะอาดได้อย่างไร",
        w: ["we can", "should"],
        s: [
          ["We can pick up the trash.", "เราเก็บขยะได้"],
          ["We should not litter.", "เราไม่ควรทิ้งขยะเรี่ยราด"],
        ],
      },
      {
        en: "What season do you like best?",
        th: "เธอชอบฤดูไหนที่สุด",
        w: ["season", "because"],
        s: [
          ["I like the rainy season because it's cool.", "ฉันชอบหน้าฝนเพราะเย็นสบาย"],
          ["I like winter.", "ฉันชอบหน้าหนาว"],
        ],
      },
      {
        en: "What is near your house?",
        th: "ใกล้บ้านเธอมีอะไรบ้าง",
        w: ["there is", "near"],
        s: [
          ["There is a market near my house.", "ใกล้บ้านฉันมีตลาด"],
          ["There is a small park.", "มีสวนเล็กๆ"],
        ],
      },
      {
        en: "What festival do you like?",
        th: "เธอชอบเทศกาลอะไร",
        w: ["festival", "because"],
        s: [
          ["I like Songkran because we play with water.", "ฉันชอบสงกรานต์เพราะได้เล่นน้ำ"],
          ["I like Loy Krathong.", "ฉันชอบลอยกระทง"],
        ],
      },
      {
        en: "How can we save water?",
        th: "เราประหยัดน้ำได้อย่างไร",
        w: ["we can", "turn off"],
        s: [
          ["We can turn off the tap.", "เราปิดก๊อกน้ำได้"],
          ["We should not waste water.", "เราไม่ควรใช้น้ำเปลือง"],
        ],
      },
      {
        en: "If you could fly, where would you go?",
        th: "ถ้าบินได้ เธอจะไปที่ไหน",
        w: ["I would go", "fly to"],
        s: [
          ["I would fly to the mountains.", "ฉันจะบินไปภูเขา"],
          ["I would go to see my grandma.", "ฉันจะไปหาคุณยาย"],
        ],
      },
    ],
  },
];

const COUNTS = [
  { v: 5, t: "5 คำถาม" },
  { v: 10, t: "10 คำถาม" },
  { v: 15, t: "15 คำถาม" },
  { v: 20, t: "20 คำถาม" },
  { v: 0, t: "ทั้งหมด" },
];

const DUR = [
  { v: 0, t: "ไม่จับเวลา" },
  { v: 30, t: "30 วิ" },
  { v: 45, t: "45 วิ" },
  { v: 60, t: "1 นาที" },
  { v: 90, t: "1 นาที 30" },
];

const CONF = ["#C43F86", "#7A5AF8", "#FFD166", "#14B79A", "#FF8FA8", "#5C9DF5"];

const BUBBLES = ["💬", "🗣️", "💭", "🎤", "✨", "💬", "⭐", "💭"].map((e, i) => ({
  emoji: e,
  left: 4 + i * 12 + (i % 3) * 3,
  size: 16 + (i % 4) * 7,
  dur: 14 + i * 2.2,
  delay: i * 1.9,
}));

type Confetto = {
  left: number;
  w: number;
  h: number;
  color: string;
  dur: number;
  delay: number;
};

function shuffleArr<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export default function TalkCardApp() {
  useTrackToolUse("media-english-talk-card");
  const { ref: fullRef, isFull, toggle: toggleFull } = useFullscreen<HTMLDivElement>();

  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [sel, setSel] = useState<string[]>(TOPICS.map((t) => t.key));
  const [dur, setDur] = useState(45);
  const [count, setCount] = useState(10);
  const [deck, setDeck] = useState<DeckQuestion[]>([]);
  const [i, setI] = useState(0);
  const [hint, setHint] = useState(false);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [confetti, setConfetti] = useState<Confetto[]>([]);
  const [muted, setMuted] = useState(() => KcSfx.isMuted());
  const [bgmOn, setBgmOn] = useState(() => KcSfx.isBgm());

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    stopTick();
    tickRef.current = setInterval(() => {
      setLeft((l) => {
        const nl = l - 1;
        if (nl <= 0) {
          stopTick();
          setRunning(false);
          KcSfx.play("star");
          return 0;
        }
        if (nl <= 5) KcSfx.play("tick");
        return nl;
      });
    }, 1000);
  }, [stopTick]);

  useEffect(() => {
    return () => {
      stopTick();
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [stopTick]);

  const pool = useCallback((): DeckQuestion[] => {
    return TOPICS.filter((t) => sel.includes(t.key)).flatMap((t) =>
      t.qs.map((q) => ({ ...q, tk: t.key })),
    );
  }, [sel]);

  const burst = useCallback(() => {
    const c: Confetto[] = Array.from({ length: 36 }, (_, idx) => ({
      left: Math.random() * 100,
      w: 6 + Math.random() * 7,
      h: 9 + Math.random() * 10,
      color: CONF[idx % CONF.length],
      dur: 2.4 + Math.random() * 1.6,
      delay: Math.random() * 0.7,
    }));
    setConfetti(c);
    setTimeout(() => setConfetti([]), 4600);
  }, []);

  const begin = useCallback(() => {
    let d = shuffleArr(pool());
    if (!d.length) return;
    if (count > 0) d = d.slice(0, count);
    KcSfx.play("whoosh");
    setDeck(d);
    setI(0);
    setHint(false);
    setLeft(dur);
    setRunning(false);
    stopTick();
    setStage(1);
  }, [pool, count, dur, stopTick]);

  const go = useCallback(
    (d: number) => {
      const n = i + d;
      if (n >= deck.length) {
        stopTick();
        KcSfx.play("win");
        burst();
        setStage(2);
        return;
      }
      if (n < 0) return;
      stopTick();
      KcSfx.play("pop");
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
      setI(n);
      setHint(false);
      setLeft(dur);
      setRunning(false);
    },
    [i, deck.length, stopTick, burst, dur],
  );

  const goSetup = useCallback(() => {
    stopTick();
    KcSfx.play("whoosh");
    setStage(0);
  }, [stopTick]);

  const toggleAll = useCallback(() => {
    KcSfx.play("click");
    setSel((s) => (s.length === TOPICS.length ? [] : TOPICS.map((t) => t.key)));
  }, []);

  const toggleTopic = useCallback((key: string) => {
    setSel((s) => {
      const on = s.includes(key);
      KcSfx.play(on ? "drop" : "click");
      return on ? s.filter((k) => k !== key) : [...s, key];
    });
  }, []);

  const toggleBgm = useCallback(() => {
    KcSfx.unlock?.();
    const next = !KcSfx.isBgm();
    KcSfx.bgm(next);
    setBgmOn(next);
  }, []);

  const toggleMute = useCallback(() => {
    KcSfx.unlock?.();
    KcSfx.toggleMuted();
    setMuted(KcSfx.isMuted());
  }, []);

  const toggleTimer = useCallback(() => {
    if (!dur) {
      KcSfx.play("click");
      setDur(45);
      setLeft(45);
      return;
    }
    KcSfx.play("click");
    if (running) {
      stopTick();
      setRunning(false);
    } else {
      setLeft((l) => {
        const nl = l > 0 ? l : dur;
        setRunning(true);
        startTick();
        return nl;
      });
    }
  }, [dur, running, stopTick, startTick]);

  const poolNow = pool();
  const q = deck[i] || null;
  const topic = q ? TOPICS.find((t) => t.key === q.tk) : null;
  const total = dur || 1;
  const pct = dur ? left / total : 1;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  const low = dur > 0 && left <= 5 && left > 0;
  const dashOffset = (138.2 * (1 - pct)).toFixed(1);

  const startLabel = poolNow.length
    ? `เริ่มสุ่มการ์ด · ${count > 0 ? Math.min(count, poolNow.length) : poolNow.length} ใบ 🚀`
    : "เลือกอย่างน้อย 1 หัวข้อ";

  const progressW = deck.length ? Math.round(((i + 1) / deck.length) * 100) + "%" : "0%";

  const bgmLive = bgmOn && !muted;

  return (
    <div
      ref={fullRef}
      className="kc-game"
      onMouseOver={hoverSfxDelegate}
      style={{
        minHeight: "70vh",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(168deg,#FFEAF5 0%,#F3ECFD 48%,#E6F7FB 100%)",
        borderRadius: 24,
      }}
    >
      <GameBackdrop
        sun={{ top: 30, right: 60, size: 110, from: "#FFEBA6", via: "#FFD166" }}
        blobs={[
          { top: -100, left: -120, size: 380, color: "#FBC7E4" },
          { top: 220, right: -150, size: 420, color: "#BFE7F7" },
          { bottom: -140, left: "24%", size: 360, color: "#FFE2BE" },
        ]}
        clouds={[{ top: 96, dur: 52, width: 140, height: 48 }]}
      />
      {BUBBLES.map((b, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            bottom: -60,
            left: `${b.left}%`,
            fontSize: b.size,
            opacity: 0.55,
            animation: `bubbleUp ${b.dur}s linear ${b.delay}s infinite`,
          }}
        >
          {b.emoji}
        </div>
      ))}
      {confetti.map((c, idx) => (
        <div
          key={idx}
          style={{
            position: "fixed",
            top: -20,
            left: `${c.left}%`,
            width: c.w,
            height: c.h,
            background: c.color,
            borderRadius: 2,
            zIndex: 60,
            animation: `confettiFall ${c.dur}s linear ${c.delay}s forwards`,
          }}
        />
      ))}

      {/* Top bar */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          padding: "12px clamp(12px,3vw,26px)",
          maxWidth: 1140,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, minWidth: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/khuncool-logo.png"
            alt="khuncool"
            style={{ width: 36, height: 36, flex: "none", objectFit: "contain" }}
          />
          <div style={{ minWidth: 0 }}>
          <div className="kc-title" style={{ fontWeight: 700, fontSize: "clamp(15px,3.6vw,19px)" }}>
            Talk Card
          </div>
          <div style={{ fontSize: 11.5, color: "#987C8E" }}>
            สุ่มคำถามพูดภาษาอังกฤษ
          </div>
          </div>
        </div>
        <Link
          href="/media/english"
          style={{
            flex: "none",
            fontWeight: 600,
            fontSize: 14,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            color: "#B03476",
            background: "#FCE1EF",
            borderRadius: 999,
            padding: "9px 16px",
            textDecoration: "none",
          }}
        >
          ☰ เมนู
        </Link>
        <button
          type="button"
          onClick={toggleBgm}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            height: 36,
            padding: "0 13px",
            borderRadius: 999,
            border: "1px solid #F0DCEA",
            background: bgmLive ? "#FCE1EF" : "#fff",
            color: bgmLive ? "#B03476" : "#A0708C",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          <span style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 13 }}>
            {[0, 1, 2].map((idx) => (
              <span
                key={idx}
                style={{
                  width: 3,
                  height: 13,
                  borderRadius: 2,
                  background: bgmLive ? "#C43F86" : "#DCCBD6",
                  transformOrigin: "bottom",
                  animation: bgmLive
                    ? `eqBar ${(0.5 + idx * 0.16).toFixed(2)}s ease-in-out infinite ${(idx * 0.12).toFixed(2)}s`
                    : "none",
                }}
              />
            ))}
          </span>
          <span>{bgmLive ? "เพลง" : "ปิดเพลง"}</span>
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label="เปิด/ปิดเสียง"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid #F0DCEA",
            background: muted ? "#F7F0F5" : "#fff",
            fontSize: 16,
          }}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <button
          type="button"
          onClick={toggleFull}
          aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
          title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid #F0DCEA",
            background: isFull ? "#FCE1EF" : "#fff",
            fontSize: 16,
          }}
        >
          ⛶
        </button>
        {stage !== 0 && (
          <button
            type="button"
            onClick={goSetup}
            style={{
              height: 36,
              padding: "0 15px",
              borderRadius: 999,
              border: "none",
              background: "#FCE1EF",
              color: "#B03476",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            ☰ หัวข้อ
          </button>
        )}
      </div>

      {/* SETUP */}
      {stage === 0 && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1000,
            margin: "0 auto",
            padding: "6px clamp(14px,4vw,26px) 70px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 14,
              marginBottom: 18,
            }}
          >
            {[
              { emoji: "💬", bg: "#FCE1EF" },
              { emoji: "🎤", bg: "#E9E1FD" },
              { emoji: "⭐", bg: "#DCF5EF" },
            ].map((b, idx) => (
              <div
                key={b.emoji}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: b.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  boxShadow: "0 16px 26px -18px rgba(122,90,248,.45)",
                  animation: `floatY 2.6s ease-in-out ${(idx * 0.3).toFixed(1)}s infinite`,
                }}
              >
                {b.emoji}
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <h1
              style={{
                fontWeight: 700,
                fontSize: "clamp(26px,6vw,44px)",
                lineHeight: 1.25,
                margin: "0 0 10px",
              }}
            >
              เปิดการ์ด แล้ว
              <span
                style={{
                  background: "linear-gradient(135deg,#C43F86,#7A5AF8)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                พูดอังกฤษ
              </span>
              กันเลย!
            </h1>
            <p
              style={{
                fontSize: "clamp(14px,3.4vw,17px)",
                color: "#6B5A66",
                lineHeight: 1.75,
                margin: "0 auto",
                maxWidth: "56ch",
              }}
            >
              เลือกหัวข้อที่กำลังสอน กดสุ่มการ์ดขึ้นจอ
              ทุกใบมีคำแปลไทย ประโยคตัวอย่าง เสียงอ่าน และตัวจับเวลาให้เด็กพูด
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>1 · เลือกหัวข้อ</div>
            <div style={{ flex: 1, height: 1, background: "#F0DCEA" }} />
            <button
              type="button"
              onClick={toggleAll}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                padding: "7px 13px",
                borderRadius: 999,
                border: "1px solid #F0DCEA",
                background: "rgba(255,255,255,.85)",
                color: "#8A6480",
              }}
            >
              {sel.length === TOPICS.length ? "ล้างทั้งหมด" : "เลือกทั้งหมด"}
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,215px),1fr))",
              gap: 10,
              marginBottom: 28,
            }}
          >
            {TOPICS.map((t) => {
              const on = sel.includes(t.key);
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => toggleTopic(t.key)}
                  style={{
                    textAlign: "left",
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: 14,
                    borderRadius: 18,
                    border: `2px solid ${on ? t.color : "#F0DCEA"}`,
                    background: on ? t.chip : "rgba(255,255,255,.8)",
                    boxShadow: on ? `0 12px 22px -16px ${t.color}` : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      flex: "none",
                      display: "inline-block",
                      animation: on ? "wiggle 1.4s ease-in-out infinite" : "none",
                    }}
                  >
                    {t.icon}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700 }}>
                      {t.th}
                    </span>
                    <span style={{ display: "block", fontSize: 11.5, color: "#8A6480" }}>
                      {t.en} · {t.qs.length} คำถาม
                    </span>
                  </span>
                  <span
                    style={{
                      flex: "none",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: on ? t.color : "#DCCBD6",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                    }}
                  >
                    {on ? "✓" : "+"}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>2 · เวลาพูดต่อคน</div>
            <div style={{ flex: 1, height: 1, background: "#F0DCEA" }} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 30 }}>
            {DUR.map((d) => (
              <button
                key={d.v}
                type="button"
                onClick={() => {
                  KcSfx.play("click");
                  setDur(d.v);
                  setLeft(d.v);
                }}
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  padding: "11px 20px",
                  borderRadius: 999,
                  border: `2px solid ${dur === d.v ? "#C43F86" : "#F0DCEA"}`,
                  background: dur === d.v ? "#C43F86" : "rgba(255,255,255,.8)",
                  color: dur === d.v ? "#fff" : "#5A4453",
                }}
              >
                {d.t}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>3 · จำนวนคำถามทั้งหมด</div>
            <div style={{ flex: 1, height: 1, background: "#F0DCEA" }} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 30 }}>
            {COUNTS.map((c) => (
              <button
                key={c.v}
                type="button"
                onClick={() => {
                  KcSfx.play("click");
                  setCount(c.v);
                }}
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  padding: "11px 20px",
                  borderRadius: 999,
                  border: `2px solid ${count === c.v ? "#C43F86" : "#F0DCEA"}`,
                  background: count === c.v ? "#C43F86" : "rgba(255,255,255,.8)",
                  color: count === c.v ? "#fff" : "#5A4453",
                }}
              >
                {c.t}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              type="button"
              onClick={begin}
              disabled={!poolNow.length}
              style={{
                fontSize: "clamp(17px,4.4vw,21px)",
                fontWeight: 700,
                padding: "16px clamp(28px,8vw,46px)",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg,#C43F86,#7A5AF8)",
                color: "#fff",
                animation: "pulseGlow 2.4s ease-in-out infinite",
                cursor: poolNow.length ? "pointer" : "not-allowed",
                opacity: poolNow.length ? 1 : 0.6,
              }}
            >
              {startLabel}
            </button>
          </div>

          <div
            style={{
              marginTop: 34,
              padding: "18px 20px",
              borderRadius: 20,
              background: "rgba(255,255,255,.75)",
              border: "1px solid #F3E2EE",
            }}
          >
            <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>
              💡 ใช้ยังไงในห้องเรียน
            </div>
            <p style={{ fontSize: 13.5, color: "#6B5A66", lineHeight: 1.85, margin: 0 }}>
              สุ่มชื่อเด็กด้วยวงล้อสุ่มชื่อ แล้วเปิดการ์ดใบใหม่ให้ตอบ
              ให้เวลาคิดสักครู่ก่อนกดจับเวลา ถ้าเด็กติด กด “ประโยคตัวอย่าง”
              ให้อ่านตามหนึ่งรอบ แล้วให้พูดเองอีกครั้ง
            </p>
          </div>
        </div>
      )}

      {/* PLAY */}
      {stage === 1 && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1000,
            margin: "0 auto",
            padding: "4px clamp(12px,4vw,26px) 44px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#A0708C", whiteSpace: "nowrap" }}>
              {i + 1} / {deck.length}
            </div>
            <div
              style={{
                flex: 1,
                height: 8,
                borderRadius: 8,
                background: "rgba(255,255,255,.8)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 8,
                  background: "linear-gradient(90deg,#C43F86,#7A5AF8)",
                  width: progressW,
                }}
              />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#A0708C", whiteSpace: "nowrap" }}>
              ⭐ {i}
            </div>
          </div>

          <div
            key={`c${i}`}
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: "clamp(22px,5vw,34px)",
              padding: "clamp(24px,6vw,48px) clamp(18px,5vw,46px) clamp(22px,5vw,38px)",
              animation: "cardFlyIn .45s cubic-bezier(.2,1.1,.4,1) both",
              overflow: "hidden",
              textAlign: "center",
              boxShadow: "0 34px 74px -30px rgba(120,40,90,.5)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -70,
                right: -50,
                width: 190,
                height: 190,
                borderRadius: "50%",
                background: topic?.blob || "#FBD3E8",
                opacity: 0.5,
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  color: topic?.color || "#C43F86",
                  background: topic?.chip || "#FCE1EF",
                  padding: "8px 16px",
                  borderRadius: 999,
                  marginBottom: "clamp(14px,3.5vw,22px)",
                }}
              >
                <span style={{ fontSize: 16 }}>{topic?.icon}</span>
                {topic?.th}
              </div>
              <h2
                style={{
                  fontWeight: 600,
                  fontSize: "clamp(26px,6.6vw,52px)",
                  lineHeight: 1.24,
                  margin: "0 0 12px",
                  color: "#26121F",
                }}
              >
                {q?.en}
              </h2>
              <p
                style={{
                  fontSize: "clamp(15px,3.8vw,20px)",
                  color: "#7A6572",
                  margin: "0 0 clamp(18px,4vw,26px)",
                }}
              >
                {q?.th}
              </p>

              <div style={{ display: "flex", gap: 9, flexWrap: "wrap", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    KcSfx.play("pop");
                    if (q) speakEnglish(q.en);
                  }}
                  style={{
                    fontSize: 14.5,
                    fontWeight: 600,
                    padding: "12px 20px",
                    borderRadius: 999,
                    border: "2px solid #F0DCEA",
                    background: "#fff",
                    color: "#5A4453",
                  }}
                >
                  🔊 ฟังคำถาม
                </button>
                <button
                  type="button"
                  onClick={() => {
                    KcSfx.play("click");
                    setHint((h) => !h);
                  }}
                  style={{
                    fontSize: 14.5,
                    fontWeight: 600,
                    padding: "12px 20px",
                    borderRadius: 999,
                    border: `2px solid ${hint ? "#C43F86" : "#F0DCEA"}`,
                    background: hint ? "#FCE1EF" : "#fff",
                    color: hint ? "#B03476" : "#5A4453",
                  }}
                >
                  💡 {hint ? "ซ่อนตัวอย่าง" : "ประโยคตัวอย่าง"}
                </button>
              </div>

              {hint && q && (
                <div
                  style={{
                    margin: "clamp(18px,4vw,24px) auto 0",
                    maxWidth: 660,
                    background: "#FDF5FA",
                    border: "1.5px dashed #EDC9E0",
                    borderRadius: 20,
                    padding: 18,
                    textAlign: "left",
                    animation: "slideDown .32s ease both",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#A9316F",
                      letterSpacing: "0.06em",
                      marginBottom: 12,
                    }}
                  >
                    ประโยคตัวอย่าง — ให้เด็กอ่านตาม
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {q.s.map(([en, th], idx) => (
                      <div key={idx} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                        <button
                          type="button"
                          onClick={() => {
                            KcSfx.play("pop");
                            speakEnglish(en);
                          }}
                          style={{
                            flex: "none",
                            width: 34,
                            height: 34,
                            borderRadius: 12,
                            border: "1px solid #EDC9E0",
                            background: "#fff",
                            fontSize: 14,
                          }}
                        >
                          🔊
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "clamp(16px,4vw,20px)", color: "#26121F", lineHeight: 1.4 }}>
                            {en}
                          </div>
                          <div style={{ fontSize: 13, color: "#8A6480" }}>{th}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#A0708C" }}>คำที่ใช้ได้:</span>
                    {q.w.map((w, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 12.5,
                          color: "#8A3A6B",
                          background: "#FBE3F1",
                          padding: "4px 11px",
                          borderRadius: 999,
                        }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
            <div
              style={{
                flex: "1 1 210px",
                minWidth: 190,
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(255,255,255,.9)",
                border: "1px solid #F3E2EE",
                borderRadius: 20,
                padding: "12px 14px",
              }}
            >
              <div style={{ position: "relative", width: 52, height: 52, flex: "none" }}>
                <svg viewBox="0 0 52 52" style={{ width: 52, height: 52, transform: "rotate(-90deg)" }}>
                  <circle cx="26" cy="26" r="22" fill="none" stroke="#F5E6F0" strokeWidth={6} />
                  <circle
                    cx="26"
                    cy="26"
                    r="22"
                    fill="none"
                    stroke={low ? "#E0451F" : running ? "#0E9F8E" : "#C43F86"}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray="138.2"
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    color: dur ? (low ? "#E0451F" : running ? "#0E9F8E" : "#C43F86") : "#B9A3B2",
                    animation: low ? "shakeX .5s ease infinite" : "none",
                  }}
                >
                  {dur ? `${mm}:${ss}` : "∞"}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: "#A0708C", marginBottom: 6 }}>
                  {dur ? (running ? "กำลังพูดอยู่" : "พร้อมพูด") : "โหมดไม่จับเวลา"}
                </div>
                <button
                  type="button"
                  onClick={toggleTimer}
                  style={{
                    width: "100%",
                    fontSize: 13.5,
                    fontWeight: 600,
                    padding: 9,
                    borderRadius: 12,
                    border: "none",
                    background: running ? "#FDE7DF" : "#FCE1EF",
                    color: running ? "#C2500B" : "#B03476",
                  }}
                >
                  {!dur ? "เปิดจับเวลา" : running ? "⏸ หยุด" : left === 0 ? "↺ เริ่มใหม่" : "▶ เริ่มพูด"}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => go(-1)}
              style={{
                flex: "0 0 auto",
                fontSize: 15,
                fontWeight: 600,
                padding: "0 18px",
                minHeight: 56,
                borderRadius: 20,
                border: "1px solid #F3E2EE",
                background: "rgba(255,255,255,.9)",
                color: "#5A4453",
              }}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              style={{
                flex: "1 1 240px",
                minHeight: 56,
                fontSize: "clamp(16px,4.2vw,19px)",
                fontWeight: 700,
                padding: "14px 22px",
                borderRadius: 20,
                border: "none",
                background: "linear-gradient(135deg,#C43F86,#7A5AF8)",
                color: "#fff",
                boxShadow: "0 18px 30px -14px rgba(122,90,248,.65)",
              }}
            >
              {i + 1 >= deck.length ? "จบเกม 🎉" : "การ์ดใบถัดไป →"}
            </button>
            <button
              type="button"
              onClick={begin}
              aria-label="สลับการ์ดใหม่"
              style={{
                flex: "0 0 auto",
                fontSize: 17,
                padding: "0 18px",
                minHeight: 56,
                borderRadius: 20,
                border: "1px solid #F3E2EE",
                background: "rgba(255,255,255,.9)",
              }}
            >
              🔀
            </button>
          </div>
        </div>
      )}

      {/* DONE */}
      {stage === 2 && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 600,
            margin: "0 auto",
            padding: "24px clamp(14px,4vw,26px) 70px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 30,
              padding: "clamp(28px,7vw,46px)",
              animation: "cardFlyIn .5s cubic-bezier(.2,1.1,.4,1) both",
              boxShadow: "0 34px 74px -30px rgba(120,40,90,.5)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(46px,12vw,64px)",
                marginBottom: 10,
                animation: "floatY 2.6s ease-in-out infinite",
              }}
            >
              🎉
            </div>
            <h2 style={{ fontWeight: 700, fontSize: "clamp(23px,5.6vw,32px)", margin: "0 0 10px" }}>
              เก่งมาก! พูดครบทุกใบแล้ว
            </h2>
            <p style={{ fontSize: 15, color: "#6B5A66", lineHeight: 1.8, margin: "0 0 24px" }}>
              ทั้งหมด {deck.length} คำถาม จากหัวข้อที่เลือกไว้
              สับใหม่เพื่อเล่นอีกรอบ หรือเปลี่ยนหัวข้อให้เข้ากับบทเรียนถัดไป
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={begin}
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  padding: "14px 26px",
                  borderRadius: 999,
                  border: "none",
                  background: "linear-gradient(135deg,#C43F86,#7A5AF8)",
                  color: "#fff",
                  boxShadow: "0 18px 30px -14px rgba(122,90,248,.65)",
                }}
              >
                เล่นอีกรอบ 🔁
              </button>
              <button
                type="button"
                onClick={goSetup}
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  padding: "14px 26px",
                  borderRadius: 999,
                  border: "1px solid #F0DCEA",
                  background: "#fff",
                  color: "#5A4453",
                }}
              >
                เปลี่ยนหัวข้อ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
