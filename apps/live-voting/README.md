# 실시간 투표 플랫폼 (Live Voting Platform)

QR 코드로 간편하게 투표를 만들고, 실시간으로 결과를 확인하는 웹 애플리케이션입니다.

## 주요 기능

- **다양한 투표 유형**: 단일 선택, 복수 선택, 순위 투표
- **QR 코드 참여**: 앱 설치 없이 QR 스캔으로 즉시 참여
- **실시간 결과**: BroadcastChannel API로 실시간 차트 업데이트
- **프레젠테이션 모드**: 대형 화면 최적화
- **익명 투표**: 개인정보 수집 없음
- **완전 프론트엔드**: 서버 없이 localStorage 기반

## 기술 스택

- **React 19** - UI 프레임워크
- **TypeScript 5.9** - 타입 안정성
- **Vite 7** - 빌드 도구
- **Tailwind CSS 3.4** - 스타일링
- **React Router DOM 7** - 라우팅
- **Recharts 2.15** - 차트 시각화
- **qrcode 1.5** - QR 코드 생성
- **nanoid 5.0** - 짧은 ID 생성
- **react-confetti 6.1** - 완료 애니메이션

## 시작하기

### 개발 서버 실행
```bash
npm run dev
```

개발 서버가 `http://localhost:5173/mini-apps/live-voting/`에서 시작됩니다.

### 빌드
```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

### 프리뷰
```bash
npm run preview
```

## 사용법

### 1. 투표 생성
1. 홈페이지에서 "투표 만들기" 클릭
2. 투표 제목과 선택지 입력 (2~10개)
3. 투표 유형 선택 (단일/복수/순위)
4. "투표 시작" 클릭

### 2. 투표 참여
1. QR 코드 스캔 또는 URL로 접속
2. 선택지 선택
3. "투표하기" 클릭
4. 투표 완료 애니메이션 확인

### 3. 실시간 결과 확인
- 호스트 뷰에서 실시간 차트 확인
- 프레젠테이션 모드로 전환 가능
- 상세 결과 테이블 제공

## 프로젝트 구조

```
src/
├── App.tsx                    # 라우팅
├── main.tsx                   # 진입점
├── pages/
│   └── HomePage.tsx           # 랜딩 페이지
├── components/
│   ├── CreatePoll.tsx         # 투표 생성
│   ├── VoteView.tsx           # 투표 참여
│   ├── HostView.tsx           # 실시간 결과
│   └── ResultChart.tsx        # 차트
├── hooks/
│   ├── useBroadcastChannel.ts # 탭 간 통신
│   └── useLiveResults.ts      # 실시간 결과
├── utils/
│   ├── storage.ts             # localStorage
│   ├── voteValidator.ts       # 중복 방지
│   └── pollCalculator.ts      # 집계 로직
└── types/
    └── poll.ts                # 타입 정의
```

## 라우팅

- `/` - 홈페이지
- `/create` - 투표 생성
- `/vote/:pollId` - 투표 참여
- `/host/:pollId` - 호스트 뷰 (실시간 결과)

## 데이터 저장

모든 데이터는 브라우저의 localStorage에 저장됩니다.

```
poll:{pollId}     - 투표 정보
votes:{pollId}    - 투표 응답
votedPolls        - 참여한 투표 목록
myPolls           - 생성한 투표 목록
```

## 투표 집계 알고리즘

### 단일/복수 선택
- 각 선택지별 득표수 카운트
- 비율(%) 계산

### 순위 투표 (Borda Count)
- 1위 = N점, 2위 = N-1점, ..., N위 = 1점
- 총점이 가장 높은 선택지가 우승

## 실시간 동기화

- **BroadcastChannel API**: 같은 origin의 탭 간 실시간 통신
- **폴링 폴백**: BroadcastChannel 미지원 시 1초마다 자동 폴링

## 브라우저 호환성

- Chrome 54+ (BroadcastChannel 지원)
- Firefox 38+
- Safari 15.4+
- Edge 79+

BroadcastChannel 미지원 브라우저는 폴링으로 자동 폴백됩니다.

## 주의사항

- localStorage 기반이므로 브라우저 데이터 삭제 시 투표 초기화됩니다.
- 중복 투표 방지는 localStorage 기반이므로 완벽하지 않습니다 (시크릿 모드/다른 브라우저 우회 가능).
- BroadcastChannel은 같은 브라우저 내 탭끼리만 통신 가능합니다.

## 배포

### Base URL 설정
```typescript
// vite.config.ts
base: '/mini-apps/live-voting/'
```

### 배포 URL
```
https://seolcoding.com/mini-apps/live-voting/
```

## 참고 문서

- [PRD 문서](../../prd/11-live-voting.md)
- [구현 상세](./IMPLEMENTATION_SUMMARY.md)

## 라이선스

MIT License

## 개발자

Claude (Anthropic) - 2025-12-20
