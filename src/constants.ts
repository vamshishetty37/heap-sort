/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const BRANCHES = [
  { code: 'CS', name: 'Computer Science' },
  { code: 'IS', name: 'Information Science' },
  { code: 'EC', name: 'Electronics & Communication' },
  { code: 'ME', name: 'Mechanical Engineering' },
  { code: 'CV', name: 'Civil Engineering' },
  { code: 'EE', name: 'Electrical & Electronics' },
  { code: 'AI', name: 'Artificial Intelligence' },
  { code: 'DS', name: 'Data Science' },
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const INITIAL_STUDENTS = [
  { id: '1', usn: '1RV21CS001', name: 'Aarav Sharma', branch: 'CS', semester: 4, cgpa: 9.1, registeredCourses: ['21CS42', '21CS44'] },
  { id: '2', usn: '1BY21EC045', name: 'Ishita Patel', branch: 'EC', semester: 4, cgpa: 8.5, registeredCourses: ['21EC44'] },
  { id: '3', usn: '1MS22IS012', name: 'Rohan Gupta', branch: 'IS', semester: 2, cgpa: 7.9, registeredCourses: [] },
  { id: '4', usn: '1BM20ME088', name: 'Ananya Rao', branch: 'ME', semester: 6, cgpa: 8.2, registeredCourses: [] },
  { id: '5', usn: '1RV21CS099', name: 'Vivek Kumar', branch: 'CS', semester: 4, cgpa: 9.5, registeredCourses: ['21CS42'] },
];

export const INITIAL_EXAMS = [
  { id: '1', subjectCode: '21CS42', subjectName: 'Design & Analysis of Algorithms', date: '2024-06-15', time: '09:30 AM', duration: '3 Hours', hall: 'LH-101', branch: 'CS', semester: 4 },
  { id: '2', subjectCode: '21EC44', subjectName: 'Control Systems', date: '2024-06-18', time: '02:00 PM', duration: '3 Hours', hall: 'LH-202', branch: 'EC', semester: 4 },
  { id: '3', subjectCode: '21IS43', subjectName: 'Operating Systems', date: '2024-06-20', time: '09:30 AM', duration: '3 Hours', hall: 'LH-305', branch: 'IS', semester: 4 },
];

export const COURSES = [
  { id: '1', code: '21CS42', name: 'Design & Analysis of Algorithms', credits: 4, semester: 4, branch: 'CS' },
  { id: '2', code: '21CS44', name: 'Microcontrollers & Embedded Systems', credits: 3, semester: 4, branch: 'CS' },
  { id: '3', code: '21EC44', name: 'Control Systems', credits: 4, semester: 4, branch: 'EC' },
  { id: '4', code: '21IS43', name: 'Operating Systems', credits: 3, semester: 4, branch: 'IS' },
  { id: '5', code: '21MAT41', name: 'Discrete Mathematical Structures', credits: 3, semester: 4, branch: 'CS' },
];
