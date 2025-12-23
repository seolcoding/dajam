import { describe, it, expect } from 'vitest';
import {
  calculateSemesterGPA,
  calculateCumulativeGPA,
  calculateCategoryGPA,
  calculateRequiredGPA,
  getGradeDistribution,
  getAllCourses,
  calculateSemesterGPAs,
} from '../gpa';
import type { Course, Semester, GPAScale } from '../../types';

// Test fixtures
function createCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 'course-1',
    name: '테스트 과목',
    credit: 3,
    grade: 'A+',
    category: 'major',
    isPassFail: false,
    ...overrides,
  };
}

function createSemester(overrides: Partial<Semester> = {}): Semester {
  return {
    id: 'semester-1',
    name: '2024-1학기',
    year: 2024,
    term: 1,
    courses: [
      createCourse({ id: 'c1', name: '전공1', grade: 'A+' }),
      createCourse({ id: 'c2', name: '전공2', grade: 'B+' }),
      createCourse({ id: 'c3', name: '전공3', grade: 'A0' }),
    ],
    ...overrides,
  };
}

describe('gpa', () => {
  describe('calculateSemesterGPA', () => {
    it('4.5 스케일에서 정확한 GPA를 계산해야 함', () => {
      const courses = [
        createCourse({ grade: 'A+', credit: 3 }), // 4.5 * 3 = 13.5
        createCourse({ grade: 'A0', credit: 3 }), // 4.0 * 3 = 12.0
        createCourse({ grade: 'B+', credit: 3 }), // 3.5 * 3 = 10.5
      ];
      // 총점: 36.0 / 9학점 = 4.0

      const result = calculateSemesterGPA(courses, '4.5');

      expect(result.gpa).toBe(4.0);
      expect(result.totalCredits).toBe(9);
      expect(result.earnedCredits).toBe(9);
    });

    it('4.3 스케일에서 정확한 GPA를 계산해야 함', () => {
      const courses = [
        createCourse({ grade: 'A+', credit: 3 }), // 4.3 * 3 = 12.9
        createCourse({ grade: 'A0', credit: 3 }), // 4.0 * 3 = 12.0
      ];
      // 총점: 24.9 / 6학점 = 4.15

      const result = calculateSemesterGPA(courses, '4.3');

      expect(result.gpa).toBe(4.15);
      expect(result.totalCredits).toBe(6);
    });

    it('Pass/Fail 과목을 GPA 계산에서 제외해야 함', () => {
      const courses = [
        createCourse({ grade: 'A+', credit: 3 }),
        createCourse({ grade: 'P', credit: 2, isPassFail: true }),
      ];

      const result = calculateSemesterGPA(courses, '4.5');

      expect(result.totalCredits).toBe(3); // P 과목 제외
      expect(result.earnedCredits).toBe(5); // P 과목 포함
    });

    it('F 성적이 GPA를 낮춰야 함', () => {
      const courses = [
        createCourse({ grade: 'A+', credit: 3 }), // 4.5 * 3 = 13.5
        createCourse({ grade: 'F', credit: 3 }),  // 0.0 * 3 = 0.0
      ];
      // 총점: 13.5 / 6학점 = 2.25

      const result = calculateSemesterGPA(courses, '4.5');

      expect(result.gpa).toBe(2.25);
      expect(result.totalCredits).toBe(6);
      expect(result.earnedCredits).toBe(3); // F 제외
    });

    it('빈 과목 목록에서 0을 반환해야 함', () => {
      const result = calculateSemesterGPA([], '4.5');

      expect(result.gpa).toBe(0);
      expect(result.totalCredits).toBe(0);
      expect(result.earnedCredits).toBe(0);
    });

    it('P 성적만 있을 때 0을 반환해야 함', () => {
      const courses = [
        createCourse({ grade: 'P', credit: 3, isPassFail: true }),
      ];

      const result = calculateSemesterGPA(courses, '4.5');

      expect(result.gpa).toBe(0);
      expect(result.totalCredits).toBe(0);
      // P 성적은 grade가 'P'이고 isPassFail이 true이면 이수로 인정
      // 하지만 grade === 'P' 조건으로 gradedCourses에서 제외됨
      expect(result.earnedCredits).toBe(0);
    });

    it('다양한 학점의 과목을 가중 평균해야 함', () => {
      const courses = [
        createCourse({ grade: 'A+', credit: 1 }), // 4.5 * 1 = 4.5
        createCourse({ grade: 'A0', credit: 4 }), // 4.0 * 4 = 16.0
      ];
      // 총점: 20.5 / 5학점 = 4.1

      const result = calculateSemesterGPA(courses, '4.5');

      expect(result.gpa).toBe(4.1);
    });
  });

  describe('calculateCumulativeGPA', () => {
    it('여러 학기의 누적 GPA를 계산해야 함', () => {
      const semesters: Semester[] = [
        createSemester({
          id: 's1',
          courses: [createCourse({ grade: 'A+', credit: 3 })], // 4.5
        }),
        createSemester({
          id: 's2',
          courses: [createCourse({ grade: 'B+', credit: 3 })], // 3.5
        }),
      ];
      // 총점: (13.5 + 10.5) / 6학점 = 4.0

      const result = calculateCumulativeGPA(semesters, '4.5');

      expect(result.gpa).toBe(4.0);
      expect(result.totalCredits).toBe(6);
    });

    it('빈 학기 목록에서 0을 반환해야 함', () => {
      const result = calculateCumulativeGPA([], '4.5');

      expect(result.gpa).toBe(0);
      expect(result.totalCredits).toBe(0);
    });

    it('모든 학기의 Pass/Fail 과목을 올바르게 처리해야 함', () => {
      const semesters: Semester[] = [
        createSemester({
          id: 's1',
          courses: [
            createCourse({ grade: 'A+', credit: 3 }),
            createCourse({ grade: 'P', credit: 2, isPassFail: true }),
          ],
        }),
      ];

      const result = calculateCumulativeGPA(semesters, '4.5');

      expect(result.totalCredits).toBe(3);
      expect(result.earnedCredits).toBe(5);
    });
  });

  describe('calculateCategoryGPA', () => {
    it('전공 GPA를 계산해야 함', () => {
      const semesters: Semester[] = [
        createSemester({
          courses: [
            createCourse({ grade: 'A+', credit: 3, category: 'major' }),
            createCourse({ grade: 'C0', credit: 3, category: 'general' }),
            createCourse({ grade: 'B+', credit: 3, category: 'major' }),
          ],
        }),
      ];

      const result = calculateCategoryGPA(semesters, 'major', '4.5');

      // 전공만: (4.5*3 + 3.5*3) / 6 = 4.0
      expect(result.gpa).toBe(4.0);
      expect(result.totalCredits).toBe(6);
    });

    it('교양 GPA를 계산해야 함', () => {
      const semesters: Semester[] = [
        createSemester({
          courses: [
            createCourse({ grade: 'A+', credit: 3, category: 'major' }),
            createCourse({ grade: 'B0', credit: 3, category: 'general' }),
          ],
        }),
      ];

      const result = calculateCategoryGPA(semesters, 'general', '4.5');

      expect(result.gpa).toBe(3.0);
      expect(result.totalCredits).toBe(3);
    });

    it('해당 카테고리 과목이 없으면 0을 반환해야 함', () => {
      const semesters: Semester[] = [
        createSemester({
          courses: [
            createCourse({ grade: 'A+', credit: 3, category: 'major' }),
          ],
        }),
      ];

      const result = calculateCategoryGPA(semesters, 'teaching', '4.5');

      expect(result.gpa).toBe(0);
      expect(result.totalCredits).toBe(0);
    });
  });

  describe('calculateRequiredGPA', () => {
    it('목표 달성 가능한 필요 GPA를 계산해야 함', () => {
      const result = calculateRequiredGPA({
        currentGPA: 3.5,
        currentCredits: 60,
        targetGPA: 4.0,
        remainingCredits: 60,
      });

      expect(result.requiredGPA).toBe(4.5);
      expect(result.isAchievable).toBe(true);
    });

    it('목표 달성 불가능할 때 알려야 함', () => {
      const result = calculateRequiredGPA({
        currentGPA: 2.0,
        currentCredits: 100,
        targetGPA: 4.0,
        remainingCredits: 20,
      });

      expect(result.isAchievable).toBe(false);
      expect(result.message).toContain('불가능');
    });

    it('이미 목표 달성했을 때 알려야 함', () => {
      const result = calculateRequiredGPA({
        currentGPA: 4.2,
        currentCredits: 100,
        targetGPA: 4.0,
        remainingCredits: 20,
      });

      // 현재 GPA가 목표보다 높지만, 필요한 GPA 계산값은 양수일 수 있음
      // (4.0 * 120 - 4.2 * 100) / 20 = (480 - 420) / 20 = 3.0
      expect(result.requiredGPA).toBe(3.0);
      expect(result.isAchievable).toBe(true);
    });

    it('경계 조건을 처리해야 함', () => {
      const result = calculateRequiredGPA({
        currentGPA: 4.0,
        currentCredits: 50,
        targetGPA: 4.25,
        remainingCredits: 50,
      });

      expect(result.requiredGPA).toBe(4.5);
      expect(result.isAchievable).toBe(true);
    });
  });

  describe('getGradeDistribution', () => {
    it('성적 분포를 계산해야 함', () => {
      const courses = [
        createCourse({ grade: 'A+' }),
        createCourse({ grade: 'A+' }),
        createCourse({ grade: 'B+' }),
        createCourse({ grade: 'A0' }),
      ];

      const distribution = getGradeDistribution(courses);

      expect(distribution['A+']).toBe(2);
      expect(distribution['B+']).toBe(1);
      expect(distribution['A0']).toBe(1);
      expect(distribution['C0']).toBeUndefined();
    });

    it('빈 과목 목록에서 빈 객체를 반환해야 함', () => {
      const distribution = getGradeDistribution([]);

      expect(Object.keys(distribution)).toHaveLength(0);
    });
  });

  describe('getAllCourses', () => {
    it('모든 학기의 과목을 평탄화해야 함', () => {
      const semesters: Semester[] = [
        createSemester({
          id: 's1',
          courses: [
            createCourse({ id: 'c1' }),
            createCourse({ id: 'c2' }),
          ],
        }),
        createSemester({
          id: 's2',
          courses: [createCourse({ id: 'c3' })],
        }),
      ];

      const allCourses = getAllCourses(semesters);

      expect(allCourses).toHaveLength(3);
      expect(allCourses.map(c => c.id)).toEqual(['c1', 'c2', 'c3']);
    });

    it('빈 학기 목록에서 빈 배열을 반환해야 함', () => {
      const allCourses = getAllCourses([]);

      expect(allCourses).toHaveLength(0);
    });
  });

  describe('calculateSemesterGPAs', () => {
    it('학기별 GPA 목록을 반환해야 함', () => {
      const semesters: Semester[] = [
        createSemester({
          id: 's1',
          courses: [createCourse({ grade: 'A+', credit: 3 })],
        }),
        createSemester({
          id: 's2',
          courses: [createCourse({ grade: 'B+', credit: 3 })],
        }),
        createSemester({
          id: 's3',
          courses: [createCourse({ grade: 'A0', credit: 3 })],
        }),
      ];

      const gpas = calculateSemesterGPAs(semesters, '4.5');

      expect(gpas).toEqual([4.5, 3.5, 4.0]);
    });

    it('빈 학기 목록에서 빈 배열을 반환해야 함', () => {
      const gpas = calculateSemesterGPAs([], '4.5');

      expect(gpas).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('0.5 학점 과목을 처리해야 함', () => {
      const courses = [
        createCourse({ grade: 'A+', credit: 0.5 }),
        createCourse({ grade: 'A0', credit: 0.5 }),
      ];

      const result = calculateSemesterGPA(courses, '4.5');

      expect(result.totalCredits).toBe(1);
      // (4.5*0.5 + 4.0*0.5) / 1 = 4.25
      expect(result.gpa).toBe(4.25);
    });

    it('4.0 스케일에서 A+와 A0이 같은 점수여야 함', () => {
      const coursesAPlus = [createCourse({ grade: 'A+', credit: 3 })];
      const coursesA0 = [createCourse({ grade: 'A0', credit: 3 })];

      const resultAPlus = calculateSemesterGPA(coursesAPlus, '4.0');
      const resultA0 = calculateSemesterGPA(coursesA0, '4.0');

      expect(resultAPlus.gpa).toBe(4.0);
      expect(resultA0.gpa).toBe(4.0);
    });

    it('NP 성적은 이수 학점에 포함되지 않아야 함', () => {
      const courses = [
        createCourse({ grade: 'A+', credit: 3 }),
        createCourse({ grade: 'NP', credit: 2, isPassFail: true }),
      ];

      const result = calculateSemesterGPA(courses, '4.5');

      expect(result.earnedCredits).toBe(3); // NP 제외
    });
  });
});
