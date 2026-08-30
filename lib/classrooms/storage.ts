import type {
  Classroom,
  ClassroomStore,
  ClassroomStudent,
} from "./types";

export const CLASSROOMS_STORAGE_KEY = "khuncool.classrooms.v1";
const LEGACY_ROSTER_KEY = "khuncool.roster";
const LEGACY_ATTENDANCE_KEY = "khuncool_attendance_v1";

export const EMPTY_CLASSROOM_STORE: ClassroomStore = {
  version: 1,
  activeClassroomId: null,
  classrooms: [],
};

export function createLocalId(prefix: "class" | "student"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function normalizeStudentNames(names: readonly string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const raw of names) {
    const name = raw.trim().replace(/\s+/g, " ");
    if (!name || seen.has(name)) continue;
    seen.add(name);
    normalized.push(name);
  }
  return normalized.slice(0, 200);
}

export function studentsFromNames(names: readonly string[]): ClassroomStudent[] {
  return normalizeStudentNames(names).map((name) => ({
    id: createLocalId("student"),
    name,
  }));
}

function isStudent(value: unknown): value is ClassroomStudent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ClassroomStudent>;
  return typeof candidate.id === "string" && typeof candidate.name === "string";
}

function sanitizeClassroom(value: unknown): Classroom | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<Classroom>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.name !== "string" ||
    !Array.isArray(candidate.students)
  ) {
    return null;
  }

  const students = candidate.students
    .filter(isStudent)
    .map((student) => ({ ...student, name: student.name.trim() }))
    .filter((student) => student.name.length > 0)
    .slice(0, 200);
  const now = Date.now();

  return {
    id: candidate.id,
    name: candidate.name.trim().slice(0, 80) || "ห้องเรียน",
    students,
    createdAt:
      typeof candidate.createdAt === "number" ? candidate.createdAt : now,
    updatedAt:
      typeof candidate.updatedAt === "number" ? candidate.updatedAt : now,
  };
}

export function sanitizeClassroomStore(value: unknown): ClassroomStore | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<ClassroomStore>;
  if (candidate.version !== 1 || !Array.isArray(candidate.classrooms)) {
    return null;
  }
  const classrooms = candidate.classrooms
    .map(sanitizeClassroom)
    .filter((classroom): classroom is Classroom => classroom !== null)
    .slice(0, 50);
  const activeClassroomId = classrooms.some(
    (classroom) => classroom.id === candidate.activeClassroomId,
  )
    ? candidate.activeClassroomId!
    : classrooms[0]?.id ?? null;
  return { version: 1, activeClassroomId, classrooms };
}

function parseLegacyRoster(): { room: string; names: string[] } | null {
  try {
    const attendanceRaw = window.localStorage.getItem(LEGACY_ATTENDANCE_KEY);
    if (attendanceRaw) {
      const attendance = JSON.parse(attendanceRaw) as {
        room?: unknown;
        students?: unknown;
      };
      if (Array.isArray(attendance.students)) {
        const names = normalizeStudentNames(
          attendance.students.filter((name): name is string => typeof name === "string"),
        );
        if (names.length) {
          return {
            room:
              typeof attendance.room === "string" && attendance.room.trim()
                ? attendance.room.trim()
                : "ห้องเรียนของฉัน",
            names,
          };
        }
      }
    }

    const rosterRaw = window.localStorage.getItem(LEGACY_ROSTER_KEY);
    if (!rosterRaw) return null;
    const roster = JSON.parse(rosterRaw) as unknown;
    if (!Array.isArray(roster)) return null;
    const names = normalizeStudentNames(
      roster.filter((name): name is string => typeof name === "string"),
    );
    return names.length ? { room: "ห้องเรียนของฉัน", names } : null;
  } catch {
    return null;
  }
}

/**
 * Loads the local multi-classroom store. The first load migrates the previous
 * single roster/attendance list into one classroom. Nothing leaves this
 * browser; cloud sync is intentionally opt-in work for a later phase.
 */
export function loadClassroomStore(): ClassroomStore {
  if (typeof window === "undefined") return EMPTY_CLASSROOM_STORE;
  try {
    const raw = window.localStorage.getItem(CLASSROOMS_STORAGE_KEY);
    if (raw) {
      const parsed = sanitizeClassroomStore(JSON.parse(raw));
      if (parsed) return parsed;
    }
  } catch {
    // Fall through to the legacy migration.
  }

  const legacy = parseLegacyRoster();
  if (!legacy) return EMPTY_CLASSROOM_STORE;
  const now = Date.now();
  const classroom: Classroom = {
    id: createLocalId("class"),
    name: legacy.room.slice(0, 80),
    students: studentsFromNames(legacy.names),
    createdAt: now,
    updatedAt: now,
  };
  const migrated: ClassroomStore = {
    version: 1,
    activeClassroomId: classroom.id,
    classrooms: [classroom],
  };
  saveClassroomStore(migrated);
  return migrated;
}

/**
 * Names of the classroom the teacher used last, for tools that seed their
 * working list from the shared roster. This is the only supported way to read
 * the roster outside the classrooms UI — the old `khuncool.roster` key is now
 * read once by the migration above and never written again.
 */
export function loadActiveRosterNames(): string[] {
  const store = loadClassroomStore();
  const active =
    store.classrooms.find(
      (classroom) => classroom.id === store.activeClassroomId,
    ) ?? store.classrooms[0];
  return active ? active.students.map((student) => student.name) : [];
}

export function saveClassroomStore(store: ClassroomStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLASSROOMS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Private browsing/storage quota: the in-memory state still works.
  }
}
