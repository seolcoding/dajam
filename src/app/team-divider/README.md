# 팀 나누기 (Team Divider)

공정한 랜덤 알고리즘으로 팀을 자동 분배하고, QR 코드로 결과를 공유할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- **참가자 입력**: 직접 입력, 일괄 입력, CSV 파일 업로드 지원
- **팀 분배 설정**: 팀 수 지정 또는 팀당 인원 지정 모드
- **Fisher-Yates 알고리즘**: 공정한 랜덤 분배 보장
- **QR 코드 생성**: 각 참가자별 QR 코드 자동 생성
- **결과 내보내기**: PDF, JSON, 클립보드 공유 지원
- **Confetti 애니메이션**: 팀 분배 완료 시 축하 효과

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **State Management**: Zustand
- **UI Components**: Radix UI + Custom Components
- **Styling**: Tailwind CSS
- **QR Code**: qrcode
- **PDF Export**: jsPDF
- **CSV Parsing**: papaparse
- **Confetti**: react-confetti

## 프로젝트 구조

```
src/app/team-divider/
├── components/
│   ├── ExportButtons.tsx       # PDF, JSON, 공유 버튼
│   ├── ParticipantInput.tsx    # 참가자 입력 컴포넌트
│   ├── QRCodeDisplay.tsx       # QR 코드 표시
│   ├── TeamDivider.tsx         # 메인 클라이언트 컴포넌트
│   ├── TeamResult.tsx          # 팀 분배 결과 표시
│   └── TeamSettings.tsx        # 팀 설정 컴포넌트
├── store/
│   └── useTeamStore.ts         # Zustand 상태 관리
├── types/
│   └── team.ts                 # TypeScript 타입 정의
├── utils/
│   ├── colors.ts               # 팀 색상 생성
│   ├── pdf.ts                  # PDF 내보내기
│   ├── qrcode.ts               # QR 코드 생성/디코딩
│   └── shuffle.ts              # Fisher-Yates 셔플 알고리즘
├── page.tsx                    # Next.js 페이지 (Server Component)
└── README.md                   # 문서
```

## 알고리즘

### Fisher-Yates Shuffle
- **시간복잡도**: O(n)
- **공간복잡도**: O(1) (in-place)
- **특징**: 모든 순열이 동일한 확률 (1/n!)로 생성되어 완전한 랜덤성 보장

### 팀 분배 모드

1. **팀 수 지정 모드**: 전체 팀 수를 지정하고 참가자를 균등 분배
2. **팀당 인원 지정 모드**: 각 팀의 인원을 지정하고 필요한 팀 수를 자동 계산

## 사용 방법

1. **참가자 입력**
   - 직접 입력: 이름을 하나씩 입력
   - 일괄 입력: 여러 이름을 한 줄에 하나씩 입력
   - CSV 업로드: CSV 파일에서 자동 추출

2. **팀 설정**
   - 팀 수 지정: 만들고 싶은 팀의 개수 입력
   - 팀당 인원 지정: 각 팀에 배정할 인원 수 입력

3. **팀 나누기**
   - "팀 나누기" 버튼 클릭
   - QR 코드 자동 생성
   - Confetti 애니메이션 표시

4. **결과 내보내기**
   - PDF로 저장: 팀 분배 결과를 PDF 파일로 다운로드
   - JSON 다운로드: 팀 데이터를 JSON 형식으로 저장
   - 공유하기: 클립보드로 복사 또는 네이티브 공유

## 의존성

주요 패키지:
- `qrcode`: QR 코드 생성
- `jspdf`: PDF 내보내기
- `papaparse`: CSV 파싱
- `react-confetti`: 축하 애니메이션
- `zustand`: 상태 관리
- `lucide-react`: 아이콘

## 개발 가이드

### 로컬 개발

```bash
pnpm install
pnpm dev
```

### 빌드

```bash
pnpm build
```

### 타입 체크

```bash
pnpm type-check
```

## 마이그레이션 정보

- **원본**: `/apps/team-divider/` (Vite)
- **대상**: `/src/app/team-divider/` (Next.js App Router)
- **마이그레이션 날짜**: 2025-12-21

### 주요 변경사항

1. Vite → Next.js App Router
2. `@mini-apps/ui` → `@/components/ui`
3. 상대 경로 → `@/app/team-divider/` 절대 경로
4. 모든 클라이언트 컴포넌트에 `'use client'` 지시문 추가
5. Server Component로 page.tsx 생성 (metadata 포함)
6. `import QRCode from 'qrcode'` → `import * as QRCode from 'qrcode'`
7. `import Papa from 'papaparse'` → `import * as Papa from 'papaparse'`

## 라이선스

© 2025 SeolCoding. All rights reserved.
