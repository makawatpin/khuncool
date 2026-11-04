/**
 * One line of a student's savings history. Balances are not stored on their
 * own: a balance is the sum of its student's history, so the two can never
 * disagree. "adjust" is an opening or corrected balance (ยอดยกมา) with a
 * signed amount; deposits and withdrawals are always positive amounts.
 */
export type Txn = {
  /** Unique per transaction; undo removes exactly this one. */
  id: string;
  name: string;
  amt: number;
  type: "deposit" | "withdraw" | "adjust";
  ts: number;
};

export function signedAmount(t: Txn): number {
  return t.type === "withdraw" ? -t.amt : t.amt;
}

export function balanceOf(name: string, txns: readonly Txn[]): number {
  let sum = 0;
  for (const t of txns) if (t.name === name) sum += signedAmount(t);
  return sum;
}

export function balancesFor(students: string[], txns: readonly Txn[]): number[] {
  const sums = new Map<string, number>();
  for (const t of txns) sums.set(t.name, (sums.get(t.name) ?? 0) + signedAmount(t));
  return students.map((n) => sums.get(n) ?? 0);
}

/**
 * Appends one "adjust" line for each student whose history does not add up
 * to `targets[i]`, so their balance becomes exactly that.
 */
export function withBalanceAdjustments(
  students: string[],
  targets: number[],
  txns: Txn[],
  ts: number,
  makeId: (i: number) => string = () => newTxnId(),
): Txn[] {
  const current = balancesFor(students, txns);
  const adds: Txn[] = [];
  students.forEach((name, i) => {
    const diff = (targets[i] || 0) - current[i];
    if (diff !== 0) adds.push({ id: makeId(adds.length), name, amt: diff, type: "adjust", ts });
  });
  return adds.length ? [...txns, ...adds] : txns;
}

/**
 * Data saved before balances came from history kept a separate `balances`
 * list (sample balances, imported balances, clamped undos…). Whatever the
 * history does not explain becomes an opening balance dated just before the
 * first transaction, so no one's money changes.
 */
export function migrateSavings(
  students: string[],
  balances: number[] | undefined,
  txns: Txn[],
  now: number,
): { txns: Txn[] } {
  if (!Array.isArray(balances)) return { txns };
  const first = txns.reduce((m, t) => Math.min(m, t.ts), now);
  return { txns: withBalanceAdjustments(students, balances, txns, first - 1) };
}

const TYPE_FROM_TEXT: Record<string, Txn["type"]> = {
  ฝาก: "deposit",
  ฝากเงิน: "deposit",
  ถอน: "withdraw",
  ถอนเงิน: "withdraw",
  ยอดยกมา: "adjust",
  ปรับยอด: "adjust",
};

export const TYPE_TEXT: Record<Txn["type"], string> = {
  deposit: "ฝาก",
  withdraw: "ถอน",
  adjust: "ยอดยกมา",
};

/** "3/11/2569 14:05:00" (th-TH, Buddhist year) → epoch ms. */
function parseThaiDateTime(text: string): number | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(text.trim());
  if (!m) return null;
  const year = Number(m[3]) > 2400 ? Number(m[3]) - 543 : Number(m[3]);
  return new Date(year, Number(m[2]) - 1, Number(m[1]), Number(m[4]), Number(m[5]), Number(m[6] ?? 0)).getTime();
}

/**
 * Reads the "รายการ" sheet this app exports back into history. Uses the exact
 * "เวลา (ระบบ)" column when present, else the Thai date text that older
 * exports have. Returns null when the sheet is not a history sheet.
 */
export function parseHistorySheet(rows: unknown[][], makeId: (i: number) => string = () => newTxnId()): Txn[] | null {
  const head = (rows[0] ?? []).map((c) => String(c ?? "").trim());
  const col = (word: string) => head.findIndex((h) => h.includes(word));
  const nameCol = col("ชื่อ");
  const typeCol = col("ประเภท");
  const amtCol = col("จำนวน");
  const dateCol = col("วันที่");
  const tsCol = col("เวลา (ระบบ)");
  if (nameCol < 0 || typeCol < 0 || amtCol < 0 || (dateCol < 0 && tsCol < 0)) return null;
  const out: Txn[] = [];
  for (const row of rows.slice(1)) {
    const name = String(row[nameCol] ?? "").trim();
    const type = TYPE_FROM_TEXT[String(row[typeCol] ?? "").trim()];
    const raw = typeof row[amtCol] === "number" ? (row[amtCol] as number) : parseFloat(String(row[amtCol] ?? "").replace(/[,\s฿]/g, ""));
    const exact = tsCol >= 0 ? Number(row[tsCol]) : NaN;
    const ts = Number.isFinite(exact) && exact > 0 ? exact : parseThaiDateTime(String(row[dateCol] ?? ""));
    if (!name || !type || !Number.isFinite(raw) || ts === null) continue;
    const amt = Math.round(type === "adjust" ? raw : Math.abs(raw));
    if (amt === 0) continue;
    out.push({ id: makeId(out.length), name, amt, type, ts });
  }
  return out;
}

/**
 * A typed deposit/withdraw amount in whole baht, or null when it is not one.
 * Commas, spaces, "฿" and "บาท" are allowed; a decimal point or minus sign is
 * refused outright rather than stripped, so "10.50" can never become 1,050.
 */
export function parseWholeBaht(input: string): number | null {
  const s = String(input ?? "")
    .replace(/[,\s฿]/g, "")
    .replace(/บาท$/, "");
  if (!/^\d+$/.test(s)) return null;
  const n = parseInt(s, 10);
  return n > 0 ? n : null;
}

/**
 * A balance read from an imported Excel cell. The app keeps whole baht, so
 * satang are rounded and negatives become 0; `adjusted` says that happened so
 * the teacher can be told.
 */
export function parseImportedBalance(cell: unknown): { value: number; adjusted: boolean } {
  const n =
    typeof cell === "number"
      ? cell
      : parseFloat(String(cell ?? "").replace(/[,\s฿]/g, "").replace(/บาท$/, ""));
  if (!Number.isFinite(n)) return { value: 0, adjusted: false };
  const value = Math.max(0, Math.round(n));
  return { value, adjusted: value !== n };
}

export { reconcileRoster } from "@/lib/roster";

/** Gives transactions saved before ids existed a unique one each. */
export function ensureTxnIds(txns: (Omit<Txn, "id"> & { id?: string })[]): Txn[] {
  return txns.map((t, i) => (t.id ? (t as Txn) : { ...t, id: `t${t.ts}-${i}` }));
}

let counter = 0;
export function newTxnId(): string {
  counter += 1;
  return `t${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 6)}`;
}
