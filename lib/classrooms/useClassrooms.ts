"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCloudSync } from "@/lib/useCloudSync";
import {
  EMPTY_CLASSROOM_STORE,
  createLocalId,
  loadClassroomStore,
  saveClassroomStore,
  studentsFromNames,
} from "./storage";
import type { Classroom, ClassroomRoster, ClassroomStore } from "./types";

export function useClassrooms() {
  const [store, setStore] = useState<ClassroomStore>(EMPTY_CLASSROOM_STORE);
  const [hydrated, setHydrated] = useState(false);

  // Set on the first change the teacher makes. Until then nothing is pushed,
  // so opening a page that reads the rosters stores nothing in the cloud.
  // Loading saved data uses setStore and does not count.
  const [edited, setEdited] = useState(false);
  const editStore = useCallback((next: React.SetStateAction<ClassroomStore>) => {
    setEdited(true);
    setStore(next);
  }, []);

  // Guests get `local-only` and zero network calls; signed-in teachers get the
  // roster mirrored into their account so it follows them across devices.
  const { pulled, status: cloudStatus } = useCloudSync("classrooms", store, { push: edited });

  // Read the local store on mount, and again when a cloud pull (after sign-in)
  // has written newer data into the same localStorage slot.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStore(loadClassroomStore());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pulled]);

  useEffect(() => {
    if (!hydrated) return;
    saveClassroomStore(store);
  }, [store, hydrated]);

  const createClassroom = useCallback(
    (name = "ห้องเรียนใหม่", studentNames: readonly string[] = []) => {
      const now = Date.now();
      const classroom: Classroom = {
        id: createLocalId("class"),
        name: name.trim().slice(0, 80) || "ห้องเรียนใหม่",
        students: studentsFromNames(studentNames),
        createdAt: now,
        updatedAt: now,
      };
      editStore((current) => ({
        ...current,
        activeClassroomId: classroom.id,
        classrooms: [classroom, ...current.classrooms],
      }));
      return classroom.id;
    },
    [editStore],
  );

  const updateClassroom = useCallback(
    (id: string, patch: { name?: string; studentNames?: readonly string[] }) => {
      editStore((current) => ({
        ...current,
        activeClassroomId: id,
        classrooms: current.classrooms.map((classroom) =>
          classroom.id === id
            ? {
                ...classroom,
                ...(patch.name !== undefined && {
                  name: patch.name.trim().slice(0, 80) || "ห้องเรียน",
                }),
                ...(patch.studentNames !== undefined && {
                  students: studentsFromNames(patch.studentNames),
                }),
                updatedAt: Date.now(),
              }
            : classroom,
        ),
      }));
    },
    [editStore],
  );

  const removeClassroom = useCallback((id: string) => {
    editStore((current) => {
      const classrooms = current.classrooms.filter(
        (classroom) => classroom.id !== id,
      );
      return {
        ...current,
        classrooms,
        activeClassroomId:
          current.activeClassroomId === id
            ? classrooms[0]?.id ?? null
            : current.activeClassroomId,
      };
    });
  }, [editStore]);

  const setActiveClassroom = useCallback((id: string) => {
    editStore((current) =>
      current.classrooms.some((classroom) => classroom.id === id)
        ? { ...current, activeClassroomId: id }
        : current,
    );
  }, [editStore]);

  const rosters = useMemo<ClassroomRoster[]>(
    () =>
      store.classrooms.map((classroom) => ({
        id: classroom.id,
        name: classroom.name,
        studentNames: classroom.students.map((student) => student.name),
      })),
    [store.classrooms],
  );

  return {
    store,
    rosters,
    hydrated,
    cloudStatus,
    createClassroom,
    updateClassroom,
    removeClassroom,
    setActiveClassroom,
  };
}
