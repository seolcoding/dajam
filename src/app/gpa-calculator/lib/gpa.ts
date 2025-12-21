import type { Course, Semester, GPAResult, GPAScale, CourseCategory, SimulatorInput } from '../types';
import { getGradePoint } from './gradeSystem';

/**
 * 단일 학기 GPA 계산
 */
export function calculateSemesterGPA(
  courses: Course[],
  scale: GPAScale = '4.5'
): GPAResult {
  // Pass/Fail 과목 제외
  const gradedCourses = courses.filter(c => !c.isPassFail && c.grade !== 'P');

  if (gradedCourses.length === 0) {
    return { gpa: 0, totalCredits: 0, earnedCredits: 0 };
  }

  const totalCredits = gradedCourses.reduce((sum, c) => sum + c.credit, 0);
  const totalPoints = gradedCourses.reduce((sum, c) => {
    return sum + (c.credit * getGradePoint(c.grade, scale));
  }, 0);

  // 실제 이수 학점 (P 포함, F/NP 제외)
  const earnedCredits = courses
    .filter(c => c.grade !== 'F' && c.grade !== 'NP')
    .reduce((sum, c) => sum + c.credit, 0);

  return {
    gpa: parseFloat((totalPoints / totalCredits).toFixed(2)),
    totalCredits,
    earnedCredits
  };
}

/**
 * 누적 GPA 계산
 */
export function calculateCumulativeGPA(
  semesters: Semester[],
  scale: GPAScale = '4.5'
): GPAResult {
  let totalPoints = 0;
  let totalCredits = 0;
  let earnedCredits = 0;

  semesters.forEach(sem => {
    const gradedCourses = sem.courses.filter(c => !c.isPassFail && c.grade !== 'P');

    gradedCourses.forEach(course => {
      totalPoints += course.credit * getGradePoint(course.grade, scale);
      totalCredits += course.credit;
    });

    // P 포함, F/NP 제외
    earnedCredits += sem.courses
      .filter(c => c.grade !== 'F' && c.grade !== 'NP')
      .reduce((sum, c) => sum + c.credit, 0);
  });

  return {
    gpa: totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0,
    totalCredits,
    earnedCredits
  };
}

/**
 * 전공/교양별 GPA 계산
 */
export function calculateCategoryGPA(
  semesters: Semester[],
  category: CourseCategory,
  scale: GPAScale = '4.5'
): GPAResult {
  const categoryCourses = semesters.flatMap(sem =>
    sem.courses.filter(c => c.category === category)
  );

  return calculateSemesterGPA(categoryCourses, scale);
}

/**
 * 목표 학점 시뮬레이터
 */
export function calculateRequiredGPA(input: SimulatorInput): {
  requiredGPA: number;
  isAchievable: boolean;
  message: string;
} {
  const { currentGPA, currentCredits, targetGPA, remainingCredits } = input;

  const currentPoints = currentGPA * currentCredits;
  const targetPoints = targetGPA * (currentCredits + remainingCredits);
  const requiredPoints = targetPoints - currentPoints;
  const requiredGPA = requiredPoints / remainingCredits;

  const isAchievable = requiredGPA <= 4.5 && requiredGPA >= 0;

  let message = '';
  if (requiredGPA > 4.5) {
    const maxAchievable = ((currentPoints + 4.5 * remainingCredits) / (currentCredits + remainingCredits)).toFixed(2);
    message = `목표 달성 불가능합니다. 최대 학점을 받아도 ${maxAchievable}까지만 가능합니다.`;
  } else if (requiredGPA < 0) {
    message = '이미 목표를 달성했습니다!';
  } else {
    message = `남은 학기에 평균 ${requiredGPA.toFixed(2)} 이상을 받아야 합니다.`;
  }

  return {
    requiredGPA: parseFloat(requiredGPA.toFixed(2)),
    isAchievable,
    message
  };
}

/**
 * 학점 등급 분포 계산
 */
export function getGradeDistribution(courses: Course[]): Record<string, number> {
  const distribution: Record<string, number> = {};

  courses.forEach(course => {
    const grade = course.grade;
    distribution[grade] = (distribution[grade] || 0) + 1;
  });

  return distribution;
}

/**
 * 전체 과목 목록 추출
 */
export function getAllCourses(semesters: Semester[]): Course[] {
  return semesters.flatMap(sem => sem.courses);
}

/**
 * 학기 GPA 목록 계산
 */
export function calculateSemesterGPAs(
  semesters: Semester[],
  scale: GPAScale = '4.5'
): number[] {
  return semesters.map(sem => calculateSemesterGPA(sem.courses, scale).gpa);
}
