# 이상형 월드컵 (Ideal Type World Cup)

토너먼트 형식의 선택 게임을 만들고 진행할 수 있는 웹 애플리케이션입니다.

## 기능

### 1. 토너먼트 생성
- 제목 입력
- 라운드 선택 (4강, 8강, 16강, 32강)
- 이미지 드래그 앤 드롭 업로드 (react-dropzone)
- 후보자 이름 자동 추출 (파일명 기반)
- 실시간 후보자 카드 미리보기

### 2. 토너먼트 진행
- 1:1 대결 화면 (좌/우 분할)
- 진행률 표시 (Progress Bar)
- 라운드 헤더 (결승, 준결승, 8강 등)
- 뒤로가기 기능 (이전 선택 취소)
- Fisher-Yates 셔플로 랜덤 매칭
- 모바일/데스크톱 반응형 UI

### 3. 결과 화면
- 우승자 카드 (대형)
- 준우승자 정보
- Canvas API 기반 결과 이미지 생성
- 이미지 다운로드
- SNS 공유 (Web Share API)
- 클립보드 복사
- 다시하기 / 홈으로 버튼

### 4. 데이터 저장
- localStorage 자동 저장
- 진행 중인 게임 복구
- 토너먼트 히스토리 관리

## 기술 스택

- **프레임워크**: React 19 + TypeScript
- **빌드**: Vite 7
- **스타일링**: Tailwind CSS v4 + @mini-apps/ui
- **상태관리**: Zustand 5
- **이미지 업로드**: react-dropzone
- **아이콘**: lucide-react

## 개발

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm --filter ideal-worldcup dev

# 빌드
pnpm --filter ideal-worldcup build

# 미리보기
pnpm --filter ideal-worldcup preview
```

## 프로젝트 구조

```
src/
├── types/                      # TypeScript 타입 정의
│   └── index.ts
├── utils/                      # 유틸리티 함수
│   ├── tournament.ts          # 토너먼트 알고리즘
│   ├── storage.ts             # LocalStorage 래퍼
│   ├── image.ts               # 이미지 처리
│   ├── canvas.ts              # Canvas 렌더링
│   └── share.ts               # Web Share API
├── store/                      # Zustand 스토어
│   └── useAppStore.ts
├── components/
│   ├── create/                # 토너먼트 생성
│   │   ├── TournamentForm.tsx
│   │   └── ImageUploader.tsx
│   ├── play/                  # 토너먼트 진행
│   │   ├── MatchView.tsx
│   │   └── CandidatePanel.tsx
│   └── result/                # 결과 화면
│       └── ResultView.tsx
├── App.tsx                     # 메인 앱 컴포넌트
└── main.tsx                    # 진입점
```

## 핵심 알고리즘

### 토너먼트 브래킷 생성
- Fisher-Yates 셔플로 후보자 랜덤 배치
- 라운드별 매칭 생성
- 재귀적 구조로 다음 라운드 진행

### Canvas 이미지 생성
- 1200x630px (SNS 최적 비율)
- 그라디언트 배경
- 원형 클리핑 이미지
- 텍스트 렌더링 + 워터마크

### 상태 관리
- Zustand로 전역 상태 관리
- localStorage 자동 동기화
- 히스토리 추적 (뒤로가기)

## 배포 URL

- **개발**: http://localhost:5179/mini-apps/ideal-worldcup/
- **프로덕션**: https://seolcoding.com/mini-apps/ideal-worldcup/

## 브라우저 지원

- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

## 라이센스

MIT
