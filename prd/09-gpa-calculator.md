# 학점 계산기 (GPA Calculator)

## 1. 개요

대학생의 학점 관리를 돕는 종합 GPA 계산 도구입니다.

### 주요 가치
- **정확한 학점 계산**: 4.5, 4.3, 4.0 만점 체계 모두 지원
- **학업 계획 수립**: 목표 GPA 달성을 위한 시뮬레이션
- **데이터 관리**: 학기별 성적 기록 및 추이 분석
- **장학금/졸업 준비**: 누적 GPA 관리로 학업 목표 달성

### 타겟 사용자
- 대학생 (학점 관리 필요)
- 편입생 (누적 학점 계산)
- 복수/부전공생 (전공별 학점 분리 계산)

---

## 2. 유사 서비스 분석

### 2.1 주요 경쟁 서비스

1. **YOHELP 학점 계산기** (https://www.yohelp.net/make_gpa.php)
   - 4.5/4.3점 만점 선택
   - 전공/전체 학점 분리 계산
   - 이번 학기 평점 · 누적 평점 관리
   - **장점**: 직관적 UI, 전공/전체 분리
   - **단점**: 데이터 저장 없음, 학기별 관리 불가

2. **사람인 학점 변환기** (https://www.saramin.co.kr/zf_user/tools/grade-converter-pop)
   - 백분율 ↔ 4.5만점 변환
   - 수도권 4년제 대학 환산식 적용
   - **장점**: 취업용 학점 변환
   - **단점**: 계산 기능만 제공

3. **Calculator-Online.net**
   - 가중/비가중 GPA 계산
   - 누적 학기 평균 지원
   - **장점**: 다양한 계산 옵션
   - **단점**: 한국 학점 체계 미지원

### 2.2 차별화 전략

우리 서비스만의 강점:
- ✅ **학기별 관리**: 여러 학기 데이터를 별도 관리
- ✅ **목표 GPA 시뮬레이터**: "졸업까지 4.0 만들려면?"
- ✅ **학점 추이 그래프**: Recharts로 시각화
- ✅ **데이터 백업**: CSV 내보내기/가져오기
- ✅ **전공/교양 분리**: 세밀한 학점 관리

---

## 3. 오픈소스 라이브러리

### 3.1 필수 라이브러리

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "recharts": "^2.13.3",
    "dexie": "^4.0.11",
    "dexie-react-hooks": "^1.1.7",
    "papaparse": "^5.4.1",
    "@types/papaparse": "^5.3.15"
  }
}
```

### 3.2 라이브러리 역할

| 라이브러리 | 용도 | 사유 |
|-----------|------|------|
| **Recharts** | 학점 추이 그래프 | React 전용, 선언적 API, 반응형 차트 |
| **Dexie.js** | IndexedDB 래퍼 | 대용량 학기 데이터 저장, Promise 기반 API |
| **PapaParse** | CSV 파싱 | 학점 데이터 내보내기/가져오기 |

### 3.3 IndexedDB vs localStorage

| 구분 | localStorage | IndexedDB (Dexie) |
|------|-------------|-------------------|
| 용량 | ~5-10MB | ~수백MB |
| 구조 | Key-Value | 관계형 DB |
| 쿼리 | 불가능 | 인덱싱/검색 가능 |
| 비동기 | 동기 | 비동기 (Promise) |

**선택**: IndexedDB (Dexie.js) - 학기별 대량 데이터 관리에 적합

---

## 4. 기술 스택

```bash
# 프로젝트 초기화
pnpm create vite gpa-calculator --template react-ts
cd gpa-calculator
pnpm install

# 의존성 추가
pnpm add recharts dexie dexie-react-hooks papaparse
pnpm add -D @types/papaparse tailwindcss@next @tailwindcss/vite@next
```

### 4.1 핵심 스택

- **프레임워크**: React 19 + TypeScript
- **빌드**: Vite 6
- **스타일**: Tailwind CSS v4
- **상태 관리**: React Hooks (useState, useReducer)
- **데이터베이스**: IndexedDB (Dexie.js)
- **차트**: Recharts
- **데이터 변환**: PapaParse

### 4.2 디렉토리 구조

```
gpa-calculator/
├── src/
│   ├── components/
│   │   ├── CourseInput.tsx       # 과목 입력 폼
│   │   ├── SemesterList.tsx      # 학기 목록
│   │   ├── GPADisplay.tsx        # 학점 결과 표시
│   │   ├── GPAChart.tsx          # Recharts 그래프
│   │   ├── Simulator.tsx         # 목표 학점 시뮬레이터
│   │   └── DataManager.tsx       # CSV 내보내기/가져오기
│   ├── lib/
│   │   ├── db.ts                 # Dexie DB 스키마
│   │   ├── gpa.ts                # GPA 계산 로직
│   │   ├── gradeSystem.ts        # 성적 등급 변환
│   │   └── csvExport.ts          # CSV 처리
│   ├── types/
│   │   └── index.ts              # TypeScript 타입 정의
│   └── App.tsx
├── vite.config.ts
└── package.json
```

---

## 5. 핵심 기능 및 구현

### 5.1 과목 입력 (과목명, 학점, 성적)

**UI 구성**:
- 과목명 입력 (텍스트)
- 학점 선택 (1~4학점, 0.5 단위)
- 성적 등급 선택 (A+, A0, B+, ...)
- 과목 구분 (전공/교양/교직)

```tsx
interface Course {
  id: string;
  name: string;
  credit: number;          // 학점 (1, 1.5, 2, 2.5, 3, 4)
  grade: Grade;            // 성적 등급
  category: CourseCategory; // 전공/교양/교직
  isPassFail: boolean;     // Pass/Fail 여부
}

type Grade = 'A+' | 'A0' | 'B+' | 'B0' | 'C+' | 'C0' | 'D+' | 'D0' | 'F' | 'P' | 'NP';
type CourseCategory = 'major' | 'general' | 'teaching';
```

### 5.2 성적 등급 시스템

한국 대학 표준 성적 등급:
- **A+, A0**: 최우수
- **B+, B0**: 우수
- **C+, C0**: 보통
- **D+, D0**: 미흡 (학점 인정)
- **F**: 낙제 (학점 미인정)
- **P**: Pass (학점 인정, 평점 미포함)
- **NP**: Non-Pass (학점 미인정)

### 5.3 4.5 / 4.3 / 4.0 만점 지원

```tsx
type GPAScale = '4.5' | '4.3' | '4.0';

interface GPASystem {
  scale: GPAScale;
  gradePoints: Record<Grade, number>;
}
```

### 5.4 Pass/Fail 처리

- **P (Pass)**: 학점은 인정, 평점 계산에서 제외
- **NP (Non-Pass)**: 학점 미인정, 평점 계산 제외

```tsx
function calculateGPA(courses: Course[], scale: GPAScale): GPAResult {
  const gradedCourses = courses.filter(c => !c.isPassFail);
  const totalCredits = gradedCourses.reduce((sum, c) => sum + c.credit, 0);
  const totalPoints = gradedCourses.reduce((sum, c) => {
    return sum + (c.credit * getGradePoint(c.grade, scale));
  }, 0);

  return {
    gpa: totalPoints / totalCredits,
    totalCredits,
    earnedCredits: courses.filter(c => c.grade !== 'F' && c.grade !== 'NP')
                          .reduce((sum, c) => sum + c.credit, 0)
  };
}
```

### 5.5 학기별 GPA

각 학기를 독립적으로 관리:

```tsx
interface Semester {
  id: string;
  name: string;           // "2024-1학기"
  year: number;           // 2024
  term: 1 | 2 | 3;        // 1학기, 2학기, 계절학기
  courses: Course[];
  gpa: number;            // 학기 GPA
  totalCredits: number;   // 이수 학점
}
```

### 5.6 누적 GPA

전체 학기의 가중 평균:

```tsx
function calculateCumulativeGPA(semesters: Semester[]): number {
  let totalPoints = 0;
  let totalCredits = 0;

  semesters.forEach(sem => {
    const gradedCourses = sem.courses.filter(c => !c.isPassFail);
    gradedCourses.forEach(course => {
      totalPoints += course.credit * getGradePoint(course.grade, '4.5');
      totalCredits += course.credit;
    });
  });

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}
```

### 5.7 목표 학점 시뮬레이터

"졸업까지 4.0 만들려면 앞으로 몇 학점을 받아야 할까?"

```tsx
interface SimulatorInput {
  currentGPA: number;         // 현재 누적 GPA
  currentCredits: number;     // 현재 이수 학점
  targetGPA: number;          // 목표 GPA
  remainingCredits: number;   // 남은 이수 학점
}

function calculateRequiredGPA(input: SimulatorInput): number {
  const { currentGPA, currentCredits, targetGPA, remainingCredits } = input;

  const currentPoints = currentGPA * currentCredits;
  const targetPoints = targetGPA * (currentCredits + remainingCredits);
  const requiredPoints = targetPoints - currentPoints;

  return requiredPoints / remainingCredits;
}

// 예시: 현재 3.2/120학점, 목표 3.5/140학점
// 필요 학점 = (3.5 * 140 - 3.2 * 120) / 20 = 4.3
```

### 5.8 학점 추이 그래프

Recharts를 활용한 시각화:

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ChartData {
  semester: string;    // "2024-1"
  gpa: number;         // 학기 GPA
  cumulative: number;  // 누적 GPA
}

function GPAChart({ semesters }: { semesters: Semester[] }) {
  const data: ChartData[] = semesters.map((sem, idx) => ({
    semester: `${sem.year}-${sem.term}`,
    gpa: sem.gpa,
    cumulative: calculateCumulativeGPA(semesters.slice(0, idx + 1))
  }));

  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="semester" />
      <YAxis domain={[0, 4.5]} />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="gpa" stroke="#8884d8" name="학기 GPA" />
      <Line type="monotone" dataKey="cumulative" stroke="#82ca9d" name="누적 GPA" />
    </LineChart>
  );
}
```

### 5.9 CSV 내보내기/가져오기

PapaParse를 활용한 데이터 백업:

```tsx
import Papa from 'papaparse';

// CSV 내보내기
function exportToCSV(semesters: Semester[]): void {
  const rows = semesters.flatMap(sem =>
    sem.courses.map(course => ({
      학기: sem.name,
      과목명: course.name,
      학점: course.credit,
      성적: course.grade,
      구분: course.category,
      'Pass/Fail': course.isPassFail ? 'Y' : 'N'
    }))
  );

  const csv = Papa.unparse(rows);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `gpa_data_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

// CSV 가져오기
function importFromCSV(file: File): Promise<Semester[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const semesters = groupBySemester(results.data);
        resolve(semesters);
      },
      error: reject
    });
  });
}
```

---

## 6. 성적 등급별 점수 변환표

### 6.1 한국 대학 표준 등급 체계

| 성적 등급 | 4.5 만점 | 4.3 만점 | 4.0 만점 | 백분율 (%) |
|----------|---------|---------|---------|-----------|
| A+       | 4.5     | 4.3     | 4.0     | 95-100    |
| A0       | 4.0     | 4.0     | 4.0     | 90-94     |
| B+       | 3.5     | 3.3     | 3.5     | 85-89     |
| B0       | 3.0     | 3.0     | 3.0     | 80-84     |
| C+       | 2.5     | 2.3     | 2.5     | 75-79     |
| C0       | 2.0     | 2.0     | 2.0     | 70-74     |
| D+       | 1.5     | 1.3     | 1.5     | 65-69     |
| D0       | 1.0     | 1.0     | 1.0     | 60-64     |
| F        | 0.0     | 0.0     | 0.0     | 0-59      |
| P        | -       | -       | -       | Pass      |
| NP       | 0.0     | 0.0     | 0.0     | Non-Pass  |

### 6.2 특이 케이스

- **A0 vs A+**: 일부 대학은 A를 A0로, A+를 최고점으로 구분
- **Pass/Fail**: 교양이나 일부 과목에서 사용
- **계절학기**: 일부 대학은 평점에 미포함

---

## 7. GPA 계산 공식

### 7.1 학기 GPA 계산

```
학기 GPA = Σ(학점 × 평점) / Σ(학점)
```

**예시**:
- 미적분학 (3학점, A+): 3 × 4.5 = 13.5
- 영어회화 (2학점, B0): 2 × 3.0 = 6.0
- 체육 (1학점, P): Pass (계산 제외)

**계산**: (13.5 + 6.0) / (3 + 2) = **3.9**

### 7.2 누적 GPA 계산

```
누적 GPA = Σ(전체 학점 × 평점) / Σ(전체 학점)
```

**예시** (3개 학기):
- 1학기: GPA 3.8 (18학점)
- 2학기: GPA 4.2 (21학점)
- 3학기: GPA 3.5 (15학점)

**계산**:
```
누적 GPA = (3.8×18 + 4.2×21 + 3.5×15) / (18+21+15)
         = (68.4 + 88.2 + 52.5) / 54
         = 209.1 / 54
         = 3.87
```

### 7.3 전공/전체 학점 분리 계산

```tsx
function calculateCategoryGPA(
  semesters: Semester[],
  category: CourseCategory
): number {
  const categoryCourses = semesters.flatMap(sem =>
    sem.courses.filter(c => c.category === category && !c.isPassFail)
  );

  return calculateGPA(categoryCourses, '4.5').gpa;
}

// 사용 예시
const majorGPA = calculateCategoryGPA(semesters, 'major');      // 전공 학점
const generalGPA = calculateCategoryGPA(semesters, 'general');  // 교양 학점
```

---

## 8. 핵심 로직 (TypeScript)

### 8.1 타입 정의 (`src/types/index.ts`)

```typescript
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
```

### 8.2 성적 변환 (`src/lib/gradeSystem.ts`)

```typescript
import type { Grade, GPAScale } from '../types';

// 성적별 점수 매핑
const GRADE_POINTS: Record<GPAScale, Record<Grade, number>> = {
  '4.5': {
    'A+': 4.5, 'A0': 4.0,
    'B+': 3.5, 'B0': 3.0,
    'C+': 2.5, 'C0': 2.0,
    'D+': 1.5, 'D0': 1.0,
    'F': 0.0, 'P': 0.0, 'NP': 0.0
  },
  '4.3': {
    'A+': 4.3, 'A0': 4.0,
    'B+': 3.3, 'B0': 3.0,
    'C+': 2.3, 'C0': 2.0,
    'D+': 1.3, 'D0': 1.0,
    'F': 0.0, 'P': 0.0, 'NP': 0.0
  },
  '4.0': {
    'A+': 4.0, 'A0': 4.0,
    'B+': 3.5, 'B0': 3.0,
    'C+': 2.5, 'C0': 2.0,
    'D+': 1.5, 'D0': 1.0,
    'F': 0.0, 'P': 0.0, 'NP': 0.0
  }
};

export function getGradePoint(grade: Grade, scale: GPAScale): number {
  return GRADE_POINTS[scale][grade];
}

// 백분율을 성적으로 변환
export function percentToGrade(percent: number): Grade {
  if (percent >= 95) return 'A+';
  if (percent >= 90) return 'A0';
  if (percent >= 85) return 'B+';
  if (percent >= 80) return 'B0';
  if (percent >= 75) return 'C+';
  if (percent >= 70) return 'C0';
  if (percent >= 65) return 'D+';
  if (percent >= 60) return 'D0';
  return 'F';
}

// 성적을 백분율로 변환
export function gradeToPercent(grade: Grade): number {
  const percentRanges: Record<Grade, number> = {
    'A+': 97.5, 'A0': 92,
    'B+': 87, 'B0': 82,
    'C+': 77, 'C0': 72,
    'D+': 67, 'D0': 62,
    'F': 30, 'P': 0, 'NP': 0
  };
  return percentRanges[grade];
}
```

### 8.3 GPA 계산 (`src/lib/gpa.ts`)

```typescript
import type { Course, Semester, GPAResult, GPAScale, CourseCategory, SimulatorInput } from '../types';
import { getGradePoint } from './gradeSystem';

// 단일 학기 GPA 계산
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

// 누적 GPA 계산
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

// 전공/교양별 GPA 계산
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

// 목표 학점 시뮬레이터
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
    message = `목표 달성 불가능합니다. 최대 학점을 받아도 ${((currentPoints + 4.5 * remainingCredits) / (currentCredits + remainingCredits)).toFixed(2)}까지만 가능합니다.`;
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

// 학점 등급 분포 계산
export function getGradeDistribution(courses: Course[]): Record<string, number> {
  const distribution: Record<string, number> = {};

  courses.forEach(course => {
    const grade = course.grade;
    distribution[grade] = (distribution[grade] || 0) + 1;
  });

  return distribution;
}
```

### 8.4 IndexedDB 스키마 (`src/lib/db.ts`)

```typescript
import Dexie, { Table } from 'dexie';
import type { Semester, Course } from '../types';

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

// CRUD 헬퍼 함수
export async function addSemester(semester: Semester): Promise<string> {
  return await db.semesters.add(semester);
}

export async function updateSemester(id: string, updates: Partial<Semester>): Promise<number> {
  return await db.semesters.update(id, updates);
}

export async function deleteSemester(id: string): Promise<void> {
  await db.semesters.delete(id);
}

export async function getAllSemesters(): Promise<Semester[]> {
  return await db.semesters.orderBy('year').reverse().toArray();
}

export async function addCourseToSemester(semesterId: string, course: Course): Promise<void> {
  const semester = await db.semesters.get(semesterId);
  if (semester) {
    semester.courses.push(course);
    await db.semesters.update(semesterId, semester);
  }
}
```

### 8.5 CSV 처리 (`src/lib/csvExport.ts`)

```typescript
import Papa from 'papaparse';
import type { Semester, Course } from '../types';

interface CSVRow {
  학기: string;
  과목명: string;
  학점: number;
  성적: string;
  구분: string;
  'Pass/Fail': string;
}

// CSV 내보내기
export function exportToCSV(semesters: Semester[]): void {
  const rows: CSVRow[] = semesters.flatMap(sem =>
    sem.courses.map(course => ({
      학기: sem.name,
      과목명: course.name,
      학점: course.credit,
      성적: course.grade,
      구분: course.category === 'major' ? '전공' :
            course.category === 'general' ? '교양' : '교직',
      'Pass/Fail': course.isPassFail ? 'Y' : 'N'
    }))
  );

  const csv = Papa.unparse(rows, {
    quotes: true,
    delimiter: ',',
    header: true
  });

  // UTF-8 BOM 추가 (엑셀 한글 호환)
  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `학점데이터_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// CSV 가져오기
export function importFromCSV(file: File): Promise<Semester[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const semesters = groupBySemester(results.data);
          resolve(semesters);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
}

// CSV 데이터를 학기별로 그룹화
function groupBySemester(rows: CSVRow[]): Semester[] {
  const semesterMap = new Map<string, Semester>();

  rows.forEach(row => {
    if (!row.학기 || !row.과목명) return;

    if (!semesterMap.has(row.학기)) {
      const [year, term] = parseSemesterName(row.학기);
      semesterMap.set(row.학기, {
        id: crypto.randomUUID(),
        name: row.학기,
        year,
        term,
        courses: []
      });
    }

    const semester = semesterMap.get(row.학기)!;
    semester.courses.push({
      id: crypto.randomUUID(),
      name: row.과목명,
      credit: Number(row.학점),
      grade: row.성적 as any,
      category: row.구분 === '전공' ? 'major' :
                row.구분 === '교양' ? 'general' : 'teaching',
      isPassFail: row['Pass/Fail'] === 'Y'
    });
  });

  return Array.from(semesterMap.values());
}

// "2024-1학기" → [2024, 1]
function parseSemesterName(name: string): [number, 1 | 2 | 3] {
  const match = name.match(/(\d{4})-(\d)/);
  if (!match) throw new Error(`Invalid semester name: ${name}`);
  return [parseInt(match[1]), parseInt(match[2]) as 1 | 2 | 3];
}
```

---

## 9. 컴포넌트 구조

```
App.tsx
├── Header (학점 체계 선택: 4.5/4.3/4.0)
├── SemesterList
│   ├── SemesterCard (학기별 카드)
│   │   ├── CourseList (과목 목록)
│   │   └── SemesterGPA (학기 GPA 표시)
│   └── AddSemesterButton
├── GPADisplay
│   ├── CumulativeGPA (누적 GPA)
│   ├── MajorGPA (전공 GPA)
│   └── TotalCredits (총 이수 학점)
├── GPAChart (Recharts 그래프)
├── Simulator (목표 학점 계산기)
└── DataManager
    ├── ExportButton (CSV 내보내기)
    └── ImportButton (CSV 가져오기)
```

### 9.1 주요 컴포넌트 구현

#### App.tsx (메인)

```tsx
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './lib/db';
import { calculateCumulativeGPA, calculateCategoryGPA } from './lib/gpa';
import type { GPAScale } from './types';

function App() {
  const [scale, setScale] = useState<GPAScale>('4.5');
  const semesters = useLiveQuery(() => db.semesters.toArray(), []);

  const cumulativeGPA = semesters
    ? calculateCumulativeGPA(semesters, scale)
    : { gpa: 0, totalCredits: 0, earnedCredits: 0 };

  const majorGPA = semesters
    ? calculateCategoryGPA(semesters, 'major', scale)
    : { gpa: 0, totalCredits: 0, earnedCredits: 0 };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">학점 계산기</h1>
          <div className="mt-4">
            <label>학점 체계:</label>
            <select value={scale} onChange={e => setScale(e.target.value as GPAScale)}>
              <option value="4.5">4.5 만점</option>
              <option value="4.3">4.3 만점</option>
              <option value="4.0">4.0 만점</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <GPADisplay
          cumulative={cumulativeGPA}
          major={majorGPA}
        />
        <GPAChart semesters={semesters || []} />
        <SemesterList semesters={semesters || []} scale={scale} />
        <Simulator currentGPA={cumulativeGPA.gpa} currentCredits={cumulativeGPA.totalCredits} />
        <DataManager semesters={semesters || []} />
      </main>
    </div>
  );
}

export default App;
```

#### GPAChart.tsx (Recharts)

```tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Semester } from '../types';
import { calculateCumulativeGPA, calculateSemesterGPA } from '../lib/gpa';

interface Props {
  semesters: Semester[];
}

export function GPAChart({ semesters }: Props) {
  const data = semesters.map((sem, idx) => {
    const semesterGPA = calculateSemesterGPA(sem.courses);
    const cumulativeGPA = calculateCumulativeGPA(semesters.slice(0, idx + 1));

    return {
      semester: `${sem.year}-${sem.term}`,
      학기GPA: semesterGPA.gpa,
      누적GPA: cumulativeGPA.gpa
    };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">학점 추이</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" />
          <YAxis domain={[0, 4.5]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="학기GPA" stroke="#8884d8" strokeWidth={2} />
          <Line type="monotone" dataKey="누적GPA" stroke="#82ca9d" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### Simulator.tsx (목표 학점)

```tsx
import React, { useState } from 'react';
import { calculateRequiredGPA } from '../lib/gpa';

interface Props {
  currentGPA: number;
  currentCredits: number;
}

export function Simulator({ currentGPA, currentCredits }: Props) {
  const [targetGPA, setTargetGPA] = useState(4.0);
  const [remainingCredits, setRemainingCredits] = useState(20);

  const result = calculateRequiredGPA({
    currentGPA,
    currentCredits,
    targetGPA,
    remainingCredits
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-xl font-bold mb-4">목표 학점 시뮬레이터</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>현재 누적 GPA</label>
          <input type="number" value={currentGPA} disabled className="w-full p-2 border rounded" />
        </div>
        <div>
          <label>현재 이수 학점</label>
          <input type="number" value={currentCredits} disabled className="w-full p-2 border rounded" />
        </div>
        <div>
          <label>목표 GPA</label>
          <input
            type="number"
            step="0.1"
            max="4.5"
            value={targetGPA}
            onChange={e => setTargetGPA(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label>남은 이수 학점</label>
          <input
            type="number"
            value={remainingCredits}
            onChange={e => setRemainingCredits(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <p className="text-lg font-semibold">
          {result.message}
        </p>
        {result.isAchievable && result.requiredGPA > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            필요 학점: <span className="font-bold text-blue-600">{result.requiredGPA}</span> / 4.5
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## 10. 개발 로드맵

### Phase 1: MVP (1주)
- ✅ 기본 과목 입력/삭제
- ✅ 4.5 만점 GPA 계산
- ✅ 학기별 관리
- ✅ localStorage 저장

### Phase 2: 고급 기능 (1주)
- ✅ 4.3/4.0 만점 지원
- ✅ Pass/Fail 처리
- ✅ 전공/교양 분리
- ✅ IndexedDB 마이그레이션

### Phase 3: 시각화 & 분석 (1주)
- ✅ Recharts 그래프
- ✅ 목표 학점 시뮬레이터
- ✅ 학점 분포 차트

### Phase 4: 데이터 관리 (3일)
- ✅ CSV 내보내기/가져오기
- ✅ 데이터 백업/복원
- ✅ 엑셀 호환성

---

## 11. 배포 설정

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/gpa-calculator/',  // seolcoding.com/gpa-calculator/
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'],
          'db-vendor': ['dexie', 'dexie-react-hooks']
        }
      }
    }
  }
});
```

---

## 12. 참고 자료

- [Recharts 공식 문서](https://recharts.org/)
- [Dexie.js 가이드](https://dexie.org/)
- [PapaParse 문서](https://www.papaparse.com/)
- [한국 대학 학점 체계](https://www.yohelp.net/make_gpa.php)

---

## 13. MCP 개발 도구

### 13.1 UI 컴포넌트 개발
- **Shadcn UI**: 검증된 컴포넌트 라이브러리
- `pnpm dlx shadcn@latest add [component]`로 추가
- `@mini-apps/ui` 패키지에서 공유

### 13.2 브라우저 테스트
- **Chrome DevTools MCP**: 실시간 UI 확인 및 디버깅
- 스냅샷/스크린샷으로 렌더링 확인
- 콘솔/네트워크 요청 분석
- 반응형 테스트 (모바일 뷰포트)

> 자세한 사용법은 `agents/mini-apps/CLAUDE.md` 참조
