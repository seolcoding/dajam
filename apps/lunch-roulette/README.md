# 점심 메뉴 룰렛 (Lunch Roulette)

오늘 뭐 먹지? 결정 피로 해결사! 위치 기반 맛집 추천 룰렛 앱.

## 주요 기능

- **2단계 룰렛 시스템**
  1. 음식 카테고리 선택 (한식, 중식, 일식, 양식 등 12가지)
  2. 선택된 카테고리의 주변 실제 음식점 추천

- **위치 기반 검색**
  - Geolocation API로 현재 위치 자동 획득
  - 검색 반경 설정 (500m, 1km, 2km, 5km)
  - 거리순 정렬

- **실시간 음식점 정보**
  - Kakao Maps Places API 연동
  - 음식점 이름, 주소, 전화번호, 거리 정보
  - 카카오맵 직접 연결

- **결과 공유**
  - 카카오톡 공유 (Kakao Share API)
  - 네이티브 공유 (모바일)
  - URL 복사

## 기술 스택

- **Framework**: React 19 + TypeScript
- **Build**: Vite 7
- **Styling**: Tailwind CSS v4
- **UI Components**: @mini-apps/ui (워크스페이스 패키지)
- **State**: Zustand
- **Roulette**: react-custom-roulette
- **APIs**:
  - Geolocation API (브라우저 내장)
  - Kakao Maps JavaScript SDK
  - Kakao Places API

## 개발 환경 설정

### 1. 환경 변수

```bash
# .env.local 파일 생성
cp .env.example .env.local

# Kakao API 키 입력
VITE_KAKAO_APP_KEY=your_kakao_javascript_key_here
```

**Kakao API 키 발급 방법**:
1. [Kakao Developers](https://developers.kakao.com/) 로그인
2. 내 애플리케이션 → 애플리케이션 추가
3. 플랫폼 설정 → Web 추가
   - 사이트 도메인: `http://localhost:5173`
   - 배포 도메인: `https://seolcoding.com`
4. JavaScript 키 복사

### 2. 의존성 설치

```bash
# 워크스페이스 루트에서
cd /path/to/agents/mini-apps
pnpm install
```

### 3. 개발 서버 실행

```bash
# 특정 앱만 실행
pnpm --filter lunch-roulette dev

# 또는 앱 디렉토리에서
cd apps/lunch-roulette
pnpm dev
```

개발 서버: http://localhost:5173

### 4. 빌드

```bash
pnpm --filter lunch-roulette build
```

빌드 결과: `dist/`

## 프로젝트 구조

```
src/
├── components/
│   ├── CategoryRoulette.tsx       # 1단계: 카테고리 룰렛
│   ├── RestaurantRoulette.tsx     # 2단계: 음식점 룰렛
│   ├── RestaurantCard.tsx         # 음식점 정보 카드
│   ├── FilterPanel.tsx            # 검색 반경 필터
│   └── ShareButtons.tsx           # 공유 버튼
├── hooks/
│   └── useGeolocation.ts          # 위치 정보 훅
├── lib/
│   └── kakao/
│       ├── init.ts                # SDK 초기화
│       └── places.ts              # Places API 래퍼
├── store/
│   └── useAppStore.ts             # Zustand 전역 상태
├── types/
│   ├── kakao.d.ts                 # Kakao API 타입
│   └── food.ts                    # 음식점/카테고리 타입
├── constants/
│   └── foodCategories.ts          # 카테고리 데이터
├── App.tsx                        # 메인 앱
└── main.tsx                       # 엔트리 포인트
```

## 사용자 플로우

1. **위치 권한 요청** → 허용 시 현재 위치, 거부 시 기본 위치(서울)
2. **카테고리 룰렛** → 12가지 음식 카테고리 중 하나 선택
3. **음식점 검색** → 선택된 카테고리의 주변 음식점 검색
4. **음식점 룰렛** → 검색된 음식점 중 하나 랜덤 선택
5. **결과 표시** → 음식점 상세 정보 + 공유 버튼

## 주요 컴포넌트 설명

### CategoryRoulette

- 12가지 음식 카테고리 룰렛
- react-custom-roulette로 애니메이션
- 각 카테고리별 고유 색상 및 이모지

### RestaurantRoulette

- 선택된 카테고리의 주변 음식점 룰렛
- Kakao Places API로 실시간 검색
- 최대 10개 음식점 표시

### RestaurantCard

- 선택된 음식점 정보 카드
- 이름, 카테고리, 주소, 전화번호, 거리
- 카카오맵 링크

### FilterPanel

- 검색 반경 설정 (500m, 1km, 2km, 5km)
- 버튼 토글 방식

### ShareButtons

- 카카오톡 공유 (Kakao Share API)
- 네이티브 공유 (navigator.share)
- URL 복사 (clipboard API)

## 환경별 설정

### 개발 환경

- Base URL: `/`
- HMR 활성화
- Source maps 포함

### 프로덕션 환경

- Base URL: `/mini-apps/lunch-roulette/`
- 코드 압축 및 최적화
- CSS 추출

## 라이선스

MIT

## 기여

Made with ❤️ by SeolCoding
