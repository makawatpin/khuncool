import { describe, expect, it } from "vitest";
import {
  EMPTY_STATE,
  STORAGE_KEY,
  activePlayers,
  addPlayer,
  beginStage,
  boxesOpened,
  canStart,
  canToggle,
  currentTurn,
  loadState,
  nextTurn,
  openBox,
  parseNames,
  pickStarter,
  playerLabels,
  pool,
  readSaved,
  resetGame,
  serializeState,
  setActive,
  setNames,
  syncPlayers,
  totalBoxes,
  writeSaved,
  type GameState,
  type Rng,
} from "./chainModel";

const first: Rng = () => 0;

function withNames(...names: string[]): GameState {
  return setNames(EMPTY_STATE, names);
}

function idOf(state: GameState, name: string): string {
  const p = state.players.find((x) => x.name === name);
  if (!p) throw new Error(`no player ${name}`);
  return p.id;
}

function nameOf(state: GameState, id: string): string {
  return state.players.find((x) => x.id === id)!.name;
}

/** เล่นตั้งแต่สุ่มคนเริ่มจนปิดวง คืน state สุดท้ายและคู่ทั้งหมด */
function playToEnd(start: GameState, rng: Rng) {
  let state = beginStage(pickStarter(start, rng));
  const pairs: [string, string][] = [];
  for (let guard = 0; guard < 500; guard++) {
    const giver = currentTurn(state)!.giverId;
    const r = openBox(state, rng);
    expect(r.receiverId).not.toBeNull();
    pairs.push([giver, r.receiverId!]);
    state = r.state;
    if (r.closesLoop) return { state, pairs };
    state = nextTurn(state);
  }
  throw new Error("game never closed");
}

describe("parseNames", () => {
  it("ตัดช่องว่างหัวท้ายและข้ามบรรทัดว่าง รองรับ CRLF", () => {
    expect(parseNames("  ต้น \r\n\r\nฝน\n  \nบี")).toEqual(["ต้น", "ฝน", "บี"]);
  });
});

describe("syncPlayers / playerLabels — ชื่อซ้ำ", () => {
  it("ชื่อซ้ำเป็นผู้เล่นแยกกัน และติดเลขต่อท้ายตั้งแต่คนที่สอง", () => {
    const s = withNames("ต้น", "ฝน", "ต้น");
    expect(s.players).toHaveLength(3);
    expect(new Set(s.players.map((p) => p.id)).size).toBe(3);
    const labels = playerLabels(s.players);
    expect(s.players.map((p) => labels[p.id])).toEqual(["ต้น", "ฝน", "ต้น (2)"]);
  });

  it("แก้รายชื่อแล้วคนเดิมยังคง id และสถานะขาด", () => {
    let s = withNames("ต้น", "ฝน", "ต้น");
    const secondTon = s.players[2].id;
    s = setActive(s, secondTon, false);
    const next = syncPlayers(s.players, ["บี", "ต้น", "ฝน", "ต้น"]);
    const kept = next.find((p) => p.id === secondTon);
    expect(kept?.active).toBe(false);
    expect(next.filter((p) => p.name === "ต้น")).toHaveLength(2);
    expect(next.find((p) => p.name === "บี")?.active).toBe(true);
  });

  it("setNames ไม่มีผลเมื่อเกมเริ่มแล้ว", () => {
    const started = pickStarter(withNames("ก", "ข", "ค"), first);
    expect(setNames(started, ["x"])).toBe(started);
  });
});

describe("canStart", () => {
  it("ต้องมีคน active อย่างน้อย 3 คน", () => {
    expect(canStart(withNames("ก", "ข"))).toBe(false);
    expect(canStart(withNames("ก", "ข", "ค"))).toBe(true);
    const s = withNames("ก", "ข", "ค");
    expect(canStart(setActive(s, idOf(s, "ค"), false))).toBe(false);
  });

  it("pickStarter ไม่ทำอะไรถ้ายังเริ่มไม่ได้", () => {
    const s = withNames("ก", "ข");
    expect(pickStarter(s, first)).toBe(s);
  });
});

describe("เล่นจนจบ", () => {
  it("ทุกคนได้รับของครั้งเดียว และกล่องสุดท้ายวนกลับคนแรก", () => {
    const s = withNames("ก", "ข", "ค", "ง", "จ");
    const { state, pairs } = playToEnd(s, first);
    expect(state.phase).toBe("finale");
    expect(state.chain.map((id) => nameOf(state, id))).toEqual(["ก", "ข", "ค", "ง", "จ"]);
    const receivers = pairs.map(([, r]) => r).sort();
    expect(receivers).toEqual([...state.chain].sort());
    expect(pairs.at(-1)![1]).toBe(state.chain[0]);
    expect(currentTurn(state)).toEqual({ giverId: state.chain.at(-1), receiverId: state.chain[0] });
  });

  it("สุ่มจริง 2000 รอบ: ไม่มีใครได้ตัวเอง และเป็นวงเดียวครอบทุกคน", () => {
    for (let round = 0; round < 2000; round++) {
      const n = 3 + Math.floor(Math.random() * 38);
      const s = withNames(...Array.from({ length: n }, (_, i) => `คน${i}`));
      const { state, pairs } = playToEnd(s, Math.random);
      expect(pairs).toHaveLength(n);
      for (const [g, r] of pairs) expect(g).not.toBe(r);
      expect(new Set(state.chain).size).toBe(n);
      const givers = new Set(pairs.map(([g]) => g));
      expect(givers.size).toBe(n);
    }
  });

  it("boxesOpened / totalBoxes นับกล่องที่เปิดแล้ว", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค"), first));
    expect(boxesOpened(s)).toBe(0);
    expect(totalBoxes(s)).toBe(3);
    s = nextTurn(openBox(s, first).state);
    expect(boxesOpened(s)).toBe(1);
    s = nextTurn(openBox(s, first).state);
    expect(boxesOpened(s)).toBe(2);
    s = openBox(s, first).state;
    expect(s.phase).toBe("finale");
    expect(boxesOpened(s)).toBe(3);
  });
});

describe("openBox — กันกดซ้ำ", () => {
  it("เปิดซ้ำตอนกล่องเปิดอยู่แล้วไม่มีผล", () => {
    const s = beginStage(pickStarter(withNames("ก", "ข", "ค", "ง"), first));
    const once = openBox(s, first);
    const twice = openBox(once.state, first);
    expect(twice.receiverId).toBeNull();
    expect(twice.state).toBe(once.state);
    expect(once.state.chain).toHaveLength(2);
  });

  it("เปิดไม่ได้ก่อนเข้าเวที", () => {
    const s = pickStarter(withNames("ก", "ข", "ค"), first);
    expect(openBox(s, first).receiverId).toBeNull();
  });
});

describe("currentTurn", () => {
  it("ก่อนเปิด: ผู้ให้คือคนท้ายโซ่ ยังไม่มีผู้รับ / หลังเปิด: ผู้ให้คือคนก่อนท้าย", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค"), first));
    expect(currentTurn(s)).toEqual({ giverId: s.chain[0], receiverId: null });
    s = openBox(s, first).state;
    expect(currentTurn(s)).toEqual({ giverId: s.chain[0], receiverId: s.chain[1] });
    s = nextTurn(s);
    expect(currentTurn(s)).toEqual({ giverId: s.chain[1], receiverId: null });
  });

  it("ยังไม่มีโซ่ คืน null", () => {
    expect(currentTurn(withNames("ก", "ข", "ค"))).toBeNull();
  });
});

describe("แก้รายชื่อกลางเกม", () => {
  it("ติ๊กขาดคนที่ยังไม่ถูกจับ แล้วคนนั้นไม่ถูกเผย", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค", "ง"), first));
    s = setActive(s, idOf(s, "ข"), false);
    const { state } = playToEndFromStage(s);
    expect(state.chain.map((id) => nameOf(state, id))).not.toContain("ข");
  });

  it("ติ๊กคนที่อยู่ในโซ่แล้วไม่ได้", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค"), first));
    s = nextTurn(openBox(s, first).state);
    const inChain = s.chain[1];
    expect(canToggle(s, inChain)).toBe(false);
    expect(setActive(s, inChain, false)).toBe(s);
  });

  it("กันติ๊กคนสุดท้ายใน pool ออก เมื่อเพิ่งมีแค่คนเริ่ม", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค"), first));
    s = setActive(s, idOf(s, "ข"), false);
    const last = pool(s)[0].id;
    expect(canToggle(s, last)).toBe(false);
    expect(setActive(s, last, false)).toBe(s);
    // ติ๊กกลับเข้ามาได้เสมอ
    expect(canToggle(s, idOf(s, "ข"))).toBe(true);
  });

  it("ติ๊กขาดจน pool ว่างตอนโซ่ยาว ≥ 2 แค่ทำให้ปิดวงเร็วขึ้น", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค", "ง"), first));
    s = nextTurn(openBox(s, first).state); // ก → ข
    s = setActive(s, idOf(s, "ค"), false);
    s = setActive(s, idOf(s, "ง"), false);
    const r = openBox(s, first);
    expect(r.closesLoop).toBe(true);
    expect(r.receiverId).toBe(s.chain[0]);
  });

  it("เพิ่มคนมาสายกลางเกม แล้วคนนั้นถูกเผยก่อนปิดวง", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค"), first));
    s = addPlayer(s, "  มาสาย ");
    expect(s.players.at(-1)?.name).toBe("มาสาย");
    const { state } = playToEndFromStage(s);
    expect(state.chain.map((id) => nameOf(state, id))).toContain("มาสาย");
  });

  it("เพิ่มชื่อว่าง หรือเพิ่มตอนจบเกมแล้ว ไม่มีผล", () => {
    const s = withNames("ก", "ข", "ค");
    expect(addPlayer(s, "   ")).toBe(s);
    const { state } = playToEnd(s, first);
    expect(addPlayer(state, "x")).toBe(state);
  });
});

describe("resetGame", () => {
  it("ล้างโซ่ กลับจอตั้งค่า คงรายชื่อและสถานะขาด", () => {
    let s = withNames("ก", "ข", "ค", "ง");
    s = setActive(s, idOf(s, "ง"), false);
    const { state } = playToEnd(s, first);
    const r = resetGame(state);
    expect(r.phase).toBe("setup");
    expect(r.chain).toEqual([]);
    expect(r.boxOpen).toBe(false);
    expect(r.players).toEqual(state.players);
    expect(activePlayers(r)).toHaveLength(3);
  });
});

describe("loadState / serializeState", () => {
  it("round-trip ได้ state เท่าเดิม และผลที่เผยแล้วไม่เปลี่ยน (รีเฟรชกลางฉาก)", () => {
    let s = beginStage(pickStarter(withNames("ก", "ข", "ค", "ต้น", "ต้น"), Math.random));
    const opened = openBox(s, Math.random);
    s = opened.state;
    const back = loadState(serializeState(s));
    expect(back).toEqual(s);
    expect(currentTurn(back!)).toEqual(currentTurn(s));
    expect(currentTurn(back!)!.receiverId).toBe(opened.receiverId);
  });

  it.each([
    ["null", null],
    ["JSON เสีย", "{oops"],
    ["ไม่ใช่ object", "42"],
    ["version ผิด", JSON.stringify({ ...EMPTY_STATE, version: 2 })],
    ["phase ผิด", JSON.stringify({ ...EMPTY_STATE, phase: "lobby" })],
    ["players ไม่ใช่ array", JSON.stringify({ ...EMPTY_STATE, players: "x" })],
    ["player ขาด field", JSON.stringify({ ...EMPTY_STATE, players: [{ id: "a", name: "ก" }] })],
    ["id ซ้ำ", JSON.stringify({ ...EMPTY_STATE, players: [{ id: "a", name: "ก", active: true }, { id: "a", name: "ข", active: true }] })],
    ["chain อ้าง id ที่ไม่มี", JSON.stringify({ ...EMPTY_STATE, phase: "stage", players: [{ id: "a", name: "ก", active: true }], chain: ["zzz"] })],
    ["setup แต่มี chain", JSON.stringify({ ...EMPTY_STATE, players: [{ id: "a", name: "ก", active: true }], chain: ["a"] })],
    ["stage แต่ chain ว่าง", JSON.stringify({ ...EMPTY_STATE, phase: "stage" })],
    ["boxOpen หาย", JSON.stringify({ version: 1, players: [], chain: [], phase: "setup", soundOn: true })],
  ])("คืน null เมื่อ %s", (_label, raw) => {
    expect(loadState(raw as string | null)).toBeNull();
  });
});

describe("readSaved / writeSaved", () => {
  it("อ่านเขียนผ่าน storage ด้วยคีย์ที่กำหนด", () => {
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
    };
    const s = withNames("ก", "ข", "ค");
    writeSaved(storage, s);
    expect(mem.has(STORAGE_KEY)).toBe(true);
    expect(readSaved(storage)).toEqual(s);
  });

  it("storage โยน error (โหมดส่วนตัว/เต็ม) แล้วไม่พัง", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(() => writeSaved(broken, EMPTY_STATE)).not.toThrow();
    expect(readSaved(broken)).toBeNull();
    expect(readSaved(undefined)).toBeNull();
  });
});

/** เล่นต่อจาก state ที่อยู่บนเวทีแล้ว จนปิดวง */
function playToEndFromStage(start: GameState) {
  let state = start;
  for (let guard = 0; guard < 500; guard++) {
    const r = openBox(state, first);
    state = r.state;
    if (r.closesLoop) return { state };
    state = nextTurn(state);
  }
  throw new Error("game never closed");
}
