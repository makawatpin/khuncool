"use client";

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

  // Guests get `local-only` and zero network calls; signed-in teachers get the
  // roster mirrored into their account so it follows them across devices.
  const { pulled, status: cloudStatus } = useCloudSync("classrooms", store);

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
      setStore((current) => ({
        ...current,
        activeClassroomId: classroom.id,
        classrooms: [classroom, ...current.classrooms],
      }));
      return classroom.id;
    },
    [],
  );

  const updateClassroom = useCallback(
    (id: string, patch: { name?: string; studentNames?: readonly string[] }) => {
      setStore((current) => ({
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
    [],
  );

  const removeClassroom = useCallback((id: string) => {
    setStore((current) => {
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
  }, []);

  const setActiveClassroom = useCallback((id: string) => {
    setStore((current) =>
      current.classrooms.some((classroom) => classroom.id === id)
        ? { ...current, activeClassroomId: id }
        : current,
    );
  }, []);

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
