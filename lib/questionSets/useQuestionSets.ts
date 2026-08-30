"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCloudSync } from "@/lib/useCloudSync";
import {
  EMPTY_QUESTION_SET_STORE,
  createSetId,
  loadQuestionSetStore,
  normalizeQuestions,
  saveQuestionSetStore,
} from "./storage";
import type { QuestionSet, QuestionSetStore, QuestionSetSummary } from "./types";

export function useQuestionSets() {
  const [store, setStore] = useState<QuestionSetStore>(EMPTY_QUESTION_SET_STORE);
  const [hydrated, setHydrated] = useState(false);

  // Guests get `local-only` and zero network calls; signed-in teachers get the
  // library mirrored into their account, same path the classroom store uses.
  const { pulled, status: cloudStatus } = useCloudSync("questionSets", store);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStore(loadQuestionSetStore());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pulled]);

  useEffect(() => {
    if (!hydrated) return;
    saveQuestionSetStore(store);
  }, [store, hydrated]);

  const createSet = useCallback(
    (name = "ชุดคำถามใหม่", questions: readonly string[] = []) => {
      const now = Date.now();
      const set: QuestionSet = {
        id: createSetId(),
        name: name.trim().slice(0, 80) || "ชุดคำถามใหม่",
        questions: normalizeQuestions(questions),
        createdAt: now,
        updatedAt: now,
      };
      setStore((current) => ({
        ...current,
        activeSetId: set.id,
        sets: [set, ...current.sets],
      }));
      return set.id;
    },
    [],
  );

  const updateSet = useCallback(
    (id: string, patch: { name?: string; questions?: readonly string[] }) => {
      setStore((current) => ({
        ...current,
        activeSetId: id,
        sets: current.sets.map((set) =>
          set.id === id
            ? {
                ...set,
                ...(patch.name !== undefined && {
                  name: patch.name.trim().slice(0, 80) || "ชุดคำถาม",
                }),
                ...(patch.questions !== undefined && {
                  questions: normalizeQuestions(patch.questions),
                }),
                updatedAt: Date.now(),
              }
            : set,
        ),
      }));
    },
    [],
  );

  const removeSet = useCallback((id: string) => {
    setStore((current) => {
      const sets = current.sets.filter((set) => set.id !== id);
      return {
        ...current,
        sets,
        activeSetId:
          current.activeSetId === id ? sets[0]?.id ?? null : current.activeSetId,
      };
    });
  }, []);

  const setActiveSet = useCallback((id: string) => {
    setStore((current) =>
      current.sets.some((set) => set.id === id)
        ? { ...current, activeSetId: id }
        : current,
    );
  }, []);

  const summaries = useMemo<QuestionSetSummary[]>(
    () =>
      store.sets.map((set) => ({
        id: set.id,
        name: set.name,
        questions: set.questions,
      })),
    [store.sets],
  );

  return {
    store,
    summaries,
    hydrated,
    cloudStatus,
    createSet,
    updateSet,
    removeSet,
    setActiveSet,
  };
}
