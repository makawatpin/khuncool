import { describe, expect, it } from "vitest";
import { ROLL_MAX, ROLL_MIN, buildRollNumbers, clampRoll } from "./rollNumbers";

describe("clampRoll", () => {
  it("keeps a เลขที่ that is already valid", () => {
    expect(clampRoll(23)).toBe(23);
  });

  it("falls back to the first เลขที่ when the field is empty", () => {
    // An empty <input type="number"> parses to NaN while being edited.
    expect(clampRoll(Number.NaN)).toBe(ROLL_MIN);
  });

  it("drops the fraction from a pasted decimal", () => {
    expect(clampRoll(12.9)).toBe(12);
  });

  it("pulls zero and negatives up to the first เลขที่", () => {
    expect(clampRoll(0)).toBe(ROLL_MIN);
    expect(clampRoll(-5)).toBe(ROLL_MIN);
  });

  it("caps a typo at the largest class it will draw", () => {
    expect(clampRoll(9999)).toBe(ROLL_MAX);
  });
});

describe("buildRollNumbers", () => {
  it("includes both ends, so 1 ถึง 40 is forty students", () => {
    const roster = buildRollNumbers(1, 40);
    expect(roster).toHaveLength(40);
    expect(roster[0]).toBe("1");
    expect(roster[39]).toBe("40");
  });

  it("builds the range a teacher actually types", () => {
    expect(buildRollNumbers(1, 5)).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("races a single เลขที่ when both ends match", () => {
    expect(buildRollNumbers(7, 7)).toEqual(["7"]);
  });

  it("sorts the bounds, so filling the second field first still works", () => {
    expect(buildRollNumbers(40, 1)).toEqual(buildRollNumbers(1, 40));
  });

  it("covers a second section that does not start at 1", () => {
    expect(buildRollNumbers(21, 24)).toEqual(["21", "22", "23", "24"]);
  });

  it("writes plain numbers with no padding", () => {
    expect(buildRollNumbers(8, 11)).toEqual(["8", "9", "10", "11"]);
  });

  it("clamps a range that runs past either limit", () => {
    expect(buildRollNumbers(0, 3)).toEqual(["1", "2", "3"]);
    expect(buildRollNumbers(ROLL_MAX - 1, 5000)).toEqual([
      String(ROLL_MAX - 1),
      String(ROLL_MAX),
    ]);
  });

  it("never returns an empty roster", () => {
    expect(buildRollNumbers(Number.NaN, Number.NaN)).toEqual(["1"]);
  });
});
