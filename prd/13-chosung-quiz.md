# 초성 퀴즈 (Chosung Quiz Game)

## 1. 개요

### 1.1 프로젝트 설명
한글 초성만 보고 단어를 맞추는 웹 기반 퀴즈 게임입니다. 회식, MT, 워크숍, 가족 모임 등에서 즐길 수 있는 레크리에이션 필수 게임을 디지털화하여 언제 어디서나 즐길 수 있도록 구현합니다.

### 1.2 타겟 사용자
- 회식/워크숍 담당자 (아이스브레이킹 활동)
- 가족 모임 (세대 간 소통 도구)
- 교육 현장 (어휘력 향상 학습 도구)
- 친구 모임 (파티 게임)
- 시니어 (치매 예방, 인지 기능 향상)

### 1.3 핵심 가치
- 한글 문화 유산의 디지털화
- 세대를 넘는 즐거움 (남녀노소 누구나)
- 두뇌 활동 촉진 및 어휘력 향상
- 간단한 규칙, 즉각적인 재미

## 2. 유사 서비스 분석

### 2.1 기존 서비스 현황

#### 모바일 앱
- **초성게임타임** (Google Play)
  - 단어 학습 및 두뇌 개발 콘셉트
  - 다양한 카테고리 제공
  - 한계: 모바일 전용, 설치 필요

- **종합단어게임** (iOS)
  - 스피드퀴즈, 초성퀴즈, 속담퀴즈 통합
  - 이어말하기 기능 포함
  - 한계: iOS 전용

#### 웹 서비스
- **자음퀴즈(jaum.kr)**
  - 영화 7만개, 음악 200만개, 백과사전 30만개 등 방대한 DB
  - 초성 검색 기능 (예: ㄱㅁ% → 괴물, 기묘한이야기)
  - 한계: 검색 위주, 게임성 부족

#### PPT 자료
- 영화 초성퀴즈 PPT (네이버 블로그)
- 드라마 초성퀴즈 PPT
- 한계: 정적, 재사용성 낮음, 수동 진행 필요

### 2.2 차별화 포인트
1. **웹 기반 접근성**: 설치 불필요, 브라우저만 있으면 즉시 플레이
2. **멀티플레이 지원**: 호스트가 화면 공유하여 실시간 단체 게임
3. **커스텀 단어 추가**: 회사 내부 용어, 가족 추억 등 개인화 가능
4. **모던 UI/UX**: 깔끔한 타이포그래피, 애니메이션 효과
5. **단계별 힌트 시스템**: 난이도 조절 가능

## 3. 오픈소스 라이브러리

### 3.1 한글 처리 라이브러리

#### ES Hangul (Toss) - 선택
- **Library ID**: `/toss/es-hangul`
- **장점**:
  - 현대적인 TypeScript 라이브러리
  - 토스에서 관리 (높은 신뢰도)
  - 167개 코드 스니펫 (풍부한 문서)
  - Benchmark Score: 높음
  - 가볍고 빠름
- **주요 기능**:
  - `getChoseong()`: 초성 추출
  - `disassemble()`: 자모 분리
  - `combineCharacter()`: 자모 조합
- **설치**: `npm install es-hangul`

#### hangul-js (대안)
- **버전**: 0.2.6 (6년 전 배포, 유지보수 중단 가능성)
- **장점**: 47개 프로젝트에서 사용 중
- **단점**: 오래된 버전, TypeScript 지원 약함

**결론**: ES Hangul 채택 (최신성, 안정성, TypeScript 지원)

### 3.2 애니메이션 라이브러리
- **Framer Motion**: React 애니메이션 (선택 사항)
  - 정답 공개 시 fade-in 효과
  - 타이머 진행바 애니메이션
  - 점수 증가 카운터 애니메이션

### 3.3 타이머 라이브러리
- **내장 구현**: `setInterval`, `requestAnimationFrame` 사용
- 외부 라이브러리 불필요 (의존성 최소화)

## 4. 기술 스택

### 4.1 프론트엔드
- **빌드 도구**: Vite 6.x
- **프레임워크**: React 19
- **언어**: TypeScript 5.x
- **스타일링**: Tailwind CSS v4
- **상태 관리**: React Hooks (useState, useReducer)
- **한글 처리**: es-hangul

### 4.2 배포
- **호스팅**: GitHub Pages / Vercel
- **도메인**: seolcoding.com/mini-apps/chosung-quiz

### 4.3 개발 환경
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "es-hangul": "^1.x.x"
  },
  "devDependencies": {
    "vite": "^6.x.x",
    "typescript": "^5.x.x",
    "tailwindcss": "^4.x.x",
    "@vitejs/plugin-react": "^4.x.x"
  }
}
```

## 5. 핵심 기능 및 구현

### 5.1 퀴즈 모드

#### 5.1.1 싱글 플레이
- 혼자서 즐기는 모드
- 개인 최고 점수 기록 (LocalStorage)
- 난이도 선택: 쉬움 / 보통 / 어려움
- 시간 제한: 30초 / 60초 / 무제한

#### 5.1.2 멀티 플레이
- 호스트 모드: 화면 공유 또는 프로젝터 연결
- 참가자들은 손들기 또는 구두로 답변
- 호스트가 정답/오답 버튼 클릭
- 점수판 실시간 업데이트
- 팀 모드: 2~4개 팀으로 나누어 대결

### 5.2 카테고리

#### 5.2.1 기본 카테고리 (총 6개)
1. **영화 제목** (100개)
   - 예시: 기생충, 타이타닉, 아바타, 인터스텔라

2. **음식** (100개)
   - 예시: 불고기, 김치찌개, 파스타, 햄버거

3. **속담/사자성어** (100개)
   - 예시: 세 살 버릇 여든까지 간다, 금상첨화

4. **K-POP 노래** (100개)
   - 예시: 강남스타일, 다이너마이트, 아파트

5. **유명인** (100개)
   - 예시: 손흥민, 봉준호, 방탄소년단

6. **드라마 제목** (100개)
   - 예시: 오징어게임, 사랑의 불시착, 이상한 변호사 우영우

#### 5.2.2 추가 카테고리 (향후 확장)
- 동물, 과일, 나라, 직업, 감정, 브랜드 등

#### 5.2.3 커스텀 카테고리
- 사용자가 직접 단어 입력
- JSON 형식으로 내보내기/가져오기
- 회사 전문 용어, 가족 내부 별명 등 활용

### 5.3 게임 진행

#### 5.3.1 화면 구성
```
┌─────────────────────────────────────┐
│  초성 퀴즈  [카테고리: 영화]  ⏱ 25초 │
├─────────────────────────────────────┤
│                                     │
│            ㄱ  ㅅ  ㅊ                │
│                                     │
│          [힌트 보기 1/3]            │
│                                     │
│      [정답 입력 ___________]        │
│                                     │
│          [제출]  [패스]              │
│                                     │
│  점수: 850점  |  남은 문제: 7/10     │
└─────────────────────────────────────┘
```

#### 5.3.2 초성 표시
- 큰 글씨 (72px~96px)
- 자간 넓게 (letter-spacing: 1rem)
- 색상: 그라데이션 또는 브랜드 컬러
- 애니메이션: fade-in, bounce

#### 5.3.3 힌트 시스템 (3단계)
1. **힌트 1**: 카테고리 세부 정보
   - 예: "2020년 개봉한 한국 영화"

2. **힌트 2**: 글자 수 공개
   - 예: "3글자"

3. **힌트 3**: 첫 글자 공개
   - 예: "기 _ _"

- 힌트 사용 시 점수 감점 (-50점/힌트)
- 힌트 버튼 UI: 자물쇠 아이콘 → 클릭 시 잠금 해제 애니메이션

#### 5.3.4 타이머
- 원형 프로그레스 바 (SVG Circle)
- 남은 시간 숫자 표시
- 10초 이하: 빨간색 + 깜빡임 효과
- 시간 종료: 부저 사운드 (선택 사항)

#### 5.3.5 정답 입력
- 자동 포커스 input 필드
- 한글 입력 자동 감지
- Enter 키로 제출
- 실시간 초성 일치 여부 표시 (선택 사항)

#### 5.3.6 정답 공개 애니메이션
- 정답:
  - 초록색 배경 flash
  - 축하 파티클 효과 (선택 사항)
  - "정답입니다!" 메시지 + 획득 점수

- 오답:
  - 빨간색 배경 flash
  - "아쉽네요! 정답은 [XXX]" 메시지
  - 다음 문제로 자동 진행 (2초 후)

### 5.4 점수 시스템

#### 5.4.1 점수 계산 공식
```typescript
baseScore = 100; // 기본 점수
timeBonus = Math.floor((remainingTime / totalTime) * 100); // 시간 보너스 (0~100)
hintPenalty = hintsUsed * 50; // 힌트 사용 감점
finalScore = baseScore + timeBonus - hintPenalty;
```

#### 5.4.2 점수 표시
- 실시간 총점 표시
- 문제별 획득 점수 애니메이션 (카운터 증가 효과)
- 최고 점수 표시 (LocalStorage)

#### 5.4.3 리더보드 (선택 사항)
- 로컬 최고 점수 Top 5
- 닉네임 입력 가능
- 카테고리별 최고 점수 분리

### 5.5 게임 종료 화면
```
┌─────────────────────────────────────┐
│         게임 종료!                   │
├─────────────────────────────────────┤
│                                     │
│       최종 점수: 1,250점            │
│       정답: 7/10                    │
│       정답률: 70%                   │
│       평균 응답 시간: 18초          │
│                                     │
│  [다시 하기]  [다른 카테고리]       │
│                                     │
│       결과 공유하기                 │
│  [트위터] [페이스북] [링크 복사]    │
└─────────────────────────────────────┘
```

## 6. 한글 초성 추출 알고리즘

### 6.1 ES Hangul 라이브러리 사용

#### 6.1.1 초성 추출 함수
```typescript
import { getChoseong } from 'es-hangul';

/**
 * 주어진 단어에서 초성만 추출
 * @param word - 한글 단어
 * @returns 초성 문자열
 *
 * @example
 * extractChosung('기생충') // 'ㄱㅅㅊ'
 * extractChosung('아이언맨') // 'ㅇㅇㅇㅁ'
 * extractChosung('대한민국') // 'ㄷㅎㅁㄱ'
 */
export function extractChosung(word: string): string {
  return getChoseong(word);
}
```

#### 6.1.2 초성 비교 함수
```typescript
/**
 * 사용자 입력과 정답의 초성을 비교
 * @param userInput - 사용자가 입력한 단어
 * @param correctAnswer - 정답 단어
 * @returns 초성이 일치하면 true
 *
 * @example
 * compareChosung('기생충', '기생충') // true
 * compareChosung('기생중', '기생충') // true (초성 동일)
 * compareChosung('고생충', '기생충') // false
 */
export function compareChosung(
  userInput: string,
  correctAnswer: string
): boolean {
  const userChosung = getChoseong(userInput);
  const answerChosung = getChoseong(correctAnswer);
  return userChosung === answerChosung;
}
```

#### 6.1.3 정답 검증 함수
```typescript
/**
 * 사용자 입력이 정답인지 검증
 * - 완전 일치 우선
 * - 초성 일치도 허용 (선택 사항)
 *
 * @param userInput - 사용자 입력
 * @param correctAnswer - 정답
 * @param strictMode - true면 완전 일치만 허용
 * @returns 정답 여부
 */
export function validateAnswer(
  userInput: string,
  correctAnswer: string,
  strictMode: boolean = false
): boolean {
  // 공백 제거 및 소문자 변환
  const normalizedInput = userInput.trim().toLowerCase();
  const normalizedAnswer = correctAnswer.trim().toLowerCase();

  // 완전 일치
  if (normalizedInput === normalizedAnswer) {
    return true;
  }

  // 엄격 모드가 아니면 초성 일치도 허용
  if (!strictMode) {
    return compareChosung(normalizedInput, normalizedAnswer);
  }

  return false;
}
```

### 6.2 자체 구현 알고리즘 (백업용)

ES Hangul을 사용하지 못할 경우를 대비한 자체 구현:

```typescript
/**
 * 한글 초성 추출 (ES Hangul 없이 자체 구현)
 * 유니코드 기반 알고리즘
 */

// 한글 유니코드 범위
const HANGUL_START = 0xAC00; // '가'
const HANGUL_END = 0xD7A3;   // '힣'

// 초성 리스트 (19개)
const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
  'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// 중성 리스트 (21개)
const JUNGSUNG_LIST = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

// 종성 리스트 (28개, 받침 없음 포함)
const JONGSUNG_LIST = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ',
  'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ',
  'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

/**
 * 한글 한 글자를 초성, 중성, 종성으로 분리
 */
export function disassembleHangul(char: string): {
  chosung: string;
  jungsung: string;
  jongsung: string;
} | null {
  const code = char.charCodeAt(0);

  // 한글 범위 체크
  if (code < HANGUL_START || code > HANGUL_END) {
    return null;
  }

  const offset = code - HANGUL_START;

  // 초성: 588로 나눈 몫
  const chosungIndex = Math.floor(offset / 588);

  // 중성: 588로 나눈 나머지를 28로 나눈 몫
  const jungsungIndex = Math.floor((offset % 588) / 28);

  // 종성: 28로 나눈 나머지
  const jongsungIndex = offset % 28;

  return {
    chosung: CHOSUNG_LIST[chosungIndex],
    jungsung: JUNGSUNG_LIST[jungsungIndex],
    jongsung: JONGSUNG_LIST[jongsungIndex]
  };
}

/**
 * 단어에서 초성만 추출 (자체 구현)
 */
export function extractChosungManual(word: string): string {
  let result = '';

  for (const char of word) {
    // 한글인 경우
    const parts = disassembleHangul(char);
    if (parts) {
      result += parts.chosung;
    }
    // 공백은 유지
    else if (char === ' ') {
      result += ' ';
    }
    // 기타 문자는 그대로 (영어, 숫자 등)
    else {
      result += char;
    }
  }

  return result;
}

/**
 * 사용 예시
 */
// extractChosungManual('기생충'); // 'ㄱㅅㅊ'
// extractChosungManual('아이언맨'); // 'ㅇㅇㅇㅁ'
// extractChosungManual('스파이더맨 노 웨이 홈'); // 'ㅅㅍㅇㄷㅁ ㄴ ㅇㅇ ㅎ'
```

### 6.3 알고리즘 선택 가이드

| 상황 | 권장 방법 |
|------|-----------|
| 일반적인 경우 | ES Hangul의 `getChoseong()` 사용 |
| 번들 크기 최소화 필요 | 자체 구현 `extractChosungManual()` 사용 |
| 복잡한 한글 처리 필요 | ES Hangul (다양한 유틸 함수 제공) |
| 교육 목적 | 자체 구현 (알고리즘 이해도 향상) |

## 7. 카테고리별 단어 데이터

### 7.1 데이터 구조

```typescript
/**
 * 퀴즈 문제 타입 정의
 */
export interface QuizWord {
  id: string;              // 고유 ID (UUID)
  word: string;            // 정답 단어
  chosung: string;         // 초성 (자동 생성)
  category: Category;      // 카테고리
  difficulty: Difficulty;  // 난이도
  hints: Hint[];          // 힌트 배열
  relatedWords?: string[]; // 관련 단어 (동의어, 유사어)
}

export interface Hint {
  level: 1 | 2 | 3;       // 힌트 단계
  content: string;         // 힌트 내용
}

export type Category =
  | 'movie'           // 영화
  | 'food'            // 음식
  | 'proverb'         // 속담/사자성어
  | 'kpop'            // K-POP
  | 'celebrity'       // 유명인
  | 'drama'           // 드라마
  | 'custom';         // 커스텀

export type Difficulty = 'easy' | 'normal' | 'hard';
```

### 7.2 데이터 예시

```typescript
// src/data/movies.ts
import { QuizWord } from '../types';

export const movieQuizData: QuizWord[] = [
  {
    id: 'movie-001',
    word: '기생충',
    chosung: 'ㄱㅅㅊ',
    category: 'movie',
    difficulty: 'easy',
    hints: [
      { level: 1, content: '2019년 개봉한 봉준호 감독의 영화' },
      { level: 2, content: '3글자' },
      { level: 3, content: '기 _ _' }
    ],
    relatedWords: ['Parasite']
  },
  {
    id: 'movie-002',
    word: '타이타닉',
    chosung: 'ㅌㅇㅌㄴ',
    category: 'movie',
    difficulty: 'easy',
    hints: [
      { level: 1, content: '1997년 제임스 카메론 감독의 로맨스 영화' },
      { level: 2, content: '4글자' },
      { level: 3, content: '타 _ _ _' }
    ]
  },
  {
    id: 'movie-003',
    word: '인터스텔라',
    chosung: 'ㅇㅌㅅㅌㄹ',
    category: 'movie',
    difficulty: 'normal',
    hints: [
      { level: 1, content: '2014년 크리스토퍼 놀란 감독의 SF 영화' },
      { level: 2, content: '5글자' },
      { level: 3, content: '인 _ _ _ _' }
    ]
  }
];
```

```typescript
// src/data/foods.ts
export const foodQuizData: QuizWord[] = [
  {
    id: 'food-001',
    word: '불고기',
    chosung: 'ㅂㄱㄱ',
    category: 'food',
    difficulty: 'easy',
    hints: [
      { level: 1, content: '한국의 대표적인 고기 요리' },
      { level: 2, content: '3글자' },
      { level: 3, content: '불 _ _' }
    ]
  },
  {
    id: 'food-002',
    word: '김치찌개',
    chosung: 'ㄱㅊㅉㄱ',
    category: 'food',
    difficulty: 'easy',
    hints: [
      { level: 1, content: '한국의 대표적인 찌개 요리' },
      { level: 2, content: '4글자' },
      { level: 3, content: '김 _ _ _' }
    ]
  },
  {
    id: 'food-003',
    word: '까르보나라',
    chosung: 'ㄲㄹㅂㄴㄹ',
    category: 'food',
    difficulty: 'normal',
    hints: [
      { level: 1, content: '크림 소스를 사용한 이탈리아 파스타' },
      { level: 2, content: '5글자' },
      { level: 3, content: '까 _ _ _ _' }
    ]
  }
];
```

```typescript
// src/data/proverbs.ts
export const proverbQuizData: QuizWord[] = [
  {
    id: 'proverb-001',
    word: '세 살 버릇 여든까지 간다',
    chosung: 'ㅅ ㅅ ㅂㄹ ㅇㄷㄲㅈ ㄱㄷ',
    category: 'proverb',
    difficulty: 'normal',
    hints: [
      { level: 1, content: '어릴 때 몸에 밴 버릇은 늙어서도 고치기 어렵다' },
      { level: 2, content: '10글자 (띄어쓰기 포함)' },
      { level: 3, content: '세 살 _ _ _ _ _ _ _ _' }
    ]
  },
  {
    id: 'proverb-002',
    word: '금상첨화',
    chosung: 'ㄱㅅㅊㅎ',
    category: 'proverb',
    difficulty: 'hard',
    hints: [
      { level: 1, content: '좋은 일 위에 또 좋은 일이 더해짐 (사자성어)' },
      { level: 2, content: '4글자' },
      { level: 3, content: '금 _ _ _' }
    ]
  }
];
```

### 7.3 데이터 관리 전략

#### 7.3.1 파일 구조
```
src/
├── data/
│   ├── index.ts          # 모든 데이터 통합 export
│   ├── movies.ts         # 영화 100개
│   ├── foods.ts          # 음식 100개
│   ├── proverbs.ts       # 속담/사자성어 100개
│   ├── kpop.ts           # K-POP 노래 100개
│   ├── celebrities.ts    # 유명인 100개
│   └── dramas.ts         # 드라마 100개
```

#### 7.3.2 데이터 통합
```typescript
// src/data/index.ts
import { movieQuizData } from './movies';
import { foodQuizData } from './foods';
import { proverbQuizData } from './proverbs';
import { kpopQuizData } from './kpop';
import { celebrityQuizData } from './celebrities';
import { dramaQuizData } from './dramas';

export const quizDatabase = {
  movie: movieQuizData,
  food: foodQuizData,
  proverb: proverbQuizData,
  kpop: kpopQuizData,
  celebrity: celebrityQuizData,
  drama: dramaQuizData
};

/**
 * 카테고리별 퀴즈 데이터 가져오기
 */
export function getQuizByCategory(category: Category): QuizWord[] {
  return quizDatabase[category] || [];
}

/**
 * 난이도별 필터링
 */
export function filterByDifficulty(
  data: QuizWord[],
  difficulty: Difficulty
): QuizWord[] {
  return data.filter(q => q.difficulty === difficulty);
}

/**
 * 랜덤 문제 선택
 */
export function getRandomQuiz(
  category: Category,
  count: number = 10
): QuizWord[] {
  const data = getQuizByCategory(category);
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
```

### 7.4 카테고리별 단어 예시 목록

#### 영화 (movie) - 100개 예시
```
쉬움: 기생충, 타이타닉, 아바타, 겨울왕국, 어벤져스
보통: 인터스텔라, 인셉션, 쇼생크탈출, 죽은시인의사회
어려움: 그랜드부다페스트호텔, 닥터스트레인지러브
```

#### 음식 (food) - 100개 예시
```
쉬움: 불고기, 김치, 피자, 치킨, 햄버거
보통: 떡볶이, 김치찌개, 파스타, 스테이크
어려움: 까르보나라, 부야베스, 라따뚜이
```

#### 속담/사자성어 (proverb) - 100개 예시
```
쉬움: 서당개삼년이면풍월을읊는다
보통: 금상첨화, 일석이조, 새옹지마
어려움: 각주구검, 괄목상대, 견물생심
```

#### K-POP (kpop) - 100개 예시
```
쉬움: 강남스타일, 다이너마이트, 아파트
보통: 봄날, 러브다이브, 하입보이
어려움: 마이크로코스모스, 판타스틱베이비
```

#### 유명인 (celebrity) - 100개 예시
```
쉬움: 손흥민, 봉준호, 방탄소년단
보통: 김연아, 류현진, 윤여정
어려움: 정의선, 권오현, 장범준
```

#### 드라마 (drama) - 100개 예시
```
쉬움: 오징어게임, 사랑의불시착
보통: 이상한변호사우영우, 도깨비
어려움: 나의아저씨, 미스터션샤인
```

## 8. 컴포넌트 구조

### 8.1 컴포넌트 트리
```
App
├── GameSettingsPage
│   ├── CategorySelector
│   ├── DifficultySelector
│   ├── ModeSelector (싱글/멀티)
│   └── StartButton
│
├── GamePlayPage
│   ├── GameHeader
│   │   ├── Timer
│   │   ├── Score
│   │   └── ProgressBar
│   │
│   ├── ChosungDisplay
│   │   └── ChosungLetters (애니메이션)
│   │
│   ├── HintSection
│   │   └── HintButton (3개)
│   │
│   ├── AnswerInput
│   │   ├── InputField
│   │   └── SubmitButton
│   │
│   └── GameControls
│       ├── PassButton
│       └── QuitButton
│
├── GameResultPage
│   ├── ScoreSummary
│   ├── Statistics
│   ├── Leaderboard (로컬)
│   └── ActionButtons
│       ├── PlayAgainButton
│       ├── ChangeCategoryButton
│       └── ShareButton
│
└── CustomWordsPage (커스텀 카테고리)
    ├── WordList
    ├── AddWordForm
    └── ImportExportButtons
```

### 8.2 주요 컴포넌트 상세

#### 8.2.1 App.tsx
```typescript
import { useState } from 'react';
import GameSettingsPage from './pages/GameSettingsPage';
import GamePlayPage from './pages/GamePlayPage';
import GameResultPage from './pages/GameResultPage';

type GameState = 'settings' | 'playing' | 'result';

function App() {
  const [gameState, setGameState] = useState<GameState>('settings');
  const [gameConfig, setGameConfig] = useState({
    category: 'movie' as Category,
    difficulty: 'normal' as Difficulty,
    mode: 'single' as 'single' | 'multi',
    questionCount: 10
  });
  const [gameResult, setGameResult] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      {gameState === 'settings' && (
        <GameSettingsPage
          onStart={(config) => {
            setGameConfig(config);
            setGameState('playing');
          }}
        />
      )}

      {gameState === 'playing' && (
        <GamePlayPage
          config={gameConfig}
          onFinish={(result) => {
            setGameResult(result);
            setGameState('result');
          }}
        />
      )}

      {gameState === 'result' && (
        <GameResultPage
          result={gameResult}
          onPlayAgain={() => setGameState('playing')}
          onChangeCategory={() => setGameState('settings')}
        />
      )}
    </div>
  );
}

export default App;
```

#### 8.2.2 ChosungDisplay.tsx
```typescript
interface ChosungDisplayProps {
  chosung: string;
  revealed?: boolean;
  answer?: string;
}

function ChosungDisplay({ chosung, revealed, answer }: ChosungDisplayProps) {
  const letters = chosung.split(' ');

  return (
    <div className="flex justify-center items-center gap-4 my-8">
      {letters.map((letter, index) => (
        <div
          key={index}
          className="w-20 h-20 flex items-center justify-center
                     bg-white rounded-2xl shadow-lg
                     text-6xl font-bold text-purple-600
                     animate-bounce"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {revealed ? answer?.[index] || letter : letter}
        </div>
      ))}
    </div>
  );
}
```

#### 8.2.3 Timer.tsx
```typescript
import { useEffect, useState } from 'react';

interface TimerProps {
  duration: number; // 초 단위
  onTimeUp: () => void;
}

function Timer({ duration, onTimeUp }: TimerProps) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (remaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining, onTimeUp]);

  const percentage = (remaining / duration) * 100;
  const isLowTime = remaining <= 10;

  return (
    <div className="relative w-24 h-24">
      {/* SVG Circle Progress */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke={isLowTime ? '#ef4444' : '#8b5cf6'}
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 40}`}
          strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
          className={isLowTime ? 'animate-pulse' : ''}
        />
      </svg>

      {/* 중앙 숫자 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold ${isLowTime ? 'text-red-500' : 'text-purple-600'}`}>
          {remaining}
        </span>
      </div>
    </div>
  );
}
```

#### 8.2.4 HintSection.tsx
```typescript
interface HintSectionProps {
  hints: Hint[];
  onUseHint: (level: number) => void;
  usedHints: number[];
}

function HintSection({ hints, onUseHint, usedHints }: HintSectionProps) {
  return (
    <div className="flex gap-4 justify-center my-6">
      {hints.map((hint) => {
        const isUsed = usedHints.includes(hint.level);

        return (
          <button
            key={hint.level}
            onClick={() => !isUsed && onUseHint(hint.level)}
            disabled={isUsed}
            className={`px-6 py-3 rounded-lg font-semibold transition-all
              ${isUsed
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'
              }`}
          >
            {isUsed ? (
              <div className="flex items-center gap-2">
                <span>🔓</span>
                <span>{hint.content}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>힌트 {hint.level} (-50점)</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

## 9. 게임 로직 구현

### 9.1 상태 관리

```typescript
// src/hooks/useGameLogic.ts
import { useState, useEffect } from 'react';
import { QuizWord, Category, Difficulty } from '../types';
import { getRandomQuiz } from '../data';
import { validateAnswer } from '../utils/hangul';

interface GameState {
  currentQuestionIndex: number;
  questions: QuizWord[];
  score: number;
  correctCount: number;
  usedHints: number[];
  startTime: number;
  isFinished: boolean;
}

export function useGameLogic(
  category: Category,
  difficulty: Difficulty,
  questionCount: number
) {
  const [state, setState] = useState<GameState>({
    currentQuestionIndex: 0,
    questions: getRandomQuiz(category, questionCount),
    score: 0,
    correctCount: 0,
    usedHints: [],
    startTime: Date.now(),
    isFinished: false
  });

  const currentQuestion = state.questions[state.currentQuestionIndex];

  const submitAnswer = (userAnswer: string) => {
    const isCorrect = validateAnswer(userAnswer, currentQuestion.word);

    if (isCorrect) {
      const timeBonus = calculateTimeBonus();
      const hintPenalty = state.usedHints.length * 50;
      const questionScore = 100 + timeBonus - hintPenalty;

      setState(prev => ({
        ...prev,
        score: prev.score + questionScore,
        correctCount: prev.correctCount + 1
      }));
    }

    moveToNextQuestion();
  };

  const useHint = (level: number) => {
    setState(prev => ({
      ...prev,
      usedHints: [...prev.usedHints, level]
    }));
  };

  const moveToNextQuestion = () => {
    if (state.currentQuestionIndex >= state.questions.length - 1) {
      setState(prev => ({ ...prev, isFinished: true }));
    } else {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        usedHints: []
      }));
    }
  };

  const calculateTimeBonus = () => {
    // 구현 로직
    return 0;
  };

  return {
    currentQuestion,
    state,
    submitAnswer,
    useHint,
    moveToNextQuestion
  };
}
```

## 10. 배포 및 운영

### 10.1 빌드 및 배포
```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프리뷰
npm run preview

# 배포 (GitHub Pages)
npm run deploy
```

### 10.2 성능 최적화
- Code splitting (React.lazy)
- 이미지 최적화 (WebP 포맷)
- Bundle size 최소화 (ES Hangul만 사용)
- PWA 지원 (오프라인 플레이 가능)

### 10.3 접근성
- 키보드 네비게이션 지원
- ARIA 라벨 추가
- 색상 대비 WCAG AA 준수
- 화면 리더 호환

## 11. 향후 확장 계획

### 11.1 Phase 2 기능
- 온라인 멀티플레이 (WebSocket)
- 실시간 리더보드 (Firebase)
- 음성 인식 답변 입력
- BGM 및 효과음 추가

### 11.2 Phase 3 기능
- AI 기반 난이도 자동 조절
- 사용자 생성 콘텐츠 (UGC) 플랫폼
- 다국어 지원 (영어, 일본어)
- 모바일 앱 (React Native)

## 12. 라이선스 및 크레딧

### 12.1 오픈소스 라이선스
- ES Hangul: MIT License
- React: MIT License
- Vite: MIT License
- Tailwind CSS: MIT License

### 12.2 데이터 출처
- 영화 데이터: KMDB (한국영화데이터베이스)
- 음식 데이터: 한식진흥원
- 속담 데이터: 국립국어원 표준국어대사전
- K-POP 데이터: 멜론, 지니뮤직 차트

### 12.3 제작 정보
- 기획/개발: seolcoding.com
- 디자인: Tailwind CSS 기반 커스텀
- 한글 처리: ES Hangul (Toss)

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

---

**문서 버전**: 1.0
**작성일**: 2025-12-20
**최종 수정일**: 2025-12-20
