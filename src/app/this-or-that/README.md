# This or That - 실시간 그룹 투표 게임

## 개요

소규모 그룹에서 실시간으로 A/B 선택 투표를 진행하는 아이스브레이킹 앱입니다. 호스트가 PC/프로젝터로 질문을 표시하면, 참여자들이 모바일로 투표하고 결과가 실시간으로 큰 화면에 표시됩니다.

## 주요 기능

### 호스트 모드 (PC/태블릿/프로젝터)
- 질문 선택 및 세션 생성
- QR 코드 + 6자리 코드로 참여자 초대
- 실시간 투표 현황 모니터링
- 큰 화면에 최적화된 프레젠테이션 모드
- 투표 시작/종료 제어
- 결과 시각화 (퍼센트 + 막대 그래프)

### 참여자 모드 (모바일)
- QR 스캔 또는 6자리 코드 입력으로 참여
- **모바일 세로 모드 최적화**
- **A/B 투표 버튼이 화면의 50% 이상 차지**
- 햅틱 피드백 (진동)
- 투표 완료 후 대기 화면

## 기술 스택

- **프레임워크**: Next.js 15 App Router
- **상태 관리**: Zustand 5
- **실시간 통신**: Supabase Realtime (공유 라이브러리)
- **UI**: shadcn/ui + Tailwind CSS
- **QR 코드**: qrcode 라이브러리
- **타입스크립트**: 타입 안정성

## 프로젝트 구조

```
src/app/this-or-that/
├── page.tsx                    # 메타데이터 + Suspense
├── components/
│   ├── ThisOrThatApp.tsx       # 메인 클라이언트 컴포넌트
│   ├── HostView.tsx            # 호스트용 프레젠테이션 화면
│   └── ParticipantView.tsx     # 참여자 모바일 화면
├── types/
│   └── index.ts                # TypeScript 타입 정의
└── data/
    └── questions.ts            # 질문 템플릿 (카테고리별)
```

## 공유 Realtime 라이브러리 사용

`/src/lib/realtime/`의 공유 라이브러리를 활용하여 구현:

```typescript
import { useRealtimeSession } from '@/lib/realtime';

const {
  session,
  participants,
  data: votes,
  createSession,
  joinSession,
} = useRealtimeSession<ThisOrThatConfig, Vote>({
  appType: 'this-or-that',
  sessionCode,
  dataTable: 'votes',
  dataEvent: 'INSERT',
});
```

## 데이터베이스 스키마

### sessions 테이블
- Supabase의 공통 `sessions` 테이블 사용
- `app_type`: 'this-or-that'
- `config`: JSON 형태로 질문 목록 저장

### votes 테이블
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES sessions(id),
  question_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  choice TEXT NOT NULL CHECK (choice IN ('A', 'B')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, question_id, participant_id)
);
```

### session_participants 테이블
- Supabase의 공통 테이블 사용
- 참여자 목록 및 실시간 presence 추적

## 질문 카테고리

1. **아이스브레이킹** (icebreaker)
   - 가벼운 선호도 질문
   - 예: "아침형 vs 저녁형", "바다 vs 산"

2. **음식** (food)
   - 음식 선택 질문
   - 예: "치킨 vs 피자", "한식 vs 양식"

3. **가치관** (values)
   - 가치 판단 질문
   - 예: "돈 vs 사랑", "높은 연봉 vs 워라밸"

4. **재미** (fun)
   - 재미있는 선택 질문
   - 예: "Netflix vs YouTube", "강아지 vs 고양이"

## 사용 흐름

### 호스트
1. 카테고리 선택
2. 질문 선택 (1개 이상)
3. 세션 시작
4. QR 코드/코드 공유
5. 투표 시작
6. 결과 확인
7. 다음 질문 또는 종료

### 참여자
1. QR 스캔 또는 코드 입력
2. 이름 입력
3. 대기
4. A/B 선택 (화면의 50% 이상)
5. 다음 질문 대기
6. 반복

## 모바일 최적화

### 참여자 화면 (세로 모드)
- Header: 최소화 (코드, 진행 상황)
- Question: 작게 표시
- **Voting Buttons: 화면의 50% 이상** (각각 최소 40vh)
- 큰 이모지 + 텍스트
- 터치 영역 최대화
- 햅틱 피드백

### 색상 구분
- Option A: 파란색 그라데이션
- Option B: 핑크색 그라데이션
- 우세한 선택지: 강조 표시 (결과 화면)

## balance-game과의 차이점

| 특징 | balance-game | this-or-that |
|------|--------------|--------------|
| 모드 | 개인 플레이 | 실시간 멀티플레이어 |
| 화면 | 모바일 중심 | 호스트(큰 화면) + 참여자(모바일) |
| 투표 | 로컬 저장 | 실시간 동기화 |
| 결과 | 개인 통계 | 그룹 집계 |
| 사용 사례 | 개인 심리테스트 | 워크샵, 강의, 팀빌딩 |

## 향후 개선 사항

- [ ] 투표 제한 시간 타이머
- [ ] 이미지 선택지 지원
- [ ] 결과 공유 이미지 생성
- [ ] 세션 통계 요약
- [ ] 커스텀 질문 추가 기능
- [ ] 질문 드래그앤드롭 순서 변경

## 참고

- PRD: `/prd/17-this-or-that.md`
- 공유 Realtime 라이브러리: `/src/lib/realtime/`
- 참고 구현: `/src/app/balance-game/`
