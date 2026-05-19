/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  branch: string;
}

export interface Student {
  id: string;
  usn: string;
  name: string;
  branch: string;
  semester: number;
  cgpa: number;
  registeredCourses: string[]; // IDs of courses
}

export interface Exam {
  id: string;
  subjectCode: string;
  subjectName: string;
  date: string;
  time: string;
  duration: string;
  hall: string;
  branch: string;
  semester: number;
}

export type SortField = 'usn' | 'name' | 'cgpa' | 'date' | 'semester' | 'code';
