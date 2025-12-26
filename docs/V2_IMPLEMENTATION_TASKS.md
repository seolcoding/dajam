# Dajam V2 Implementation Tasks

> **Last Updated**: 2024-12-25
> **Status**: Phase 1-3 DB Complete, Phase 4-5 Pending

---

## Implementation Status

| Phase | Name | Status | Completion |
|-------|------|--------|------------|
| 1 | Core Layer (DB) | ✅ Complete | 100% |
| 2 | Content Layer (DB) | ✅ Complete | 100% |
| 3 | CRM Layer (DB) | ✅ Complete | 100% |
| 4 | Application Integration | ⏳ Pending | 0% |
| 5 | External Integrations | ⏳ Pending | 0% |

---

## Phase 4: Application Integration

### 4.1 Host Dashboard UI

**Priority**: High
**Estimated**: 3-5 days

#### Tasks

- [ ] **4.1.1** Element Editor Component
  ```
  Location: src/app/audience-engage/components/ElementEditor.tsx
  Features:
  - 드래그앤드롭 요소 순서 변경
  - 요소 타입별 Config 편집 UI
  - 실시간 미리보기
  - 템플릿 저장/불러오기
  ```

- [ ] **4.1.2** Element Type Selector
  ```
  Location: src/app/audience-engage/components/ElementTypeSelector.tsx
  Features:
  - 18+ 요소 타입 그리드 뷰
  - 카테고리 분류 (투표/퀴즈/게임/수집)
  - 빠른 추가 모드
  - 추천 조합 표시
  ```

- [ ] **4.1.3** Active Element Display
  ```
  Location: src/app/audience-engage/components/ActiveElementView.tsx
  Features:
  - 타입별 결과 시각화
  - 실시간 참여자 수 표시
  - 결과 공개/숨김 토글
  - 다음 요소 전환
  ```

- [ ] **4.1.4** Participant List Panel
  ```
  Location: src/app/audience-engage/components/ParticipantListPanel.tsx
  Features:
  - 참여자 목록 (실시간 업데이트)
  - 응답 상태 표시 (제출/미제출)
  - 참여자 검색
  - 강제 퇴장 기능
  ```

---

### 4.2 Element Response UI (Participant)

**Priority**: High
**Estimated**: 3-4 days

#### Tasks

- [ ] **4.2.1** Poll Response Component
  ```
  Location: src/components/elements/PollResponse.tsx
  Features:
  - 단일/다중 선택 UI
  - 결과 차트 (제출 후)
  - 접근성 지원
  ```

- [ ] **4.2.2** Quiz Response Component
  ```
  Location: src/components/elements/QuizResponse.tsx
  Features:
  - 문항별 응답
  - 타이머 표시 (있는 경우)
  - 정답 확인 애니메이션
  - 점수 표시
  ```

- [ ] **4.2.3** Word Cloud Response Component
  ```
  Location: src/components/elements/WordCloudResponse.tsx
  Features:
  - 단어 입력 (최대 N개)
  - 실시간 워드클라우드 시각화
  - 중복 체크
  ```

- [ ] **4.2.4** Balance Game Response Component
  ```
  Location: src/components/elements/BalanceGameResponse.tsx
  Features:
  - 좌/우 선택 UI
  - 선택 비율 표시
  - 스와이프 제스처 지원
  ```

- [ ] **4.2.5** Generic Response Factory
  ```
  Location: src/components/elements/ResponseFactory.tsx
  Features:
  - element_type 기반 컴포넌트 동적 로딩
  - 공통 레이아웃 래퍼
  - 에러 바운더리
  ```

---

### 4.3 Realtime Hooks

**Priority**: High
**Estimated**: 2-3 days

#### Tasks

- [ ] **4.3.1** useSessionElements Hook
  ```typescript
  Location: src/lib/realtime/hooks/useSessionElements.ts

  interface UseSessionElements {
    elements: SessionElement[];
    activeElement: SessionElement | null;
    loading: boolean;
    error: Error | null;
    reorder: (elementIds: string[]) => Promise<void>;
    setActive: (elementId: string) => Promise<void>;
    updateState: (elementId: string, state: Json) => Promise<void>;
  }
  ```

- [ ] **4.3.2** useElementResponses Hook
  ```typescript
  Location: src/lib/realtime/hooks/useElementResponses.ts

  interface UseElementResponses {
    responses: ElementResponse[];
    aggregates: ElementAggregate[];
    myResponse: ElementResponse | null;
    submitResponse: (data: Json) => Promise<void>;
    loading: boolean;
  }
  ```

- [ ] **4.3.3** useElementAggregates Hook
  ```typescript
  Location: src/lib/realtime/hooks/useElementAggregates.ts

  interface UseElementAggregates {
    aggregates: Map<string, number>;
    totalResponses: number;
    subscribe: () => void;
    unsubscribe: () => void;
  }
  ```

---

### 4.4 CRM Dashboard

**Priority**: Medium
**Estimated**: 4-5 days

#### Tasks

- [ ] **4.4.1** Contacts List Page
  ```
  Location: src/app/(dashboard)/dashboard/contacts/page.tsx
  Features:
  - 페이지네이션 테이블
  - 필터 (상태, 태그, 연령대, 스킬레벨)
  - 일괄 작업 (태그 추가, 상태 변경)
  - CSV 내보내기
  ```

- [ ] **4.4.2** Contact Detail Page
  ```
  Location: src/app/(dashboard)/dashboard/contacts/[id]/page.tsx
  Features:
  - 프로필 정보 편집
  - 수강 이력 타임라인
  - 인터랙션 통계 차트
  - 메모 및 태그 관리
  ```

- [ ] **4.4.3** Contact Import Modal
  ```
  Location: src/components/dashboard/ContactImportModal.tsx
  Features:
  - CSV/Excel 파일 업로드
  - 컬럼 매핑 UI
  - 중복 검사 및 처리
  - 미리보기 및 확인
  ```

- [ ] **4.4.4** Contact Stats Cards
  ```
  Location: src/components/dashboard/ContactStatsCards.tsx
  Features:
  - 총 수강생 수
  - 활성/비활성 비율
  - 평균 출석률
  - 이탈 위험 수
  ```

---

### 4.5 Attendance System

**Priority**: Medium
**Estimated**: 2-3 days

#### Tasks

- [ ] **4.5.1** QR Code Generator
  ```
  Location: src/components/attendance/QRCodeGenerator.tsx
  Features:
  - 세션별 고유 QR 생성
  - 만료 시간 설정
  - 다운로드/인쇄
  ```

- [ ] **4.5.2** QR Code Scanner
  ```
  Location: src/components/attendance/QRCodeScanner.tsx
  Features:
  - 카메라 스캔
  - 자동 출석 체크
  - 성공/실패 피드백
  ```

- [ ] **4.5.3** Attendance List View
  ```
  Location: src/app/(dashboard)/dashboard/attendance/page.tsx
  Features:
  - 세션별 출석 현황
  - 수동 체크 기능
  - 출석률 통계
  - 체크인 시간 표시
  ```

---

### 4.6 Workspace Management

**Priority**: Medium
**Estimated**: 2-3 days

#### Tasks

- [ ] **4.6.1** Workspace Settings Page
  ```
  Location: src/app/(dashboard)/dashboard/settings/workspace/page.tsx
  Features:
  - 워크스페이스 정보 편집
  - 로고 업로드
  - 플랜 정보 표시
  - 삭제/이전 옵션
  ```

- [ ] **4.6.2** Team Members Page
  ```
  Location: src/app/(dashboard)/dashboard/team/page.tsx
  Features:
  - 멤버 목록 및 역할
  - 초대 기능 (이메일)
  - 역할 변경
  - 멤버 제거
  ```

- [ ] **4.6.3** Workspace Switcher
  ```
  Location: src/components/dashboard/WorkspaceSwitcher.tsx
  Features:
  - 워크스페이스 목록 드롭다운
  - 빠른 전환
  - 새 워크스페이스 생성
  ```

---

## Phase 5: External Integrations

### 5.1 Google Sheets Integration

**Priority**: Low
**Estimated**: 2-3 days

#### Tasks

- [ ] **5.1.1** OAuth Flow
- [ ] **5.1.2** Spreadsheet Selector
- [ ] **5.1.3** Column Mapping UI
- [ ] **5.1.4** Auto-sync Logic
- [ ] **5.1.5** Sync Status Display

---

### 5.2 Webhook Integration

**Priority**: Low
**Estimated**: 1-2 days

#### Tasks

- [ ] **5.2.1** Webhook Configuration UI
- [ ] **5.2.2** Event Selection
- [ ] **5.2.3** Test Webhook
- [ ] **5.2.4** Delivery Logs

---

### 5.3 Kakao Channel Integration

**Priority**: Low
**Estimated**: 2-3 days

#### Tasks

- [ ] **5.3.1** Kakao Developer Setup
- [ ] **5.3.2** Message Template Registration
- [ ] **5.3.3** Send Notification API
- [ ] **5.3.4** Delivery Status Tracking

---

---

## Phase 6: Competitor Feature Parity (WeLiveOn 참고)

### 6.1 Pre/Post Test Comparison

**Priority**: Medium
**Estimated**: 2 days

#### Tasks

- [ ] **6.1.1** Pre-test Element Mode
  ```
  quiz 요소에 mode: 'pre_test' | 'post_test' 옵션 추가
  동일 quiz를 사전/사후로 2회 실행 가능하게
  ```

- [ ] **6.1.2** Test Result Comparison View
  ```
  Location: src/components/elements/TestComparisonView.tsx
  Features:
  - 사전/사후 점수 비교 차트
  - 개인별 성장률 표시
  - 그룹 평균 비교
  ```

- [ ] **6.1.3** Achievement Certificate Generator
  ```
  Location: src/components/certificate/CertificateGenerator.tsx
  Features:
  - 수료증 PDF 생성
  - 커스텀 템플릿
  - 자동 이메일 발송 (옵션)
  ```

### 6.2 Random Draw Element

**Priority**: Medium
**Estimated**: 1 day

#### Tasks

- [ ] **6.2.1** Lucky Draw Element Type
  ```typescript
  type ElementType = ... | 'lucky_draw';

  interface LuckyDrawConfig {
    prizes: Array<{ name: string; count: number }>;
    animationType: 'slot' | 'wheel' | 'confetti';
    excludePreviousWinners: boolean;
  }
  ```

- [ ] **6.2.2** Draw Animation Component
  ```
  Location: src/components/elements/LuckyDrawAnimation.tsx
  Features:
  - 슬롯머신 / 룰렛 / 빗방울 애니메이션
  - 당첨자 공개 연출
  - 결과 저장 및 중복 방지
  ```

### 6.3 Presenter Remote Mode

**Priority**: Low
**Estimated**: 2 days

#### Tasks

- [ ] **6.3.1** Remote Control Page
  ```
  Location: src/app/audience-engage/remote/page.tsx
  Features:
  - 간소화된 발표자용 UI
  - 다음/이전 요소 전환
  - 결과 공개 버튼
  - 참여자 수 표시
  ```

- [ ] **6.3.2** Dual Screen Sync
  ```
  발표자 PC + 스마트폰 리모콘 동시 사용
  동일 세션에 host role로 다중 접속
  ```

---

## Technical Debt & Improvements

### Immediate (This Sprint)

- [ ] **TD-1**: 기존 `votes` 테이블 → `element_responses` 마이그레이션 스크립트
- [ ] **TD-2**: `live-voting` 앱을 새 element_responses API로 전환
- [ ] **TD-3**: TypeScript 타입 가드 함수 구현 (isPollConfig, isQuizConfig 등)

### Short-term (Next 2 Sprints)

- [ ] **TD-4**: audience-engage SceneManager를 session_elements 기반으로 리팩토링
- [ ] **TD-5**: 기존 앱들 (chosung-quiz, bingo-game 등) session_elements 연동
- [ ] **TD-6**: 공통 Element Response 컴포넌트 라이브러리화

### Long-term (Backlog)

- [ ] **TD-7**: 오프라인 지원 (Service Worker + IndexedDB)
- [ ] **TD-8**: 성능 최적화 (가상 스크롤, 레이지 로딩)
- [ ] **TD-9**: 다국어 지원 (i18n)
- [ ] **TD-10**: 분석 대시보드 (워크스페이스 리포트)

---

## Definition of Done

### Feature Complete Checklist

- [ ] TypeScript 컴파일 에러 없음
- [ ] 단위 테스트 커버리지 > 70%
- [ ] E2E 테스트 주요 시나리오 통과
- [ ] 접근성 검사 통과 (axe-core)
- [ ] 반응형 디자인 검증 (mobile, tablet, desktop)
- [ ] 한국어 UI 텍스트 검수
- [ ] Supabase RLS 정책 검증
- [ ] 코드 리뷰 승인

---

## Related Documents

- [ARCHITECTURE_V2.md](./ARCHITECTURE_V2.md) - V2 아키텍처 스펙
- [PRD: V2 Data Architecture](../prd/00-v2-data-architecture.md) - 상세 요구사항
- [REALTIME_SESSION_SPEC.md](./REALTIME_SESSION_SPEC.md) - 실시간 세션 스펙
- [E2E_TEST_PLAN.md](./E2E_TEST_PLAN.md) - 테스트 계획

---

## Sprint Planning Notes

### Recommended First Sprint (Phase 4.1-4.3)

| Task ID | Task | Effort | Priority |
|---------|------|--------|----------|
| 4.3.1 | useSessionElements Hook | 1d | P0 |
| 4.3.2 | useElementResponses Hook | 1d | P0 |
| 4.2.1 | Poll Response Component | 1d | P0 |
| 4.1.3 | Active Element Display | 1d | P0 |
| TD-3 | Type Guard Functions | 0.5d | P0 |

**Sprint Goal**: 기본 투표 요소의 호스트-참여자 실시간 인터랙션 완성

### Recommended Second Sprint (Phase 4.2 continued)

| Task ID | Task | Effort | Priority |
|---------|------|--------|----------|
| 4.2.2 | Quiz Response Component | 1d | P1 |
| 4.2.3 | Word Cloud Response | 1d | P1 |
| 4.2.4 | Balance Game Response | 1d | P1 |
| 4.1.1 | Element Editor Component | 2d | P1 |
| 4.1.2 | Element Type Selector | 1d | P1 |

**Sprint Goal**: 주요 4개 요소 타입 완성 및 호스트 편집 UI
