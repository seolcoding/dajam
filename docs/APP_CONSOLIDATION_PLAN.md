# Dajam 앱 통합 및 세션 모드 계획

> 작성일: 2024-12-26
> 상태: 승인됨

## 개요

22개 앱을 18개로 통합하고, 각 앱의 세션 모드를 정의합니다.

## 앱 통합 계획

### 삭제/통합 예정 (4개)

| 기존 앱 | 통합 대상 | 이유 |
|---------|----------|------|
| `this-or-that` | `balance-game` | 동일한 A vs B 선택 로직 |
| `chosung-quiz` | `realtime-quiz` | 퀴즈 플랫폼 통합 |
| `lunch-roulette` | `random-picker` | 랜덤 선택 로직 통합 |
| `ladder-game` | `random-picker` | 1:1 매칭도 랜덤 뽑기의 변형 |

### 통합 후 앱 구조

#### 1. 랜덤 뽑기 (통합)
```
random-picker/
├── 일반 모드: 범용 랜덤 선택
├── 점심 모드: 맛집 + 위치 기반 + 링크 추천
└── 사다리 모드: 1:1 매칭 시각화
```

**추가 기능:**
- 다양한 애니메이션 (복권, 물리엔진, 3D, 핀볼, 깔대기)
- 마우스 클릭/드래그로 직접 섞기 인터랙션
- 경품 추첨 시 참여자 자동 등록

#### 2. 밸런스 게임 (통합)
```
balance-game/
├── 클래식 모드: A vs B 선택
└── This or That 모드: 빠른 양자택일
```

#### 3. 실시간 퀴즈 (통합)
```
realtime-quiz/
├── 일반 퀴즈: 객관식/주관식
├── 초성 퀴즈: 한글 초성 맞추기
├── 이해도 테스트: 강연 후 학습 확인
└── AI 퀴즈 생성 (추후)
```

---

## 최종 앱 목록 (18개)

### 싱글 플레이 전용 (5개)

| # | 앱 | 설명 |
|---|---|---|
| 1 | `salary-calculator` | 급여 실수령액 계산 |
| 2 | `rent-calculator` | 전월세 변환 계산 |
| 3 | `gpa-calculator` | 학점 계산 |
| 4 | `dutch-pay` | 더치페이 정산 |
| 5 | `id-validator` | 신분증 번호 검증 |

### 싱글 + 세션 모드 (4개)

| # | 앱 | 싱글 | 세션 |
|---|---|---|---|
| 6 | `balance-game` | 혼자 선택 + 통계 | 호스트 질문 컨트롤, 결과 실시간 공유 |
| 7 | `ideal-worldcup` | 혼자 토너먼트 | 세션 참여자 점수 집계 (토너먼트 진출 점수) |
| 8 | `personality-test` | 혼자 테스트 | 팀 분포 통계 (I/E 비율 등) |
| 9 | `student-network` | 프로필 생성 | 세션 + 지속적 네트워킹 (동의 기반 연락처 공유) |

### 세션 전용 - 호스트 주도 (4개)

| # | 앱 | 호스트 역할 | 참여자 역할 |
|---|---|---|---|
| 10 | `random-picker` | 항목 입력, 뽑기 실행 | 실시간 화면 공유 시청, 경품 추첨 시 자동 등록 |
| 11 | `team-divider` | 팀 배분 실행 | 자동 등록, 결과 확인 |
| 12 | `live-voting` | 투표 생성/시작/종료 | 투표 참여, 익명 옵션 |
| 13 | `word-cloud` | 질문 출제 | 단어 제출 |

### 세션 전용 - 실시간 게임 (3개)

| # | 앱 | 설명 |
|---|---|---|
| 14 | `bingo-game` | 호스트 호출 → 참여자 체크 (Supabase 연동 필요) |
| 15 | `realtime-quiz` | 실시간 퀴즈 대결 (초성퀴즈 포함) |
| 16 | `human-bingo` | 아이스브레이킹 빙고 (템플릿 하드코딩) |

### 마스터 플랫폼 (2개)

| # | 앱 | 설명 |
|---|---|---|
| 17 | `group-order` | 단체 주문 집계 |
| 18 | `audience-engage` | **통합 플랫폼**: 화면 강제 리다이렉트, 모든 인터랙션 통합 |

---

## 세션 모드 상세

### 싱글 + 세션 앱 플로우

```
[엔트리 화면]
├── [싱글 플레이] → 혼자 진행 → 결과 확인
└── [세션 참여]
    ├── [호스트] → 세션 생성 → 6자리 코드 공유 → 진행 컨트롤
    └── [참여자] → 코드 입력 → 참여 → 결과 함께 확인
```

### 세션 전용 앱 플로우

```
[엔트리 화면]
├── [호스트 탭] → 세션 생성 → 코드 공유 → 진행
└── [참여자 탭] → 코드 입력 → 이름 입력 → 참여
```

### audience-engage 화면 강제 리다이렉트

```typescript
// 참여자 클라이언트
useEffect(() => {
  supabase.channel('session')
    .on('broadcast', { event: 'scene_change' }, (payload) => {
      setCurrentView(payload.scene); // 'voting' | 'quiz' | 'wordcloud' | 'result'
    })
    .subscribe();
}, []);
```

---

## 추가 기능 계획

### Phase 1: 기본 기능
- [x] ~~앱 통합 (4개 → 기존 앱으로)~~ **random-picker 통합 완료 (2024-12-27)**
  - [x] `lunch-roulette` → `random-picker/modes/LunchMode.tsx`
  - [x] `ladder-game` → `random-picker/modes/LadderMode.tsx`
  - [x] `this-or-that` → `balance-game` 세션 모드 연동 (2024-12-27)
    - balance-game에 MultiplayerEntry 통합
    - 혼자/세션 모드 탭 전환 UI 추가
    - 기존 session/ 경로 활용
  - [x] `chosung-quiz` → `realtime-quiz` 통합 (2024-12-27)
    - realtime-quiz에 실시간/초성 모드 탭 추가
    - 초성 모드에서 chosung-quiz 컴포넌트 렌더링
    - 기존 chosung-quiz 데이터/로직 100% 재사용
- [x] 세션 모드 UI 통일 (MultiplayerEntry 패턴 적용)
  - [x] random-picker: UnifiedPickerApp에 MultiplayerEntry 적용
  - [x] realtime-quiz: MultiplayerEntry 적용됨
  - [x] balance-game: 솔로/세션 모드 탭 + MultiplayerEntry 추가
  - [x] team-divider: TeamDividerApp에 MultiplayerEntry 적용됨
- [ ] 빙고 게임 Supabase 연동

### Phase 2: 향상 기능
- [x] 워드클라우드 향상 (2024-12-27)
  - `utils/wordNormalizer.ts` - 단어 정규화 유틸리티
  - 오타 수정: 영한 자판 변환, 일반 오타 패턴
  - 유사어 묶기: 동의어 그룹핑 (감정, 날씨, 음식 등)
  - 단어 추천: 초성 기반 자동완성
  - HostView에 유사어 묶기 토글 추가
- [x] 투표 향상 (2024-12-27)
  - `types/poll.ts` - Vote에 participantId, isCancelled 필드 추가
  - `types/poll.ts` - PollReport 인터페이스 추가 (통합 분석용)
  - `utils/reportGenerator.ts` - 리포트 생성 유틸리티
  - HostView에 CSV/JSON 내보내기 버튼 추가
- [x] 다크 모드 지원 (2024-12-27)
  - `src/components/theme/ThemeProvider.tsx` - 테마 프로바이더
  - `src/components/theme/ThemeToggle.tsx` - 테마 토글 컴포넌트
  - light/dark/system 모드 지원
  - localStorage 저장 및 시스템 테마 자동 감지
- [x] URL 상태 공유 기능 (2024-12-27)
  - `src/lib/hooks/useUrlState.ts` - URL 상태 인코딩/디코딩 훅
  - salary-calculator에 적용: 계산 결과 URL 공유
  - base64 인코딩으로 URL 길이 최소화
- [ ] 랜덤 뽑기: 다양한 애니메이션 (물리엔진, 3D) - 추후 구현

### Phase 3: AI 기능
- [ ] 실시간 퀴즈: AI 퀴즈 생성
- [ ] 팀 나누기: LLM 기반 스마트 배분 (아이스브레이킹 결과 기반)
- [ ] 워드클라우드: AI 정규화

---

## 엔트리 컴포넌트 구조

```
src/components/entry/
├── index.ts                 # 모든 컴포넌트 export
├── AppEntryLayout.tsx       # 헤더/푸터 포함 레이아웃
├── SinglePlayerEntry.tsx    # 싱글 플레이 시작 UI
├── MultiplayerEntry.tsx     # 호스트/참여자 탭 UI
├── SessionCodeInput.tsx     # 6자리 코드 입력 + 검증
└── QRCodeShare.tsx          # QR 코드 + 세션 코드 공유
```

---

## 관련 문서

- `README.md` - 프로젝트 개요
- `CLAUDE.md` - AI 에이전트 가이드
- `APP_INDEX.yaml` - 앱-코드 매핑
- `prd/*.md` - 개별 앱 PRD
