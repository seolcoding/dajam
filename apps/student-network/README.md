# 수강생 네트워킹 플랫폼 (Student Networking Platform)

학력이 아닌 관심사로 연결되는 교육 과정 수강생 네트워킹 앱

## 주요 기능

### 1. 프로필 생성
- 이름, 한줄 소개 (30자 제한)
- 전공/분야 선택 (13개 옵션)
- 관심사 태그 (최대 5개 선택)
- 프로필 사진 업로드 (선택)
- 연락처 정보 (이메일, GitHub, LinkedIn, 개인 웹사이트 - 모두 선택)

### 2. 프로필 카드
- Canvas 기반 시각적 프로필 카드
- QR 코드 자동 생성 (프로필 공유용)
- PNG 이미지로 다운로드 가능
- SNS 공유 최적화 (1200x630px)

### 3. Room (교실) 관리
- Room 생성 (6자리 고유 코드)
- Room 참여 (코드 입력)
- 참여자 목록 보기
- Room 나가기

### 4. 관심사 매칭
- 공통 관심사 기반 추천
- 관심사 빈도수 시각화 (태그 클라우드)
- 매칭 점수 표시

### 5. 아이스브레이킹
- 랜덤 질문 생성 (21개 카테고리)
- 질문 답변 작성 및 공유
- Room 내 모든 답변 보기

## 기술 스택

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **UI Components**: @mini-apps/ui (Radix UI 기반)
- **State Management**: Zustand v5
- **Storage**: localStorage (완전 비공개)
- **Libraries**:
  - html2canvas: 프로필 카드 이미지 생성
  - qrcode.react: QR 코드 생성
  - nanoid: 고유 ID 생성
  - lucide-react: 아이콘

## 개발

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build
```

## 디렉토리 구조

```
src/
├── components/           # React 컴포넌트
│   ├── ProfileForm.tsx       # 프로필 생성 폼
│   ├── ProfileCard.tsx       # Canvas 프로필 카드
│   ├── RoomManager.tsx       # Room 생성/참여
│   ├── RoomView.tsx          # Room 상세 (탭)
│   ├── MatchingView.tsx      # 관심사 매칭
│   └── IcebreakerView.tsx    # 아이스브레이킹
├── store/               # Zustand 스토어
│   ├── profileStore.ts       # 프로필 상태
│   ├── roomStore.ts          # Room 상태
│   └── icebreakerStore.ts    # 아이스브레이킹 상태
├── lib/                 # 유틸리티
│   ├── roomCode.ts           # Room 코드 생성
│   ├── matching.ts           # 매칭 알고리즘
│   └── privacy.ts            # 데이터 관리
├── constants/           # 상수
│   ├── fields.ts             # 전공/분야 목록
│   ├── interests.ts          # 관심사 태그
│   └── icebreakers.ts        # 아이스브레이킹 질문
└── types/              # TypeScript 타입
    └── index.ts
```

## 데이터 모델

### Profile
```typescript
{
  id: string;           // nanoid
  name: string;
  tagline: string;      // 한줄 소개
  field: string;        // 전공/분야
  interests: string[];  // 관심사 (최대 5개)
  contacts: {
    email?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  avatarUrl?: string;   // Base64 이미지
  createdAt: string;    // ISO 8601
}
```

### Room
```typescript
{
  id: string;           // 6자리 코드
  name: string;         // 교실 이름
  createdBy: string;    // Profile ID
  members: string[];    // Profile IDs
  createdAt: string;
}
```

### IcebreakerAnswer
```typescript
{
  id: string;
  questionId: string;
  question: string;
  answer: string;
  profileId: string;
  roomId: string;
  createdAt: string;
}
```

## 개인정보 보호

- 모든 데이터는 브라우저 localStorage에만 저장
- 서버로 전송되지 않음
- 학력 정보는 수집하지 않음
- 데이터 백업/삭제 기능 제공

## 배포

- Base URL: `/mini-apps/student-network/`
- GitHub Pages / Vercel / Netlify 지원

## 참고

- PRD: `../../prd/12-student-network.md`
- UI 패키지: `../../packages/ui/`
