import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * GPA Calculator Page Object
 *
 * 테스트 시나리오:
 * - 학기 추가 및 과목 입력
 * - GPA 계산 정확성 검증
 * - 전공/교양 GPA 분리 계산
 * - 차트 렌더링 확인
 * - Pass/Fail 과목 처리
 */
export class GPACalculatorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - 학점 체계
  get scaleSelect() {
    return this.page.locator('#scale-select');
  }

  // Locators - 학기 관리
  get addSemesterButton() {
    return this.page.getByRole('button', { name: /학기 추가/i });
  }

  get semesterYearInput() {
    return this.page.locator('#year');
  }

  get semesterTermSelect() {
    return this.page.locator('#term');
  }

  get semesterSubmitButton() {
    return this.page.getByRole('button', { name: '추가' });
  }

  get semesterSelector() {
    return this.page.locator('select').filter({ hasText: /2024|2023|학기/ }).first();
  }

  // Locators - 과목 입력
  get courseNameInput() {
    return this.page.locator('#course-name');
  }

  get courseCreditSelect() {
    return this.page.locator('#course-credit');
  }

  get courseGradeSelect() {
    return this.page.locator('#course-grade');
  }

  get courseCategorySelect() {
    return this.page.locator('#course-category');
  }

  get passFailSwitch() {
    return this.page.locator('#pass-fail');
  }

  get addCourseButton() {
    return this.page.getByRole('button', { name: /과목 추가/i });
  }

  // Locators - GPA 결과
  get cumulativeGPA() {
    return this.page.locator('.text-blue-600.text-3xl').first();
  }

  get majorGPA() {
    return this.page.locator('.text-3xl').nth(1);
  }

  get generalGPA() {
    return this.page.locator('.text-3xl').nth(2);
  }

  get totalCreditsDisplay() {
    return this.page.getByText(/총.*학점 이수/i).first();
  }

  // Locators - 차트
  get chart() {
    return this.page.locator('.recharts-wrapper, svg.recharts-surface').first();
  }

  // Locators - 탭
  get coursesTab() {
    return this.page.getByRole('tab', { name: /과목 관리/i });
  }

  get simulatorTab() {
    return this.page.getByRole('tab', { name: /목표 학점/i });
  }

  get dataTab() {
    return this.page.getByRole('tab', { name: /데이터/i });
  }

  // Actions
  async goto() {
    await super.goto('/gpa-calculator');
  }

  /**
   * 학기 추가
   */
  async addSemester(year: number, term: 1 | 2 | 3) {
    await this.addSemesterButton.click();
    await this.waitForAnimation(300);

    // Wait for dialog to be visible
    await this.semesterYearInput.waitFor({ state: 'visible' });

    // Enter year
    await this.semesterYearInput.clear();
    await this.semesterYearInput.fill(year.toString());

    // Select term
    await this.semesterTermSelect.click();
    await this.page.getByRole('option', { name: term === 1 ? '1학기' : term === 2 ? '2학기' : '계절학기' }).click();

    // Submit
    await this.semesterSubmitButton.click();
    await this.waitForAnimation(500);
  }

  /**
   * 과목 추가
   */
  async addCourse(params: {
    name: string;
    credit: number;
    grade: string;
    category?: 'major' | 'general' | 'teaching';
    isPassFail?: boolean;
  }) {
    const {
      name,
      credit,
      grade,
      category = 'general',
      isPassFail = false
    } = params;

    // Enter course name
    await this.courseNameInput.waitFor({ state: 'visible' });
    await this.courseNameInput.clear();
    await this.courseNameInput.fill(name);

    // Select credit
    await this.courseCreditSelect.click();
    await this.page.getByRole('option', { name: `${credit}학점` }).click();
    await this.waitForAnimation(100);

    // Select grade
    await this.courseGradeSelect.click();
    await this.page.getByRole('option', { name: grade }).click();
    await this.waitForAnimation(100);

    // Select category
    await this.courseCategorySelect.click();
    const categoryText = category === 'major' ? '전공' : category === 'general' ? '교양' : '교직';
    await this.page.getByRole('option', { name: categoryText }).click();
    await this.waitForAnimation(100);

    // Toggle Pass/Fail if needed
    if (isPassFail) {
      await this.passFailSwitch.click();
      await this.waitForAnimation(100);
    }

    // Submit
    await this.addCourseButton.click();
    await this.waitForAnimation(300);
  }

  /**
   * 학점 체계 변경
   */
  async changeScale(scale: '4.5' | '4.3' | '4.0') {
    await this.scaleSelect.click();
    await this.page.getByRole('option', { name: `${scale} 만점` }).click();
    await this.waitForAnimation(300);
  }

  /**
   * 과목 삭제
   */
  async deleteCourse(courseName: string) {
    const courseRow = this.page.locator('tr', { hasText: courseName });
    const deleteButton = courseRow.getByRole('button', { name: /삭제/i });

    // Handle confirmation dialog
    this.page.once('dialog', dialog => dialog.accept());
    await deleteButton.click();
    await this.waitForAnimation(300);
  }

  /**
   * 학기 삭제
   */
  async deleteSemester(semesterName: string) {
    const semesterCard = this.page.locator('[class*="Card"]', { hasText: semesterName });
    const deleteButton = semesterCard.getByRole('button', { name: /삭제/i });

    // Handle confirmation dialog
    this.page.once('dialog', dialog => dialog.accept());
    await deleteButton.click();
    await this.waitForAnimation(300);
  }

  /**
   * 전체 데이터 삭제
   */
  async clearAll() {
    await this.dataTab.click();
    await this.waitForAnimation(300);

    const clearButton = this.page.getByRole('button', { name: /전체 삭제|모두 삭제/i });

    // Handle confirmation dialog
    this.page.once('dialog', dialog => dialog.accept());
    await clearButton.click();
    await this.waitForAnimation(300);
  }

  // Assertions
  /**
   * GPA 값 검증 (소수점 2자리)
   */
  async expectGPA(expectedGPA: number, tolerance = 0.01) {
    await this.cumulativeGPA.waitFor({ state: 'visible', timeout: 5000 });
    const text = await this.cumulativeGPA.textContent();
    const gpa = parseFloat(text || '0');

    expect(gpa).toBeGreaterThanOrEqual(expectedGPA - tolerance);
    expect(gpa).toBeLessThanOrEqual(expectedGPA + tolerance);
  }

  /**
   * 전공 GPA 검증
   */
  async expectMajorGPA(expectedGPA: number, tolerance = 0.01) {
    await this.majorGPA.waitFor({ state: 'visible', timeout: 5000 });
    const text = await this.majorGPA.textContent();

    // Handle "-" for no major courses
    if (text?.includes('-')) {
      expect(expectedGPA).toBe(0);
      return;
    }

    const gpa = parseFloat(text || '0');
    expect(gpa).toBeGreaterThanOrEqual(expectedGPA - tolerance);
    expect(gpa).toBeLessThanOrEqual(expectedGPA + tolerance);
  }

  /**
   * 교양 GPA 검증
   */
  async expectGeneralGPA(expectedGPA: number, tolerance = 0.01) {
    await this.generalGPA.waitFor({ state: 'visible', timeout: 5000 });
    const text = await this.generalGPA.textContent();

    // Handle "-" for no general courses
    if (text?.includes('-')) {
      expect(expectedGPA).toBe(0);
      return;
    }

    const gpa = parseFloat(text || '0');
    expect(gpa).toBeGreaterThanOrEqual(expectedGPA - tolerance);
    expect(gpa).toBeLessThanOrEqual(expectedGPA + tolerance);
  }

  /**
   * 총 학점 검증
   */
  async expectTotalCredits(expectedCredits: number) {
    await this.totalCreditsDisplay.waitFor({ state: 'visible', timeout: 5000 });
    const text = await this.totalCreditsDisplay.textContent();
    const match = text?.match(/(\d+(?:\.\d+)?)/);

    if (match) {
      const credits = parseFloat(match[1]);
      expect(credits).toBe(expectedCredits);
    } else {
      throw new Error(`Could not parse credits from: ${text}`);
    }
  }

  /**
   * 과목이 목록에 있는지 확인
   */
  async expectCourseVisible(courseName: string) {
    await expect(this.page.getByText(courseName)).toBeVisible({ timeout: 5000 });
  }

  /**
   * 과목이 목록에 없는지 확인
   */
  async expectCourseNotVisible(courseName: string) {
    await expect(this.page.getByText(courseName)).not.toBeVisible();
  }

  /**
   * 학기가 목록에 있는지 확인
   */
  async expectSemesterVisible(semesterName: string) {
    await expect(this.page.getByText(semesterName)).toBeVisible({ timeout: 5000 });
  }

  /**
   * 차트 표시 확인
   */
  async expectChartVisible() {
    await expect(this.chart).toBeVisible({ timeout: 5000 });
  }

  /**
   * 차트 미표시 확인 (학기 없을 때)
   */
  async expectChartNotVisible() {
    await expect(this.chart).not.toBeVisible();
  }

  /**
   * 빈 상태 확인
   */
  async expectEmptyState() {
    await expect(this.addSemesterButton).toBeVisible();
    await this.expectChartNotVisible();
  }

  /**
   * 경고 메시지 확인
   */
  async expectAlert(message: string) {
    this.page.once('dialog', dialog => {
      expect(dialog.message()).toContain(message);
      dialog.dismiss();
    });
  }
}
