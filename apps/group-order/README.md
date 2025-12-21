# 단체 주문 통합 (Group Order Collector)

회식, 단체 주문 시 메뉴를 간편하게 모으고 집계하는 웹 앱

## 주요 기능

### 1. 주문방 생성 (호스트)
- 가게/식당 이름 입력
- 메뉴 입력 방식 선택:
  - **고정 메뉴 모드**: 미리 메뉴와 가격 입력
  - **자유 입력 모드**: 참가자가 직접 메뉴명/가격 입력
- 마감 시간 설정 (선택)
- QR 코드 및 링크 생성

### 2. 주문 참여 (참가자)
- QR 스캔 또는 링크 클릭으로 참여
- 닉네임 입력 (중복 체크)
- 메뉴 선택 및 수량 조절
- 특이사항 메모 입력
- 장바구니 기능

### 3. 실시간 주문 현황 (호스트 대시보드)
- 참여자 목록 실시간 업데이트
- 메뉴별 집계 (메뉴명, 수량, 소계)
- 개인별 주문 내역
- 총 금액 / 1인당 금액 자동 계산
- 실시간 동기화 (BroadcastChannel API)

### 4. 주문 마감 및 정리
- 주문 마감 버튼
- 주문서 생성 (이미지/텍스트)
- 카카오톡/SNS 공유
- 개인별 정산 금액 계산

## 기술 스택

- **프레임워크**: React 19 + TypeScript
- **빌드 도구**: Vite 7
- **스타일링**: Tailwind CSS v4
- **UI 컴포넌트**: @mini-apps/ui (Radix UI 기반)
- **상태 관리**: React Hooks + localStorage
- **실시간 동기화**: BroadcastChannel API
- **라우팅**: React Router v7
- **라이브러리**:
  - `qrcode.react`: QR 코드 생성
  - `html2canvas`: 주문서 이미지 변환
  - `nanoid`: 고유 ID 생성
  - `lucide-react`: 아이콘

## 프로젝트 구조

```
src/
├── types/
│   └── index.ts              # TypeScript 타입 정의
│
├── services/
│   ├── storage.ts            # localStorage 관리
│   ├── OrderBroadcaster.ts   # BroadcastChannel 래퍼
│   └── orderService.ts       # 주문 CRUD 및 집계
│
├── hooks/
│   ├── useSession.ts         # 세션 관리
│   ├── useOrderSync.ts       # 실시간 주문 동기화
│   └── useOrderSummary.ts    # 주문 집계
│
├── pages/
│   ├── HomePage.tsx          # 랜딩 페이지
│   ├── CreateSessionPage.tsx # 주문방 생성
│   ├── HostDashboardPage.tsx # 호스트 대시보드
│   ├── JoinSessionPage.tsx   # 참여자 주문
│   └── SummaryPage.tsx       # 주문서 페이지
│
├── App.tsx                   # 라우팅
└── main.tsx                  # 진입점
```

## 개발

```bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev

# 빌드
pnpm build

# 미리보기
pnpm preview
```

## 데이터 저장

- **localStorage**: 세션 데이터 및 주문 내역 저장
- **BroadcastChannel API**: 탭 간 실시간 동기화
- **Fallback**: Safari 등 BroadcastChannel 미지원 브라우저는 `storage` 이벤트 사용

### localStorage 키 구조

- `session:{sessionId}`: 세션 정보
- `orders:{sessionId}`: 주문 목록
- `session:list`: 생성된 세션 ID 목록

## 주요 알고리즘

### 메뉴별 집계
```typescript
// Map 기반으로 메뉴별 수량/금액 집계
aggregateByMenu(orders: Order[]): MenuSummaryItem[]
```

### 참가자별 집계
```typescript
// 참가자별 주문 내역 및 금액 계산
aggregateByParticipant(orders: Order[]): ParticipantBill[]
```

### 실시간 동기화
```typescript
// BroadcastChannel을 통한 탭 간 메시지 전송
broadcaster.broadcast({ type: 'NEW_ORDER', order })
```

## 브라우저 지원

- Chrome, Firefox, Edge: BroadcastChannel API 지원
- Safari: localStorage 이벤트 폴백

## 배포 URL

- 개발: `http://localhost:5173/mini-apps/group-order/`
- 프로덕션: `https://seolcoding.com/mini-apps/group-order/`

## 라이센스

MIT

## 참고 자료

- [PRD 문서](../../prd/15-group-order.md)
- [배달의민족 함께주문 분석](https://techblog.woowahan.com/10232/)
- [BroadcastChannel API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
