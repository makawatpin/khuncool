"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useTrackToolUse } from "@/lib/trackToolEvent";
import { KcSfx, hoverSfxDelegate, speakEnglish } from "@/lib/kcSfx";
import GameBackdrop from "../GameBackdrop";
import { useStage } from "../../_stage/useStage";
import styles from "./WeatherSeasonsApp.module.css";

const LS_KEY = "kc-weather-v1";

type WeatherWord = {
  id: string;
  en: string;
  th: string;
  emoji: string;
  image?: string;
  category: "weather" | "season" | "clothes";
  sentence: string;
  sentenceTh: string;
  level: 1 | 2 | 3;
  tags: string[];
};

type Question = {
  id: string;
  type:
    | "listen-pick-image"
    | "image-pick-word"
    | "fill-blank"
    | "build-sentence"
    | "pick-season"
    | "dress-for-weather"
    | "true-false";
  prompt: string;
  promptTh?: string;
  promptVisual?: string;
  speak?: string;
  options: string[];
  correct: number;
  explain: string;
  skill: "vocabulary" | "listening" | "sentence" | "season" | "clothes";
  level: 1 | 2 | 3;
  scope: "weather" | "seasons" | "mixed";
  tokens?: string[];
  answer?: string[];
};

type Difficulty = "easy" | "normal";
type Scope = "weather" | "seasons" | "mixed";
type SeasonSystem = "international" | "thai";
type QuestionCount = 5 | 10 | "all";
type AppMode = "welcome" | "home" | "learn" | "practice" | "reporter" | "quiz" | "summary";
type LearnTab = "words" | "wheel" | "clothes" | "map";

type TeacherSettings = {
  difficulty: Difficulty;
  scope: Scope;
  seasonSystem: SeasonSystem;
  questionCount: QuestionCount;
  soundEnabled: boolean;
  showThai: boolean;
  hintsEnabled: boolean;
};

type SavedState = {
  settings: TeacherSettings;
  latest?: { mode: string; score: number; total: number; at: string };
};

type QuizResult = { question: Question; correct: boolean };

const DEFAULT_SETTINGS: TeacherSettings = {
  difficulty: "normal",
  scope: "mixed",
  seasonSystem: "international",
  questionCount: 10,
  soundEnabled: true,
  showThai: true,
  hintsEnabled: true,
};

const WEATHER_WORDS: WeatherWord[] = [
  { id: "weather-sunny", en: "sunny", th: "มีแดด", emoji: "☀️", image: "/assets/weather-seasons/sunny-3d.webp", category: "weather", sentence: "It's sunny today.", sentenceTh: "วันนี้มีแดด", level: 1, tags: ["hot", "summer", "hat", "sunglasses"] },
  { id: "weather-rainy", en: "rainy", th: "มีฝนตก", emoji: "🌧️", image: "/assets/weather-seasons/rainy-3d.webp", category: "weather", sentence: "It's rainy today.", sentenceTh: "วันนี้มีฝนตก", level: 1, tags: ["rainy-season", "raincoat", "boots", "umbrella"] },
  { id: "weather-cloudy", en: "cloudy", th: "มีเมฆมาก", emoji: "☁️", image: "/assets/weather-seasons/cloudy-3d.webp", category: "weather", sentence: "It's cloudy today.", sentenceTh: "วันนี้มีเมฆมาก", level: 1, tags: ["cool", "autumn"] },
  { id: "weather-windy", en: "windy", th: "มีลมแรง", emoji: "🌬️", image: "/assets/weather-seasons/windy-3d.webp", category: "weather", sentence: "It's windy today.", sentenceTh: "วันนี้มีลมแรง", level: 1, tags: ["autumn", "sweater"] },
  { id: "weather-stormy", en: "stormy", th: "มีพายุ", emoji: "⛈️", image: "/assets/weather-seasons/stormy-3d.webp", category: "weather", sentence: "It's stormy today.", sentenceTh: "วันนี้มีพายุ", level: 2, tags: ["rainy-season", "raincoat", "boots"] },
  { id: "weather-snowy", en: "snowy", th: "มีหิมะตก", emoji: "🌨️", image: "/assets/weather-seasons/snowy-3d.webp", category: "weather", sentence: "It's snowy today.", sentenceTh: "วันนี้มีหิมะตก", level: 2, tags: ["cold", "winter", "coat", "scarf"] },
  { id: "weather-foggy", en: "foggy", th: "มีหมอก", emoji: "🌫️", image: "/assets/weather-seasons/foggy-3d.webp", category: "weather", sentence: "It's foggy this morning.", sentenceTh: "เช้านี้มีหมอก", level: 2, tags: ["cool", "winter"] },
  { id: "weather-hot", en: "hot", th: "ร้อน", emoji: "🥵", image: "/assets/weather-seasons/hot-3d.webp", category: "weather", sentence: "It's hot today.", sentenceTh: "วันนี้อากาศร้อน", level: 1, tags: ["summer", "hot-season", "T-shirt", "shorts"] },
  { id: "weather-warm", en: "warm", th: "อบอุ่น", emoji: "🌤️", image: "/assets/weather-seasons/warm-3d.webp", category: "weather", sentence: "It's warm today.", sentenceTh: "วันนี้อากาศอบอุ่น", level: 2, tags: ["spring", "T-shirt"] },
  { id: "weather-cool", en: "cool", th: "เย็นสบาย", emoji: "🍃", image: "/assets/weather-seasons/cool-3d.webp", category: "weather", sentence: "It's cool today.", sentenceTh: "วันนี้อากาศเย็นสบาย", level: 2, tags: ["autumn", "cool-season", "sweater"] },
  { id: "weather-cold", en: "cold", th: "หนาว", emoji: "🥶", image: "/assets/weather-seasons/cold-3d.webp", category: "weather", sentence: "It's cold today.", sentenceTh: "วันนี้อากาศหนาว", level: 1, tags: ["winter", "cool-season", "coat", "scarf"] },
  { id: "season-spring", en: "spring", th: "ฤดูใบไม้ผลิ", emoji: "🌷", image: "/assets/weather-seasons/spring-3d.webp", category: "season", sentence: "Flowers grow in spring.", sentenceTh: "ดอกไม้เติบโตในฤดูใบไม้ผลิ", level: 2, tags: ["warm", "international"] },
  { id: "season-summer", en: "summer", th: "ฤดูร้อน", emoji: "🏖️", image: "/assets/weather-seasons/summer-3d.webp", category: "season", sentence: "It's hot in summer.", sentenceTh: "อากาศร้อนในฤดูร้อน", level: 1, tags: ["sunny", "hot", "international"] },
  { id: "season-autumn", en: "autumn / fall", th: "ฤดูใบไม้ร่วง", emoji: "🍂", image: "/assets/weather-seasons/autumn-3d.webp", category: "season", sentence: "Leaves fall in autumn.", sentenceTh: "ใบไม้ร่วงในฤดูใบไม้ร่วง", level: 2, tags: ["windy", "cool", "international"] },
  { id: "season-winter", en: "winter", th: "ฤดูหนาว", emoji: "❄️", image: "/assets/weather-seasons/winter-3d.webp", category: "season", sentence: "It's cold in winter.", sentenceTh: "อากาศหนาวในฤดูหนาว", level: 1, tags: ["snowy", "cold", "international"] },
  { id: "season-thai-hot", en: "hot season", th: "ฤดูร้อนของไทย", emoji: "☀️", image: "/assets/weather-seasons/thai-hot-season-3d.webp", category: "season", sentence: "Thailand is hot in the hot season.", sentenceTh: "ประเทศไทยอากาศร้อนในฤดูร้อน", level: 1, tags: ["sunny", "hot", "thai"] },
  { id: "season-thai-rainy", en: "rainy season", th: "ฤดูฝนของไทย", emoji: "🌧️", image: "/assets/weather-seasons/thai-rainy-season-3d.webp", category: "season", sentence: "It rains in the rainy season.", sentenceTh: "ฝนตกในฤดูฝน", level: 1, tags: ["rainy", "stormy", "thai"] },
  { id: "season-thai-cool", en: "cool season", th: "ฤดูหนาวของไทย", emoji: "🍃", image: "/assets/weather-seasons/thai-cool-season-3d.webp", category: "season", sentence: "It is cool in the cool season.", sentenceTh: "อากาศเย็นในฤดูหนาวของไทย", level: 1, tags: ["cool", "cold", "thai"] },
  { id: "clothes-tshirt", en: "T-shirt", th: "เสื้อยืด", emoji: "👕", image: "/assets/weather-seasons/tshirt-3d.webp", category: "clothes", sentence: "You should wear a T-shirt.", sentenceTh: "เธอควรใส่เสื้อยืด", level: 1, tags: ["sunny", "hot", "summer", "hot-season"] },
  { id: "clothes-shorts", en: "shorts", th: "กางเกงขาสั้น", emoji: "🩳", image: "/assets/weather-seasons/shorts-3d.webp", category: "clothes", sentence: "You should wear shorts.", sentenceTh: "เธอควรใส่กางเกงขาสั้น", level: 1, tags: ["sunny", "hot", "summer"] },
  { id: "clothes-sweater", en: "sweater", th: "เสื้อกันหนาว", emoji: "🧶", image: "/assets/weather-seasons/sweater-3d.webp", category: "clothes", sentence: "You should wear a sweater.", sentenceTh: "เธอควรใส่เสื้อกันหนาว", level: 2, tags: ["cool", "windy", "autumn"] },
  { id: "clothes-coat", en: "coat", th: "เสื้อโค้ต", emoji: "🧥", image: "/assets/weather-seasons/coat-3d.webp", category: "clothes", sentence: "You should wear a coat.", sentenceTh: "เธอควรใส่เสื้อโค้ต", level: 1, tags: ["cold", "snowy", "winter"] },
  { id: "clothes-raincoat", en: "raincoat", th: "เสื้อกันฝน", emoji: "🧥", image: "/assets/weather-seasons/raincoat-3d.webp", category: "clothes", sentence: "You should wear a raincoat.", sentenceTh: "เธอควรใส่เสื้อกันฝน", level: 1, tags: ["rainy", "stormy", "rainy-season"] },
  { id: "clothes-boots", en: "boots", th: "รองเท้าบูต", emoji: "🥾", image: "/assets/weather-seasons/boots-3d.webp", category: "clothes", sentence: "You should wear boots.", sentenceTh: "เธอควรใส่รองเท้าบูต", level: 1, tags: ["rainy", "snowy", "winter"] },
  { id: "clothes-hat", en: "hat", th: "หมวก", emoji: "👒", image: "/assets/weather-seasons/hat-3d.webp", category: "clothes", sentence: "You should wear a hat.", sentenceTh: "เธอควรใส่หมวก", level: 1, tags: ["sunny", "hot"] },
  { id: "clothes-scarf", en: "scarf", th: "ผ้าพันคอ", emoji: "🧣", image: "/assets/weather-seasons/scarf-3d.webp", category: "clothes", sentence: "You should wear a scarf.", sentenceTh: "เธอควรใส่ผ้าพันคอ", level: 2, tags: ["cold", "snowy", "winter"] },
  { id: "clothes-umbrella", en: "umbrella", th: "ร่ม", emoji: "☂️", image: "/assets/weather-seasons/umbrella-3d.webp", category: "clothes", sentence: "You should take an umbrella.", sentenceTh: "เธอควรพกร่ม", level: 1, tags: ["rainy", "stormy", "rainy-season"] },
  { id: "clothes-sunglasses", en: "sunglasses", th: "แว่นกันแดด", emoji: "🕶️", image: "/assets/weather-seasons/sunglasses-3d.webp", category: "clothes", sentence: "You should wear sunglasses.", sentenceTh: "เธอควรใส่แว่นกันแดด", level: 1, tags: ["sunny", "hot", "summer"] },
];

const QUESTIONS: Question[] = [
  { id: "listen-rainy", type: "listen-pick-image", prompt: "Listen and choose the picture.", promptTh: "ฟังแล้วเลือกภาพที่ถูกต้อง", speak: "rainy", options: ["☀️", "🌧️", "☁️", "🌬️"], correct: 1, explain: "Rainy แปลว่า มีฝนตก จึงตรงกับภาพ 🌧️", skill: "listening", level: 1, scope: "weather" },
  { id: "listen-windy", type: "listen-pick-image", prompt: "Listen and choose the picture.", promptTh: "ฟังแล้วเลือกภาพที่ถูกต้อง", speak: "windy", options: ["🌫️", "🌨️", "🌬️", "⛈️"], correct: 2, explain: "Windy แปลว่า มีลมแรง จึงตรงกับภาพเส้นลม", skill: "listening", level: 1, scope: "weather" },
  { id: "listen-cloudy", type: "listen-pick-image", prompt: "Listen and choose the picture.", promptTh: "ฟังแล้วเลือกภาพที่ถูกต้อง", speak: "cloudy", options: ["☁️", "☀️", "🌧️", "🌨️"], correct: 0, explain: "Cloudy แปลว่า มีเมฆมาก จึงตรงกับภาพก้อนเมฆทึบ", skill: "listening", level: 1, scope: "weather" },
  { id: "image-sunny", type: "image-pick-word", prompt: "Which word matches this picture?", promptTh: "คำใดตรงกับภาพนี้", promptVisual: "sunny", speak: "Which word matches the picture?", options: ["sunny", "stormy", "foggy", "snowy"], correct: 0, explain: "ภาพดวงอาทิตย์สว่างคือ sunny — มีแดด", skill: "vocabulary", level: 1, scope: "weather" },
  { id: "image-foggy", type: "image-pick-word", prompt: "Which word matches this picture?", promptTh: "คำใดตรงกับภาพนี้", promptVisual: "foggy", speak: "Which word matches the picture?", options: ["windy", "foggy", "rainy", "hot"], correct: 1, explain: "ภาพชั้นหมอกคือ foggy — มีหมอก", skill: "vocabulary", level: 2, scope: "weather" },
  { id: "image-stormy", type: "image-pick-word", prompt: "Which word matches this picture?", promptTh: "คำใดตรงกับภาพนี้", promptVisual: "stormy", speak: "Which word matches the picture?", options: ["warm", "cloudy", "stormy", "sunny"], correct: 2, explain: "ภาพเมฆสีเข้มพร้อมสายฟ้าคือ stormy — มีพายุ", skill: "vocabulary", level: 2, scope: "weather" },
  { id: "blank-rainy", type: "fill-blank", prompt: "It's ___ today.", promptTh: "เติมคำในช่องว่าง", promptVisual: "rainy", speak: "Look at the picture. Which weather word completes the sentence?", options: ["rainy", "windy", "warm", "sunny"], correct: 0, explain: "ประโยคที่ถูกคือ It's rainy today.", skill: "sentence", level: 1, scope: "weather" },
  { id: "blank-cold", type: "fill-blank", prompt: "It's ___ today.", promptTh: "เติมคำในช่องว่าง", promptVisual: "cold", speak: "Look at the picture. Which weather word completes the sentence?", options: ["hot", "warm", "cold", "sunny"], correct: 2, explain: "ประโยคที่ถูกคือ It's cold today.", skill: "sentence", level: 1, scope: "weather" },
  { id: "blank-summer", type: "fill-blank", prompt: "It's hot in ___.", promptTh: "เติมชื่อฤดูกาล", speak: "Which season completes the sentence? It's hot in...", options: ["winter", "summer", "autumn", "spring"], correct: 1, explain: "It's hot in summer.", skill: "season", level: 1, scope: "seasons" },
  { id: "build-sunny", type: "build-sentence", prompt: "Put the words in order.", promptTh: "เรียงคำให้เป็นประโยค", speak: "It's sunny today.", options: ["today.", "sunny", "It's"], correct: 0, tokens: ["today.", "sunny", "It's"], answer: ["It's", "sunny", "today."], explain: "ประโยคที่ถูกคือ It's sunny today.", skill: "sentence", level: 1, scope: "weather" },
  { id: "build-bangkok", type: "build-sentence", prompt: "Put the words in order.", promptTh: "เรียงคำให้เป็นประโยค", speak: "It's sunny in Bangkok.", options: ["Bangkok.", "sunny", "It's", "in"], correct: 0, tokens: ["Bangkok.", "sunny", "It's", "in"], answer: ["It's", "sunny", "in", "Bangkok."], explain: "ประโยคที่ถูกคือ It's sunny in Bangkok.", skill: "sentence", level: 2, scope: "mixed" },
  { id: "build-wear", type: "build-sentence", prompt: "Put the words in order.", promptTh: "เรียงคำให้เป็นประโยค", speak: "You should wear a raincoat.", options: ["raincoat.", "wear", "You", "a", "should"], correct: 0, tokens: ["raincoat.", "wear", "You", "a", "should"], answer: ["You", "should", "wear", "a", "raincoat."], explain: "ประโยคที่ถูกคือ You should wear a raincoat.", skill: "sentence", level: 2, scope: "mixed" },
  { id: "season-winter", type: "pick-season", prompt: "It is snowy and cold. What season is it?", promptTh: "หิมะตกและอากาศหนาว เป็นฤดูอะไร", speak: "It is snowy and cold. What season is it?", options: ["spring", "summer", "autumn", "winter"], correct: 3, explain: "Snowy และ cold เชื่อมโยงกับ winter", skill: "season", level: 1, scope: "seasons" },
  { id: "season-autumn", type: "pick-season", prompt: "Leaves fall and it is windy. What season is it?", promptTh: "ใบไม้ร่วงและมีลม เป็นฤดูอะไร", speak: "Leaves fall and it is windy. What season is it?", options: ["summer", "autumn", "winter", "spring"], correct: 1, explain: "Leaves fall in autumn.", skill: "season", level: 2, scope: "seasons" },
  { id: "season-spring", type: "pick-season", prompt: "Flowers grow and it is warm. What season is it?", promptTh: "ดอกไม้เติบโตและอากาศอบอุ่น เป็นฤดูอะไร", speak: "Flowers grow and it is warm. What season is it?", options: ["spring", "winter", "summer", "autumn"], correct: 0, explain: "Flowers grow in spring.", skill: "season", level: 2, scope: "seasons" },
  { id: "season-thai-rainy", type: "pick-season", prompt: "It rains a lot in Thailand. What season is it?", promptTh: "ประเทศไทยมีฝนตกมาก เป็นฤดูอะไร", speak: "It rains a lot in Thailand. What season is it?", options: ["hot season", "rainy season", "cool season"], correct: 1, explain: "ฝนตกมากใน rainy season", skill: "season", level: 1, scope: "seasons" },
  { id: "dress-rainy", type: "dress-for-weather", prompt: "It's rainy. What should I wear?", promptTh: "ฝนตก ควรใส่อะไร", speak: "It's rainy. What should I wear?", options: ["raincoat", "sunglasses", "scarf", "shorts"], correct: 0, explain: "You should wear a raincoat when it is rainy.", skill: "clothes", level: 1, scope: "mixed" },
  { id: "dress-cold", type: "dress-for-weather", prompt: "It's cold. What should I wear?", promptTh: "อากาศหนาว ควรใส่อะไร", speak: "It's cold. What should I wear?", options: ["shorts", "coat", "sunglasses", "T-shirt"], correct: 1, explain: "You should wear a coat when it is cold.", skill: "clothes", level: 1, scope: "mixed" },
  { id: "dress-sunny", type: "dress-for-weather", prompt: "It's sunny. What should I wear?", promptTh: "แดดออก ควรใส่อะไร", speak: "It's sunny. What should I wear?", options: ["scarf", "boots", "sunglasses", "raincoat"], correct: 2, explain: "Sunglasses protect your eyes on a sunny day.", skill: "clothes", level: 1, scope: "mixed" },
  { id: "dress-snowy", type: "dress-for-weather", prompt: "It's snowy. What should I wear?", promptTh: "หิมะตก ควรใส่อะไร", speak: "It's snowy. What should I wear?", options: ["coat", "shorts", "T-shirt", "sunglasses"], correct: 0, explain: "A coat keeps you warm in snowy weather.", skill: "clothes", level: 2, scope: "mixed" },
  { id: "tf-summer", type: "true-false", prompt: "Summer is usually hot.", promptTh: "ฤดูร้อนมักมีอากาศร้อน", speak: "Summer is usually hot. True or false?", options: ["True ✓", "False ✗"], correct: 0, explain: "ถูกต้อง Summer is usually hot.", skill: "season", level: 1, scope: "seasons" },
  { id: "tf-winter", type: "true-false", prompt: "Winter is usually hot.", promptTh: "ฤดูหนาวมักมีอากาศร้อน", speak: "Winter is usually hot. True or false?", options: ["True ✓", "False ✗"], correct: 1, explain: "Winter is usually cold, not hot.", skill: "season", level: 1, scope: "seasons" },
  { id: "tf-umbrella", type: "true-false", prompt: "I should take an umbrella on a rainy day.", promptTh: "ฉันควรพกร่มในวันที่ฝนตก", speak: "I should take an umbrella on a rainy day. True or false?", options: ["True ✓", "False ✗"], correct: 0, explain: "An umbrella is useful on a rainy day.", skill: "clothes", level: 1, scope: "mixed" },
  { id: "tf-snow", type: "true-false", prompt: "Snowy means there is a lot of sunshine.", promptTh: "Snowy หมายถึงมีแสงแดดมาก", speak: "Snowy means there is a lot of sunshine. True or false?", options: ["True ✓", "False ✗"], correct: 1, explain: "Snowy means snow is falling.", skill: "vocabulary", level: 2, scope: "weather" },
];

const INTERNATIONAL_SEASONS = WEATHER_WORDS.filter((word) => word.category === "season" && word.tags.includes("international"));
const THAI_SEASONS = WEATHER_WORDS.filter((word) => word.category === "season" && word.tags.includes("thai"));
const SEASON_MONTHS: Record<string, string> = {
  "season-spring": "Mar–May",
  "season-summer": "Jun–Aug",
  "season-autumn": "Sep–Nov",
  "season-winter": "Dec–Feb",
  "season-thai-hot": "Mar–May",
  "season-thai-rainy": "Jun–Oct",
  "season-thai-cool": "Nov–Feb",
};
const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const SEASON_WHEEL_ANGLES: Record<string, number> = {
  "season-spring": 300,
  "season-summer": 30,
  "season-autumn": 120,
  "season-winter": 210,
  "season-thai-hot": 300,
  "season-thai-rainy": 60,
  "season-thai-cool": 195,
};
const WEATHER_ONLY = WEATHER_WORDS.filter((word) => word.category === "weather");
const CLOTHES_ONLY = WEATHER_WORDS.filter((word) => word.category === "clothes");
const DRESSED_CHARACTER_IMAGES: Record<string, string> = {
  "T-shirt": "/assets/weather-seasons/character-tshirt-cutout-3d.webp",
  shorts: "/assets/weather-seasons/character-shorts-cutout-3d.webp",
  sweater: "/assets/weather-seasons/character-sweater-cutout-3d.webp",
  coat: "/assets/weather-seasons/character-coat-cutout-3d.webp",
  raincoat: "/assets/weather-seasons/character-raincoat-cutout-3d.webp",
  boots: "/assets/weather-seasons/character-boots-cutout-3d.webp",
  scarf: "/assets/weather-seasons/character-scarf-cutout-3d.webp",
  umbrella: "/assets/weather-seasons/character-umbrella-cutout-3d.webp",
  sunglasses: "/assets/weather-seasons/character-sunglasses-cutout-3d.webp",
};
const DRESS_MISSIONS: Record<string, { correct: string; options: string[] }> = {
  sunny: { correct: "sunglasses", options: ["sunglasses", "raincoat", "coat", "boots"] },
  rainy: { correct: "raincoat", options: ["raincoat", "sunglasses", "scarf", "shorts"] },
  windy: { correct: "sweater", options: ["sweater", "raincoat", "sunglasses", "shorts"] },
  snowy: { correct: "coat", options: ["coat", "T-shirt", "shorts", "sunglasses"] },
  cold: { correct: "scarf", options: ["scarf", "T-shirt", "shorts", "sunglasses"] },
  stormy: { correct: "umbrella", options: ["umbrella", "hat", "sunglasses", "shorts"] },
};
const DRESS_WEATHER_ORDER = ["rainy", "sunny", "windy", "snowy", "cold", "stormy"];
const LEVEL_LIMIT: Record<Difficulty, 1 | 2> = { easy: 1, normal: 2 };

const CITY_REPORTS = [
  { id: "bangkok", city: "Bangkok", th: "กรุงเทพฯ", weather: "sunny" },
  { id: "chiangMai", city: "Chiang Mai", th: "เชียงใหม่", weather: "cool" },
  { id: "khonKaen", city: "Khon Kaen", th: "ขอนแก่น", weather: "cloudy" },
  { id: "phuket", city: "Phuket", th: "ภูเก็ต", weather: "rainy" },
  { id: "udonThani", city: "Udon Thani", th: "อุดรธานี", weather: "foggy" },
  { id: "ayutthaya", city: "Ayutthaya", th: "อยุธยา", weather: "hot" },
  { id: "pattaya", city: "Pattaya", th: "พัทยา", weather: "windy" },
  { id: "hatYai", city: "Hat Yai", th: "หาดใหญ่", weather: "stormy" },
];

const LESSON_ORDER: LearnTab[] = ["words", "wheel", "clothes", "map"];
const LESSON_NAMES: Record<LearnTab, string> = { words: "คำศัพท์อากาศ", wheel: "ฤดูกาล", clothes: "แต่งตัวตามอากาศ", map: "รายงานอากาศไทย" };

function validateData() {
  const wordIds = new Set<string>();
  const questionIds = new Set<string>();
  WEATHER_WORDS.forEach((word) => {
    if (wordIds.has(word.id)) throw new Error(`Duplicate weather word id: ${word.id}`);
    wordIds.add(word.id);
  });
  QUESTIONS.forEach((question) => {
    if (questionIds.has(question.id)) throw new Error(`Duplicate question id: ${question.id}`);
    questionIds.add(question.id);
    if (new Set(question.options).size !== question.options.length) throw new Error(`Duplicate options: ${question.id}`);
    if (question.correct < 0 || question.correct >= question.options.length) throw new Error(`Invalid correct index: ${question.id}`);
    if (!question.speak?.trim()) throw new Error(`Missing narration: ${question.id}`);
    if (/\bblank\b|_{2,}/i.test(question.speak)) throw new Error(`Unnatural narration placeholder: ${question.id}`);
    if (question.type === "build-sentence") {
      if (!question.tokens?.length || !question.answer?.length) throw new Error(`Missing sentence data: ${question.id}`);
      if ([...question.tokens].sort().join("|") !== [...question.answer].sort().join("|")) throw new Error(`Sentence tokens do not match: ${question.id}`);
    }
  });
}

if (process.env.NODE_ENV !== "production") validateData();

function normalizeSettings(input?: Record<string, unknown>): TeacherSettings {
  const difficulty: Difficulty = input?.difficulty === "easy" ? "easy" : "normal";
  const scope: Scope = input?.scope === "weather" || input?.scope === "seasons" ? input.scope : "mixed";
  const seasonSystem: SeasonSystem = input?.seasonSystem === "thai" ? "thai" : "international";
  const questionCount: QuestionCount = input?.questionCount === 5 || input?.questionCount === 10 || input?.questionCount === "all"
    ? input.questionCount
    : input?.questionCount === 15 ? "all" : DEFAULT_SETTINGS.questionCount;
  return {
    difficulty,
    scope,
    seasonSystem,
    questionCount,
    soundEnabled: typeof input?.soundEnabled === "boolean" ? input.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
    showThai: typeof input?.showThai === "boolean" ? input.showThai : DEFAULT_SETTINGS.showThai,
    hintsEnabled: typeof input?.hintsEnabled === "boolean" ? input.hintsEnabled : DEFAULT_SETTINGS.hintsEnabled,
  };
}

function loadSaved(): SavedState {
  if (typeof window === "undefined") return { settings: DEFAULT_SETTINGS };
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return { settings: DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<SavedState>;
    const savedSettings = parsed.settings && typeof parsed.settings === "object"
      ? parsed.settings as unknown as Record<string, unknown>
      : undefined;
    return { ...parsed, settings: normalizeSettings(savedSettings) };
  } catch {
    return { settings: DEFAULT_SETTINGS };
  }
}

function saveState(state: SavedState) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* Storage is optional. */
  }
}

function questionLabel(type: Question["type"]) {
  const labels: Record<Question["type"], string> = {
    "listen-pick-image": "ฟังแล้วเลือกภาพ",
    "image-pick-word": "ดูภาพเลือกคำ",
    "fill-blank": "เติมคำ",
    "build-sentence": "เรียงประโยค",
    "pick-season": "เลือกฤดูกาล",
    "dress-for-weather": "แต่งตัวตามอากาศ",
    "true-false": "จริงหรือเท็จ",
  };
  return labels[type];
}

function quizLessonFor(question: Question) {
  if (question.type === "fill-blank") {
    const asksSeason = question.skill === "season";
    return {
      icon: asksSeason ? "🍂" : "☀️",
      title: asksSeason ? "บอกอากาศในแต่ละฤดู" : "บอกสภาพอากาศวันนี้",
      pattern: asksSeason ? "It’s [weather] in [season]." : "It’s [weather] today.",
      meaning: asksSeason ? "ใช้ in นำหน้าชื่อฤดูกาล" : "ใส่คำบอกอากาศหลัง It’s",
      instruction: asksSeason ? "เลือกชื่อฤดูที่ทำให้ประโยคสมบูรณ์" : "ดูภาพ แล้วเลือกคำบอกอากาศเติมในช่องว่าง",
      example: asksSeason ? "It's warm in spring." : "It's sunny today.",
    };
  }
  if (question.type === "pick-season") return {
    icon: "🗓️",
    title: "หาฤดูจากคำบอกใบ้",
    pattern: "It is [weather]. What season is it?",
    meaning: "อ่านลักษณะอากาศหรือธรรมชาติ แล้วหาชื่อฤดู",
    instruction: "อ่านคำบอกใบ้ แล้วเลือกฤดูที่ตรงที่สุด",
    example: "It is warm. What season is it?",
  };
  if (question.type === "dress-for-weather") return {
    icon: "🧥",
    title: "แนะนำเสื้อผ้าที่ควรสวม",
    pattern: "You should wear [clothing].",
    meaning: "should wear ใช้บอกว่าควรสวมอะไร",
    instruction: "ดูสภาพอากาศ แล้วเลือกเสื้อผ้าที่เหมาะที่สุด",
    example: "You should wear a hat.",
  };
  if (question.skill === "clothes") return {
    icon: "✅",
    title: "ตรวจคำแนะนำเกี่ยวกับเสื้อผ้า",
    pattern: "I should [action] on a [weather] day.",
    meaning: "อ่านว่าเสื้อผ้าหรือของชิ้นนั้นเหมาะกับอากาศหรือไม่",
    instruction: "อ่านประโยค แล้วเลือก True ถ้าถูก หรือ False ถ้าไม่ถูก",
    example: "I should take a hat on a sunny day.",
  };
  return {
    icon: "✅",
    title: "ตรวจข้อเท็จจริงเรื่องอากาศ",
    pattern: "[Weather / season] is usually [description].",
    meaning: "usually หมายถึง โดยปกติหรือโดยทั่วไป",
    instruction: "อ่านประโยค แล้วเลือก True ถ้าถูก หรือ False ถ้าไม่ถูก",
    example: "Summer is usually warm.",
  };
}

function optionWeatherWord(option: string) {
  const normalizedOption = option.trim().toLowerCase();
  return WEATHER_WORDS.find((word) => {
    const names = word.en.split("/").map((name) => name.trim().toLowerCase());
    return names.includes(normalizedOption) || word.en.toLowerCase() === normalizedOption || word.emoji === option;
  });
}

function WeatherVisual({ word, className }: { word: WeatherWord; className?: string }) {
  if (word.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={word.image} alt="" aria-hidden="true" />;
  }
  return <span className={className} aria-hidden="true">{word.emoji}</span>;
}

function weatherTheme(en: string) {
  if (["rainy", "stormy"].includes(en)) return "rain";
  if (["snowy", "cold"].includes(en)) return "snow";
  if (["cloudy", "foggy"].includes(en)) return "cloud";
  if (["windy", "cool"].includes(en)) return "wind";
  return "sun";
}

export default function WeatherSeasonsApp() {
  useTrackToolUse("weather-seasons");
  const { isFull, stageProps, toggle: toggleFull } = useStage<HTMLDivElement>();
  const [mode, setMode] = useState<AppMode>("welcome");
  const [settings, setSettings] = useState<TeacherSettings>(DEFAULT_SETTINGS);
  const [settingsReady, setSettingsReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [learnTab, setLearnTab] = useState<LearnTab>("words");
  const [learnIndex, setLearnIndex] = useState(0);
  const [learnCategory, setLearnCategory] = useState<WeatherWord["category"]>("weather");
  const [wheelIndex, setWheelIndex] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(60);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState("bangkok");
  const [dressWeather, setDressWeather] = useState("rainy");
  const [dressChoice, setDressChoice] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [built, setBuilt] = useState<number[]>([]);
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [scrambleRound, setScrambleRound] = useState(0);
  const [scrambleTiles, setScrambleTiles] = useState<number[]>([]);
  const [scrambleBuilt, setScrambleBuilt] = useState<number[]>([]);
  const [scrambleStatus, setScrambleStatus] = useState<"correct" | "wrong" | null>(null);
  const [dressRound, setDressRound] = useState(0);
  const [dressScore, setDressScore] = useState(0);
  const [dressReaction, setDressReaction] = useState<"ready" | "right" | "wrong">("ready");
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [summaryKind, setSummaryKind] = useState<"practice" | "reporter" | "quiz">("practice");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion = questions[questionIndex];
  const levelLimit = LEVEL_LIMIT[settings.difficulty];
  const seasonWords = settings.seasonSystem === "thai" ? THAI_SEASONS : INTERNATIONAL_SEASONS;
  const scrambleWords = useMemo(() => WEATHER_WORDS.filter((word) => word.category !== "season" && word.level <= levelLimit && /^[A-Za-z-]+$/.test(word.en)), [levelLimit]);
  const scrambleWord = scrambleWords[scrambleRound % Math.max(1, scrambleWords.length)];
  const selectedCityReport = CITY_REPORTS.find((report) => report.id === selectedCityId) ?? CITY_REPORTS[0];
  const selectedCityWeather = WEATHER_ONLY.find((word) => word.en === selectedCityReport.weather)!;

  const visibleLearnWords = useMemo(() => {
    if (learnCategory === "season") return seasonWords.filter((word) => word.level <= levelLimit);
    return WEATHER_WORDS.filter((word) => word.category === learnCategory && word.level <= levelLimit);
  }, [learnCategory, seasonWords, levelLimit]);

  const speak = useCallback((text?: string) => {
    if (!text || !settings.soundEnabled) return;
    speakEnglish(text, true);
  }, [settings.soundEnabled]);

  const stopMedia = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  }, []);

  useEffect(() => stopMedia, [stopMedia]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      setSettings(loadSaved().settings);
      setSettingsReady(true);
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    saveState({ settings, latest: loadSaved().latest });
    KcSfx.setMuted(!settings.soundEnabled);
  }, [settings, settingsReady]);

  useEffect(() => {
    if (mode !== "practice" || !scrambleWord) return;
    const shuffleTimer = window.setTimeout(() => {
      const indexes = Array.from({ length: scrambleWord.en.length }, (_, index) => index);
      for (let index = indexes.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1));
        [indexes[index], indexes[swap]] = [indexes[swap], indexes[index]];
      }
      if (indexes.every((value, index) => value === index) && indexes.length > 1) [indexes[0], indexes[1]] = [indexes[1], indexes[0]];
      setScrambleTiles(indexes);
      setScrambleBuilt([]);
      setScrambleStatus(null);
    }, 0);
    return () => window.clearTimeout(shuffleTimer);
  }, [mode, scrambleRound, scrambleWord]);

  const filteredQuestions = useCallback((onlyIds?: string[]) => {
    let pool = QUESTIONS.filter((q) => q.level <= LEVEL_LIMIT[settings.difficulty]);
    if (settings.scope === "weather") pool = pool.filter((q) => q.scope !== "seasons");
    if (settings.scope === "seasons") pool = pool.filter((q) => q.scope === "seasons");
    if (settings.seasonSystem === "thai") pool = pool.filter((q) => !["season-winter", "season-autumn", "season-spring", "blank-summer", "tf-winter"].includes(q.id));
    else pool = pool.filter((q) => q.id !== "season-thai-rainy");
    if (onlyIds?.length) pool = pool.filter((q) => onlyIds.includes(q.id));
    return pool;
  }, [settings]);

  const resetQuestionState = useCallback(() => {
    setPicked(null);
    setLocked(false);
    setFeedback(null);
    setBuilt([]);
  }, []);

  const startMode = useCallback((nextMode: "practice" | "reporter" | "quiz", onlyIds?: string[]) => {
    stopMedia();
    let pool = filteredQuestions(onlyIds);
    if (nextMode === "practice") pool = QUESTIONS.slice(0, 8);
    if (nextMode === "reporter") pool = QUESTIONS.slice(0, 6);
    if (nextMode === "quiz") pool = pool.filter((question) => ["fill-blank", "pick-season", "dress-for-weather", "true-false"].includes(question.type));
    const count = onlyIds?.length
      ? pool.length
      : nextMode === "practice"
        ? 8
        : nextMode === "reporter"
          ? 6
          : settings.questionCount === "all" ? pool.length : settings.questionCount;
    pool = pool.slice(0, Math.max(1, count));
    setQuestions(pool);
    setQuestionIndex(0);
    setPracticeCorrect(0);
    setQuizResults([]);
    setScrambleRound(0);
    setScrambleBuilt([]);
    setScrambleStatus(null);
    setDressRound(0);
    setDressScore(0);
    setDressWeather("rainy");
    setDressChoice(null);
    setDressReaction("ready");
    resetQuestionState();
    setMode(nextMode);
    KcSfx.play("whoosh");
    const intro = nextMode === "practice" ? "Unscramble the weather word." : nextMode === "reporter" ? "Dress the character for the weather." : "Choose the best sentence.";
    timeoutRef.current = setTimeout(() => speak(intro), 260);
  }, [filteredQuestions, resetQuestionState, settings.questionCount, speak, stopMedia]);

  const finish = useCallback((kind: "practice" | "reporter" | "quiz", score: number, total: number) => {
    stopMedia();
    setSummaryKind(kind);
    setMode("summary");
    saveState({ settings, latest: { mode: kind, score, total, at: new Date().toISOString() } });
    KcSfx.play(score >= Math.ceil(total * 0.7) ? "win" : "star");
  }, [settings, stopMedia]);

  const pickScrambleTile = useCallback((tileIndex: number) => {
    if (!scrambleWord || scrambleBuilt.includes(tileIndex) || scrambleStatus === "correct") return;
    const next = [...scrambleBuilt, tileIndex];
    setScrambleBuilt(next);
    if (next.length !== scrambleWord.en.length) return;
    const answer = next.map((index) => scrambleWord.en[index]).join("");
    if (answer.toLowerCase() === scrambleWord.en.toLowerCase()) {
      setScrambleStatus("correct");
      setPracticeCorrect((score) => score + 1);
      KcSfx.play("correct");
      speak(scrambleWord.en);
    } else {
      setScrambleStatus("wrong");
      KcSfx.play("wrong");
      timeoutRef.current = setTimeout(() => { setScrambleBuilt([]); setScrambleStatus(null); }, 850);
    }
  }, [scrambleBuilt, scrambleStatus, scrambleWord, speak]);

  const nextScramble = useCallback(() => {
    const next = scrambleRound + 1;
    if (next >= questions.length) {
      finish("practice", practiceCorrect, questions.length);
      return;
    }
    setScrambleRound(next);
    KcSfx.play("whoosh");
  }, [finish, practiceCorrect, questions.length, scrambleRound]);

  const tryDressItem = useCallback((word: WeatherWord) => {
    const correct = DRESS_MISSIONS[dressWeather]?.correct === word.en;
    setDressChoice(word.en);
    setDressReaction(correct ? "right" : "wrong");
    KcSfx.play(correct ? "correct" : "wrong");
    speak(correct ? word.sentence : `Try again. Choose the item made for ${dressWeather} weather.`);
    if (correct) setDressScore((score) => score + 1);
  }, [dressWeather, speak]);

  const nextDress = useCallback(() => {
    const next = dressRound + 1;
    if (next >= questions.length) {
      setPracticeCorrect(dressScore);
      finish("reporter", dressScore, questions.length);
      return;
    }
    setDressRound(next);
    setDressWeather(DRESS_WEATHER_ORDER[next % DRESS_WEATHER_ORDER.length]);
    setDressChoice(null);
    setDressReaction("ready");
    KcSfx.play("whoosh");
  }, [dressRound, dressScore, finish, questions.length]);

  const moveNext = useCallback((kind: "practice" | "reporter" | "quiz", nextResults?: QuizResult[]) => {
    const next = questionIndex + 1;
    if (next >= questions.length) {
      if (kind === "practice") finish(kind, practiceCorrect + 1, questions.length);
      if (kind === "quiz") {
        const results = nextResults || quizResults;
        finish(kind, results.filter((result) => result.correct).length, questions.length);
      }
      if (kind === "reporter") {
        setQuestionIndex(9);
        resetQuestionState();
      }
      return;
    }
    setQuestionIndex(next);
    resetQuestionState();
    timeoutRef.current = setTimeout(() => speak(questions[next]?.speak || questions[next]?.prompt), 260);
  }, [finish, practiceCorrect, questionIndex, questions, quizResults, resetQuestionState, speak]);

  const chooseAnswer = useCallback((index: number) => {
    if (!currentQuestion || locked) return;
    const correct = index === currentQuestion.correct;
    setPicked(index);
    setFeedback(correct ? "correct" : "wrong");
    KcSfx.play(correct ? "correct" : "wrong");

    if (mode === "practice") {
      if (!correct) {
        setLocked(true);
        timeoutRef.current = setTimeout(() => {
          setLocked(false);
          setPicked(null);
          setFeedback(null);
        }, 1100);
        return;
      }
      setLocked(true);
      setPracticeCorrect((score) => score + 1);
      timeoutRef.current = setTimeout(() => moveNext("practice"), 1050);
      return;
    }

    if (mode === "quiz") {
      setLocked(true);
      const nextResults = [...quizResults, { question: currentQuestion, correct }];
      setQuizResults(nextResults);
      timeoutRef.current = setTimeout(() => moveNext("quiz", nextResults), 1150);
      return;
    }

  }, [currentQuestion, locked, mode, moveNext, quizResults]);

  const submitSentence = useCallback(() => {
    if (!currentQuestion?.answer || locked) return;
    const sentence = built.map((index) => currentQuestion.tokens?.[index]).join(" ");
    const expected = currentQuestion.answer.join(" ");
    chooseAnswer(sentence === expected ? currentQuestion.correct : -1);
  }, [built, chooseAnswer, currentQuestion, locked]);

  const replayCurrent = useCallback(() => speak(currentQuestion?.speak || currentQuestion?.prompt), [currentQuestion, speak]);

  const toggleSound = useCallback(() => {
    if (settings.soundEnabled) {
      try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    }
    setSettings((value) => ({ ...value, soundEnabled: !value.soundEnabled }));
  }, [settings.soundEnabled]);

  const updateSettings = useCallback((next: TeacherSettings) => {
    if (next.seasonSystem !== settings.seasonSystem) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setWheelSpinning(false);
      setWheelIndex(0);
      setWheelRotation(60);
    }
    setSettings(next);
  }, [settings.seasonSystem]);

  const exitMode = useCallback(() => {
    stopMedia();
    setMode("home");
    setSettingsOpen(false);
    KcSfx.play("whoosh");
  }, [stopMedia]);

  const moveLesson = useCallback((direction: -1 | 1) => {
    const index = LESSON_ORDER.indexOf(learnTab);
    const next = index + direction;
    if (next < 0) {
      setMode("home");
      return;
    }
    if (next >= LESSON_ORDER.length) {
      startMode("practice");
      return;
    }
    const nextTab = LESSON_ORDER[next];
    setLearnTab(nextTab);
    if (nextTab === "words") {
      setLearnCategory("weather");
      setLearnIndex(0);
    }
    KcSfx.play("whoosh");
    if (nextTab === "wheel") setTimeout(() => speak("What season is it?"), 220);
    if (nextTab === "clothes") setTimeout(() => speak("What should I wear?"), 220);
    if (nextTab === "map") setTimeout(() => speak("It's sunny in Bangkok."), 220);
  }, [learnTab, speak, startMode]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
      if (event.code === "Space") {
        event.preventDefault();
        replayCurrent();
        return;
      }
      const index = Number(event.key) - 1;
      if (index < 0 || index > 3 || locked || !currentQuestion) return;
      if (currentQuestion.type === "build-sentence") {
        if (index < (currentQuestion.tokens?.length || 0) && !built.includes(index)) setBuilt((value) => [...value, index]);
      } else if (index < currentQuestion.options.length) chooseAnswer(index);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [built, chooseAnswer, currentQuestion, locked, replayCurrent]);

  const renderToolbar = mode !== "welcome" && mode !== "home" && mode !== "summary";
  const progress = questions.length ? Math.round(((questionIndex + 1) / questions.length) * 100) : 0;
  const learnWord = visibleLearnWords[learnIndex % Math.max(visibleLearnWords.length, 1)];
  const wheelSeasons = seasonWords;
  const wheelWord = wheelSeasons[wheelIndex % wheelSeasons.length];
  const wheelDisplaySeasons = wheelSeasons;
  const wheelWeatherWords = wheelWord ? WEATHER_ONLY.filter((word) => wheelWord.tags.includes(word.en)) : [];
  const dressWord = WEATHER_ONLY.find((word) => word.en === dressWeather) || WEATHER_ONLY[1];
  const dressChoiceWord = dressChoice ? CLOTHES_ONLY.find((word) => word.en === dressChoice) : undefined;
  const dressedCharacterSrc = dressChoiceWord && dressChoiceWord.en !== "hat" ? DRESSED_CHARACTER_IMAGES[dressChoiceWord.en] : "/assets/weather-seasons/dress-character-3d.webp";
  const dressMission = DRESS_MISSIONS[dressWeather] || DRESS_MISSIONS.rainy;
  const dressOptions = dressMission.options.map((name) => CLOTHES_ONLY.find((word) => word.en === name)).filter((word): word is WeatherWord => Boolean(word));
  const promptVisualWord = currentQuestion?.promptVisual ? WEATHER_ONLY.find((word) => word.en === currentQuestion.promptVisual) : undefined;
  const quizLesson = currentQuestion ? quizLessonFor(currentQuestion) : null;

  const spinSeasonWheel = () => {
    if (wheelSpinning || wheelSeasons.length < 2) return;
    let next = wheelIndex;
    while (next === wheelIndex) next = Math.floor(Math.random() * wheelSeasons.length);
    const centers = wheelSeasons.length === 3 ? [300, 60, 195] : [300, 30, 120, 210];
    const target = ((-centers[next] % 360) + 360) % 360;
    const current = ((wheelRotation % 360) + 360) % 360;
    const landingTurn = (target - current + 360) % 360;
    const suspenseTurns = 360 * (4 + Math.floor(Math.random() * 3));
    setWheelSpinning(true);
    setWheelRotation((rotation) => rotation + suspenseTurns + landingTurn);
    KcSfx.play("whoosh");
    timeoutRef.current = setTimeout(() => {
      setWheelIndex(next);
      setWheelSpinning(false);
      KcSfx.play("correct");
      speak(wheelSeasons[next].sentence);
    }, 3800);
  };
  const rightClothes = CLOTHES_ONLY.filter((word) => word.en === dressMission.correct);

  return (
    <div {...stageProps} className={`kc-stage ${styles.stage}`}>
      <div className={`kc-stage-body kc-game kc-weather-game ${styles.body} ${styles[`theme${weatherTheme(learnWord?.en || "sunny")}`]}`} onMouseOver={hoverSfxDelegate}>
        <GameBackdrop
          sun={{ top: 22, right: "7%", size: 126, from: "#FFE59A", via: "#FFD166" }}
          blobs={[{ top: -90, left: -100, size: 330, color: "#C6C9FB" }, { top: 230, right: -120, size: 380, color: "#B6F3E4" }, { bottom: -130, left: "28%", size: 340, color: "#FFE0C2" }]}
          clouds={[{ top: 84, dur: 48, opacity: 0.75 }]}
        />

        <div className={styles.appContent} aria-hidden={settingsOpen || undefined} inert={settingsOpen || undefined}>
        <header className={styles.header}>
          <div className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/khuncool-logo.webp" alt="KhunCool" />
            <div><strong className="kc-title">Weather & Seasons Adventure</strong><span>ภารกิจนักพยากรณ์อากาศ</span></div>
          </div>
          <div className={styles.toolbar} aria-label="เมนูและการตั้งค่าเกม">
            <button className={`${styles.iconButton} kc-tap-chrome`} type="button" aria-label="เปิดการตั้งค่า" title="ตั้งค่า" onClick={() => setSettingsOpen(true)}>⚙️</button>
            <button className={`${styles.iconButton} ${!settings.soundEnabled ? styles.soundOff : ""} kc-tap-chrome`} type="button" aria-label={settings.soundEnabled ? "ปิดเสียง" : "เปิดเสียง"} aria-pressed={settings.soundEnabled} title={settings.soundEnabled ? "ปิดเสียง" : "เปิดเสียง"} onClick={toggleSound}>{settings.soundEnabled ? "🔊" : "🔇"}</button>
            <button className={`${styles.iconButton} kc-tap-chrome`} type="button" aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} title={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} onClick={toggleFull}>⛶</button>
            {renderToolbar && <button className={`${styles.iconButton} kc-tap-chrome`} type="button" aria-label="กลับหน้าเลือกโหมด" title="กลับหน้าเลือกโหมด" onClick={exitMode}>↩</button>}
          </div>
        </header>

        {mode === "welcome" && (
          <main className={`${styles.screen} ${styles.welcome}`} data-stage="welcome">
            <section className={styles.welcomeCopy}>
              <p className={styles.eyebrow}>WEATHER STUDIO · ENGLISH CLASSROOM</p>
              <h2>อ่านท้องฟ้า<br /><em>พูดภาษาอังกฤษให้มั่นใจ</em></h2>
              <p>บทเรียนพร้อมสอนเรื่องอากาศ ฤดูกาล และเสื้อผ้า<br />เรียนเป็นขั้น แล้วใช้จริงในบทบาทนักพยากรณ์</p>
              <div className={styles.welcomeActions}>
                <button className={`${styles.primaryButton} kc-tap`} type="button" onClick={() => { setMode("home"); KcSfx.play("whoosh"); }}>เลือกโหมดการสอน <span>→</span></button>
                <span>เหมาะสำหรับฉายหน้าชั้น · เล่นพร้อมกัน</span>
              </div>
            </section>
            <section className={styles.forecastBoard} aria-label="ภาพรวมเส้นทางการเรียน 4 โหมด">
              <div className={styles.forecastTop}><span>LIVE CLASS PLAN</span><strong>4 โหมด · พร้อมสอน</strong></div>
              <div className={styles.heroIcons} aria-hidden="true">
                {[WEATHER_ONLY.find((word) => word.en === "sunny")!, WEATHER_ONLY.find((word) => word.en === "rainy")!, INTERNATIONAL_SEASONS.find((word) => word.en === "autumn / fall")!, INTERNATIONAL_SEASONS.find((word) => word.en === "winter")!].map((word) => <span key={word.id}><WeatherVisual word={word} /></span>)}
              </div>
              <div className={styles.journeyPreview}>
                <span><b>01</b><i>📚</i><strong>เรียนรู้</strong><small>คำศัพท์และประโยค</small></span>
                <span><b>02</b><i>🔤</i><strong>สลับอักษร</strong><small>สร้างคำศัพท์ให้ถูก</small></span>
                <span><b>03</b><i>🧒</i><strong>แต่งตัว</strong><small>ลากชุดตามอากาศ</small></span>
                <span><b>04</b><i>💬</i><strong>ประโยค Quiz</strong><small>เรียนแล้วเลือกตอบ</small></span>
              </div>
            </section>
          </main>
        )}

        {mode === "home" && (
          <main className={`${styles.screen} ${styles.modeHome}`} data-stage="mode-picker">
            <div className={styles.sectionHeading}>
              <h2>เลือกโหมดที่อยากเล่น 🎮</h2>
              <p>เริ่มจากโหมดไหนก่อนก็ได้ · ถ้าสอนทั้งคาบ แนะนำเล่น 1 → 4</p>
            </div>
            <div className={styles.modeGrid}>
              <button type="button" onClick={() => { setLearnTab("words"); setLearnCategory("weather"); setMode("learn"); }}><span aria-hidden="true">📚</span><strong>เรียนรู้</strong><small>คำศัพท์ · ฤดู · เสื้อผ้า · รายงาน</small></button>
              <button type="button" onClick={() => startMode("practice")}><span aria-hidden="true">🔤</span><strong>เกมสลับอักษร</strong><small>เรียงตัวอักษรเพื่อสร้างคำศัพท์</small></button>
              <button type="button" onClick={() => startMode("reporter")}><span aria-hidden="true">🧒</span><strong>Dress the Character</strong><small>ลากเสื้อผ้าใส่ตัวละครตามอากาศ</small></button>
              <button type="button" onClick={() => startMode("quiz")}><span aria-hidden="true">💬</span><strong>Sentence Quiz</strong><small>เรียนแม่แบบประโยคแล้วเลือกคำตอบ</small></button>
            </div>
          </main>
        )}

        {mode === "learn" && learnWord && (
          <main className={`${styles.screen} ${styles.learn}`} data-stage={`learn-${learnTab}`}>
            <div className={styles.stageBanner}>
              <div className={styles.lessonIdentity}><span>ด่านที่ 1 จาก 4</span><strong>เรียนรู้ Weather &amp; Seasons</strong></div>
              <div className={styles.lessonProgress}><b>บทที่ {LESSON_ORDER.indexOf(learnTab) + 1}/4</b><div><i style={{ width: `${((LESSON_ORDER.indexOf(learnTab) + 1) / 4) * 100}%` }} /></div><span>{LESSON_NAMES[learnTab]}</span></div>
              <nav className={styles.lessonNav} aria-label="นำทางบทเรียน">
                <button type="button" onClick={() => moveLesson(-1)} aria-label={learnTab === "words" ? "กลับไปเลือกโหมด" : "ไปบทก่อนหน้า"} title={learnTab === "words" ? "เลือกโหมด" : "บทก่อนหน้า"}><span aria-hidden="true">←</span><span className={styles.lessonNavText}>{learnTab === "words" ? "เลือกโหมด" : "บทก่อนหน้า"}</span></button>
                <button type="button" onClick={() => moveLesson(1)} aria-label={learnTab === "map" ? "ไปเกมสลับอักษร" : "ไปบทถัดไป"} title={learnTab === "map" ? "ไปเกมสลับอักษร" : "บทถัดไป"}><span className={styles.lessonNavText}>{learnTab === "map" ? "เกมสลับอักษร" : "บทถัดไป"}</span><span aria-hidden="true">{learnTab === "map" ? "🔤" : "→"}</span></button>
              </nav>
            </div>

            {learnTab === "words" && (
              <div className={styles.learnWords}>
                <div className={styles.categoryChips}>
                  <span>บทที่ 1 · ฟังและพูดตามคำศัพท์ทีละคำ</span>
                  <button type="button" aria-pressed={!settings.showThai} onClick={() => setSettings((value) => ({ ...value, showThai: !value.showThai }))}>{settings.showThai ? "🙈 ซ่อนคำแปล" : "👀 แสดงคำแปล"}</button>
                </div>
                <button className={`${styles.wordCard} ${styles[`scene${weatherTheme(learnWord.en)}`]}`} type="button" onClick={() => speak(`${learnWord.en}. ${learnWord.sentence}`)} aria-label={`ฟังคำว่า ${learnWord.en}`}>
                  <WeatherVisual word={learnWord} className={styles.weatherEmoji} />
                  <span className={styles.bigWord}>{learnWord.en}</span>
                  {settings.showThai && <span className={styles.thaiWord}>{learnWord.th}</span>}
                  <span className={styles.example}>🔊 {learnWord.sentence}</span>
                  {settings.showThai && <span className={styles.exampleThai}>{learnWord.sentenceTh}</span>}
                </button>
                <div className={styles.wordRail}>
                  {visibleLearnWords.map((word, index) => <button type="button" key={word.id} aria-label={word.en} aria-pressed={learnIndex === index} onClick={() => { setLearnIndex(index); speak(`${word.en}. ${word.sentence}`); }}><WeatherVisual word={word} className={styles.railVisual} /><span>{word.en}</span></button>)}
                </div>
              </div>
            )}

            {learnTab === "wheel" && wheelWord && (
              <div className={styles.wheelLayout}>
                <section className={styles.wheelArea} aria-label="วงล้อสุ่มฤดูกาล">
                  <div className={styles.wheelInstruction}><b>1</b><span><strong>หมุนเพื่อสุ่มฤดู</strong><small>{settings.seasonSystem === "thai" ? "ช่วงเดือนโดยประมาณ · ประเทศไทย" : "ช่วงเดือนโดยประมาณ · ซีกโลกเหนือ"}</small></span></div>
                  <div className={styles.wheelShell}>
                    <div className={`${styles.wheelPointer} ${wheelSpinning ? styles.wheelPointerSpin : ""}`} aria-hidden="true"><i /><span /></div>
                    <div className={`${styles.wheelRotor} ${wheelSpinning ? styles.wheelRotorSpinning : ""}`} style={{ transform: `rotate(${wheelRotation}deg)`, "--wheel-counter-rotation": `${-wheelRotation}deg` } as CSSProperties}>
                      <button className={`${styles.wheel} ${wheelSeasons.length === 3 ? styles.wheelThai : ""}`} type="button" disabled={wheelSpinning} aria-busy={wheelSpinning} aria-label={wheelSpinning ? "วงล้อกำลังหมุน" : "หมุนวงล้อสุ่มฤดูกาล"} onClick={spinSeasonWheel}>
                        <span className={`${styles.seasonFace} ${wheelSeasons.length === 3 ? styles.seasonFaceThai : ""}`} aria-hidden="true" />
                        <span className={styles.monthRing} aria-label="เดือนภาษาอังกฤษรอบวงล้อ">
                          {MONTHS.map((month, index) => {
                            const angle = 210 + index * 30;
                            return <span className={styles.monthSlot} key={month} title={month} style={{ "--month-angle": `${angle}deg`, "--month-upright-angle": `${-angle}deg` } as CSSProperties}><b>{month.slice(0, 3)}</b></span>;
                          })}
                        </span>
                        <span className={styles.seasonMarkers} aria-hidden="true">
                          {wheelDisplaySeasons.map((season) => {
                            const angle = SEASON_WHEEL_ANGLES[season.id] ?? 0;
                            return <span className={styles.wheelMarker} key={season.id} aria-current={!wheelSpinning && season.id === wheelWord.id ? "true" : undefined} style={{ "--season-angle": `${angle}deg`, "--season-upright-angle": `${-angle}deg` } as CSSProperties}><span><WeatherVisual word={season} className={styles.wheelMarkerVisual} /><strong>{season.en}</strong><small>{SEASON_MONTHS[season.id]}</small></span></span>;
                          })}
                        </span>
                        <span className={styles.wheelHub}><i aria-hidden="true">↻</i><b>{wheelSpinning ? "รอลุ้น..." : "หมุน"}</b><small>{wheelSpinning ? "กำลังเลือกฤดู" : "แตะเพื่อเริ่ม"}</small></span>
                      </button>
                    </div>
                  </div>
                </section>
                <div className={styles.lessonPanel}>
                  <div className={styles.resultHeading}><b>2</b><span><small>ฤดูที่สุ่มได้ · {SEASON_MONTHS[wheelWord.id]}</small><strong><WeatherVisual word={wheelWord} className={styles.resultSeasonVisual} />{wheelWord.en}</strong>{settings.showThai && <em>{wheelWord.th}</em>}</span></div>
                  <div className={styles.seasonWeather}><small>อากาศที่พบบ่อยในฤดูนี้</small><div>{wheelWeatherWords.map((word) => <span key={word.id}><WeatherVisual word={word} className={styles.seasonWeatherVisual} /><b>{word.en}</b></span>)}</div></div>
                  <p className={styles.speakingPrompt}>3 · พูดประโยคนี้ตาม</p>
                  <p className={styles.spokenLine}>{wheelWord.sentence}</p>
                  {settings.showThai && <p>{wheelWord.sentenceTh}</p>}
                  <button type="button" onClick={() => speak(`What season is it? ${wheelWord.sentence}`)}>🔊 ฟังและพูดตาม</button>
                </div>
              </div>
            )}

            {learnTab === "clothes" && (
              <div className={styles.dressLayout}>
                <div className={styles.weatherPicker}>{["sunny","rainy","windy","snowy","cold"].map((weather) => { const word = WEATHER_ONLY.find((item) => item.en === weather)!; return <button type="button" key={weather} aria-pressed={dressWeather === weather} onClick={() => { setDressWeather(weather); setDressChoice(null); speak(`It's ${weather}. What should I wear?`); }}><WeatherVisual word={word} className={styles.pickerVisual} /><span>{weather}</span></button>; })}</div>
                <div className={styles.dressStage}><div><WeatherVisual word={dressWord} className={styles.dressWeatherVisual} /><strong>It&apos;s {dressWeather}.</strong><small>What should I wear?</small></div><div className={styles.childAvatar}>🧒<span>{dressChoiceWord ? <WeatherVisual word={dressChoiceWord} className={styles.childChoiceVisual} /> : "❓"}</span></div></div>
                <div className={styles.clothesGrid}>{dressOptions.map((word) => { const correct = rightClothes.some((item) => item.id === word.id); return <button type="button" key={word.id} onClick={() => { setDressChoice(word.en); KcSfx.play(correct ? "correct" : "wrong"); speak(correct ? word.sentence : `Try again. Choose the item made for ${dressWeather} weather.`); }} className={dressChoice === word.en ? (correct ? styles.choiceRight : styles.choiceTry) : ""}><WeatherVisual word={word} className={styles.clothingEmoji} /><span>{word.en}</span>{dressChoice === word.en && <small>{correct ? "✅ เหมาะที่สุด!" : "💡 เลือกของที่ใช้กับอากาศนี้โดยตรง"}</small>}</button>; })}</div>
              </div>
            )}

            {learnTab === "map" && (
              <div className={styles.mapLayout}>
                <div className={styles.mapSteps} aria-label="วิธีทำกิจกรรม 3 ขั้นตอน"><span><b>1</b>เลือกเมือง</span><span><b>2</b>ดูสภาพอากาศ</span><span><b>3</b>พูดประโยค</span></div>
                <section className={styles.mapBoard}>
                  <header><p className={styles.eyebrow}>STEP 1 · CHOOSE A CITY</p><h2>แตะเมืองบนแผนที่</h2><small>เลือกเมืองใดก็ได้ แล้วดูรายงานด้านขวา</small></header>
                  <div className={styles.thailandMap} aria-label="เลือกเมืองบนแผนที่อากาศประเทศไทย"><div className={styles.mapShape}><strong>THAILAND</strong><small>ประเทศไทย</small></div>{CITY_REPORTS.map((report, index) => { const word = WEATHER_ONLY.find((item) => item.en === report.weather)!; const active = report.id === selectedCityId; return <button type="button" key={report.city} aria-pressed={active} className={`${styles.cityMarker} ${styles[report.id]} ${active ? styles.cityMarkerActive : ""}`} onClick={() => { setSelectedCityId(report.id); KcSfx.play("pop"); speak(`It's ${report.weather} in ${report.city}.`); }}><b>{index + 1}</b><WeatherVisual word={word} className={styles.cityMarkerVisual} /><strong>{report.city}</strong><small>{report.th}</small></button>; })}</div>
                </section>
                <section className={`${styles.lessonPanel} ${styles.mapReportPanel}`} aria-live="polite">
                  <p className={styles.eyebrow}>STEP 2 · READ THE WEATHER</p>
                  <div className={styles.selectedForecast}><WeatherVisual word={selectedCityWeather} className={styles.selectedForecastVisual} /><span><small>{selectedCityReport.th}</small><strong>{selectedCityReport.city}</strong><b>{selectedCityWeather.en}</b></span></div>
                  <p className={styles.reportQuestion}>How&apos;s the weather in {selectedCityReport.city}?</p>
                  <div className={styles.reportSentence}><small>STEP 3 · SAY THE SENTENCE</small><strong>It&apos;s <u>{selectedCityWeather.en}</u> in <u>{selectedCityReport.city}</u>.</strong>{settings.showThai && <span>อากาศ{selectedCityWeather.th}ที่{selectedCityReport.th}</span>}</div>
                  <button type="button" onClick={() => speak(`How's the weather in ${selectedCityReport.city}? It's ${selectedCityWeather.en} in ${selectedCityReport.city}.`)}>🔊 ฟังแล้วพูดตาม</button>
                  <p className={styles.mapTeacherTip}>ครูถาม “How&apos;s the weather?” แล้วให้นักเรียนตอบตามประโยคด้านบน</p>
                </section>
              </div>
            )}
          </main>
        )}

        {mode === "practice" && scrambleWord && (
          <main className={`${styles.screen} ${styles.scrambleScreen}`} data-stage="word-scramble">
            <div className={styles.gameModeHeader}><span>🔤 เกมสลับอักษร</span><div><i style={{ width: `${((scrambleRound + 1) / questions.length) * 100}%` }} /></div><strong>{scrambleRound + 1}/{questions.length}</strong></div>
            <section className={styles.scrambleBoard}>
              <div className={styles.scrambleClue}>
                <p className={styles.eyebrow}>GUESS THE WORD</p>
                <WeatherVisual word={scrambleWord} className={styles.scrambleVisual} />
                {settings.showThai && <strong>{scrambleWord.th}</strong>}
                <button type="button" onClick={() => speak(scrambleWord.en)}>🔊 ฟังเสียงคำศัพท์</button>
              </div>
              <div className={styles.scramblePlay}>
                <span className={styles.miniInstruction}>แตะตัวอักษรตามลำดับให้เป็นคำ</span>
                <div className={styles.letterSlots}>{Array.from({ length: scrambleWord.en.length }, (_, index) => <button type="button" key={index} disabled={index >= scrambleBuilt.length} onClick={() => setScrambleBuilt((value) => value.slice(0, index))}>{index < scrambleBuilt.length ? scrambleWord.en[scrambleBuilt[index]].toUpperCase() : ""}</button>)}</div>
                <div className={styles.letterBank}>{scrambleTiles.map((tileIndex) => <button type="button" key={tileIndex} disabled={scrambleBuilt.includes(tileIndex) || scrambleStatus === "correct"} onClick={() => pickScrambleTile(tileIndex)}>{scrambleWord.en[tileIndex].toUpperCase()}</button>)}</div>
                <div className={`${styles.scrambleMessage} ${scrambleStatus ? styles[`scramble${scrambleStatus}`] : ""}`}>{scrambleStatus === "correct" ? <>🎉 <strong>{scrambleWord.en}</strong> ถูกต้อง!</> : scrambleStatus === "wrong" ? <>😵 ตัวอักษรสลับกันอยู่ ลองใหม่!</> : <>💡 เริ่มจากเสียงแรกของคำ</>}</div>
                <div className={styles.scrambleActions}><button type="button" disabled={!scrambleBuilt.length || scrambleStatus === "correct"} onClick={() => setScrambleBuilt([])}>↺ เริ่มเรียงใหม่</button>{scrambleStatus === "correct" && <button type="button" className={styles.nextStage} onClick={nextScramble}>{scrambleRound + 1 >= questions.length ? "ดูคะแนน 🏆" : "คำถัดไป →"}</button>}</div>
              </div>
            </section>
          </main>
        )}

        {mode === "reporter" && (
          <main className={`${styles.screen} ${styles.dressGameScreen}`} data-stage="dress-character">
            <div className={styles.gameModeHeader}><span>🧒 Dress the Character</span><div><i style={{ width: `${((dressRound + 1) / questions.length) * 100}%` }} /></div><strong>{dressRound + 1}/{questions.length} · ⭐ {dressScore}</strong></div>
            <div className={styles.dressGameLayout}>
              <section className={styles.weatherMission}><span>ภารกิจวันนี้</span><WeatherVisual word={dressWord} className={styles.missionWeatherVisual} /><strong>It&apos;s {dressWeather}!</strong><small>What should I wear?</small><button type="button" onClick={() => speak(`It's ${dressWeather}. What should I wear?`)}>🔊 ฟังโจทย์</button></section>
              <section role="region" aria-label="ตัวละครสำหรับวางเสื้อผ้า" className={`${styles.characterDropZone} ${dressReaction === "right" ? styles.characterHappy : dressReaction === "wrong" ? styles.characterSilly : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const id = event.dataTransfer.getData("text/plain"); const word = CLOTHES_ONLY.find((item) => item.id === id); if (word) tryDressItem(word); }}>
                <div className={styles.reactionBubble}>{dressReaction === "right" ? "เยี่ยม! ชิ้นนี้เหมาะกับอากาศนี้ที่สุด 😄" : dressReaction === "wrong" ? `${dressChoice} ไม่ใช่ของที่ใช้กับอากาศ ${dressWeather} โดยตรง ลองใหม่!` : "เลือกของที่เหมาะกับอากาศนี้ที่สุด"}</div>
                <div className={styles.characterCanvas}>
                  <Image key={dressedCharacterSrc} className={styles.characterImage} src={dressedCharacterSrc} width={1024} height={1536} sizes="310px" alt={dressChoiceWord ? `ตัวละครสวม ${dressChoiceWord.en}` : "ตัวละครสำหรับเกมแต่งตัว"} priority />
                  {dressChoiceWord?.en === "hat" && <WeatherVisual word={dressChoiceWord} className={styles.hatOnCharacter} />}
                </div>
                <span className={styles.dropHint}>วางเสื้อผ้าตรงนี้</span>
              </section>
              <aside className={styles.clothingRack}><div><strong>เลือก 1 ชิ้น</strong><small>ชิ้นไหนใช้กับอากาศนี้โดยตรง?</small></div><section>{dressOptions.map((word) => <button type="button" draggable key={word.id} onDragStart={(event) => event.dataTransfer.setData("text/plain", word.id)} onClick={() => tryDressItem(word)} className={dressChoice === word.en ? styles.rackSelected : ""}><WeatherVisual word={word} className={styles.rackItemVisual} /><span>{word.en}</span></button>)}</section>{dressReaction === "right" && <button type="button" className={styles.nextStage} onClick={nextDress}>{dressRound + 1 >= questions.length ? "สรุปผล 🏆" : "อากาศถัดไป →"}</button>}</aside>
            </div>
          </main>
        )}

        {mode === "quiz" && currentQuestion && quizLesson && (
          <main className={`${styles.screen} ${styles.questionScreen}`} data-stage={`${mode}-question`}>
            <div className={styles.progressRow}><span>💬 Sentence Quiz · เลือกคำตอบที่เหมาะที่สุด</span><div><i style={{ width: `${progress}%` }} /></div><strong>{questionIndex + 1}/{questions.length}</strong></div>
            <section className={styles.questionCard} aria-live="polite">
              <div className={styles.quizLesson}>
                <div className={styles.quizLessonIcon} aria-hidden="true">{quizLesson.icon}</div>
                <div><span>เรียนก่อนตอบ</span><strong>{quizLesson.title}</strong><p>{quizLesson.pattern}</p><small>{quizLesson.meaning}</small></div>
                <button type="button" aria-label={`ฟังประโยคตัวอย่าง: ${quizLesson.example}`} title={`ตัวอย่าง: ${quizLesson.example}`} onClick={() => speak(quizLesson.example)}>🔊 <span>ฟังตัวอย่าง</span></button>
              </div>
              <div className={styles.quizTask}>
                <div className={styles.questionKicker}><b>คำถาม</b><span>{questionLabel(currentQuestion.type)}</span></div>
                <p className={styles.quizInstruction}>{quizLesson.instruction}</p>
                {promptVisualWord && <WeatherVisual word={promptVisualWord} className={styles.promptVisual} />}
                <h2>{currentQuestion.prompt}</h2>
                {settings.showThai && currentQuestion.promptTh && <p className={styles.promptThai}>{currentQuestion.promptTh}</p>}
                <button className={styles.replayQuestion} type="button" aria-label={`ฟังคำถาม: ${currentQuestion.prompt}`} onClick={replayCurrent}>🔊 ฟังคำถามอีกครั้ง</button>
              </div>
              {currentQuestion.type === "build-sentence" ? (
                <div className={styles.sentenceBuilder}>
                  <div className={styles.sentenceSlots}>{built.length ? built.map((tokenIndex, index) => <button type="button" key={`${tokenIndex}-${index}`} onClick={() => setBuilt((value) => value.filter((_, i) => i !== index))}>{currentQuestion.tokens?.[tokenIndex]}</button>) : <span>แตะคำด้านล่างเพื่อเรียงประโยค</span>}</div>
                  <div className={styles.tokenBank}>{currentQuestion.tokens?.map((token, index) => <button type="button" key={index} disabled={built.includes(index) || locked} onClick={() => setBuilt((value) => [...value, index])}><kbd>{index + 1}</kbd>{token}</button>)}</div>
                  <div className={styles.builderActions}><button type="button" disabled={!built.length || locked} onClick={() => setBuilt((value) => value.slice(0, -1))}>↩ ลบคำล่าสุด</button><button type="button" disabled={built.length !== currentQuestion.answer?.length || locked} onClick={submitSentence}>ตรวจคำตอบ ✅</button></div>
                </div>
              ) : (
                <div className={styles.optionsGrid}>{currentQuestion.options.map((option, index) => { const isCorrect = index === currentQuestion.correct; const selected = picked === index; const showCorrect = feedback === "correct" || (feedback === "wrong" && settings.hintsEnabled); const stateClass = showCorrect && isCorrect ? styles.answerRight : feedback === "wrong" && selected ? styles.answerWrong : ""; const visualWord = optionWeatherWord(option); const rawEmoji = /\p{Extended_Pictographic}/u.test(option); return <button type="button" key={option} disabled={locked} className={stateClass} aria-label={`ตัวเลือก ${index + 1}: ${visualWord?.en || option}`} onClick={() => chooseAnswer(index)}><kbd>{index + 1}</kbd>{visualWord ? <WeatherVisual word={visualWord} className={styles.optionVisual} /> : rawEmoji && <span className={styles.optionVisual} aria-hidden="true">{option}</span>}{!rawEmoji && <strong>{option}</strong>}{showCorrect && isCorrect && <small>✅ ถูกต้อง</small>}{feedback === "wrong" && selected && <small>💪 ลองอีกครั้ง</small>}</button>; })}</div>
              )}
              {feedback && <div className={`${styles.feedback} ${feedback === "correct" ? styles.feedbackRight : styles.feedbackWrong}`}><span>{feedback === "correct" ? "🎉" : "💡"}</span><div><strong>{feedback === "correct" ? "ถูกต้อง เก่งมาก!" : "เกือบแล้ว ลองอีกครั้งนะ"}</strong>{(feedback === "correct" || settings.hintsEnabled) && <p>{currentQuestion.explain}</p>}</div></div>}
            </section>
          </main>
        )}

        {mode === "summary" && (
          <Summary kind={summaryKind} questions={questions} practiceScore={practiceCorrect} quizResults={quizResults} onHome={() => setMode("home")} onReplay={() => summaryKind === "reporter" ? startMode("reporter") : startMode(summaryKind)} onNext={summaryKind === "practice" ? () => startMode("reporter") : summaryKind === "reporter" ? () => startMode("quiz") : undefined} onWrong={(ids) => startMode("practice", ids)} />
        )}
        </div>

        {settingsOpen && <SettingsPanel settings={settings} onChange={updateSettings} onReset={() => updateSettings(DEFAULT_SETTINGS)} onClose={() => setSettingsOpen(false)} isFull={isFull} onToggleFull={toggleFull} />}
      </div>
    </div>
  );
}

function SettingsPanel({ settings, onChange, onReset, onClose, isFull, onToggleFull }: { settings: TeacherSettings; onChange: (value: TeacherSettings) => void; onReset: () => void; onClose: () => void; isFull: boolean; onToggleFull: () => void }) {
  const set = <K extends keyof TeacherSettings>(key: K, value: TeacherSettings[K]) => onChange({ ...settings, [key]: value });
  return <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={styles.settingsPanel} role="dialog" aria-modal="true" aria-labelledby="weather-settings-title" data-stage="settings">
      <div className={styles.settingsTitle}>
        <div><p className={styles.eyebrow}>CLASSROOM SETUP</p><h2 id="weather-settings-title">เตรียมห้องเรียน</h2><span>เลือกเฉพาะค่าที่มีผลกับบทเรียนและ Sentence Quiz</span></div>
        <div className={styles.settingsTitleActions}><button className="kc-tap-chrome" type="button" aria-label={isFull ? "ออกจากเต็มจอ" : "เต็มจอ"} onClick={onToggleFull}>⛶</button><button className="kc-tap-chrome" type="button" onClick={onClose} aria-label="ปิดการตั้งค่า">✕</button></div>
      </div>
      <div className={styles.settingsBody}>
        <SettingChoice label="ระดับเนื้อหา" hint="บทเรียนคำศัพท์ เกมสลับอักษร และ Quiz" value={settings.difficulty} options={[["easy","🌱 พื้นฐาน"],["normal","⭐ ครบทั้งหมด"]]} onPick={(value) => set("difficulty", value as Difficulty)} />
        <SettingChoice label="เนื้อหา Sentence Quiz" hint="กำหนดชุดคำถามในโหมดสุดท้าย" value={settings.scope} options={[["weather","☀️ อากาศ + เสื้อผ้า"],["seasons","🍂 ฤดูกาล"],["mixed","🌈 ทั้งหมด"]]} onPick={(value) => set("scope", value as Scope)} />
        <SettingChoice label="ระบบฤดูกาล" hint="ใช้กับบทเรียนวงล้อและคำถามฤดูกาล" value={settings.seasonSystem} options={[["international","🌍 สากล 4 ฤดู"],["thai","🇹🇭 ไทย 3 ฤดู"]]} onPick={(value) => set("seasonSystem", value as SeasonSystem)} />
        <SettingChoice label="จำนวนข้อ Sentence Quiz" hint="ครบทุกข้อจะปรับตามเนื้อหาที่เลือก" value={String(settings.questionCount)} options={[["5","5 ข้อ"],["10","10 ข้อ"],["all","ครบทุกข้อ"]]} onPick={(value) => set("questionCount", value === "all" ? "all" : Number(value) as 5 | 10)} />
        <div className={styles.switchGrid}><Toggle label="🔊 เสียง" checked={settings.soundEnabled} onChange={(value) => set("soundEnabled", value)} /><Toggle label="🇹🇭 คำแปลไทย" checked={settings.showThai} onChange={(value) => set("showThai", value)} /><Toggle label="💡 แสดงเฉลยเมื่อผิด" checked={settings.hintsEnabled} onChange={(value) => set("hintsEnabled", value)} /></div>
      </div>
      <div className={styles.settingsFooter}><div><span>ค่าจะถูกจำไว้ในเครื่องนี้</span><button className={styles.resetSettings} type="button" onClick={onReset}>↺ คืนค่าเริ่มต้น</button></div><button className={`${styles.saveSettings} kc-tap`} type="button" onClick={onClose}>พร้อมสอน ✓</button></div>
    </section>
  </div>;
}

function SettingChoice({ label, hint, value, options, onPick }: { label: string; hint: string; value: string; options: string[][]; onPick: (value: string) => void }) {
  return <div className={styles.settingRow}><div className={styles.settingLabel}><strong>{label}</strong><small>{hint}</small></div><div>{options.map(([key, text]) => <button type="button" key={key} aria-pressed={value === key} onClick={() => onPick(key)}>{text}</button>)}</div></div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" className={styles.toggle} aria-pressed={checked} onClick={() => onChange(!checked)}><span>{label}</span><i>{checked ? "เปิด" : "ปิด"}</i></button>;
}

function Summary({ kind, questions, practiceScore, quizResults, onHome, onReplay, onNext, onWrong }: { kind: "practice" | "reporter" | "quiz"; questions: Question[]; practiceScore: number; quizResults: QuizResult[]; onHome: () => void; onReplay: () => void; onNext?: () => void; onWrong: (ids: string[]) => void }) {
  const wrong = quizResults.filter((result) => !result.correct);
  const score = kind === "quiz" ? quizResults.filter((result) => result.correct).length : practiceScore;
  const skills = ["vocabulary", "listening", "sentence", "season", "clothes"] as const;
  const weak = skills.map((skill) => { const rows = quizResults.filter((result) => result.question.skill === skill); return { skill, total: rows.length, correct: rows.filter((row) => row.correct).length }; }).filter((row) => row.total && row.correct / row.total < 0.7);
  if (kind === "reporter") { return <main className={`${styles.screen} ${styles.summary}`} data-stage="dress-summary"><div className={styles.trophy}>🧒✨</div><p className={styles.eyebrow}>DRESS THE CHARACTER COMPLETE</p><h2>แต่งตัวตามอากาศสำเร็จ!</h2><p>เลือกชุดเหมาะสมได้ {practiceScore} จาก {questions.length} สภาพอากาศ</p><div className={styles.scoreCircle}><strong>{questions.length ? Math.round(practiceScore / questions.length * 100) : 0}%</strong><span>แต่งตัวถูก</span></div><SummaryActions onHome={onHome} onReplay={onReplay} onNext={onNext} nextLabel="ไป Sentence Quiz 💬" /></main>; }
  return <main className={`${styles.screen} ${styles.summary}`} data-stage={`${kind}-summary`}><div className={styles.trophy}>{kind === "quiz" && score === questions.length ? "🏆" : score >= questions.length * .7 ? "🎉" : "🌱"}</div><p className={styles.eyebrow}>{kind === "practice" ? "WORD SCRAMBLE COMPLETE" : "WEATHER ADVENTURE COMPLETE"}</p><h2>{score >= questions.length * .7 ? "เก่งมาก ภารกิจสำเร็จ!" : "ทำได้ดี มาฝึกเพิ่มอีกนิดนะ"}</h2><p>ตอบได้ {score} จาก {questions.length} ข้อ</p><div className={styles.scoreCircle}><strong>{questions.length ? Math.round(score / questions.length * 100) : 0}%</strong><span>คะแนนรวม</span></div>{kind === "quiz" && <><div className={styles.skillResults}>{skills.map((skill) => { const rows = quizResults.filter((result) => result.question.skill === skill); const correct = rows.filter((row) => row.correct).length; return rows.length ? <div key={skill}><span>{skill}</span><div><i style={{ width: `${correct / rows.length * 100}%` }} /></div><strong>{correct}/{rows.length}</strong></div> : null; })}</div><p className={styles.reviewText}>{weak.length ? `ควรทบทวน: ${weak.map((row) => row.skill).join(", ")}` : "ยอดเยี่ยม! ทุกทักษะผ่านเป้าหมายแล้ว"}</p></>}{kind === "quiz" && wrong.length > 0 && <button className={styles.wrongPractice} type="button" onClick={() => onWrong(wrong.map((result) => result.question.id))}>🔤 ทบทวนคำศัพท์ด้วยเกมสลับอักษร</button>}<SummaryActions onHome={onHome} onReplay={onReplay} onNext={onNext} nextLabel="ไป Dress the Character 🧒" /></main>;
}

function SummaryActions({ onHome, onReplay, onNext, nextLabel }: { onHome: () => void; onReplay: () => void; onNext?: () => void; nextLabel?: string }) {
  return <div className={styles.summaryActions}>{onNext && <button type="button" className={styles.nextStage} onClick={onNext}>{nextLabel}</button>}<button type="button" onClick={onReplay}>🔁 เล่นอีกครั้ง</button><button type="button" onClick={onHome}>☰ เลือกด่าน</button></div>;
}
