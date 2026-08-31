import assert from "node:assert/strict";
import test from "node:test";
import { slicePath, stripBounds, unequalWeights } from "./fractionGeometry.ts";

test("slicePath ของแต่ละชิ้นต่อกันสนิท", () => {
  for (const parts of [2, 3, 4, 5, 6]) {
    for (let i = 0; i < parts - 1; i++) {
      const end = slicePath(i, parts).match(/A50 50 0 \d 1 ([\d.-]+) ([\d.-]+)/);
      const start = slicePath(i + 1, parts).match(/L([\d.-]+) ([\d.-]+)/);
      assert.equal(end[1], start[1], `parts=${parts} ชิ้น ${i} จบไม่ตรงที่ชิ้น ${i + 1} เริ่ม`);
      assert.equal(end[2], start[2], `parts=${parts} ชิ้น ${i} จบไม่ตรงที่ชิ้น ${i + 1} เริ่ม`);
    }
  }
});

test("slicePath ชิ้นแรกเริ่มที่ 12 นาฬิกา", () => {
  const start = slicePath(0, 4).match(/L([\d.-]+) ([\d.-]+)/);
  assert.equal(Number(start[1]), 50);
  assert.equal(Number(start[2]), 0);
});

test("parts=1 ได้วงกลมเต็มใบ ไม่ใช่ชิ้นที่ลากเข้าจุดศูนย์กลาง", () => {
  const path = slicePath(0, 1);
  assert.ok(!path.includes("M50 50 L"), "วงกลมเต็มใบต้องไม่มีเส้นลากเข้าศูนย์กลาง");
  assert.ok(path.includes("A"), "ต้องเป็นส่วนโค้ง");
});

test("slicePath ของทุกชิ้นในรูปเดียวกันไม่ซ้ำกัน", () => {
  for (const parts of [2, 3, 4, 5, 6]) {
    const paths = Array.from({ length: parts }, (_, i) => slicePath(i, parts));
    assert.equal(new Set(paths).size, parts);
  }
});

test("stripBounds แบ่งเท่ากันและเต็ม 100 พอดี", () => {
  for (const parts of [2, 3, 4, 5, 6]) {
    const bounds = Array.from({ length: parts }, (_, i) => stripBounds(i, parts));
    assert.equal(bounds.length, parts);
    assert.equal(bounds[0].x, 0);
    const last = bounds[parts - 1];
    assert.equal(Math.round((last.x + last.width) * 1000) / 1000, 100);
    const widths = new Set(bounds.map((b) => b.width));
    assert.equal(widths.size, 1, "แบ่งเท่ากันต้องกว้างเท่ากันทุกช่อง");
  }
});

test("stripBounds แบบไม่เท่ากันยังเต็ม 100 แต่กว้างไม่เท่ากัน", () => {
  for (const parts of [2, 3, 4]) {
    const bounds = Array.from({ length: parts }, (_, i) => stripBounds(i, parts, true));
    const last = bounds[parts - 1];
    assert.equal(Math.round((last.x + last.width) * 1000) / 1000, 100);
    assert.equal(new Set(bounds.map((b) => b.width)).size, parts, "ต้องกว้างไม่ซ้ำกันเลย");
  }
});

test("unequalWeights รวมได้ 1 และไม่มีค่าซ้ำ", () => {
  for (const parts of [2, 3, 4]) {
    const weights = unequalWeights(parts);
    assert.equal(weights.length, parts);
    assert.equal(Math.round(weights.reduce((sum, w) => sum + w, 0) * 1000) / 1000, 1);
    assert.equal(new Set(weights).size, parts);
    assert.ok(weights.every((w) => w > 0));
  }
});

test("unequalWeights ของจำนวนส่วนที่ไม่ได้กำหนดไว้ ถอยไปเป็นแบ่งเท่ากัน", () => {
  const weights = unequalWeights(5);
  assert.equal(weights.length, 5);
  assert.equal(new Set(weights).size, 1);
});
