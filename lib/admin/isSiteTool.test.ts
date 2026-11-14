import { describe, expect, it } from "vitest";
import { isSiteTool } from "./isSiteTool";

describe("isSiteTool", () => {
  it("keeps real tools", () => {
    expect(isSiteTool("duck-race")).toBe(true);
    expect(isSiteTool("group-maker")).toBe(true);
  });
  it("drops the เลี้ยงกาแฟ strip and sheet events, which are not tools", () => {
    expect(isSiteTool("support-strip")).toBe(false);
    expect(isSiteTool("support-sheet")).toBe(false);
  });
});
