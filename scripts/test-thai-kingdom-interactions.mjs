#!/usr/bin/env node

import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const route = `${baseUrl}/media/thai/thai-kingdom`;
const browser = await chromium.launch({ headless: true });

try {
  const keyboardContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const keyboardPage = await keyboardContext.newPage();
  await keyboardPage.goto(route, { waitUntil: "networkidle" });
  await keyboardPage.getByRole("button", { name: /เรียนรู้/ }).click();
  await keyboardPage.getByRole("button", { name: "🖼️ ซ่อนภาพ" }).waitFor();
  await keyboardPage.getByRole("tab", { name: /ตำแหน่งสระ/ }).click();
  await keyboardPage.getByRole("button", { name: /ซ่อนภาพ/ }).waitFor({ state: "detached" });
  await keyboardPage.getByRole("button", { name: /ซ่อนคำ/ }).waitFor({ state: "detached" });
  await keyboardPage.getByRole("tab", { name: /โรงงานสร้างคำ/ }).click();
  await keyboardPage.getByRole("button", { name: /ซ่อนภาพ/ }).waitFor({ state: "detached" });
  const nextStep = keyboardPage.getByRole("button", { name: "แสดงขั้นถัดไป" });
  await nextStep.focus();
  await keyboardPage.keyboard.press("Enter");
  await keyboardPage.getByText("ขั้น 2 จาก 3", { exact: true }).waitFor();
  await keyboardPage.getByRole("button", { name: "กลับเมนูเกม" }).click();
  await keyboardPage.getByRole("button", { name: /ฝึกทำ/ }).click();
  await keyboardPage.getByRole("button", { name: /เริ่มภารกิจ/ }).click();
  const firstAnswer = keyboardPage.locator('[aria-label="ตัวเลือกคำตอบ"] button').first();
  await firstAnswer.focus();
  await keyboardPage.keyboard.press("Enter");
  await keyboardPage.locator('[class*="__correctMessage"], [class*="__retryMessage"]').waitFor();
  await keyboardContext.close();

  const touchContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
  });
  const touchPage = await touchContext.newPage();
  await touchPage.goto(route, { waitUntil: "networkidle" });
  await touchPage.getByRole("button", { name: /รถไฟเก็บคำ/ }).tap();
  await touchPage.locator('[data-stage="settings"]').waitFor();
  await touchPage.getByRole("button", { name: "แบ่งทีม" }).tap();
  await touchPage.getByRole("button", { name: "3 ทีม" }).tap();
  await touchPage.getByRole("button", { name: /เริ่มภารกิจ/ }).tap();
  await touchPage.locator('[data-stage="train"]').waitFor();
  await touchContext.close();

  console.log("Thai Kingdom manual lesson steps, keyboard Enter and mobile touch flows passed.");
} finally {
  await browser.close();
}
