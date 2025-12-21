# 이상형 월드컵 (Ideal Type World Cup)

## 1. 개요

### 1.1 앱 설명
이상형 월드컵은 사용자가 원하는 주제로 토너먼트 형식의 선택 게임을 만들고 진행할 수 있는 웹 애플리케이션입니다. 사용자는 자신만의 후보(이미지 + 이름)를 업로드하여 토너먼트를 생성하고, 1:1 대결을 통해 최종 우승자를 선택할 수 있습니다. 결과는 이미지로 저장하여 SNS에 공유할 수 있습니다.

### 1.2 타겟 사용자
- 10대~30대 SNS 활동이 활발한 사용자
- 친구들과 재미있는 컨텐츠를 공유하고 싶은 사용자
- 자신만의 취향을 표현하고 싶은 사용자
- 커뮤니티에서 투표형 컨텐츠를 만들고 싶은 크리에이터

### 1.3 핵심 가치
- **간편성**: 복잡한 회원가입 없이 즉시 시작 가능
- **창의성**: 어떤 주제든 자유롭게 만들 수 있는 유연성
- **공유성**: 결과를 이미지로 저장하여 쉽게 공유
- **재미성**: 단순하지만 중독성 있는 게임 메커니즘

## 2. 유사 서비스 분석

### 2.1 주요 유사 서비스
- **피쿠(PIKU)** (https://www.piku.co.kr): 국내 대표 이상형 월드컵 플랫폼
- **여러 개인 개발자들의 이상형 월드컵 웹 앱**

### 2.2 기능 분석
주요 공통 기능:
- 라운드 선택 (4강, 8강, 16강, 32강 등)
- 1:1 대결 화면
- 진행률 표시
- 최종 우승자 발표
- 랭킹/통계 (일부 서비스)

### 2.3 UI/UX 패턴
- 화면을 좌우로 나눈 대결 구도
- 클릭/탭으로 선택
- 진행률 표시 바
- 애니메이션 효과 (선택 시, 라운드 전환 시)
- 모바일 퍼스트 디자인

### 2.4 차별화 포인트
우리 앱의 차별화:
- 로컬 퍼스트: 모든 데이터를 브라우저에 저장 (서버 불필요)
- Canvas 기반 결과 이미지 생성 (워터마크, 커스텀 디자인)
- Tailwind CSS v4를 활용한 모던한 UI
- TypeScript로 타입 안정성 확보
- React 19 최신 기능 활용

## 3. 오픈소스 라이브러리

### 3.1 토너먼트 브래킷
**선택한 라이브러리**: 직접 구현 (Simple Tournament Logic)

이상형 월드컵은 복잡한 브래킷 시각화가 필요하지 않고, 단순한 1:1 매칭만 필요하므로 직접 구현하는 것이 더 적합합니다.

**참고 라이브러리**:
- [@g-loot/react-tournament-brackets](https://github.com/g-loot/react-tournament-brackets): 복잡한 토너먼트 브래킷 시각화가 필요할 경우 참고
  - Single/Double Elimination 지원
  - SVG 기반 렌더링
  - 커스터마이징 가능한 테마

### 3.2 드래그 앤 드롭 이미지 업로드
**선택한 라이브러리**: [react-dropzone](https://github.com/react-dropzone/react-dropzone)

```bash
npm install react-dropzone
```

**선택 이유**:
- React Hooks 기반으로 React 19와 호환성 우수
- HTML5 compliant
- 파일 타입 제한 및 검증 기능
- 커스터마이징 가능한 UI
- 2025년 기준 가장 활발히 유지보수되는 라이브러리

**대안**:
- [react-drag-drop-files](https://www.npmjs.com/package/react-drag-drop-files): 더 가벼운 옵션
- 네이티브 구현: 라이브러리 없이 HTML5 API 직접 사용

### 3.3 Canvas 이미지 생성
**선택한 방법**: 네이티브 Canvas API

Canvas API로 충분히 구현 가능하며, 추가 라이브러리는 불필요합니다.

**참고 라이브러리** (복잡한 요구사항 시):
- [Fabric.js](https://fabricjs.com/): 풍부한 텍스트 스타일링, SVG 지원
- [html-to-image](https://www.npmjs.com/package/html-to-image): HTML → 이미지 변환
- [Canvas-Txt](https://github.com/geongeorge/Canvas-Txt): 멀티라인 텍스트 렌더링

### 3.4 기타 라이브러리
- **상태관리**: [Zustand](https://github.com/pmndrs/zustand) - 최소한의 보일러플레이트, Hooks 기반
- **아이콘**: [lucide-react](https://lucide.dev/) - 모던하고 가벼운 아이콘 라이브러리
- **이미지 압축**: [browser-image-compression](https://www.npmjs.com/package/browser-image-compression) - 클라이언트 사이드 이미지 최적화

## 4. 기술 스택

### 4.1 코어 기술
- **프레임워크**: Vite 6.0+ + React 19
- **언어**: TypeScript 5.7+
- **스타일링**: Tailwind CSS v4
- **상태관리**: Zustand 5.0+
- **이미지 처리**: Canvas API + FileReader API

### 4.2 개발 도구
- **패키지 매니저**: npm
- **코드 포맷터**: Prettier
- **린터**: ESLint
- **번들러**: Vite (기본)

### 4.3 배포
- **호스팅**: Vercel / Netlify (정적 사이트)
- **도메인**: seolcoding.com/mini-apps/ideal-worldcup

### 4.4 브라우저 지원
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

## 5. 핵심 기능 및 구현

### 5.1 주제 생성 (Create Tournament)

**기능 요구사항**:
- 토너먼트 제목 입력 (필수)
- 라운드 선택 (4강, 8강, 16강, 32강)
- 후보자 이미지 업로드 (드래그 앤 드롭 또는 파일 선택)
- 후보자 이름 입력
- 최소 후보자 수 검증 (선택한 라운드에 맞게)

**구현 세부사항**:
```typescript
// 드래그 앤 드롭으로 이미지 업로드
// react-dropzone 사용
// 업로드된 이미지를 FileReader로 읽어 Data URL로 변환
// IndexedDB 또는 localStorage에 저장 (용량에 따라)
// 이미지 압축으로 용량 최적화
```

**UI 요소**:
- 제목 입력 필드
- 라운드 선택 라디오/드롭다운
- 업로드 영역 (드래그 앤 드롭 존)
- 후보자 카드 그리드 (썸네일 + 이름)
- 시작하기 버튼

### 5.2 토너먼트 진행 (Play Tournament)

**기능 요구사항**:
- 1:1 대결 화면
- 좌/우 이미지 클릭으로 선택
- 진행률 표시 (현재 라운드, 남은 매치)
- 라운드별 헤더 (예: "16강", "8강")
- 매칭 랜덤화
- 선택 히스토리 추적

**구현 세부사항**:
```typescript
// 토너먼트 브래킷 알고리즘
// - 초기 매칭: Fisher-Yates 셔플로 랜덤 배치
// - 라운드 진행: 승자들을 다음 라운드로 이동
// - 재귀적 구조로 최종 우승자까지 진행
```

**UI 요소**:
- 상단: 라운드 표시 + 진행률 바
- 중앙: 좌우 분할 대결 화면
  - 좌측: 후보자 A 이미지 + 이름
  - 우측: 후보자 B 이미지 + 이름
- 하단: 뒤로 가기 버튼 (이전 선택 취소)

**애니메이션**:
- 선택 시 페이드 인/아웃
- 라운드 전환 시 슬라이드 효과
- 버튼 호버 효과

### 5.3 결과 이미지 생성 (Generate Result Image)

**기능 요구사항**:
- 최종 우승자 표시
- 준우승자, 4강 결과 표시 (선택사항)
- Canvas로 이미지 렌더링
- 워터마크/브랜딩 추가
- PNG/JPEG 다운로드

**구현 세부사항**:
```typescript
// Canvas API 사용
// 1. 캔버스 생성 (1200x630 - SNS 최적 비율)
// 2. 배경색/그라디언트 그리기
// 3. 우승자 이미지 그리기 (중앙)
// 4. 텍스트 렌더링 (제목, 우승자 이름, 순위)
// 5. 워터마크 추가 (seolcoding.com 로고)
// 6. canvas.toBlob()으로 이미지 생성
```

**UI 요소**:
- 우승자 카드 (크게)
- 순위 표시 (1위, 2위, 3-4위)
- 다운로드 버튼
- SNS 공유 버튼

### 5.4 SNS 공유 (Share to Social Media)

**기능 요구사항**:
- 이미지 다운로드
- Web Share API 지원
- 클립보드 복사 (이미지)
- 공유 텍스트 커스터마이징

**구현 세부사항**:
```typescript
// Web Share API (모바일 네이티브 공유)
if (navigator.share) {
  await navigator.share({
    files: [imageBlob],
    title: '나의 이상형 월드컵 결과',
    text: `우승: ${winner.name}`
  });
}

// Clipboard API (이미지 복사)
await navigator.clipboard.write([
  new ClipboardItem({ 'image/png': imageBlob })
]);
```

**UI 요소**:
- 공유 버튼 (네이티브 공유 시트 트리거)
- 다운로드 버튼
- 복사 버튼

### 5.5 데이터 저장 (Local Storage)

**기능 요구사항**:
- 생성한 토너먼트 저장
- 진행 중인 게임 저장 (중단 후 재개)
- 완료한 게임 히스토리 저장

**구현 세부사항**:
```typescript
// IndexedDB 사용 (이미지 포함, 대용량)
// 또는 localStorage (5MB 제한, 작은 이미지만)

// 저장 구조:
// tournaments: [{ id, title, round, candidates, createdAt }]
// history: [{ id, tournamentId, winner, results, completedAt }]
```

## 6. 데이터 모델 (TypeScript 타입)

```typescript
// 후보자 (Candidate)
export interface Candidate {
  id: string; // UUID
  name: string;
  imageUrl: string; // Data URL or Blob URL
  imageFile?: File; // 원본 파일 (optional)
}

// 매치 (Match)
export interface Match {
  id: string;
  round: number; // 1 (결승), 2 (준결승), 4 (8강), 8 (16강) ...
  candidateA: Candidate;
  candidateB: Candidate;
  winner?: Candidate; // 아직 선택 안 된 경우 undefined
}

// 토너먼트 (Tournament)
export interface Tournament {
  id: string;
  title: string;
  totalRounds: number; // 4, 8, 16, 32
  candidates: Candidate[];
  createdAt: Date;
}

// 게임 상태 (Game State)
export interface GameState {
  tournament: Tournament;
  currentRound: number; // 현재 진행 중인 라운드
  currentMatchIndex: number; // 현재 라운드 내 매치 인덱스
  matches: Match[]; // 모든 매치 (과거 + 현재 + 미래)
  history: Candidate[]; // 선택 히스토리 (뒤로가기용)
  isComplete: boolean;
  winner?: Candidate;
}

// 결과 (Result)
export interface TournamentResult {
  id: string;
  tournamentId: string;
  tournamentTitle: string;
  winner: Candidate;
  runnerUp?: Candidate;
  semiFinals?: Candidate[];
  completedAt: Date;
}

// Zustand Store 타입
export interface AppStore {
  // State
  tournaments: Tournament[];
  currentGame: GameState | null;
  results: TournamentResult[];

  // Actions
  createTournament: (tournament: Omit<Tournament, 'id' | 'createdAt'>) => void;
  startGame: (tournamentId: string) => void;
  selectWinner: (match: Match, winner: Candidate) => void;
  goBack: () => void;
  saveResult: (result: Omit<TournamentResult, 'id' | 'completedAt'>) => void;
  deleteTournament: (id: string) => void;
  clearAll: () => void;
}
```

## 7. 컴포넌트 구조

```
src/
├── main.tsx                    # 앱 진입점
├── App.tsx                     # 라우팅 + 레이아웃
├── store/
│   └── useAppStore.ts          # Zustand 스토어
├── components/
│   ├── common/
│   │   ├── Button.tsx          # 재사용 가능한 버튼
│   │   ├── Card.tsx            # 카드 컴포넌트
│   │   ├── ProgressBar.tsx     # 진행률 바
│   │   └── Modal.tsx           # 모달 (공유 등)
│   ├── create/
│   │   ├── TournamentForm.tsx  # 토너먼트 생성 폼
│   │   ├── ImageUploader.tsx   # 드래그앤드롭 업로더
│   │   └── CandidateCard.tsx   # 후보자 카드
│   ├── play/
│   │   ├── MatchView.tsx       # 1:1 대결 화면
│   │   ├── CandidatePanel.tsx  # 좌/우 패널
│   │   └── RoundHeader.tsx     # 라운드 헤더
│   ├── result/
│   │   ├── ResultView.tsx      # 결과 화면
│   │   ├── ResultCanvas.tsx    # Canvas 이미지 생성
│   │   ├── ShareButtons.tsx    # 공유 버튼들
│   │   └── RankingDisplay.tsx  # 순위 표시
│   └── home/
│       ├── TournamentList.tsx  # 토너먼트 목록
│       └── ResultHistory.tsx   # 결과 히스토리
├── pages/
│   ├── HomePage.tsx            # 메인 페이지
│   ├── CreatePage.tsx          # 생성 페이지
│   ├── PlayPage.tsx            # 플레이 페이지
│   └── ResultPage.tsx          # 결과 페이지
├── hooks/
│   ├── useTournament.ts        # 토너먼트 로직
│   ├── useImageUpload.ts       # 이미지 업로드 로직
│   └── useCanvas.ts            # Canvas 생성 로직
├── utils/
│   ├── tournament.ts           # 토너먼트 알고리즘
│   ├── canvas.ts               # Canvas 렌더링 유틸
│   ├── storage.ts              # LocalStorage/IndexedDB 래퍼
│   ├── image.ts                # 이미지 압축/변환
│   └── share.ts                # Web Share API 래퍼
└── types/
    └── index.ts                # 타입 정의
```

**컴포넌트 설계 원칙**:
- 단일 책임 원칙 (SRP)
- Props drilling 최소화 (Zustand로 전역 상태 관리)
- 재사용 가능한 컴포넌트는 common/에 배치
- 페이지별 컴포넌트는 각 페이지 폴더에 배치

## 8. 핵심 알고리즘

### 8.1 토너먼트 브래킷 생성

```typescript
/**
 * 토너먼트 브래킷 생성
 * @param candidates - 후보자 배열
 * @param totalRounds - 전체 라운드 수 (4, 8, 16, 32)
 * @returns 초기 매치 배열
 */
export function createBracket(
  candidates: Candidate[],
  totalRounds: number
): Match[] {
  // 1. 후보자 셔플 (Fisher-Yates)
  const shuffled = shuffleArray([...candidates]);

  // 2. 필요한 후보자 수 검증
  const requiredCount = totalRounds;
  if (shuffled.length < requiredCount) {
    throw new Error(`최소 ${requiredCount}명의 후보자가 필요합니다.`);
  }

  // 3. 초기 매치 생성 (첫 라운드)
  const matches: Match[] = [];
  const initialCandidates = shuffled.slice(0, requiredCount);

  for (let i = 0; i < initialCandidates.length; i += 2) {
    matches.push({
      id: `match-${i / 2}`,
      round: totalRounds / 2, // 예: 16강이면 8
      candidateA: initialCandidates[i],
      candidateB: initialCandidates[i + 1],
    });
  }

  return matches;
}
```

### 8.2 랜덤 매칭 (Fisher-Yates Shuffle)

```typescript
/**
 * Fisher-Yates 셔플 알고리즘
 * @param array - 셔플할 배열
 * @returns 셔플된 새 배열
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
```

### 8.3 다음 라운드 진행

```typescript
/**
 * 현재 라운드의 승자들로 다음 라운드 매치 생성
 * @param currentMatches - 현재 라운드 매치 배열
 * @returns 다음 라운드 매치 배열
 */
export function advanceToNextRound(currentMatches: Match[]): Match[] {
  // 1. 모든 매치가 완료되었는지 확인
  const allComplete = currentMatches.every(match => match.winner);
  if (!allComplete) {
    throw new Error('모든 매치가 완료되지 않았습니다.');
  }

  // 2. 승자 추출
  const winners = currentMatches.map(match => match.winner!);

  // 3. 결승전인 경우
  if (winners.length === 1) {
    return []; // 더 이상 진행할 라운드 없음
  }

  // 4. 다음 라운드 매치 생성
  const nextRound = currentMatches[0].round / 2;
  const nextMatches: Match[] = [];

  for (let i = 0; i < winners.length; i += 2) {
    nextMatches.push({
      id: `match-round${nextRound}-${i / 2}`,
      round: nextRound,
      candidateA: winners[i],
      candidateB: winners[i + 1],
    });
  }

  return nextMatches;
}
```

### 8.4 Canvas 이미지 렌더링

```typescript
/**
 * 토너먼트 결과 이미지 생성
 * @param result - 토너먼트 결과
 * @returns Blob (PNG 이미지)
 */
export async function generateResultImage(
  result: TournamentResult
): Promise<Blob> {
  // 1. Canvas 생성 (SNS 최적 비율)
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = 1200;
  canvas.height = 630;

  // 2. 배경 그라디언트
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3. 타이틀 렌더링
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(result.tournamentTitle, canvas.width / 2, 80);

  // 4. 우승자 이미지 로드 및 그리기
  const img = await loadImage(result.winner.imageUrl);
  const imgSize = 400;
  const imgX = (canvas.width - imgSize) / 2;
  const imgY = 120;

  // 원형 클리핑 (선택사항)
  ctx.save();
  ctx.beginPath();
  ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
  ctx.restore();

  // 5. 우승자 이름
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(`🏆 ${result.winner.name}`, canvas.width / 2, imgY + imgSize + 60);

  // 6. 워터마크
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('seolcoding.com', canvas.width - 20, canvas.height - 20);

  // 7. Blob 생성
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}

/**
 * 이미지 로드 헬퍼
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
```

### 8.5 이미지 압축

```typescript
import imageCompression from 'browser-image-compression';

/**
 * 이미지 압축 (클라이언트 사이드)
 * @param file - 원본 이미지 파일
 * @returns 압축된 Blob
 */
export async function compressImage(file: File): Promise<Blob> {
  const options = {
    maxSizeMB: 1, // 최대 1MB
    maxWidthOrHeight: 800, // 최대 너비/높이
    useWebWorker: true,
  };

  try {
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch (error) {
    console.error('이미지 압축 실패:', error);
    return file; // 실패 시 원본 반환
  }
}
```

## 9. 구현 우선순위

### Phase 1: MVP (1주)
- [x] 프로젝트 셋업 (Vite + React + TypeScript)
- [x] 기본 라우팅 (React Router)
- [x] Zustand 스토어 구조
- [x] 토너먼트 생성 페이지
- [x] 이미지 업로드 (react-dropzone)
- [x] 토너먼트 진행 로직
- [x] 1:1 대결 UI
- [x] 결과 화면
- [x] LocalStorage 저장

### Phase 2: 고급 기능 (1주)
- [ ] Canvas 결과 이미지 생성
- [ ] Web Share API 통합
- [ ] 이미지 압축
- [ ] 애니메이션 효과
- [ ] 반응형 디자인 최적화
- [ ] 다크모드 지원

### Phase 3: 최적화 & 배포 (3일)
- [ ] 성능 최적화
- [ ] 접근성 개선 (ARIA)
- [ ] SEO 메타 태그
- [ ] PWA 설정 (선택사항)
- [ ] Vercel 배포
- [ ] 사용자 테스트

## 10. 참고 자료

### 공식 문서
- [React 19 Documentation](https://react.dev/)
- [Vite Guide](https://vite.dev/)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Web Share API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)

### 라이브러리
- [react-dropzone](https://github.com/react-dropzone/react-dropzone)
- [browser-image-compression](https://www.npmjs.com/package/browser-image-compression)
- [lucide-react](https://lucide.dev/)

### 참고 프로젝트
- [g-loot/react-tournament-brackets](https://github.com/g-loot/react-tournament-brackets)
- [PIKU - 이상형 월드컵](https://www.piku.co.kr)

## 11. 개발 도구

### 11.1 UI 컴포넌트
- **Shadcn UI**: 검증된 컴포넌트 라이브러리
- `pnpm dlx shadcn@latest add [component]`로 추가
- `@mini-apps/ui` 패키지에서 공유

### 11.2 브라우저 테스트
- **Chrome DevTools MCP**: 실시간 UI 확인 및 디버깅
- 스냅샷/스크린샷으로 렌더링 확인
- 콘솔/네트워크 요청 분석
- 반응형 테스트 (모바일 뷰포트)

> 자세한 사용법은 `agents/mini-apps/CLAUDE.md` 참조

---

**작성일**: 2025-12-20
**버전**: 1.0
**작성자**: Claude (Anthropic)
