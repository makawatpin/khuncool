/**
 * Name-list changes shared by the classroom apps. Their records are keyed by
 * student name, so when a teacher corrects a name the records must follow.
 */

/**
 * Carries balances from the old roster to a new one. Names that match keep
 * their balance. An unmatched new name in the same row as an unmatched old
 * name is taken as that student's name being corrected (a rename), so their
 * money follows them. Old students with money who are not in the new list are
 * returned in `dropped` so the teacher can confirm before it is lost.
 */
export function reconcileRoster(
  oldNames: string[],
  oldBalances: number[],
  newNames: string[],
): {
  balances: number[];
  renames: { from: string; to: string }[];
  dropped: { name: string; balance: number }[];
} {
  const byName = new Map<string, number>();
  oldNames.forEach((n, i) => byName.set(n, oldBalances[i] || 0));
  const newSet = new Set(newNames);
  const used = new Set<string>();
  const renames: { from: string; to: string }[] = [];
  const balances = newNames.map((name, i) => {
    if (byName.has(name)) {
      used.add(name);
      return byName.get(name)!;
    }
    const before = oldNames[i];
    if (before !== undefined && !newSet.has(before) && !used.has(before)) {
      used.add(before);
      renames.push({ from: before, to: name });
      return byName.get(before) ?? 0;
    }
    return 0;
  });
  const dropped = oldNames
    .map((name, i) => ({ name, balance: oldBalances[i] || 0 }))
    .filter((s) => !used.has(s.name) && s.balance > 0);
  return { balances, renames, dropped };
}

/** Moves every record kept under a renamed student's old name to the new one. */
export function renameKeys<T>(
  byName: Readonly<Record<string, T>>,
  renames: readonly { from: string; to: string }[],
): Record<string, T> {
  const out = { ...byName };
  for (const { from, to } of renames) {
    if (from in out) {
      out[to] = out[from];
      delete out[from];
    }
  }
  return out;
}
