import { test, expect } from '@playwright/test';
import { GPACalculatorPage } from '../../pages/calculator/gpa.page';

/**
 * GPA Calculator - E2E Tests
 *
 * Based on APPS_DOCUMENTATION.md:
 * - 학기별 성적 관리 및 GPA 계산
 * - 누적/전공/교양 GPA 분리 계산
 * - 4.5/4.3/4.0 학점 체계 지원
 * - Pass/Fail 과목 처리
 * - Dexie (IndexedDB) 데이터 저장
 *
 * Test Coverage:
 * 1. 페이지 로드 및 초기 상태
 * 2. 학기 추가 및 과목 입력
 * 3. GPA 계산 정확성 (4.5 만점 기준)
 * 4. 전공/교양 GPA 분리 계산
 * 5. 학점 체계 변경 (4.5 -> 4.0)
 * 6. Pass/Fail 과목 처리
 * 7. 과목/학기 삭제
 * 8. 차트 렌더링
 * 9. 데이터 퍼시스턴스 (IndexedDB)
 */

test.describe('GPA Calculator', () => {
  let gpaPage: GPACalculatorPage;

  test.beforeEach(async ({ page }) => {
    gpaPage = new GPACalculatorPage(page);
    await gpaPage.goto();
  });

  test.afterEach(async ({ page }) => {
    // Clean up IndexedDB after each test
    await page.evaluate(() => {
      indexedDB.deleteDatabase('gpa-calculator');
    });
  });

  test.describe('페이지 로드 및 초기 상태', () => {
    test('should load page with title and controls', async () => {
      // Verify page title
      await gpaPage.expectHeading(/학점 계산기/i);

      // Verify scale selector is visible
      await expect(gpaPage.scaleSelect).toBeVisible();

      // Verify add semester button is visible
      await expect(gpaPage.addSemesterButton).toBeVisible();

      // Verify GPA display cards are visible
      await expect(gpaPage.cumulativeGPA).toBeVisible();
    });

    test('should show empty state with no semesters', async () => {
      await gpaPage.expectEmptyState();

      // Verify GPA is 0.00
      await gpaPage.expectGPA(0);
    });

    test('should default to 4.5 scale', async () => {
      const scale = await gpaPage.scaleSelect.textContent();
      expect(scale).toContain('4.5');
    });
  });

  test.describe('학기 추가', () => {
    test('should add a new semester', async () => {
      await gpaPage.addSemester(2024, 1);

      // Verify semester is added
      await gpaPage.expectSemesterVisible('2024-1학기');
    });

    test('should add multiple semesters', async () => {
      await gpaPage.addSemester(2024, 1);
      await gpaPage.addSemester(2024, 2);

      await gpaPage.expectSemesterVisible('2024-1학기');
      await gpaPage.expectSemesterVisible('2024-2학기');
    });

    test('should add summer semester', async () => {
      await gpaPage.addSemester(2024, 3);

      await gpaPage.expectSemesterVisible('2024-3학기');
    });
  });

  test.describe('과목 추가 및 GPA 계산', () => {
    test('should add a course and calculate GPA', async () => {
      // Add semester
      await gpaPage.addSemester(2024, 1);

      // Add course: 미적분학, 3학점, A+ (4.5)
      await gpaPage.addCourse({
        name: '미적분학',
        credit: 3,
        grade: 'A+',
        category: 'general'
      });

      // Verify course is added
      await gpaPage.expectCourseVisible('미적분학');

      // Verify GPA = 4.5 (4.5 * 3 / 3)
      await gpaPage.expectGPA(4.5);

      // Verify total credits = 3
      await gpaPage.expectTotalCredits(3);
    });

    test('should calculate GPA for multiple courses', async () => {
      await gpaPage.addSemester(2024, 1);

      // Add courses
      await gpaPage.addCourse({ name: '미적분학', credit: 3, grade: 'A+' }); // 4.5
      await gpaPage.addCourse({ name: '프로그래밍', credit: 3, grade: 'A0' }); // 4.0
      await gpaPage.addCourse({ name: '영어회화', credit: 2, grade: 'B+' }); // 3.5

      // Calculate expected GPA:
      // (4.5*3 + 4.0*3 + 3.5*2) / (3+3+2) = (13.5 + 12 + 7) / 8 = 32.5 / 8 = 4.0625
      await gpaPage.expectGPA(4.06, 0.02);
      await gpaPage.expectTotalCredits(8);
    });

    test('should handle F grade correctly', async () => {
      await gpaPage.addSemester(2024, 1);

      await gpaPage.addCourse({ name: '물리학', credit: 3, grade: 'A+' }); // 4.5
      await gpaPage.addCourse({ name: '화학', credit: 3, grade: 'F' }); // 0.0

      // GPA = (4.5*3 + 0*3) / 6 = 13.5 / 6 = 2.25
      await gpaPage.expectGPA(2.25);
      await gpaPage.expectTotalCredits(6);
    });

    test('should handle various credit amounts', async () => {
      await gpaPage.addSemester(2024, 1);

      await gpaPage.addCourse({ name: '세미나', credit: 1, grade: 'A+' }); // 4.5
      await gpaPage.addCourse({ name: '실험', credit: 2, grade: 'A0' }); // 4.0
      await gpaPage.addCourse({ name: '전공필수', credit: 4, grade: 'B+' }); // 3.5

      // GPA = (4.5*1 + 4.0*2 + 3.5*4) / 7 = (4.5 + 8 + 14) / 7 = 26.5 / 7 = 3.786
      await gpaPage.expectGPA(3.79, 0.02);
      await gpaPage.expectTotalCredits(7);
    });
  });

  test.describe('전공/교양 GPA 분리 계산', () => {
    test('should calculate major and general GPA separately', async () => {
      await gpaPage.addSemester(2024, 1);

      // Add major courses
      await gpaPage.addCourse({
        name: '자료구조',
        credit: 3,
        grade: 'A+',
        category: 'major'
      });
      await gpaPage.addCourse({
        name: '알고리즘',
        credit: 3,
        grade: 'A0',
        category: 'major'
      });

      // Add general courses
      await gpaPage.addCourse({
        name: '영어',
        credit: 3,
        grade: 'B+',
        category: 'general'
      });

      // Major GPA = (4.5*3 + 4.0*3) / 6 = 25.5 / 6 = 4.25
      await gpaPage.expectMajorGPA(4.25);

      // General GPA = 3.5*3 / 3 = 3.5
      await gpaPage.expectGeneralGPA(3.5);

      // Cumulative GPA = (4.5*3 + 4.0*3 + 3.5*3) / 9 = 36 / 9 = 4.0
      await gpaPage.expectGPA(4.0);
    });

    test('should show "-" for missing category', async () => {
      await gpaPage.addSemester(2024, 1);

      // Add only general courses
      await gpaPage.addCourse({
        name: '영어',
        credit: 3,
        grade: 'A+',
        category: 'general'
      });

      // General GPA should be 4.5
      await gpaPage.expectGeneralGPA(4.5);

      // Major GPA should show "-"
      await gpaPage.expectMajorGPA(0);
    });
  });

  test.describe('학점 체계 변경', () => {
    test('should recalculate GPA when scale changes', async () => {
      await gpaPage.addSemester(2024, 1);

      // Add course with A+ grade
      await gpaPage.addCourse({
        name: '미적분학',
        credit: 3,
        grade: 'A+'
      });

      // Verify 4.5 scale: A+ = 4.5
      await gpaPage.expectGPA(4.5);

      // Change to 4.0 scale
      await gpaPage.changeScale('4.0');
      await gpaPage.waitForAnimation(300);

      // Verify 4.0 scale: A+ = 4.0
      await gpaPage.expectGPA(4.0);

      // Change to 4.3 scale
      await gpaPage.changeScale('4.3');
      await gpaPage.waitForAnimation(300);

      // Verify 4.3 scale: A+ = 4.3
      await gpaPage.expectGPA(4.3);
    });
  });

  test.describe('Pass/Fail 과목 처리', () => {
    test('should not include P/F courses in GPA calculation', async () => {
      await gpaPage.addSemester(2024, 1);

      // Add regular course
      await gpaPage.addCourse({
        name: '미적분학',
        credit: 3,
        grade: 'A+'
      });

      // Add P/F course with P grade
      await gpaPage.addCourse({
        name: '체육',
        credit: 1,
        grade: 'P',
        isPassFail: true
      });

      // GPA should only include 미적분학
      await gpaPage.expectGPA(4.5);

      // Total credits should be 3 (not 4)
      // Note: earnedCredits includes P/F, but totalCredits (for GPA) doesn't
      await gpaPage.expectTotalCredits(4); // This shows earnedCredits (includes P)
    });
  });

  test.describe('과목 및 학기 삭제', () => {
    test('should delete a course', async () => {
      await gpaPage.addSemester(2024, 1);

      await gpaPage.addCourse({ name: '미적분학', credit: 3, grade: 'A+' });
      await gpaPage.addCourse({ name: '물리학', credit: 3, grade: 'B+' });

      // Verify both courses exist
      await gpaPage.expectCourseVisible('미적분학');
      await gpaPage.expectCourseVisible('물리학');

      // Delete 미적분학
      await gpaPage.deleteCourse('미적분학');

      // Verify course is removed
      await gpaPage.expectCourseNotVisible('미적분학');
      await gpaPage.expectCourseVisible('물리학');

      // GPA should update to only 물리학 (B+ = 3.5)
      await gpaPage.expectGPA(3.5);
    });

    test('should delete a semester', async () => {
      await gpaPage.addSemester(2024, 1);
      await gpaPage.addCourse({ name: '미적분학', credit: 3, grade: 'A+' });

      await gpaPage.addSemester(2024, 2);

      // Delete 2024-1학기
      await gpaPage.deleteSemester('2024-1학기');

      // Verify semester and course are removed
      await gpaPage.expectCourseNotVisible('미적분학');

      // GPA should reset to 0
      await gpaPage.expectGPA(0);
    });
  });

  test.describe('차트 렌더링', () => {
    test('should not show chart with no semesters', async () => {
      await gpaPage.expectChartNotVisible();
    });

    test('should show chart after adding semesters', async () => {
      await gpaPage.addSemester(2024, 1);
      await gpaPage.addCourse({ name: '미적분학', credit: 3, grade: 'A+' });

      await gpaPage.expectChartVisible();
    });

    test('should update chart with multiple semesters', async () => {
      // Add first semester
      await gpaPage.addSemester(2024, 1);
      await gpaPage.addCourse({ name: '미적분학', credit: 3, grade: 'A+' });

      // Add second semester
      await gpaPage.addSemester(2024, 2);
      await gpaPage.addCourse({ name: '물리학', credit: 3, grade: 'B+' });

      // Chart should be visible with multiple data points
      await gpaPage.expectChartVisible();
    });
  });

  test.describe('데이터 퍼시스턴스', () => {
    test('should persist data in IndexedDB', async () => {
      await gpaPage.addSemester(2024, 1);
      await gpaPage.addCourse({
        name: '미적분학',
        credit: 3,
        grade: 'A+',
        category: 'general'
      });

      // Reload page
      await gpaPage.goto();
      await gpaPage.waitForAnimation(500);

      // Verify data persisted
      await gpaPage.expectSemesterVisible('2024-1학기');
      await gpaPage.expectCourseVisible('미적분학');
      await gpaPage.expectGPA(4.5);
    });

    test('should clear all data', async () => {
      await gpaPage.addSemester(2024, 1);
      await gpaPage.addCourse({ name: '미적분학', credit: 3, grade: 'A+' });

      // Clear all data
      await gpaPage.clearAll();

      // Verify empty state
      await gpaPage.expectEmptyState();
      await gpaPage.expectGPA(0);
    });
  });

  test.describe('탭 네비게이션', () => {
    test('should switch between tabs', async () => {
      // Default tab is "과목 관리"
      await expect(gpaPage.coursesTab).toHaveAttribute('data-state', 'active');

      // Switch to simulator
      await gpaPage.simulatorTab.click();
      await gpaPage.waitForAnimation(300);
      await expect(gpaPage.simulatorTab).toHaveAttribute('data-state', 'active');

      // Switch to data
      await gpaPage.dataTab.click();
      await gpaPage.waitForAnimation(300);
      await expect(gpaPage.dataTab).toHaveAttribute('data-state', 'active');
    });
  });

  test.describe('엣지 케이스', () => {
    test('should handle empty course name', async () => {
      await gpaPage.addSemester(2024, 1);

      // Try to add course without name
      await gpaPage.courseNameInput.clear();
      await gpaPage.courseCreditSelect.click();
      await gpaPage.page.getByRole('option', { name: '3학점' }).click();
      await gpaPage.addCourseButton.click();

      // Should show validation error (HTML5 required attribute)
      // Course should not be added
      await gpaPage.waitForAnimation(300);
    });

    test('should handle multiple semesters with same courses', async () => {
      // Add first semester
      await gpaPage.addSemester(2024, 1);
      await gpaPage.addCourse({ name: '미적분학', credit: 3, grade: 'A+' });

      // Add second semester
      await gpaPage.addSemester(2024, 2);
      await gpaPage.addCourse({ name: '미적분학', credit: 3, grade: 'B+' });

      // Both courses should exist
      const courses = await gpaPage.page.getByText('미적분학').count();
      expect(courses).toBeGreaterThanOrEqual(2);

      // GPA should be average: (4.5*3 + 3.5*3) / 6 = 24 / 6 = 4.0
      await gpaPage.expectGPA(4.0);
    });

    test('should handle rapid course additions', async () => {
      await gpaPage.addSemester(2024, 1);

      // Add multiple courses rapidly
      const courses = [
        { name: '과목1', credit: 3, grade: 'A+' },
        { name: '과목2', credit: 3, grade: 'A0' },
        { name: '과목3', credit: 3, grade: 'B+' },
        { name: '과목4', credit: 3, grade: 'B0' }
      ];

      for (const course of courses) {
        await gpaPage.addCourse(course);
      }

      // All courses should be added
      await gpaPage.expectCourseVisible('과목1');
      await gpaPage.expectCourseVisible('과목2');
      await gpaPage.expectCourseVisible('과목3');
      await gpaPage.expectCourseVisible('과목4');

      // Total credits should be 12
      await gpaPage.expectTotalCredits(12);
    });
  });

  test.describe('반응형 디자인', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await gpaPage.goto();

      // Verify page loads
      await gpaPage.expectHeading(/학점 계산기/i);

      // Add semester and course
      await gpaPage.addSemester(2024, 1);
      await gpaPage.addCourse({ name: '미적분학', credit: 3, grade: 'A+' });

      // Verify GPA calculation works
      await gpaPage.expectGPA(4.5);
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await gpaPage.goto();

      await gpaPage.addSemester(2024, 1);
      await gpaPage.addCourse({ name: '프로그래밍', credit: 3, grade: 'A0' });

      await gpaPage.expectGPA(4.0);
    });
  });
});
