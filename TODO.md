# TODO - Audience Engage 구현 진행 상황

> **목표**: Slido/Mentimeter 대안 통합 플랫폼 구축
> **참조**: `prd/22-audience-engage.md`

## 구현 상태 요약

| Phase | 설명 | 상태 |
|-------|------|------|
| Phase 0 | 공유 컴포넌트 추출 | ✅ 완료 |
| Phase 1 | 슬라이드 Core | 🔄 진행 중 |
| Phase 2 | Q&A + Chat | 🔲 대기 |
| Phase 3 | 반응 + 이모지 | 🔲 대기 |
| Phase 4 | Presenter View | 🔲 대기 |
| Phase 5 | 분석 + 내보내기 | 🔲 대기 |

---

## Phase 0: 공유 컴포넌트 추출 ✅ 완료

기존 6개 실시간 앱의 핵심 로직을 `src/features/interactions/`로 추출

### 폴더 구조 생성
- [x] `src/features/interactions/` 디렉토리 구조 생성
- [x] `src/features/interactions/common/` - 공통 컴포넌트

### 퀴즈 (realtime-quiz → features/interactions/quiz/)
- [x] `QuizHost.tsx` - 호스트용 퀴즈 컴포넌트
- [x] `QuizParticipant.tsx` - 참여자용 퀴즈 컴포넌트
- [x] `QuizLeaderboard.tsx` - 점수 리더보드
- [x] `types.ts` - 퀴즈 타입 정의

### This or That (this-or-that → features/interactions/this-or-that/)
- [x] `ThisOrThatHost.tsx` - 호스트용 컴포넌트
- [x] `ThisOrThatParticipant.tsx` - 참여자용 컴포넌트
- [x] `types.ts` - 타입 정의

### 워드클라우드 (word-cloud → features/interactions/word-cloud/)
- [x] `WordCloudVisualization.tsx` - 워드클라우드 시각화
- [x] `WordCloudStats.tsx` - 통계 컴포넌트
- [x] `types.ts` - 타입 정의

### 성격테스트 (personality-test → features/interactions/personality/)
- [x] `types.ts` - 타입 정의

### 휴먼빙고 (human-bingo → features/interactions/bingo/)
- [x] `types.ts` - 타입 정의

### 공통 컴포넌트 (features/interactions/common/)
- [x] `ReactionBar.tsx` - 이모지 반응 바
- [x] `ParticipantCount.tsx` - 참여자 수 표시
- [x] `ConnectionStatus.tsx` - 연결 상태 표시

---

## Phase 1: 슬라이드 Core 🔄 진행 중

### audience-engage 기본 라우트
- [x] `src/app/audience-engage/page.tsx` - 메인 페이지
- [x] `src/app/audience-engage/types/index.ts` - 타입 정의
- [x] `src/app/audience-engage/components/AudienceEngageApp.tsx` - 메인 앱 컴포넌트
- [x] `src/app/audience-engage/components/SceneManager.tsx` - Scene 전환 관리
- [x] `src/app/audience-engage/components/HostView.tsx` - 호스트 뷰
- [x] `src/app/audience-engage/components/ParticipantView.tsx` - 참여자 뷰

### 데이터베이스 스키마
- [ ] `presentations` 테이블 마이그레이션
- [ ] `presentation_slides` 테이블 마이그레이션
- [ ] `scenes` 테이블 마이그레이션

### 슬라이드 업로드
- [ ] PDF 업로드 컴포넌트
- [ ] pdf.js 통합 (PDF→이미지 변환)
- [ ] Supabase Storage에 이미지 저장
- [ ] 슬라이드 메타데이터 저장

### Google Slides 임베드
- [x] Google Slides URL 파싱 (SceneManager 내 구현)
- [x] iframe 임베드 컴포넌트 (SceneManager 내 구현)
- [ ] 슬라이드 동기화 (호스트→참여자)

### 실시간 동기화
- [x] 호스트 Scene 변경 브로드캐스트 (`useSceneSync` 훅)
- [x] 참여자 Scene 동기화 수신 (`useSceneSync` 훅)
- [x] Zustand store 생성 (`audienceEngageStore.ts`)

---

## Phase 2: Q&A + Chat

### 데이터베이스
- [ ] `qa_questions` 테이블 마이그레이션
- [ ] `qa_votes` 테이블 마이그레이션
- [ ] `chat_messages` 테이블 마이그레이션

### Q&A 기능
- [ ] 질문 제출 UI
- [ ] 질문 목록 (실시간)
- [ ] 좋아요/투표 기능
- [ ] 호스트 질문 관리 (답변 완료, 하이라이트, 삭제)

### 채팅 기능
- [ ] 채팅 메시지 전송
- [ ] 실시간 메시지 수신
- [ ] 호스트 모더레이션

---

## Phase 3: 반응 + 이모지

### 실시간 반응
- [ ] 이모지 반응 UI (👍 👏 ❤️ 😂 🎉 ❓)
- [ ] 반응 애니메이션 (floating emojis)
- [ ] 반응 집계 표시

### 손들기 기능
- [ ] 손들기 버튼
- [ ] 호스트에서 손든 사람 목록
- [ ] 손 내리기 기능

---

## Phase 4: Presenter View

### 호스트 대시보드
- [ ] 2-panel 레이아웃 (슬라이드 + 컨트롤)
- [ ] 실시간 참여자 통계
- [ ] 다음 슬라이드 미리보기
- [ ] Scene 빠른 전환

### 발표자 메모
- [ ] 슬라이드별 메모 저장
- [ ] 메모 표시 UI

---

## Phase 5: 분석 + 내보내기

### 분석 대시보드
- [ ] 참여자 수 그래프
- [ ] 반응 통계
- [ ] Q&A 통계
- [ ] Scene별 참여도

### 내보내기
- [ ] 세션 결과 PDF 내보내기
- [ ] Q&A 목록 CSV 내보내기
- [ ] 통계 JSON 내보내기

---

## 기존 앱 라우트 호환성

하이브리드 아키텍처로 기존 라우트 유지:

| 독립 라우트 | audience-engage Scene |
|-------------|----------------------|
| `/realtime-quiz` | `/audience-engage?scene=quiz` |
| `/this-or-that` | `/audience-engage?scene=this-or-that` |
| `/word-cloud` | `/audience-engage?scene=word-cloud` |
| `/personality-test` | `/audience-engage?scene=personality` |
| `/human-bingo` | `/audience-engage?scene=bingo` |
| `/live-voting` | `/audience-engage?scene=vote` |

---

## 완료된 작업

### 분석 및 계획
- [x] Claper 오픈소스 분석 (`claudedocs/claper-analysis.md`)
- [x] Auden 오픈소스 분석 (`claudedocs/auden-architecture-analysis.md`)
- [x] PRD 작성 (`prd/22-audience-engage.md`)
- [x] README 업데이트
- [x] database.ts에 `audience-engage` AppType 추가

### 기존 실시간 앱 (구현 완료)
- [x] This or That (`src/app/this-or-that/`)
- [x] Realtime Quiz (`src/app/realtime-quiz/`)
- [x] Word Cloud (`src/app/word-cloud/`)
- [x] Personality Test (`src/app/personality-test/`)
- [x] Human Bingo (`src/app/human-bingo/`)

### 기존 인프라 (구현 완료)
- [x] `useRealtimeSession` 훅
- [x] `useRealtimeSubscription` 훅
- [x] `SessionHostLayout` 컴포넌트
- [x] Supabase 통합 (`src/lib/supabase/`)

---

## 다음 단계

1. **Phase 1 계속**: Zustand store 생성 및 실시간 동기화
2. Scene 전환 시 호스트→참여자 브로드캐스트 구현
3. PDF 업로드 컴포넌트 구현 (pdf.js)
4. Phase 2 시작: Q&A + Chat 기능
