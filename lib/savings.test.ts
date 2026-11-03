import { describe, expect, it } from "vitest";
import {
  balanceOf,
  balancesFor,
  ensureTxnIds,
  migrateSavings,
  parseHistorySheet,
  parseImportedBalance,
  parseWholeBaht,
  reconcileRoster,
  withBalanceAdjustments,
  type Txn,
} from "./savings";

describe("parseWholeBaht", () => {
  it("reads whole baht, with commas, spaces and ฿/บาท", () => {
    expect(parseWholeBaht("10")).toBe(10);
    expect(parseWholeBaht(" 1,000 ")).toBe(1000);
    expect(parseWholeBaht("฿50")).toBe(50);
    expect(parseWholeBaht("20 บาท")).toBe(20);
  });

  it("refuses anything that is not a whole amount", () => {
    expect(parseWholeBaht("10.50")).toBeNull();
    expect(parseWholeBaht("-20")).toBeNull();
    expect(parseWholeBaht("1o")).toBeNull();
    expect(parseWholeBaht("0")).toBeNull();
    expect(parseWholeBaht("")).toBeNull();
  });
});

describe("parseImportedBalance", () => {
  it("keeps the amount a cell holds", () => {
    expect(parseImportedBalance(150)).toEqual({ value: 150, adjusted: false });
    expect(parseImportedBalance("1,250")).toEqual({ value: 1250, adjusted: false });
    expect(parseImportedBalance("")).toEqual({ value: 0, adjusted: false });
  });

  it("rounds satang and floors negatives instead of multiplying them", () => {
    expect(parseImportedBalance(150.5)).toEqual({ value: 151, adjusted: true });
    expect(parseImportedBalance("150.25")).toEqual({ value: 150, adjusted: true });
    expect(parseImportedBalance("-20")).toEqual({ value: 0, adjusted: true });
  });
});

describe("reconcileRoster", () => {
  const old = ["ก ไก่", "ข ไข่", "ค ควาย"];
  const bal = [100, 50, 0];

  it("keeps balances by name when the list is reordered or extended", () => {
    const r = reconcileRoster(old, bal, ["ค ควาย", "ก ไก่", "ข ไข่", "ง งู"]);
    expect(r.balances).toEqual([0, 100, 50, 0]);
    expect(r.renames).toEqual([]);
    expect(r.dropped).toEqual([]);
  });

  it("treats an edited name in the same row as a rename", () => {
    const r = reconcileRoster(old, bal, ["ก ไก่", "ข ไข่ ดีใจ", "ค ควาย"]);
    expect(r.balances).toEqual([100, 50, 0]);
    expect(r.renames).toEqual([{ from: "ข ไข่", to: "ข ไข่ ดีใจ" }]);
    expect(r.dropped).toEqual([]);
  });

  it("reports students with money who would leave the list", () => {
    const r = reconcileRoster(old, bal, ["ก ไก่", "ค ควาย"]);
    expect(r.balances).toEqual([100, 0]);
    expect(r.dropped).toEqual([{ name: "ข ไข่", balance: 50 }]);
  });

  it("does not report students leaving with no money", () => {
    expect(reconcileRoster(old, bal, ["ก ไก่", "ข ไข่"]).dropped).toEqual([]);
  });
});

describe("ensureTxnIds", () => {
  it("gives old transactions distinct ids, even with the same time", () => {
    const txns = ensureTxnIds([
      { name: "ก", amt: 5, type: "deposit" as const, ts: 2 },
      { name: "ข", amt: 5, type: "deposit" as const, ts: 2 },
    ]);
    expect(new Set(txns.map((t) => t.id)).size).toBe(2);
  });

  it("keeps ids that are already there", () => {
    const [t] = ensureTxnIds([{ id: "x1", name: "ก", amt: 5, type: "deposit" as const, ts: 2 }]);
    expect(t.id).toBe("x1");
  });
});

const dep = (name: string, amt: number, ts: number, id = `${name}${ts}`): Txn => ({ id, name, amt, type: "deposit", ts });
const wd = (name: string, amt: number, ts: number, id = `w${name}${ts}`): Txn => ({ id, name, amt, type: "withdraw", ts });

describe("balances from history", () => {
  const txns = [dep("ก", 100, 1), wd("ก", 30, 2), dep("ข", 20, 3), { id: "a", name: "ข", amt: -5, type: "adjust" as const, ts: 4 }];

  it("adds deposits, takes withdrawals and applies signed adjustments", () => {
    expect(balanceOf("ก", txns)).toBe(70);
    expect(balanceOf("ข", txns)).toBe(15);
    expect(balancesFor(["ข", "ค", "ก"], txns)).toEqual([15, 0, 70]);
  });
});

describe("withBalanceAdjustments", () => {
  it("adds one adjustment per student whose target differs", () => {
    const out = withBalanceAdjustments(["ก", "ข"], [120, 0], [dep("ก", 100, 10)], 5, (i) => `x${i}`);
    expect(out.slice(1)).toEqual([{ id: "x0", name: "ก", amt: 20, type: "adjust", ts: 5 }]);
    expect(balancesFor(["ก", "ข"], out)).toEqual([120, 0]);
  });

  it("can adjust downward and leaves matching students alone", () => {
    const out = withBalanceAdjustments(["ก"], [60], [dep("ก", 100, 10)], 11, () => "y");
    expect(out.at(-1)).toEqual({ id: "y", name: "ก", amt: -40, type: "adjust", ts: 11 });
    expect(withBalanceAdjustments(["ก"], [100], [dep("ก", 100, 10)], 11, () => "z")).toHaveLength(1);
  });
});

describe("migrateSavings", () => {
  it("turns stored balances that the history does not explain into an opening balance", () => {
    const { txns } = migrateSavings(["ก", "ข"], [320, 50], [dep("ข", 50, 1000)], 9999);
    expect(balancesFor(["ก", "ข"], txns)).toEqual([320, 50]);
    const opening = txns.find((t) => t.type === "adjust");
    expect(opening).toMatchObject({ name: "ก", amt: 320 });
    // Opening balances sort before every real transaction.
    expect(opening!.ts).toBeLessThan(1000);
  });

  it("changes nothing when balances already match the history", () => {
    const history = [dep("ก", 10, 5)];
    expect(migrateSavings(["ก"], [10], history, 9999).txns).toEqual(history);
  });
});

describe("parseHistorySheet", () => {
  it("reads this app's own history sheet, exact time column first", () => {
    const rows = [
      ["วันที่-เวลา", "ชื่อ-สกุล", "ประเภท", "จำนวน", "เวลา (ระบบ)"],
      ["3/11/2569 14:05:00", "ก", "ฝาก", 20, 1793700000000],
      ["3/11/2569 14:06:00", "ก", "ถอน", 5, 1793700060000],
      ["1/11/2569 08:00:00", "ข", "ยอดยกมา", -10, 1793500000000],
    ];
    const txns = parseHistorySheet(rows, (i) => `h${i}`);
    expect(txns).toEqual([
      { id: "h0", name: "ก", amt: 20, type: "deposit", ts: 1793700000000 },
      { id: "h1", name: "ก", amt: 5, type: "withdraw", ts: 1793700060000 },
      { id: "h2", name: "ข", amt: -10, type: "adjust", ts: 1793500000000 },
    ]);
  });

  it("reads the Thai date of files exported before the time column existed", () => {
    const rows = [
      ["วันที่-เวลา", "ชื่อ-สกุล", "ประเภท", "จำนวน"],
      ["3/11/2569 14:05:00", "ก", "ฝาก", 20],
    ];
    const [t] = parseHistorySheet(rows, () => "h")!;
    expect(t.ts).toBe(new Date(2026, 10, 3, 14, 5, 0).getTime());
  });

  it("returns null for a sheet that is not a history sheet", () => {
    expect(parseHistorySheet([["เลขที่", "ชื่อ-สกุล"]], () => "h")).toBeNull();
  });
});
