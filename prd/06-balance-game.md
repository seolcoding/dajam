# 밸런스 게임 (Balance Game / This or That)

## 1. 개요

### 1.1 프로젝트 설명
A vs B 양자택일 게임으로, 사용자가 두 가지 선택지 중 하나를 고르고 다른 사용자들의 선택 통계를 확인할 수 있는 웹 애플리케이션입니다. 아이스브레이킹, 팀 빌딩, 가치관 탐색 등 다양한 상황에서 활용 가능합니다.

### 1.2 핵심 가치
- **아이스브레이킹 도구**: 처음 만난 사람들과 빠르게 친해질 수 있는 대화 소재 제공
- **가치관 탐색**: 선택을 통해 나와 타인의 가치관, 성향 파악
- **투표 결과 통계**: 실시간 투표 결과를 차트로 시각화하여 트렌드 확인
- **커스터마이징**: 사용자가 직접 질문을 만들고 공유 가능

### 1.3 타겟 유저
- 친구/연인과 재미있는 대화를 나누고 싶은 사용자
- 워크숍/세미나에서 아이스브레이킹이 필요한 진행자
- SNS에 공유할 재미있는 콘텐츠를 찾는 사용자
- 커뮤니티/단체에서 설문 도구가 필요한 운영자

---

## 2. 유사 서비스 분석

### 2.1 국내 서비스

#### BELLRUNS (https://bellruns.com/)
- **특징**: 카테고리별 밸런스 게임 질문 제공 (#황금밸런스게임, #19금밸런스게임 등)
- **예시 질문**: "평생동안 샤워 안하기 vs 양치 안하기"
- **강점**: 다양한 난이도와 주제의 질문 데이터베이스
- **약점**: 통계 시각화, 결과 공유 기능 부재

#### 메타브 (Metavv) - 이상형 밸런스 게임
- **특징**: 인터랙티브 웹 플랫폼, "본능적으로 끌리는 당신의 이상형은?" 테마
- **강점**: 비주얼 중심의 UI/UX
- **약점**: 특정 주제(이상형)에 한정

#### 마인드브릿지 (MindBridge)
- **특징**: 질문 다이어리 앱, 매일 질문 제공, 친구와 답변 공유
- **강점**: 소셜 기능, 지속적인 참여 유도
- **약점**: 앱 설치 필요, 웹 접근성 낮음

### 2.2 해외 서비스

#### Swipe It by Playable (https://playable.com/concepts/swipe-it/)
- **특징**: "this or that" 스타일 게임, 스와이프 인터페이스로 즉각적인 선호도 수집
- **강점**: 직관적인 스와이프 UX, 트렌드/인사이트 추적, 개인화된 결과 제공
- **약점**: 게임 컨셉 단계로 실제 서비스 미확인

#### VoteSwiper (https://www.voteswiper.org/)
- **특징**: 정치적 이슈 질문에 스와이프로 답변, 자신과 맞는 정당 매칭
- **강점**: 중립적 선택지 제공, 결과 공유 기능
- **적용 가능**: 스와이프 인터페이스, 결과 시각화 방식

#### The Vote's Out (https://votesout.com/)
- **특징**: "Would you rather" 및 "This or That" 스타일 파티 게임
- **강점**: 모바일/데스크톱 크로스 플랫폼, 앱 설치 불필요
- **적용 가능**: 웹 기반 접근성, 실시간 투표 시스템

### 2.3 차별화 포인트

본 프로젝트는 다음과 같은 차별점을 가집니다:

1. **스와이프 + 클릭 하이브리드 UX**: 모바일은 스와이프, 데스크톱은 클릭으로 자연스러운 선택 경험 제공
2. **통계 시각화**: Recharts를 활용한 실시간 투표 결과 차트 (막대 그래프, 파이 차트, 트렌드 라인)
3. **결과 이미지 생성**: Canvas API를 활용하여 SNS 공유용 이미지 자동 생성
4. **템플릿 시스템**: 음식, 여행, 가치관 등 카테고리별 질문 템플릿 제공
5. **커스텀 질문**: 사용자가 직접 질문을 만들고 URL로 공유 가능
6. **오프라인 투표 집계**: localStorage 기반 로컬 투표 데이터 저장 및 통계

---

## 3. 오픈소스 라이브러리

### 3.1 데이터 시각화

#### Recharts (추천)
```typescript
// 설치
npm install recharts

// 사용 예시
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const VoteResultChart: React.FC<{ data: VoteData[] }> = ({ data }) => {
  const COLORS = ['#0088FE', '#FF8042'];

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        cx={200}
        cy={200}
        labelLine={false}
        label
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
};
```

**선정 이유**:
- React 네이티브 지원
- TypeScript 타입 정의 완벽
- 반응형 차트 기본 지원
- 커스터마이징 자유도 높음

**대안**: Chart.js - Canvas 기반, 더 가볍지만 React 통합 번거로움

### 3.2 스와이프 제스처

#### react-swipeable
```typescript
// 설치
npm install react-swipeable

// 사용 예시
import { useSwipeable } from 'react-swipeable';

const SwipeCard: React.FC<{ question: Question; onSwipe: (direction: 'left' | 'right') => void }> = ({
  question,
  onSwipe
}) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipe('left'),
    onSwipedRight: () => onSwipe('right'),
    trackMouse: true, // 데스크톱 마우스 드래그 지원
  });

  return (
    <div {...handlers} className="swipe-card">
      <h2>{question.title}</h2>
      <div className="options">
        <div className="option-a">{question.optionA}</div>
        <div className="option-b">{question.optionB}</div>
      </div>
    </div>
  );
};
```

**선정 이유**:
- 가볍고 간단한 API
- 마우스 드래그도 지원
- 스와이프 임계값 커스터마이징 가능

**대안**: react-spring - 더 복잡한 애니메이션 필요 시 사용

### 3.3 Canvas API (결과 이미지 생성)

```typescript
// 외부 라이브러리 불필요, 브라우저 네이티브 API 사용
const generateResultImage = (question: Question, myChoice: 'A' | 'B', stats: VoteStats): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630; // OG 이미지 표준 비율
    const ctx = canvas.getContext('2d')!;

    // 배경
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 질문 텍스트
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(question.title, 600, 100);

    // 선택지 A
    ctx.fillStyle = myChoice === 'A' ? '#0088FE' : '#666666';
    ctx.fillRect(50, 200, 500, 300);
    ctx.fillStyle = '#ffffff';
    ctx.font = '36px sans-serif';
    ctx.fillText(question.optionA, 300, 350);
    ctx.font = '24px sans-serif';
    ctx.fillText(`${stats.percentageA}%`, 300, 400);

    // 선택지 B
    ctx.fillStyle = myChoice === 'B' ? '#FF8042' : '#666666';
    ctx.fillRect(650, 200, 500, 300);
    ctx.fillStyle = '#ffffff';
    ctx.font = '36px sans-serif';
    ctx.fillText(question.optionB, 900, 350);
    ctx.font = '24px sans-serif';
    ctx.fillText(`${stats.percentageB}%`, 900, 400);

    canvas.toBlob((blob) => {
      resolve(blob!);
    });
  });
};
```

### 3.4 기타 유틸리티

#### nanoid (짧은 URL ID 생성)
```typescript
npm install nanoid

import { nanoid } from 'nanoid';

const questionId = nanoid(10); // "V1StGXR8_Z"
const shareUrl = `${window.location.origin}/balance/${questionId}`;
```

---

## 4. 기술 스택

### 4.1 프론트엔드

```json
{
  "name": "balance-game",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.1",
    "recharts": "^2.15.0",
    "react-swipeable": "^7.0.2",
    "nanoid": "^5.0.9",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^6.0.5",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

### 4.2 Tailwind CSS v4 설정

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/balance/', // seolcoding.com/balance/
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

```css
/* src/index.css */
@import "tailwindcss";
```

### 4.3 프로젝트 구조

```
agents/mini-apps/balance-game/
├── public/
│   └── balance-og.png              # OG 이미지
├── src/
│   ├── components/
│   │   ├── QuestionCard.tsx        # 질문 카드 (스와이프 가능)
│   │   ├── ResultChart.tsx         # 투표 결과 차트
│   │   ├── TemplateSelector.tsx    # 템플릿 선택기
│   │   ├── CustomQuestionForm.tsx  # 커스텀 질문 생성 폼
│   │   └── ShareButton.tsx         # 공유 버튼
│   ├── pages/
│   │   ├── HomePage.tsx            # 메인 페이지 (질문 선택)
│   │   ├── GamePage.tsx            # 게임 페이지 (스와이프/선택)
│   │   ├── ResultPage.tsx          # 결과 페이지 (통계)
│   │   └── CreatePage.tsx          # 질문 생성 페이지
│   ├── data/
│   │   ├── templates.ts            # 기본 질문 템플릿
│   │   └── categories.ts           # 카테고리 정의
│   ├── types/
│   │   └── index.ts                # TypeScript 타입 정의
│   ├── utils/
│   │   ├── storage.ts              # localStorage 관리
│   │   ├── imageGenerator.ts       # Canvas 이미지 생성
│   │   └── analytics.ts            # 투표 통계 계산
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 5. 핵심 기능 및 구현

### 5.1 질문 생성 UI

#### CustomQuestionForm.tsx
```typescript
import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { Question, Category } from '../types';

const CustomQuestionForm: React.FC<{ onSubmit: (question: Question) => void }> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [category, setCategory] = useState<Category>('general');
  const [imageA, setImageA] = useState<string>('');
  const [imageB, setImageB] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newQuestion: Question = {
      id: nanoid(10),
      title: title.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      category,
      imageA: imageA.trim() || undefined,
      imageB: imageB.trim() || undefined,
      createdAt: new Date().toISOString(),
      votes: { A: 0, B: 0 },
    };

    onSubmit(newQuestion);

    // 폼 초기화
    setTitle('');
    setOptionA('');
    setOptionB('');
    setImageA('');
    setImageB('');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">새 질문 만들기</h2>

      {/* 질문 제목 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">질문</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 더 중요한 것은?"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          maxLength={100}
        />
      </div>

      {/* 선택지 A */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">선택지 A</label>
        <input
          type="text"
          value={optionA}
          onChange={(e) => setOptionA(e.target.value)}
          placeholder="예: 돈"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          maxLength={50}
        />
        <input
          type="url"
          value={imageA}
          onChange={(e) => setImageA(e.target.value)}
          placeholder="이미지 URL (선택)"
          className="w-full px-4 py-2 border rounded-lg mt-2"
        />
      </div>

      {/* 선택지 B */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">선택지 B</label>
        <input
          type="text"
          value={optionB}
          onChange={(e) => setOptionB(e.target.value)}
          placeholder="예: 사랑"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
          required
          maxLength={50}
        />
        <input
          type="url"
          value={imageB}
          onChange={(e) => setImageB(e.target.value)}
          placeholder="이미지 URL (선택)"
          className="w-full px-4 py-2 border rounded-lg mt-2"
        />
      </div>

      {/* 카테고리 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">카테고리</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="general">일반</option>
          <option value="food">음식</option>
          <option value="travel">여행</option>
          <option value="values">가치관</option>
          <option value="romance">연애</option>
          <option value="work">직장</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:opacity-90 transition"
      >
        질문 생성하기
      </button>
    </form>
  );
};

export default CustomQuestionForm;
```

---

### 5.2 템플릿 제공 (음식, 여행, 가치관)

#### data/templates.ts
```typescript
import { Question } from '../types';

export const questionTemplates: Record<Category, Question[]> = {
  food: [
    {
      id: 'food-1',
      title: '평생 하나만 먹을 수 있다면?',
      optionA: '치킨',
      optionB: '피자',
      category: 'food',
      imageA: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
      imageB: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
    {
      id: 'food-2',
      title: '한 달 동안 매일 먹어야 한다면?',
      optionA: '짜장면',
      optionB: '짬뽕',
      category: 'food',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
    {
      id: 'food-3',
      title: '디저트는 무엇?',
      optionA: '케이크',
      optionB: '아이스크림',
      category: 'food',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
  ],

  travel: [
    {
      id: 'travel-1',
      title: '휴가지를 선택한다면?',
      optionA: '바다',
      optionB: '산',
      category: 'travel',
      imageA: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      imageB: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
    {
      id: 'travel-2',
      title: '여행 스타일은?',
      optionA: '계획적인 여행',
      optionB: '즉흥적인 여행',
      category: 'travel',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
    {
      id: 'travel-3',
      title: '해외여행지는?',
      optionA: '유럽',
      optionB: '동남아',
      category: 'travel',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
  ],

  values: [
    {
      id: 'values-1',
      title: '더 중요한 것은?',
      optionA: '돈',
      optionB: '사랑',
      category: 'values',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
    {
      id: 'values-2',
      title: '5억 받는 조건은?',
      optionA: '나 혼자 5억',
      optionB: '나 10억, 내 원수 20억',
      category: 'values',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
    {
      id: 'values-3',
      title: '당신의 선택은?',
      optionA: '평생 샤워 안하기',
      optionB: '평생 양치 안하기',
      category: 'values',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
  ],

  romance: [
    {
      id: 'romance-1',
      title: '연인의 매력은?',
      optionA: '외모',
      optionB: '유머',
      category: 'romance',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
    {
      id: 'romance-2',
      title: '이상형은?',
      optionA: '연하 같은 연상',
      optionB: '연상 같은 연하',
      category: 'romance',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
  ],

  work: [
    {
      id: 'work-1',
      title: '직장에서 더 중요한 것은?',
      optionA: '높은 연봉',
      optionB: '워라밸',
      category: 'work',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
    {
      id: 'work-2',
      title: '업무 스타일은?',
      optionA: '혼자 집중',
      optionB: '팀 협업',
      category: 'work',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
  ],

  general: [
    {
      id: 'general-1',
      title: '평생 하나만 사용한다면?',
      optionA: 'Netflix',
      optionB: 'YouTube',
      category: 'general',
      createdAt: '2025-01-01T00:00:00Z',
      votes: { A: 0, B: 0 },
    },
  ],
};
```

---

### 5.3 스와이프/클릭 선택

#### components/QuestionCard.tsx
```typescript
import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Question } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onSelect: (choice: 'A' | 'B') => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onSelect }) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      setSwipeOffset(eventData.deltaX);
    },
    onSwipedLeft: () => {
      setIsAnimating(true);
      setSwipeOffset(-500);
      setTimeout(() => {
        onSelect('B');
        setSwipeOffset(0);
        setIsAnimating(false);
      }, 300);
    },
    onSwipedRight: () => {
      setIsAnimating(true);
      setSwipeOffset(500);
      setTimeout(() => {
        onSelect('A');
        setSwipeOffset(0);
        setIsAnimating(false);
      }, 300);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const cardStyle: React.CSSProperties = {
    transform: `translateX(${swipeOffset}px) rotate(${swipeOffset / 20}deg)`,
    transition: isAnimating ? 'transform 0.3s ease-out' : 'none',
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* 스와이프 힌트 */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-16 text-blue-500 opacity-50">
        <ChevronLeft size={48} />
        <span className="text-sm font-bold">A</span>
      </div>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-16 text-pink-500 opacity-50">
        <ChevronRight size={48} />
        <span className="text-sm font-bold">B</span>
      </div>

      {/* 질문 카드 */}
      <div
        {...handlers}
        style={cardStyle}
        className="bg-white rounded-2xl shadow-2xl p-8 cursor-grab active:cursor-grabbing"
      >
        {/* 질문 제목 */}
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          {question.title}
        </h2>

        {/* 선택지 컨테이너 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 옵션 A */}
          <button
            onClick={() => onSelect('A')}
            className="group relative overflow-hidden rounded-xl border-4 border-blue-500 hover:border-blue-600 transition-all hover:scale-105 active:scale-95"
          >
            {question.imageA && (
              <img
                src={question.imageA}
                alt={question.optionA}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6">
              <p className="text-white text-xl font-bold text-center">
                {question.optionA}
              </p>
            </div>
            <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>

          {/* 옵션 B */}
          <button
            onClick={() => onSelect('B')}
            className="group relative overflow-hidden rounded-xl border-4 border-pink-500 hover:border-pink-600 transition-all hover:scale-105 active:scale-95"
          >
            {question.imageB && (
              <img
                src={question.imageB}
                alt={question.optionB}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6">
              <p className="text-white text-xl font-bold text-center">
                {question.optionB}
              </p>
            </div>
            <div className="absolute inset-0 bg-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
        </div>

        {/* 모바일 스와이프 안내 */}
        <p className="text-center text-gray-500 text-sm mt-6 md:hidden">
          👈 왼쪽으로 스와이프하면 B 선택 | 오른쪽으로 스와이프하면 A 선택 👉
        </p>
      </div>
    </div>
  );
};

export default QuestionCard;
```

---

### 5.4 투표 결과 집계 (localStorage)

#### utils/storage.ts
```typescript
import { Question, VoteRecord } from '../types';

const STORAGE_KEY = 'balance-game-votes';
const QUESTIONS_KEY = 'balance-game-questions';

// 투표 기록 저장
export const saveVote = (questionId: string, choice: 'A' | 'B'): void => {
  const votes = getVotes();
  votes[questionId] = choice;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
};

// 투표 기록 조회
export const getVotes = (): Record<string, 'A' | 'B'> => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

// 특정 질문에 대한 투표 여부 확인
export const hasVoted = (questionId: string): boolean => {
  const votes = getVotes();
  return questionId in votes;
};

// 질문별 투표 집계 (시뮬레이션)
export const getQuestionStats = (questionId: string): { A: number; B: number } => {
  // 실제로는 서버 API를 호출해야 하지만, 데모용으로 localStorage 사용
  const statsKey = `stats-${questionId}`;
  const cached = localStorage.getItem(statsKey);

  if (cached) {
    return JSON.parse(cached);
  }

  // 초기 랜덤 데이터 (데모용)
  const randomStats = {
    A: Math.floor(Math.random() * 500) + 100,
    B: Math.floor(Math.random() * 500) + 100,
  };

  localStorage.setItem(statsKey, JSON.stringify(randomStats));
  return randomStats;
};

// 투표 추가 (시뮬레이션)
export const incrementVote = (questionId: string, choice: 'A' | 'B'): void => {
  const stats = getQuestionStats(questionId);
  stats[choice] += 1;
  localStorage.setItem(`stats-${questionId}`, JSON.stringify(stats));
};

// 커스텀 질문 저장
export const saveCustomQuestion = (question: Question): void => {
  const questions = getCustomQuestions();
  questions.push(question);
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
};

// 커스텀 질문 조회
export const getCustomQuestions = (): Question[] => {
  const data = localStorage.getItem(QUESTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

// 질문 ID로 조회
export const getQuestionById = (id: string): Question | null => {
  const questions = getCustomQuestions();
  return questions.find((q) => q.id === id) || null;
};
```

---

### 5.5 통계 차트

#### components/ResultChart.tsx
```typescript
import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Question } from '../types';

interface ResultChartProps {
  question: Question;
  stats: { A: number; B: number };
  myChoice?: 'A' | 'B';
}

const COLORS = {
  A: '#0088FE',
  B: '#FF8042',
};

const ResultChart: React.FC<ResultChartProps> = ({ question, stats, myChoice }) => {
  const totalVotes = stats.A + stats.B;
  const percentageA = ((stats.A / totalVotes) * 100).toFixed(1);
  const percentageB = ((stats.B / totalVotes) * 100).toFixed(1);

  const barData = [
    {
      name: question.optionA,
      votes: stats.A,
      percentage: percentageA,
      fill: COLORS.A,
    },
    {
      name: question.optionB,
      votes: stats.B,
      percentage: percentageB,
      fill: COLORS.B,
    },
  ];

  const pieData = [
    { name: question.optionA, value: stats.A },
    { name: question.optionB, value: stats.B },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-center mb-6">투표 결과</h2>

      {/* 나의 선택 표시 */}
      {myChoice && (
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">나의 선택</p>
          <div
            className="inline-block px-6 py-3 rounded-full font-bold text-white"
            style={{ backgroundColor: COLORS[myChoice] }}
          >
            {myChoice === 'A' ? question.optionA : question.optionB}
          </div>
        </div>
      )}

      {/* 퍼센트 표시 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">{question.optionA}</p>
          <p className="text-4xl font-bold text-blue-600">{percentageA}%</p>
          <p className="text-xs text-gray-500 mt-1">{stats.A.toLocaleString()}명</p>
        </div>
        <div className="text-center p-4 bg-pink-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">{question.optionB}</p>
          <p className="text-4xl font-bold text-pink-600">{percentageB}%</p>
          <p className="text-xs text-gray-500 mt-1">{stats.B.toLocaleString()}명</p>
        </div>
      </div>

      {/* 막대 그래프 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-center">비교 차트</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString()}명`, '투표 수']}
            />
            <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 파이 차트 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">비율</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? COLORS.A : COLORS.B}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toLocaleString()}명`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 총 투표 수 */}
      <p className="text-center text-gray-500 text-sm mt-6">
        총 {totalVotes.toLocaleString()}명이 참여했습니다
      </p>
    </div>
  );
};

export default ResultChart;
```

---

### 5.6 결과 이미지 생성

#### utils/imageGenerator.ts
```typescript
import { Question } from '../types';

export interface ResultImageOptions {
  question: Question;
  myChoice: 'A' | 'B';
  stats: { A: number; B: number };
  percentageA: number;
  percentageB: number;
}

export const generateResultImage = async (
  options: ResultImageOptions
): Promise<Blob> => {
  const { question, myChoice, stats, percentageA, percentageB } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630; // OG 이미지 표준 비율 (1.91:1)

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 상단 라벨
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('밸런스 게임 결과', 600, 60);

    // 질문 제목
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(question.title, 600, 130);

    // 선택지 A 영역
    const boxAX = 100;
    const boxAY = 200;
    const boxWidth = 450;
    const boxHeight = 350;

    ctx.fillStyle = myChoice === 'A' ? '#0088FE' : '#4B5563';
    ctx.roundRect(boxAX, boxAY, boxWidth, boxHeight, 20);
    ctx.fill();

    // 선택지 A 텍스트
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(question.optionA, boxAX + boxWidth / 2, boxAY + 100);

    ctx.font = 'bold 72px sans-serif';
    ctx.fillText(`${percentageA.toFixed(1)}%`, boxAX + boxWidth / 2, boxAY + 200);

    ctx.font = '24px sans-serif';
    ctx.fillText(`${stats.A.toLocaleString()}명`, boxAX + boxWidth / 2, boxAY + 250);

    if (myChoice === 'A') {
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('✓ 나의 선택', boxAX + boxWidth / 2, boxAY + 300);
    }

    // 선택지 B 영역
    const boxBX = 650;
    const boxBY = 200;

    ctx.fillStyle = myChoice === 'B' ? '#FF8042' : '#4B5563';
    ctx.roundRect(boxBX, boxBY, boxWidth, boxHeight, 20);
    ctx.fill();

    // 선택지 B 텍스트
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(question.optionB, boxBX + boxWidth / 2, boxBY + 100);

    ctx.font = 'bold 72px sans-serif';
    ctx.fillText(`${percentageB.toFixed(1)}%`, boxBX + boxWidth / 2, boxBY + 200);

    ctx.font = '24px sans-serif';
    ctx.fillText(`${stats.B.toLocaleString()}명`, boxBX + boxWidth / 2, boxBY + 250);

    if (myChoice === 'B') {
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('✓ 나의 선택', boxBX + boxWidth / 2, boxBY + 300);
    }

    // 하단 브랜딩
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.fillText('seolcoding.com/balance', 600, 600);

    // Canvas를 Blob으로 변환
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate image'));
      }
    }, 'image/png');
  });
};

// 이미지 다운로드 트리거
export const downloadImage = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// 클립보드에 복사
export const copyImageToClipboard = async (blob: Blob): Promise<void> => {
  if (!navigator.clipboard || !ClipboardItem) {
    throw new Error('Clipboard API not supported');
  }

  const item = new ClipboardItem({ 'image/png': blob });
  await navigator.clipboard.write([item]);
};
```

#### components/ShareButton.tsx
```typescript
import React, { useState } from 'react';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { generateResultImage, downloadImage, copyImageToClipboard } from '../utils/imageGenerator';
import { ResultImageOptions } from '../utils/imageGenerator';

interface ShareButtonProps {
  imageOptions: ResultImageOptions;
  questionId: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ imageOptions, questionId }) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await generateResultImage(imageOptions);
      downloadImage(blob, `balance-game-${questionId}.png`);
    } catch (error) {
      console.error('이미지 생성 실패:', error);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyImage = async () => {
    setLoading(true);
    try {
      const blob = await generateResultImage(imageOptions);
      await copyImageToClipboard(blob);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      alert('클립보드 복사에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/balance/${questionId}`;
    const shareText = `${imageOptions.question.title}\n나는 "${
      imageOptions.myChoice === 'A'
        ? imageOptions.question.optionA
        : imageOptions.question.optionB
    }" 선택!`;

    if (navigator.share) {
      try {
        const blob = await generateResultImage(imageOptions);
        const file = new File([blob], `balance-game-${questionId}.png`, {
          type: 'image/png',
        });

        await navigator.share({
          title: '밸런스 게임 결과',
          text: shareText,
          url: shareUrl,
          files: [file],
        });
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      // Web Share API 미지원 시 URL 복사
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className="flex gap-3 justify-center mt-6">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
      >
        <Download size={20} />
        이미지 저장
      </button>

      <button
        onClick={handleCopyImage}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
      >
        {copied ? <Check size={20} /> : <Copy size={20} />}
        {copied ? '복사됨!' : '이미지 복사'}
      </button>

      <button
        onClick={handleShare}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
      >
        <Share2 size={20} />
        공유하기
      </button>
    </div>
  );
};

export default ShareButton;
```

---

### 5.7 커스텀 질문 추가

#### pages/CreatePage.tsx
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomQuestionForm from '../components/CustomQuestionForm';
import { Question } from '../types';
import { saveCustomQuestion } from '../utils/storage';
import { ArrowLeft, Sparkles } from 'lucide-react';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleQuestionCreate = (question: Question) => {
    saveCustomQuestion(question);
    const url = `${window.location.origin}/balance/custom/${question.id}`;
    setShareUrl(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            돌아가기
          </button>
          <div className="flex items-center gap-2 text-purple-600">
            <Sparkles size={24} />
            <h1 className="text-2xl font-bold">나만의 질문 만들기</h1>
          </div>
        </div>

        {/* 폼 */}
        <CustomQuestionForm onSubmit={handleQuestionCreate} />

        {/* 공유 URL */}
        {shareUrl && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-green-600">✓ 질문이 생성되었습니다!</h3>
            <p className="text-gray-700 mb-2">아래 링크를 공유하세요:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('링크가 복사되었습니다!');
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                복사
              </button>
            </div>
            <button
              onClick={() => navigate(`/game/custom/${shareUrl.split('/').pop()}`)}
              className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-lg font-bold hover:opacity-90"
            >
              바로 플레이하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePage;
```

---

## 6. 데이터 모델

### types/index.ts
```typescript
// 카테고리 타입
export type Category = 'general' | 'food' | 'travel' | 'values' | 'romance' | 'work';

// 질문 타입
export interface Question {
  id: string; // nanoid로 생성된 고유 ID
  title: string; // 질문 제목 (예: "더 중요한 것은?")
  optionA: string; // 선택지 A (예: "돈")
  optionB: string; // 선택지 B (예: "사랑")
  category: Category; // 카테고리
  imageA?: string; // 선택지 A 이미지 URL (선택)
  imageB?: string; // 선택지 B 이미지 URL (선택)
  createdAt: string; // ISO 8601 날짜 (예: "2025-01-01T00:00:00Z")
  votes: {
    A: number; // 선택지 A 투표 수
    B: number; // 선택지 B 투표 수
  };
}

// 투표 기록 타입
export interface VoteRecord {
  questionId: string;
  choice: 'A' | 'B';
  votedAt: string; // ISO 8601 날짜
}

// 통계 데이터 타입
export interface VoteStats {
  A: number; // 선택지 A 투표 수
  B: number; // 선택지 B 투표 수
  total: number; // 총 투표 수
  percentageA: number; // 선택지 A 비율 (0-100)
  percentageB: number; // 선택지 B 비율 (0-100)
}

// 카테고리 메타데이터
export interface CategoryMeta {
  id: Category;
  label: string; // 한글 라벨 (예: "음식")
  emoji: string; // 대표 이모지 (예: "🍕")
  color: string; // Tailwind 색상 클래스 (예: "bg-orange-500")
}

// 공유 URL 파라미터
export interface ShareParams {
  questionId: string;
  myChoice?: 'A' | 'B';
}
```

### data/categories.ts
```typescript
import { CategoryMeta } from '../types';

export const categoryMetadata: Record<Category, CategoryMeta> = {
  general: {
    id: 'general',
    label: '일반',
    emoji: '💬',
    color: 'bg-gray-500',
  },
  food: {
    id: 'food',
    label: '음식',
    emoji: '🍕',
    color: 'bg-orange-500',
  },
  travel: {
    id: 'travel',
    label: '여행',
    emoji: '✈️',
    color: 'bg-blue-500',
  },
  values: {
    id: 'values',
    label: '가치관',
    emoji: '💭',
    color: 'bg-purple-500',
  },
  romance: {
    id: 'romance',
    label: '연애',
    emoji: '💖',
    color: 'bg-pink-500',
  },
  work: {
    id: 'work',
    label: '직장',
    emoji: '💼',
    color: 'bg-indigo-500',
  },
};
```

---

## 7. 컴포넌트 구조

### 7.1 페이지 컴포넌트

#### pages/HomePage.tsx
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryMetadata } from '../data/categories';
import { questionTemplates } from '../data/templates';
import { Category } from '../types';
import { Plus, Shuffle } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category>('general');

  const handleRandomQuestion = () => {
    const categories = Object.keys(questionTemplates) as Category[];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const questions = questionTemplates[randomCategory];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    navigate(`/game/${randomQuestion.id}`);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    const questions = questionTemplates[category];
    if (questions.length > 0) {
      navigate(`/game/${questions[0].id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            밸런스 게임
          </h1>
          <p className="text-xl text-gray-600">
            A vs B, 당신의 선택은?
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4 justify-center mb-12">
          <button
            onClick={handleRandomQuestion}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold text-lg hover:opacity-90 transition shadow-lg"
          >
            <Shuffle size={24} />
            랜덤 질문
          </button>
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full font-bold text-lg hover:opacity-90 transition shadow-lg"
          >
            <Plus size={24} />
            질문 만들기
          </button>
        </div>

        {/* 카테고리 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {(Object.keys(categoryMetadata) as Category[]).map((category) => {
            const meta = categoryMetadata[category];
            const questionCount = questionTemplates[category]?.length || 0;

            return (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`
                  ${meta.color} text-white p-8 rounded-2xl shadow-lg
                  hover:scale-105 transition-transform cursor-pointer
                  flex flex-col items-center gap-4
                `}
              >
                <div className="text-6xl">{meta.emoji}</div>
                <div className="text-2xl font-bold">{meta.label}</div>
                <div className="text-sm opacity-90">{questionCount}개 질문</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
```

#### pages/GamePage.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import { Question } from '../types';
import { questionTemplates } from '../data/templates';
import { getQuestionById, saveVote, incrementVote } from '../utils/storage';
import { ArrowLeft } from 'lucide-react';

const GamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (!id) return;

    // 템플릿 질문 찾기
    let found: Question | null = null;
    for (const category in questionTemplates) {
      const questions = questionTemplates[category as keyof typeof questionTemplates];
      found = questions.find((q) => q.id === id) || null;
      if (found) break;
    }

    // 커스텀 질문 찾기
    if (!found) {
      found = getQuestionById(id);
    }

    setQuestion(found);
  }, [id]);

  const handleSelect = (choice: 'A' | 'B') => {
    if (!question) return;

    saveVote(question.id, choice);
    incrementVote(question.id, choice);
    navigate(`/result/${question.id}`);
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-600">질문을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            돌아가기
          </button>
        </div>

        {/* 질문 카드 */}
        <QuestionCard question={question} onSelect={handleSelect} />
      </div>
    </div>
  );
};

export default GamePage;
```

#### pages/ResultPage.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResultChart from '../components/ResultChart';
import ShareButton from '../components/ShareButton';
import { Question } from '../types';
import { questionTemplates } from '../data/templates';
import { getQuestionById, getQuestionStats, getVotes } from '../utils/storage';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const ResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [stats, setStats] = useState<{ A: number; B: number } | null>(null);
  const [myChoice, setMyChoice] = useState<'A' | 'B' | undefined>(undefined);

  useEffect(() => {
    if (!id) return;

    // 질문 찾기
    let found: Question | null = null;
    for (const category in questionTemplates) {
      const questions = questionTemplates[category as keyof typeof questionTemplates];
      found = questions.find((q) => q.id === id) || null;
      if (found) break;
    }

    if (!found) {
      found = getQuestionById(id);
    }

    setQuestion(found);

    // 통계 조회
    if (found) {
      const voteStats = getQuestionStats(found.id);
      setStats(voteStats);

      const votes = getVotes();
      setMyChoice(votes[found.id]);
    }
  }, [id]);

  const handlePlayAgain = () => {
    navigate('/');
  };

  if (!question || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-pink-100 flex items-center justify-center">
        <p className="text-2xl font-bold text-gray-600">결과를 불러오는 중...</p>
      </div>
    );
  }

  const totalVotes = stats.A + stats.B;
  const percentageA = (stats.A / totalVotes) * 100;
  const percentageB = (stats.B / totalVotes) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            돌아가기
          </button>
          <button
            onClick={handlePlayAgain}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold hover:opacity-90"
          >
            <RefreshCw size={20} />
            다른 질문 하기
          </button>
        </div>

        {/* 결과 차트 */}
        <ResultChart question={question} stats={stats} myChoice={myChoice} />

        {/* 공유 버튼 */}
        {myChoice && (
          <ShareButton
            imageOptions={{
              question,
              myChoice,
              stats,
              percentageA,
              percentageB,
            }}
            questionId={question.id}
          />
        )}
      </div>
    </div>
  );
};

export default ResultPage;
```

### 7.2 라우팅 설정

#### App.tsx
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import CreatePage from './pages/CreatePage';

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/balance">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:id" element={<GamePage />} />
        <Route path="/game/custom/:id" element={<GamePage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/create" element={<CreatePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
```

---

## 8. 배포 설정

### 8.1 GitHub Actions Workflow 추가

`.github/workflows/deploy.yml`에 다음 단계 추가:

```yaml
- name: Build Balance Game
  run: |
    cd agents/mini-apps/balance-game
    pnpm install
    pnpm build
    mkdir -p ../../../public/balance
    cp -r dist/* ../../../public/balance/
```

### 8.2 배포 URL

- **로컬 개발**: `http://localhost:5173`
- **프로덕션**: `https://seolcoding.com/balance/`

---

## 9. 추가 기능 아이디어 (Phase 2)

### 9.1 멀티플레이어 모드
- WebSocket을 활용한 실시간 투표
- 친구 초대 링크 생성
- 그룹 투표 결과 비교

### 9.2 서버 통합
- Supabase/Firebase로 실시간 투표 데이터 동기화
- 전체 사용자 통계 (글로벌 트렌드)
- 인기 질문 TOP 10

### 9.3 AI 질문 생성
- Claude API를 활용한 자동 질문 생성
- 사용자 관심사 기반 맞춤 질문 추천

### 9.4 소셜 기능
- 친구와 답변 비교
- 프로필 시스템
- 리더보드 (가장 많이 투표한 사용자)

---

## 10. 참고 자료

### 유사 서비스
- [BELLRUNS](https://bellruns.com/) - 밸런스 게임 질문 모음
- [Swipe It by Playable](https://playable.com/concepts/swipe-it/) - 스와이프 인터페이스 참고
- [VoteSwiper](https://www.voteswiper.org/) - 정치 이슈 투표 앱
- [The Vote's Out](https://votesout.com/) - "Would you rather" 파티 게임
- [VoxVote](https://www.voxvote.com/) - 실시간 투표 차트

### 기술 문서
- [React 19 공식 문서](https://react.dev/)
- [Recharts 문서](https://recharts.org/)
- [react-swipeable GitHub](https://github.com/FormidableLabs/react-swipeable)
- [Canvas API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Tailwind CSS v4](https://tailwindcss.com/)

---

## 마무리

이 PRD는 밸런스 게임 미니앱의 전체 구조와 핵심 기능을 상세하게 정의합니다. 모든 코드는 TypeScript로 작성되었으며, React 19 + Vite + Tailwind CSS v4 기술 스택을 사용합니다.

**핵심 특징**:
- 스와이프 + 클릭 하이브리드 UX
- Recharts 기반 실시간 통계 시각화
- Canvas API 결과 이미지 생성
- localStorage 기반 오프라인 투표 저장
- 템플릿 질문 + 커스텀 질문 지원

**다음 단계**:
1. `agents/mini-apps/balance-game/` 폴더 생성
2. Vite + React 프로젝트 초기화
3. 이 PRD에 정의된 컴포넌트 구현
4. GitHub Actions 배포 설정 추가

---

## 11. MCP 개발 도구

### 11.1 UI 컴포넌트 개발
- **Shadcn UI**: 검증된 컴포넌트 라이브러리
- `pnpm dlx shadcn@latest add [component]`로 추가
- `@mini-apps/ui` 패키지에서 공유

### 11.2 브라우저 테스트
- **Chrome DevTools MCP**: 실시간 UI 확인 및 디버깅
- 스냅샷/스크린샷으로 렌더링 확인
- 콘솔/네트워크 요청 분석
- 반응형 테스트 (모바일 뷰포트)

> 자세한 사용법은 `agents/mini-apps/CLAUDE.md` 참조
