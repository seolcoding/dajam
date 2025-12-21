# 실시간 투표 플랫폼 (Live Voting Platform)

## 1. 개요

### 1.1 앱 설명
실시간 투표 플랫폼은 오프라인 행사, 강의, 회의에서 참가자들의 의견을 즉시 수집하고 시각화하는 웹 애플리케이션입니다. 호스트는 QR 코드 또는 URL로 투표를 생성하고, 참가자는 모바일 기기로 익명 투표하며, 결과는 대형 화면에 실시간으로 표시됩니다.

### 1.2 타겟 사용자
- 강사/교육자: 실시간 학습 피드백, 이해도 체크
- 발표자/연사: 청중 참여 유도, 설문 조사
- 회의 진행자: 의사결정, 팀 투표
- 이벤트 매니저: 행사 만족도 조사

### 1.3 핵심 가치
- **즉시성**: 투표 생성부터 결과 공유까지 1분 이내
- **접근성**: QR 스캔 또는 짧은 URL로 앱 설치 없이 참여
- **익명성**: 참가자 신원 보호
- **시각화**: 실시간 차트 업데이트, 애니메이션 효과
- **단순성**: 복잡한 설정 없이 바로 시작

### 1.4 사용 시나리오
1. **워크샵 아이스브레이커**: "오늘 기분을 이모지로 표현하면?"
2. **강의 중 이해도 체크**: "방금 설명한 개념을 이해하셨나요?"
3. **회의 의사결정**: "다음 프로젝트 우선순위는?"
4. **이벤트 만족도**: "오늘 세션 평가 (1-5점)"

---

## 2. 유사 서비스 분석

### 2.1 주요 경쟁 서비스

#### 2.1.1 Mentimeter (https://www.mentimeter.com)
**장점**:
- AI 기반 자동 프레젠테이션 생성
- 다양한 투표 유형 (워드클라우드, 퀴즈, 순위 투표)
- PowerPoint/Google Slides 통합
- 500만+ 사용자

**단점**:
- 무료 플랜 제한 (최대 2개 질문, 5개 퀴즈)
- 복잡한 UI (초보자에게 부담)
- 온라인 의존 (서버 필수)

**가격**: 무료 ~ $11.99/월

#### 2.1.2 Slido (https://www.slido.com)
**장점**:
- 익명 Q&A 기능
- 7가지 투표 유형 (다중 선택, 워드클라우드, 순위, 레이팅)
- Webex/Teams/Zoom 통합
- 엑셀/PDF 결과 내보내기

**단점**:
- 무료 플랜 100명 제한
- 브랜딩 제거 시 유료
- 이벤트 종료 후 데이터 보관 기간 짧음

**가격**: 무료 ~ $10/이벤트

#### 2.1.3 Kahoot (https://kahoot.com)
**장점**:
- 게임 기반 학습 (리더보드, 타이머)
- 재미 요소 강조
- 교육 시장 점유율 1위

**단점**:
- 퀴즈/게임에 특화 (일반 투표 부적합)
- 실시간 답변 강제 (느린 참가자 불리)
- 복잡한 사전 준비

**가격**: 무료 ~ $9.99/월

#### 2.1.4 Poll Everywhere (https://polleverywhere.com)
**장점**:
- SMS 투표 지원 (인터넷 불필요)
- 강력한 데이터 분석
- 대학/기업 대상 엔터프라이즈 기능

**단점**:
- 높은 가격 ($240/년~)
- 무거운 UI
- 모바일 최적화 부족

**가격**: 무료 (25명) ~ $240/년

### 2.2 기능 비교 테이블

| 기능 | Mentimeter | Slido | Kahoot | Poll Everywhere | **우리 앱** |
|------|-----------|-------|--------|----------------|-----------|
| 실시간 투표 | ✅ | ✅ | ✅ | ✅ | ✅ |
| QR 코드 | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| 익명 투표 | ✅ | ✅ | ❌ | ✅ | ✅ |
| 워드클라우드 | ✅ | ✅ | ❌ | ✅ | V2 예정 |
| 순위 투표 | ✅ | ✅ | ❌ | ✅ | ✅ |
| 복수 선택 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 결과 내보내기 | PDF/Excel | Excel/PDF | ✅ | ✅ | JSON/PNG |
| **오프라인 모드** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **서버 불필요** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **무료 인원 제한** | 무제한 | 100명 | 무제한 | 25명 | **무제한** |

### 2.3 차별화 전략

1. **완전 프론트엔드 솔루션**
   - localStorage + BroadcastChannel API로 탭 간 실시간 동기화
   - 서버 비용 제로, 개인정보 수집 제로
   - 오프라인 환경 대응 (로컬 네트워크)

2. **초간단 UX**
   - 3단계 워크플로우: 생성 → QR 공유 → 결과 보기
   - 회원가입 없음, 설정 최소화
   - 모바일 우선 디자인

3. **교육 시장 특화**
   - 한국어 우선 지원
   - 프레젠테이션 모드 (전체화면)
   - 학급/강의실 환경 최적화

4. **무료 & 오픈소스**
   - GitHub 공개, MIT 라이선스
   - 누구나 자체 호스팅 가능

---

## 3. 오픈소스 라이브러리

### 3.1 핵심 라이브러리

| 라이브러리 | 용도 | 라이선스 | 버전 |
|-----------|------|---------|------|
| **qrcode** | QR 코드 생성 | MIT | ^1.5.4 |
| **Recharts** | 차트 시각화 | MIT | ^2.15.0 |
| **nanoid** | 짧은 ID 생성 | MIT | ^5.0.9 |
| **react-confetti** | 투표 완료 애니메이션 | MIT | ^6.1.0 |

### 3.2 설치 명령

```bash
npm install qrcode recharts nanoid react-confetti
npm install -D @types/qrcode
```

### 3.3 대안 라이브러리 비교

#### 3.3.1 차트 라이브러리

| 라이브러리 | 장점 | 단점 | 선택 이유 |
|-----------|------|------|----------|
| **Recharts** ✅ | React 네이티브, 선언적 문법 | 커스텀 제한적 | 간단한 문법, 애니메이션 |
| Chart.js | 다양한 차트, 성능 우수 | React 통합 복잡 | - |
| Victory | 고도 커스터마이징 | 무겁고 복잡 | - |
| D3.js | 최강 유연성 | 학습 곡선 높음 | - |

#### 3.3.2 QR 코드 생성

| 라이브러리 | 장점 | 단점 | 선택 |
|-----------|------|------|------|
| **qrcode** ✅ | 가볍고 빠름, Canvas/SVG 지원 | - | ✅ |
| qrcode.react | React 컴포넌트 | qrcode 래퍼일 뿐 | - |
| node-qrcode | Node.js 전용 | 브라우저 미지원 | - |

---

## 4. 기술 스택

### 4.1 프론트엔드
- **빌드 도구**: Vite 6.x
- **프레임워크**: React 19 + TypeScript 5.7
- **스타일링**: Tailwind CSS v4
- **상태 관리**: Zustand 5.0+ (전역 상태)
- **차트**: Recharts 2.15+
- **QR 코드**: qrcode 1.5+

### 4.2 데이터 동기화
- **로컬 저장소**: localStorage (투표 데이터)
- **탭 간 통신**: BroadcastChannel API
- **실시간 업데이트**: polling (500ms 간격)

### 4.3 개발 환경
- **Node.js**: 20.x LTS
- **패키지 매니저**: npm
- **타입 체크**: TypeScript strict mode
- **린터**: ESLint + Prettier

### 4.4 배포
- **호스팅**: Vercel / Netlify (정적 사이트)
- **도메인**: seolcoding.com/mini-apps/live-voting
- **CI/CD**: GitHub Actions

---

## 5. 핵심 기능 및 구현

### 5.1 투표 생성 (호스트 모드)

#### 5.1.1 기능 요구사항
- 투표 제목 입력 (필수)
- 투표 유형 선택 (단일 선택, 복수 선택, 순위 투표)
- 선택지 추가/삭제 (최소 2개, 최대 10개)
- QR 코드 자동 생성
- 대형 화면용 프레젠테이션 모드

#### 5.1.2 UI 요소
- 제목 입력 필드 (최대 100자)
- 투표 유형 라디오 버튼
- 선택지 입력 폼 (동적 추가/삭제)
- QR 코드 미리보기
- "투표 시작" 버튼

#### 5.1.3 구현 예시

```typescript
// types/poll.ts
export type PollType = 'single' | 'multiple' | 'ranking';

export interface Poll {
  id: string; // nanoid (8자리)
  title: string;
  type: PollType;
  options: string[]; // 선택지
  createdAt: Date;
  expiresAt?: Date; // 선택적 만료 시간
}

export interface Vote {
  id: string; // nanoid
  pollId: string;
  selection: number | number[]; // 단일: 인덱스, 복수: 인덱스 배열, 순위: 정렬된 인덱스
  timestamp: Date;
}

// components/CreatePoll.tsx
import { useState } from 'react';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import { Poll, PollType } from '../types/poll';

export function CreatePoll() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PollType>('single');
  const [options, setOptions] = useState(['', '']);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const createPoll = async () => {
    const poll: Poll = {
      id: nanoid(8),
      title,
      type,
      options: options.filter(opt => opt.trim()),
      createdAt: new Date(),
    };

    // localStorage에 저장
    localStorage.setItem(`poll:${poll.id}`, JSON.stringify(poll));

    // QR 코드 생성
    const url = `${window.location.origin}/vote/${poll.id}`;
    const qrUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
    });
    setQrDataUrl(qrUrl);

    // 호스트 뷰로 이동
    window.location.href = `/host/${poll.id}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">투표 생성</h1>

      {/* 제목 */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="투표 질문 (예: 오늘 점심 메뉴는?)"
        className="w-full px-4 py-3 border rounded-lg mb-4"
        maxLength={100}
      />

      {/* 투표 유형 */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">투표 유형</label>
        <div className="flex gap-4">
          <button
            onClick={() => setType('single')}
            className={`px-4 py-2 rounded ${type === 'single' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            단일 선택
          </button>
          <button
            onClick={() => setType('multiple')}
            className={`px-4 py-2 rounded ${type === 'multiple' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            복수 선택
          </button>
          <button
            onClick={() => setType('ranking')}
            className={`px-4 py-2 rounded ${type === 'ranking' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            순위 투표
          </button>
        </div>
      </div>

      {/* 선택지 */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">선택지</label>
        {options.map((option, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
              placeholder={`선택지 ${index + 1}`}
              className="flex-1 px-4 py-2 border rounded"
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="px-3 py-2 bg-red-500 text-white rounded"
              >
                삭제
              </button>
            )}
          </div>
        ))}
        {options.length < 10 && (
          <button
            onClick={addOption}
            className="mt-2 px-4 py-2 bg-gray-200 rounded"
          >
            + 선택지 추가
          </button>
        )}
      </div>

      {/* 투표 시작 버튼 */}
      <button
        onClick={createPoll}
        disabled={!title.trim() || options.filter(o => o.trim()).length < 2}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-bold disabled:opacity-50"
      >
        투표 시작
      </button>
    </div>
  );
}
```

---

### 5.2 투표 참여 (참가자 모드)

#### 5.2.1 기능 요구사항
- QR 스캔 또는 URL 접속
- 투표 질문 및 선택지 표시
- 투표 제출 (한 번만 가능)
- 중복 투표 방지 (localStorage 기반)
- 투표 완료 확인 메시지

#### 5.2.2 중복 투표 방지 로직

```typescript
// utils/voteValidator.ts

/**
 * 이미 투표했는지 확인
 */
export function hasVoted(pollId: string): boolean {
  const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
  return votedPolls.includes(pollId);
}

/**
 * 투표 완료 기록
 */
export function markAsVoted(pollId: string): void {
  const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
  votedPolls.push(pollId);
  localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
}
```

#### 5.2.3 구현 예시

```typescript
// components/VoteView.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Poll, Vote } from '../types/poll';
import { hasVoted, markAsVoted } from '../utils/voteValidator';
import { nanoid } from 'nanoid';
import Confetti from 'react-confetti';

export function VoteView() {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selection, setSelection] = useState<number | number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // 투표 데이터 로드
    const pollData = localStorage.getItem(`poll:${pollId}`);
    if (!pollData) {
      alert('투표를 찾을 수 없습니다.');
      navigate('/');
      return;
    }

    const parsedPoll = JSON.parse(pollData);
    setPoll(parsedPoll);

    // 이미 투표했는지 확인
    if (hasVoted(pollId!)) {
      setSubmitted(true);
    }
  }, [pollId, navigate]);

  const handleSubmit = () => {
    if (!poll || hasVoted(pollId!)) return;

    const vote: Vote = {
      id: nanoid(),
      pollId: poll.id,
      selection,
      timestamp: new Date(),
    };

    // 투표 저장
    const votesKey = `votes:${poll.id}`;
    const existingVotes = JSON.parse(localStorage.getItem(votesKey) || '[]');
    existingVotes.push(vote);
    localStorage.setItem(votesKey, JSON.stringify(existingVotes));

    // 중복 투표 방지 마킹
    markAsVoted(pollId!);

    // BroadcastChannel로 호스트에게 알림
    const channel = new BroadcastChannel(`poll:${poll.id}`);
    channel.postMessage({ type: 'NEW_VOTE', vote });
    channel.close();

    setSubmitted(true);
  };

  if (!poll) return <div>로딩 중...</div>;

  if (submitted) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Confetti recycle={false} numberOfPieces={200} />
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">투표 완료!</h2>
          <p className="text-gray-600">참여해 주셔서 감사합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{poll.title}</h1>

      <div className="space-y-3">
        {poll.options.map((option, index) => (
          <button
            key={index}
            onClick={() => {
              if (poll.type === 'single') {
                setSelection(index);
              } else if (poll.type === 'multiple') {
                const sel = selection as number[];
                setSelection(
                  sel.includes(index)
                    ? sel.filter(i => i !== index)
                    : [...sel, index]
                );
              }
            }}
            className={`w-full p-4 border-2 rounded-lg text-left transition ${
              (poll.type === 'single' && selection === index) ||
              (poll.type === 'multiple' && (selection as number[]).includes(index))
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={
          (poll.type === 'single' && selection === undefined) ||
          (poll.type === 'multiple' && (selection as number[]).length === 0)
        }
        className="w-full mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg font-bold disabled:opacity-50"
      >
        투표하기
      </button>
    </div>
  );
}
```

---

### 5.3 실시간 결과 (호스트 뷰)

#### 5.3.1 기능 요구사항
- 실시간 차트 업데이트
- 참여자 수 표시
- 프레젠테이션 모드 (전체화면, 폰트 확대)
- 애니메이션 효과 (새 투표 시)

#### 5.3.2 BroadcastChannel 기반 실시간 동기화

```typescript
// hooks/useLiveResults.ts
import { useState, useEffect } from 'react';
import { Poll, Vote } from '../types/poll';

export function useLiveResults(pollId: string) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [poll, setPoll] = useState<Poll | null>(null);

  useEffect(() => {
    // 투표 데이터 로드
    const pollData = localStorage.getItem(`poll:${pollId}`);
    if (pollData) {
      setPoll(JSON.parse(pollData));
    }

    // 기존 투표 로드
    const votesData = localStorage.getItem(`votes:${pollId}`);
    if (votesData) {
      setVotes(JSON.parse(votesData));
    }

    // BroadcastChannel 리스너
    const channel = new BroadcastChannel(`poll:${pollId}`);
    channel.onmessage = (event) => {
      if (event.data.type === 'NEW_VOTE') {
        setVotes(prev => [...prev, event.data.vote]);
      }
    };

    // 폴링 (BroadcastChannel 미지원 브라우저 대응)
    const interval = setInterval(() => {
      const latestVotes = localStorage.getItem(`votes:${pollId}`);
      if (latestVotes) {
        setVotes(JSON.parse(latestVotes));
      }
    }, 500);

    return () => {
      channel.close();
      clearInterval(interval);
    };
  }, [pollId]);

  // 투표 집계
  const results = poll
    ? poll.options.map((option, index) => {
        const count = votes.filter(vote => {
          if (poll.type === 'single') {
            return vote.selection === index;
          } else if (poll.type === 'multiple') {
            return (vote.selection as number[]).includes(index);
          }
          return false;
        }).length;

        return {
          option,
          count,
          percentage: votes.length > 0 ? (count / votes.length) * 100 : 0,
        };
      })
    : [];

  return { poll, votes, results };
}
```

#### 5.3.3 차트 컴포넌트

```typescript
// components/ResultChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultChartProps {
  results: Array<{
    option: string;
    count: number;
    percentage: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ResultChart({ results }: ResultChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={results}>
        <XAxis dataKey="option" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" animationDuration={500}>
          {results.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

#### 5.3.4 호스트 뷰 구현

```typescript
// components/HostView.tsx
import { useParams } from 'react-router-dom';
import { useLiveResults } from '../hooks/useLiveResults';
import { ResultChart } from './ResultChart';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

export function HostView() {
  const { pollId } = useParams<{ pollId: string }>();
  const { poll, votes, results } = useLiveResults(pollId!);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  useEffect(() => {
    // QR 코드 생성
    const url = `${window.location.origin}/vote/${pollId}`;
    QRCode.toDataURL(url, { width: 300 }).then(setQrDataUrl);
  }, [pollId]);

  if (!poll) return <div>로딩 중...</div>;

  return (
    <div className={`p-6 ${isPresentationMode ? 'h-screen bg-gradient-to-br from-blue-500 to-purple-600' : ''}`}>
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`font-bold ${isPresentationMode ? 'text-5xl text-white' : 'text-3xl'}`}>
            {poll.title}
          </h1>
          <p className={`${isPresentationMode ? 'text-2xl text-white/80' : 'text-gray-600'}`}>
            총 {votes.length}명 참여
          </p>
        </div>
        <button
          onClick={() => setIsPresentationMode(!isPresentationMode)}
          className="px-4 py-2 bg-white rounded shadow"
        >
          {isPresentationMode ? '일반 모드' : '프레젠테이션 모드'}
        </button>
      </div>

      <div className={`grid ${isPresentationMode ? 'grid-cols-3 gap-8' : 'grid-cols-2 gap-6'}`}>
        {/* QR 코드 */}
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="font-bold mb-4">투표 참여</h3>
          {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="mx-auto" />}
          <p className="mt-2 text-sm text-gray-600">QR 스캔 또는</p>
          <p className="font-mono text-xs">{window.location.origin}/vote/{pollId}</p>
        </div>

        {/* 차트 */}
        <div className={`bg-white p-6 rounded-lg shadow ${isPresentationMode ? 'col-span-2' : ''}`}>
          <h3 className="font-bold mb-4">실시간 결과</h3>
          <ResultChart results={results} />
        </div>
      </div>

      {/* 결과 테이블 */}
      {!isPresentationMode && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-4">상세 결과</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">선택지</th>
                <th className="text-right py-2">득표수</th>
                <th className="text-right py-2">비율</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{result.option}</td>
                  <td className="text-right">{result.count}</td>
                  <td className="text-right">{result.percentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

### 5.4 투표 유형별 구현

#### 5.4.1 단일 선택 (Single Choice)
- 참가자는 하나만 선택 가능
- 라디오 버튼 UI
- 집계: 각 선택지별 카운트

#### 5.4.2 복수 선택 (Multiple Choice)
- 참가자는 여러 개 선택 가능
- 체크박스 UI
- 집계: 각 선택지별 카운트 (총합 > 참가자 수)

#### 5.4.3 순위 투표 (Ranking Poll)
- 참가자가 선택지를 1위~N위로 정렬
- 드래그 앤 드롭 UI
- 집계: 가중 점수 (1위 = N점, 2위 = N-1점, ...)

```typescript
// utils/rankingCalculator.ts

/**
 * 순위 투표 집계 (Borda Count 방식)
 */
export function calculateRankingResults(
  options: string[],
  votes: Vote[]
): Array<{ option: string; score: number; rank: number }> {
  const scores = options.map(() => 0);

  votes.forEach(vote => {
    const ranking = vote.selection as number[]; // [2, 0, 1] = 3번째가 1위, 1번째가 2위, 2번째가 3위
    ranking.forEach((optionIndex, position) => {
      scores[optionIndex] += options.length - position; // 1위 = N점, 2위 = N-1점
    });
  });

  const results = options.map((option, index) => ({
    option,
    score: scores[index],
    rank: 0,
  }));

  // 점수순 정렬
  results.sort((a, b) => b.score - a.score);

  // 랭킹 부여
  results.forEach((result, index) => {
    result.rank = index + 1;
  });

  return results;
}
```

---

### 5.5 결과 내보내기

#### 5.5.1 PNG 이미지 생성

```typescript
// utils/exportImage.ts
import html2canvas from 'html2canvas';

/**
 * 차트를 PNG 이미지로 내보내기
 */
export async function exportChartAsPNG(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2, // 고해상도
  });

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `poll-result-${Date.now()}.png`;
  link.click();
}
```

#### 5.5.2 JSON 데이터 내보내기

```typescript
// utils/exportJSON.ts

/**
 * 투표 결과를 JSON 파일로 내보내기
 */
export function exportResultsAsJSON(poll: Poll, votes: Vote[]): void {
  const data = {
    poll: {
      id: poll.id,
      title: poll.title,
      type: poll.type,
      options: poll.options,
      createdAt: poll.createdAt,
    },
    votes: votes.map(vote => ({
      id: vote.id,
      selection: vote.selection,
      timestamp: vote.timestamp,
    })),
    summary: {
      totalVotes: votes.length,
      timestamp: new Date().toISOString(),
    },
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `poll-${poll.id}-results.json`;
  link.click();

  URL.revokeObjectURL(url);
}
```

---

## 6. 데이터 모델 (TypeScript)

### 6.1 핵심 타입 정의

```typescript
// types/poll.ts

/**
 * 투표 유형
 */
export type PollType = 'single' | 'multiple' | 'ranking';

/**
 * 투표 (Poll)
 */
export interface Poll {
  id: string; // nanoid (8자리)
  title: string; // 투표 질문
  type: PollType; // 투표 유형
  options: string[]; // 선택지 배열
  createdAt: Date; // 생성 시간
  expiresAt?: Date; // 선택적 만료 시간
  allowAnonymous: boolean; // 익명 투표 허용 (기본 true)
}

/**
 * 투표 응답 (Vote)
 */
export interface Vote {
  id: string; // nanoid
  pollId: string; // 투표 ID
  selection: number | number[]; // 선택 인덱스 (단일/복수/순위)
  timestamp: Date; // 투표 시간
}

/**
 * 투표 결과 (집계)
 */
export interface PollResult {
  option: string; // 선택지
  count: number; // 득표수
  percentage: number; // 비율 (%)
  rank?: number; // 순위 (순위 투표 시)
  score?: number; // 점수 (순위 투표 시)
}

/**
 * 호스트 상태
 */
export interface HostState {
  poll: Poll;
  votes: Vote[];
  results: PollResult[];
  totalVotes: number;
  isActive: boolean;
}
```

### 6.2 LocalStorage 키 구조

```typescript
// utils/storage.ts

/**
 * LocalStorage 키 관리
 */
export const STORAGE_KEYS = {
  poll: (pollId: string) => `poll:${pollId}`,
  votes: (pollId: string) => `votes:${pollId}`,
  votedPolls: 'votedPolls', // 사용자가 투표한 poll ID 배열
  myPolls: 'myPolls', // 사용자가 생성한 poll ID 배열
};

/**
 * Poll 저장
 */
export function savePoll(poll: Poll): void {
  localStorage.setItem(STORAGE_KEYS.poll(poll.id), JSON.stringify(poll));

  // 내 투표 목록에 추가
  const myPolls = JSON.parse(localStorage.getItem(STORAGE_KEYS.myPolls) || '[]');
  myPolls.push(poll.id);
  localStorage.setItem(STORAGE_KEYS.myPolls, JSON.stringify(myPolls));
}

/**
 * Poll 로드
 */
export function loadPoll(pollId: string): Poll | null {
  const data = localStorage.getItem(STORAGE_KEYS.poll(pollId));
  return data ? JSON.parse(data) : null;
}

/**
 * Vote 저장
 */
export function saveVote(vote: Vote): void {
  const votesKey = STORAGE_KEYS.votes(vote.pollId);
  const votes = JSON.parse(localStorage.getItem(votesKey) || '[]');
  votes.push(vote);
  localStorage.setItem(votesKey, JSON.stringify(votes));
}

/**
 * Votes 로드
 */
export function loadVotes(pollId: string): Vote[] {
  const data = localStorage.getItem(STORAGE_KEYS.votes(pollId));
  return data ? JSON.parse(data) : [];
}
```

---

## 7. 탭 간 통신 구현 (BroadcastChannel)

### 7.1 BroadcastChannel API 개요

BroadcastChannel API는 같은 origin의 탭/창 간 메시지 통신을 지원합니다.

**장점**:
- 서버 불필요
- 간단한 API
- 실시간 동기화

**브라우저 지원**:
- Chrome 54+
- Firefox 38+
- Safari 15.4+ (2022년 3월 이후)

### 7.2 구현 코드

```typescript
// hooks/useBroadcastChannel.ts
import { useEffect, useCallback } from 'react';

export type BroadcastMessage =
  | { type: 'NEW_VOTE'; vote: Vote }
  | { type: 'POLL_CLOSED'; pollId: string }
  | { type: 'REFRESH_RESULTS' };

export function useBroadcastChannel(
  channelName: string,
  onMessage: (message: BroadcastMessage) => void
) {
  useEffect(() => {
    const channel = new BroadcastChannel(channelName);

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      onMessage(event.data);
    };

    return () => {
      channel.close();
    };
  }, [channelName, onMessage]);

  const broadcast = useCallback(
    (message: BroadcastMessage) => {
      const channel = new BroadcastChannel(channelName);
      channel.postMessage(message);
      channel.close();
    },
    [channelName]
  );

  return { broadcast };
}
```

### 7.3 사용 예시

```typescript
// components/VoteView.tsx (참가자)
import { useBroadcastChannel } from '../hooks/useBroadcastChannel';

export function VoteView() {
  // ...

  const { broadcast } = useBroadcastChannel(`poll:${pollId}`, () => {});

  const handleSubmit = () => {
    // 투표 저장
    saveVote(vote);

    // 호스트에게 알림
    broadcast({ type: 'NEW_VOTE', vote });
  };

  // ...
}
```

```typescript
// components/HostView.tsx (호스트)
import { useBroadcastChannel } from '../hooks/useBroadcastChannel';

export function HostView() {
  const [votes, setVotes] = useState<Vote[]>([]);

  useBroadcastChannel(`poll:${pollId}`, (message) => {
    if (message.type === 'NEW_VOTE') {
      setVotes(prev => [...prev, message.vote]);
    }
  });

  // ...
}
```

### 7.4 폴백 메커니즘 (BroadcastChannel 미지원 시)

```typescript
// hooks/useLiveSync.ts
import { useEffect, useState } from 'react';
import { loadVotes } from '../utils/storage';

/**
 * BroadcastChannel 미지원 브라우저 대응
 * - 500ms 간격으로 localStorage 폴링
 */
export function useLiveSync(pollId: string) {
  const [votes, setVotes] = useState<Vote[]>([]);

  useEffect(() => {
    // 초기 로드
    setVotes(loadVotes(pollId));

    // BroadcastChannel 지원 여부 확인
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(`poll:${pollId}`);
      channel.onmessage = (event) => {
        if (event.data.type === 'NEW_VOTE') {
          setVotes(prev => [...prev, event.data.vote]);
        }
      };

      return () => channel.close();
    } else {
      // 폴링 폴백
      const interval = setInterval(() => {
        setVotes(loadVotes(pollId));
      }, 500);

      return () => clearInterval(interval);
    }
  }, [pollId]);

  return votes;
}
```

---

## 8. 컴포넌트 구조

### 8.1 컴포넌트 트리

```
App.tsx
├── Header.tsx (타이틀, 네비게이션)
├── Routes
│   ├── HomePage.tsx (랜딩)
│   ├── CreatePollPage.tsx (투표 생성)
│   ├── VoteViewPage.tsx (투표 참여)
│   ├── HostViewPage.tsx (호스트 뷰)
│   └── MyPollsPage.tsx (내 투표 목록)
├── components/
│   ├── CreatePoll.tsx (투표 생성 폼)
│   ├── VoteView.tsx (투표 참여 UI)
│   ├── HostView.tsx (실시간 결과)
│   ├── ResultChart.tsx (차트)
│   ├── QRCodeDisplay.tsx (QR 코드)
│   ├── PollTypeSelector.tsx (투표 유형 선택)
│   ├── OptionEditor.tsx (선택지 편집)
│   ├── RankingInput.tsx (순위 투표 UI)
│   └── ExportButtons.tsx (내보내기)
└── Footer.tsx
```

### 8.2 라우팅 구조

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePollPage />} />
        <Route path="/vote/:pollId" element={<VoteViewPage />} />
        <Route path="/host/:pollId" element={<HostViewPage />} />
        <Route path="/my-polls" element={<MyPollsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 8.3 폴더 구조

```
src/
├── main.tsx                # 앱 진입점
├── App.tsx                 # 라우팅
├── components/
│   ├── CreatePoll.tsx
│   ├── VoteView.tsx
│   ├── HostView.tsx
│   ├── ResultChart.tsx
│   ├── QRCodeDisplay.tsx
│   ├── PollTypeSelector.tsx
│   ├── OptionEditor.tsx
│   ├── RankingInput.tsx
│   └── ExportButtons.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── CreatePollPage.tsx
│   ├── VoteViewPage.tsx
│   ├── HostViewPage.tsx
│   └── MyPollsPage.tsx
├── hooks/
│   ├── useBroadcastChannel.ts
│   ├── useLiveResults.ts
│   └── useLiveSync.ts
├── utils/
│   ├── storage.ts          # LocalStorage 래퍼
│   ├── voteValidator.ts    # 중복 투표 방지
│   ├── rankingCalculator.ts
│   ├── exportImage.ts
│   └── exportJSON.ts
├── types/
│   └── poll.ts             # 타입 정의
└── styles/
    └── index.css           # Tailwind CSS
```

---

## 9. 핵심 알고리즘

### 9.1 순위 투표 집계 (Borda Count)

```typescript
/**
 * Borda Count 방식 순위 투표 집계
 * - 1위 = N점, 2위 = N-1점, ..., N위 = 1점
 * - 총점이 가장 높은 선택지가 우승
 */
export function bordaCount(
  options: string[],
  votes: Vote[]
): PollResult[] {
  const n = options.length;
  const scores = new Array(n).fill(0);

  // 투표 집계
  votes.forEach(vote => {
    const ranking = vote.selection as number[]; // [2, 0, 1]
    ranking.forEach((optionIndex, position) => {
      scores[optionIndex] += n - position; // 1위 = n점, 2위 = n-1점
    });
  });

  // 결과 생성
  const results: PollResult[] = options.map((option, index) => ({
    option,
    count: 0, // 순위 투표에는 count 사용 안 함
    percentage: 0,
    score: scores[index],
    rank: 0,
  }));

  // 점수순 정렬
  results.sort((a, b) => b.score! - a.score!);

  // 랭킹 부여
  results.forEach((result, index) => {
    result.rank = index + 1;
  });

  return results;
}
```

### 9.2 단일/복수 선택 집계

```typescript
/**
 * 단일/복수 선택 투표 집계
 */
export function countVotes(
  options: string[],
  votes: Vote[],
  type: 'single' | 'multiple'
): PollResult[] {
  const counts = new Array(options.length).fill(0);

  votes.forEach(vote => {
    if (type === 'single') {
      counts[vote.selection as number]++;
    } else {
      (vote.selection as number[]).forEach(index => {
        counts[index]++;
      });
    }
  });

  const totalVotes = votes.length;

  return options.map((option, index) => ({
    option,
    count: counts[index],
    percentage: totalVotes > 0 ? (counts[index] / totalVotes) * 100 : 0,
  }));
}
```

---

## 10. 구현 우선순위

### Phase 1: MVP (1주)
- [x] 프로젝트 셋업 (Vite + React + TypeScript)
- [x] 투표 생성 페이지 (단일 선택만)
- [x] QR 코드 생성
- [x] 투표 참여 페이지
- [x] 중복 투표 방지 (localStorage)
- [x] 호스트 뷰 (실시간 결과)
- [x] BroadcastChannel 통합

### Phase 2: 고급 기능 (1주)
- [ ] 복수 선택 투표
- [ ] 순위 투표
- [ ] 프레젠테이션 모드
- [ ] 결과 내보내기 (PNG, JSON)
- [ ] 애니메이션 효과

### Phase 3: 최적화 & 배포 (3일)
- [ ] 폴백 메커니즘 (폴링)
- [ ] 반응형 디자인
- [ ] PWA 설정 (오프라인 지원)
- [ ] 성능 최적화
- [ ] Vercel 배포

---

## 11. 추가 기능 (V2)

### 11.1 워드클라우드
- 개방형 질문 (텍스트 입력)
- 단어 빈도 분석
- 동적 워드클라우드 생성

### 11.2 실시간 Q&A
- 익명 질문 제출
- 좋아요 기반 순위
- 호스트가 답변 표시

### 11.3 투표 분석
- 시간대별 참여율 그래프
- 참여자 유입 경로 (QR vs URL)
- CSV 내보내기

### 11.4 팀 투표
- 팀별 결과 비교
- 팀 코드 입력

---

## 12. 성능 최적화

### 12.1 코드 분할

```typescript
// Lazy loading
const HostView = React.lazy(() => import('./components/HostView'));
const ResultChart = React.lazy(() => import('./components/ResultChart'));
```

### 12.2 메모이제이션

```typescript
// ResultChart.tsx
import { useMemo } from 'react';

export function ResultChart({ results }: ResultChartProps) {
  const chartData = useMemo(() => {
    return results.map(r => ({
      name: r.option,
      value: r.count,
    }));
  }, [results]);

  // ...
}
```

### 12.3 Debounce (폴링)

```typescript
// hooks/useDebouncedPolling.ts
import { useEffect, useState } from 'react';
import debounce from 'lodash.debounce';

export function useDebouncedPolling(pollId: string, interval = 500) {
  const [votes, setVotes] = useState<Vote[]>([]);

  useEffect(() => {
    const debouncedUpdate = debounce(() => {
      setVotes(loadVotes(pollId));
    }, interval);

    const timer = setInterval(debouncedUpdate, interval);

    return () => {
      clearInterval(timer);
      debouncedUpdate.cancel();
    };
  }, [pollId, interval]);

  return votes;
}
```

---

## 13. 접근성 (a11y)

### 13.1 키보드 네비게이션
- Tab/Enter로 투표 가능
- ESC로 모달 닫기

### 13.2 스크린 리더 지원

```tsx
<button
  aria-label={`${option} 선택`}
  role="radio"
  aria-checked={selection === index}
>
  {option}
</button>
```

### 13.3 색각 이상 대응
- 차트에 패턴 추가
- 충분한 명도 대비

---

## 14. 테스트 전략

### 14.1 단위 테스트
- 투표 집계 로직
- Borda Count 알고리즘
- 중복 투표 방지

### 14.2 통합 테스트
- 전체 워크플로우 (생성 → 투표 → 결과)
- BroadcastChannel 통신

### 14.3 E2E 테스트 (Playwright)
- 시나리오: 3명이 투표하고 실시간 결과 확인
- QR 코드 스캔 시뮬레이션

---

## 15. 배포 전략

### 15.1 정적 호스팅
- **Vercel**: 자동 배포, 프리뷰 URL
- **Netlify**: 무료 티어

### 15.2 도메인
- `https://seolcoding.com/mini-apps/live-voting`

### 15.3 CI/CD
- GitHub Actions
- 자동 빌드 및 배포

---

## 16. 보안 고려사항

### 16.1 XSS 방지
- 사용자 입력 sanitize
- React의 자동 이스케이핑 활용

### 16.2 투표 조작 방지
- localStorage 기반 중복 투표 차단 (완벽하지 않음)
- V2: IP 기반 제한 (서버 필요)

### 16.3 데이터 프라이버시
- 개인정보 수집 없음
- 익명 투표
- 로컬 저장소만 사용

---

## 17. 참고 자료

### 17.1 공식 문서
- [React 19 Documentation](https://react.dev/)
- [Vite Guide](https://vite.dev/)
- [Recharts Documentation](https://recharts.org/)
- [BroadcastChannel API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
- [Web Storage API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

### 17.2 라이브러리
- [qrcode](https://www.npmjs.com/package/qrcode)
- [Recharts](https://recharts.org/)
- [nanoid](https://github.com/ai/nanoid)
- [react-confetti](https://www.npmjs.com/package/react-confetti)

### 17.3 유사 서비스
- [Mentimeter](https://www.mentimeter.com/)
- [Slido](https://www.slido.com/)
- [Poll Everywhere](https://polleverywhere.com/)
- [Kahoot](https://kahoot.com/)

### 17.4 알고리즘
- [Borda Count - Wikipedia](https://en.wikipedia.org/wiki/Borda_count)
- [Voting Theory - Stanford](https://plato.stanford.edu/entries/voting-methods/)

---

## 18. 라이선스

MIT License (오픈소스 공개)

## 19. MCP 개발 도구

### 19.1 UI 컴포넌트 개발
- **Shadcn UI**: 검증된 컴포넌트 라이브러리
- `pnpm dlx shadcn@latest add [component]`로 추가
- `@mini-apps/ui` 패키지에서 공유

### 19.2 브라우저 테스트
- **Chrome DevTools MCP**: 실시간 UI 확인 및 디버깅
- 스냅샷/스크린샷으로 렌더링 확인
- 콘솔/네트워크 요청 분석
- 반응형 테스트 (모바일 뷰포트)

> 자세한 사용법은 `agents/mini-apps/CLAUDE.md` 참조

---

**작성일**: 2025-12-20
**버전**: 1.0
**작성자**: Claude (Anthropic)
