export interface Student {
  id: number;
  registrationId: string;
  rollNumber: string;
  studentName: string;
  fatherName: string;
  class: string;
  level: string;
}

export interface Event {
  id: number;
  createdAt: Date;
  type: string;
  schoolId: number | null;
  schoolName: string | null;
  contestName: string;
  email: string;
  students: Student[] | null;
  studentPrev: string | null;
  description: string;
}
