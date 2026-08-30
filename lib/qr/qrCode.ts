/* Dependency-free QR encoder: byte mode, version 4, error correction L. */
const VERSION = 4;
const SIZE = 17 + VERSION * 4;
const DATA_CODEWORDS = 80;
const ECC_CODEWORDS = 20;

function multiply(a: number, b: number): number {
  let result = 0;
  while (b > 0) {
    if (b & 1) result ^= a;
    a <<= 1;
    if (a & 0x100) a ^= 0x11d;
    b >>>= 1;
  }
  return result;
}

function generator(degree: number): number[] {
  let result = [1];
  let root = 1;
  for (let i = 0; i < degree; i++) {
    const next = Array(result.length + 1).fill(0);
    result.forEach((coefficient, index) => {
      next[index] ^= coefficient;
      next[index + 1] ^= multiply(coefficient, root);
    });
    result = next;
    root = multiply(root, 2);
  }
  return result;
}

function remainder(data: readonly number[]): number[] {
  const divisor = generator(ECC_CODEWORDS);
  const result = Array(ECC_CODEWORDS).fill(0);
  for (const value of data) {
    const factor = value ^ result[0];
    result.shift();
    result.push(0);
    for (let i = 0; i < ECC_CODEWORDS; i++) result[i] ^= multiply(divisor[i + 1], factor);
  }
  return result;
}

function appendBits(bits: number[], value: number, length: number) {
  for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
}

function encodeData(text: string): number[] {
  const bytes = Array.from(new TextEncoder().encode(text));
  if (bytes.length > 78) throw new Error("ลิงก์ยาวเกินกว่าจะสร้าง QR ได้");
  const bits: number[] = [];
  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach((byte) => appendBits(bits, byte, 8));
  appendBits(bits, 0, Math.min(4, DATA_CODEWORDS * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const result: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    result.push(bits.slice(i, i + 8).reduce((sum, bit) => (sum << 1) | bit, 0));
  }
  for (let pad = 0; result.length < DATA_CODEWORDS; pad++) result.push(pad % 2 ? 0x11 : 0xec);
  return [...result, ...remainder(result)];
}

function formatBits(mask: number): number {
  const data = (1 << 3) | mask; // Error correction L = 01
  let rem = data << 10;
  for (let i = 14; i >= 10; i--) if ((rem >>> i) & 1) rem ^= 0x537 << (i - 10);
  return ((data << 10) | rem) ^ 0x5412;
}

export function createQrMatrix(text: string): boolean[][] {
  const modules = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const fixed = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const set = (x: number, y: number, dark: boolean, isFixed = true) => {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    modules[y][x] = dark;
    if (isFixed) fixed[y][x] = true;
  };
  const finder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      set(cx + dx, cy + dy, distance !== 2 && distance !== 4);
    }
  };
  finder(3, 3); finder(SIZE - 4, 3); finder(3, SIZE - 4);
  for (let i = 8; i < SIZE - 8; i++) {
    set(i, 6, i % 2 === 0);
    set(6, i, i % 2 === 0);
  }
  const alignment = (cx: number, cy: number) => {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  };
  alignment(26, 26);

  // Reserve both copies of the format information before placing payload bits.
  for (let i = 0; i <= 5; i++) set(8, i, false);
  set(8, 7, false); set(8, 8, false); set(7, 8, false);
  for (let i = 9; i < 15; i++) set(14 - i, 8, false);
  for (let i = 0; i < 8; i++) set(SIZE - 1 - i, 8, false);
  for (let i = 8; i < 15; i++) set(8, SIZE - 15 + i, false);
  set(8, SIZE - 8, true);

  const payload: number[] = [];
  encodeData(text).forEach((byte) => appendBits(payload, byte, 8));
  let bitIndex = 0;
  let upward = true;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right--;
    for (let step = 0; step < SIZE; step++) {
      const y = upward ? SIZE - 1 - step : step;
      for (let offset = 0; offset < 2; offset++) {
        const x = right - offset;
        if (fixed[y][x]) continue;
        const value = bitIndex < payload.length ? payload[bitIndex++] === 1 : false;
        modules[y][x] = value !== ((x + y) % 2 === 0); // mask 0
      }
    }
    upward = !upward;
  }

  const format = formatBits(0);
  const bit = (i: number) => ((format >>> i) & 1) !== 0;
  for (let i = 0; i <= 5; i++) set(8, i, bit(i));
  set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) set(SIZE - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) set(8, SIZE - 15 + i, bit(i));
  set(8, SIZE - 8, true);
  return modules;
}
