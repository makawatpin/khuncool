export type ClassroomStudent = {
  id: string;
  name: string;
};

export type Classroom = {
  id: string;
  name: string;
  students: ClassroomStudent[];
  createdAt: number;
  updatedAt: number;
};

export type ClassroomStore = {
  version: 1;
  activeClassroomId: string | null;
  classrooms: Classroom[];
};

export type ClassroomRoster = {
  id: string;
  name: string;
  studentNames: string[];
};
