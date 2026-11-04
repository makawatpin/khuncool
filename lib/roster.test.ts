import { describe, expect, it } from "vitest";
import { cleanName, duplicateNames, uniqueNames } from "./roster";

describe("cleanName", () => {
  it("trims and collapses spaces", () => {
    expect(cleanName("  ด.ช.สมชาย   ใจดี ")).toBe("ด.ช.สมชาย ใจดี");
  });
});

describe("uniqueNames", () => {
  it("numbers repeated names so each row is its own student", () => {
    expect(uniqueNames(["ก", "ข", "ก", "ก"])).toEqual({ names: ["ก", "ข", "ก (2)", "ก (3)"], renamed: ["ก (2)", "ก (3)"] });
  });

  it("treats names that differ only in spacing as the same", () => {
    expect(uniqueNames(["ด.ช.สมชาย ใจดี", "ด.ช.สมชาย  ใจดี"]).names).toEqual(["ด.ช.สมชาย ใจดี", "ด.ช.สมชาย ใจดี (2)"]);
  });

  it("skips a number already used by a real name", () => {
    expect(uniqueNames(["ก", "ก (2)", "ก"]).names).toEqual(["ก", "ก (2)", "ก (3)"]);
  });

  it("leaves a list without repeats alone", () => {
    expect(uniqueNames(["ก", "ข"])).toEqual({ names: ["ก", "ข"], renamed: [] });
  });
});

describe("duplicateNames", () => {
  it("lists each repeated name once", () => {
    expect(duplicateNames(["ก", "ข", "ก", "ก"])).toEqual(["ก"]);
    expect(duplicateNames(["ก", "ข"])).toEqual([]);
  });
});
