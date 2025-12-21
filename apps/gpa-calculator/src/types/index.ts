/**
 * GPA Calculator Type Definitions
 */

// 성적 등급
export type Grade =
  | 'A+' | 'A0'
  | 'B+' | 'B0'
  | 'C+' | 'C0'
  | 'D+' | 'D0'
  | 'F'
  | 'P' | 'NP';

// 학점 체계
export type GPAScale = '4.5' | '4.3' | '4.0';

// 과목 구분
export type CourseCategory = 'major' | 'general' | 'teaching';

// 학기 구분
export type Term = 1 | 2 | 3; // 1학기, 2학기, 계절학기

// 과목
export interface Course {
  id: string;
  name: string;
  credit: number;          // 0.5 ~ 4.0
  grade: Grade;
  category: CourseCategory;
  isPassFail: boolean;
}

// 학기
export interface Semester {
  id: string;
  name: string;            // "2024-1학기"
  year: number;
  term: Term;
  courses: Course[];
}

// GPA 계산 결과
export interface GPAResult {
  gpa: number;
  totalCredits: number;    // 평점 계산에 포함된 학점
  earnedCredits: number;   // 실제 이수한 학점 (P 포함)
}

// 시뮬레이터 입력
export interface SimulatorInput {
  currentGPA: number;
  currentCredits: number;
  targetGPA: number;
  remainingCredits: number;
}

// 차트 데이터
export interface ChartData {
  semester: string;
  학기GPA: number;
  누적GPA: number;
}
