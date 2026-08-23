#!/usr/bin/env node

import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const route = `${baseUrl}/media/mathematics/math-adventure`;
const browser = await chromium.launch({ headless: true });

try {
  const keyboardContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const keyboardPage = await keyboardContext.newPage();
  await keyboardPage.goto(route, { waitUntil: "networkidle" });
  await keyboardPage.getByRole("button", { name: /เรียนรู้/ }).click();

  const nextStep = keyboardPage.getByRole("button", { name: "แสดงขั้นถัดไป" });
  await nextStep.focus();
  await keyboardPage.keyboard.press("Enter");
  await keyboardPage.getByText("ขั้น 2 จาก 3", { exact: true }).waitFor();
  await keyboardPage.keyboard.press("Enter");
  await keyboardPage.getByText("ขั้น 3 จาก 3", { exact: true }).waitFor();

  const previousStep = keyboardPage.getByRole("button", { name: "ย้อนกลับไปขั้นก่อนหน้า" });
  await previousStep.focus();
  await keyboardPage.keyboard.press("Enter");
  await keyboardPage.getByText("ขั้น 2 จาก 3", { exact: true }).waitFor();

  await keyboardPage.getByRole("tab", { name: /เส้นจำนวน 0–20/ }).click();
  await keyboardPage.getByText("ตัวอย่าง 1/10", { exact: true }).waitFor();
  const nextExample = keyboardPage.getByRole("button", { name: "ตัวอย่างถัดไป" });
  for (let index = 1; index < 10; index += 1) await nextExample.click();
  await keyboardPage.getByText("ตัวอย่าง 10/10", { exact: true }).waitFor();
  await keyboardPage.getByText("11 − 9 = 2", { exact: true }).waitFor();
  await keyboardContext.close();

  const touchContext = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  const touchPage = await touchContext.newPage();
  await touchPage.goto(route, { waitUntil: "networkidle" });
  await touchPage.getByRole("button", { name: /เรียนรู้/ }).tap();
  await touchPage.getByRole("button", { name: "แสดงขั้นถัดไป" }).tap();
  await touchPage.getByText("ขั้น 2 จาก 3", { exact: true }).waitFor();
  await touchContext.close();

  console.log("Math Adventure manual lesson steps passed with keyboard and touch.");
} finally {
  await browser.close();
}
