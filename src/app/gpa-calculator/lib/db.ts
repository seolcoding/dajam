import Dexie, { type Table } from 'dexie';
import type { Semester, Course } from '../types';

/**
 * GPA Calculator Database
 */
export class GPADatabase extends Dexie {
  semesters!: Table<Semester, string>;

  constructor() {
    super('GPACalculator');

    this.version(1).stores({
      semesters: 'id, year, term, name'
    });
  }
}

export const db = new GPADatabase();

/**
 * CRUD Helper Functions
 */

// 학기 추가
export async function addSemester(semester: Semester): Promise<string> {
  return await db.semesters.add(semester);
}

// 학기 수정
export async function updateSemester(id: string, updates: Partial<Semester>): Promise<number> {
  return await db.semesters.update(id, updates);
}

// 학기 삭제
export async function deleteSemester(id: string): Promise<void> {
  await db.semesters.delete(id);
}

// 전체 학기 목록 가져오기 (최신순)
export async function getAllSemesters(): Promise<Semester[]> {
  return await db.semesters.orderBy('year').reverse().toArray();
}

// 특정 학기 가져오기
export async function getSemester(id: string): Promise<Semester | undefined> {
  return await db.semesters.get(id);
}

// 학기에 과목 추가
export async function addCourseToSemester(semesterId: string, course: Course): Promise<void> {
  const semester = await db.semesters.get(semesterId);
  if (semester) {
    semester.courses.push(course);
    await db.semesters.put(semester);
  }
}

// 학기에서 과목 삭제
export async function deleteCourseFromSemester(semesterId: string, courseId: string): Promise<void> {
  const semester = await db.semesters.get(semesterId);
  if (semester) {
    semester.courses = semester.courses.filter(c => c.id !== courseId);
    await db.semesters.put(semester);
  }
}

// 과목 수정
export async function updateCourse(semesterId: string, courseId: string, updates: Partial<Course>): Promise<void> {
  const semester = await db.semesters.get(semesterId);
  if (semester) {
    const courseIndex = semester.courses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      semester.courses[courseIndex] = { ...semester.courses[courseIndex], ...updates };
      await db.semesters.put(semester);
    }
  }
}

// 전체 데이터 초기화
export async function clearAllData(): Promise<void> {
  await db.semesters.clear();
}

// 데이터베이스 내보내기 (백업용)
export async function exportDatabase(): Promise<Semester[]> {
  return await db.semesters.toArray();
}

// 데이터베이스 가져오기 (복원용)
export async function importDatabase(semesters: Semester[]): Promise<void> {
  await db.semesters.bulkPut(semesters);
}
