import { CONFUSION_GROUPS, FAMILY_BY_ID } from "./familyData.ts";
import { WORDS } from "./wordData.ts";
import type { FamilyId, GameConfig, GameQuestion } from "./types.ts";

export type RandomSource = () => number;

const shuffle = <T,>(items: readonly T[], rng: RandomSource) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

function selectedGroup(focus: FamilyId, requested?: FamilyId[]): FamilyId[] {
  const group = CONFUSION_GROUPS[FAMILY_BY_ID[focus].confusionGroupId];
  if (!requested) return group;
  const selected = group.filter((id) => requested.includes(id));
  if (!selected.includes(focus)) selected.unshift(focus);
  return selected.length >= 2 ? selected : group;
}

function focusSchedule(focus: FamilyId, count: number, comparisonFamilies?: FamilyId[]): FamilyId[] {
  const group = selectedGroup(focus, comparisonFamilies);
  const others = group.filter((id) => id !== focus);
  const focusCount = count === 5 ? 2 : count === 10 ? 4 : 5;
  const remaining = count - focusCount;
  return [
    ...Array.from({ length: focusCount }, () => focus),
    ...Array.from({ length: remaining }, (_, index) => others[index % others.length]),
  ];
}

export function generateQuestions(config: GameConfig, rng: RandomSource = Math.random): GameQuestion[] {
  const allFamilies = Object.keys(FAMILY_BY_ID) as FamilyId[];
  const schedule = config.focusFamily
    ? focusSchedule(config.focusFamily, config.questionCount, config.comparisonFamilies)
    : Array.from({ length: config.questionCount }, (_, index) => allFamilies[index % allFamilies.length]);
  const used = new Set<string>();

  return shuffle(schedule, rng).map((familyId, index) => {
    const pool = WORDS.filter((word) => word.familyId === familyId && word.difficulty <= config.difficulty && !used.has(word.id));
    const fallback = WORDS.filter((word) => word.familyId === familyId && !used.has(word.id));
    const source = pool.length ? pool : fallback;
    const word = source[Math.floor(rng() * source.length)];
    if (!word) throw new Error(`คลังคำของ ${familyId} ไม่พอสำหรับสร้างคำถาม`);
    used.add(word.id);
    const group = config.focusFamily ? selectedGroup(config.focusFamily, config.comparisonFamilies) : CONFUSION_GROUPS[FAMILY_BY_ID[familyId].confusionGroupId];
    return { id: `${index}-${word.id}`, word, answer: familyId, options: shuffle(group, rng) };
  });
}
