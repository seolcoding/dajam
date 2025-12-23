# Word Cloud - 실시간 워드 클라우드

## 1. 개요

### 1.1 앱 설명
Word Cloud는 실시간으로 참가자들의 텍스트 입력을 수집하여 워드 클라우드를 생성하는 아이스브레이킹 도구입니다. 호스트가 질문을 던지면 참가자들이 단어를 입력하고, 많이 입력된 단어가 크게 표시됩니다. Mentimeter의 Word Cloud 기능을 무료로 구현합니다.

### 1.2 타겟 사용자
- **강의자/발표자**: 청중 의견 수집, 브레인스토밍
- **워크샵 진행자**: 아이스브레이킹, 팀 의견 통합
- **회의 진행자**: 아이디어 수집, 투표 대안
- **교육자**: 학생들의 이해도 체크

### 1.3 핵심 가치
- **즉각적인 시각화**: 입력 즉시 워드 클라우드에 반영
- **익명 참여**: 부담 없이 솔직한 의견 표현
- **아름다운 결과물**: 공유 가능한 이미지 생성
- **무료 & 무제한**: 참가자 수/단어 수 제한 없음

### 1.4 사용 시나리오
1. **수업 시작**: "오늘 수업에서 기대하는 것은?" → 학습 목표 파악
2. **회의 시작**: "우리 팀의 강점은?" → 팀 정체성 확인
3. **이벤트 마무리**: "오늘 행사를 한 단어로 표현하면?" → 만족도 파악
4. **브레인스토밍**: "신제품 아이디어를 한 단어로?" → 아이디어 수집

### 1.5 참여 모드 원칙
> **호스트 = PC/프로젝터(큰 화면), 참가자 = 모바일**

| 역할 | 디바이스 | 화면 구성 |
|------|----------|-----------|
| **호스트** | PC/프로젝터 | 질문 표시, 실시간 워드 클라우드, 참가자 수, 입력 마감 |
| **참가자** | 모바일 (필수) | 6자리 코드 입력 → 단어 입력 필드 → 제출 버튼 |

- 참가자 화면은 **모바일 세로 모드에 최적화**
- 텍스트 입력 필드는 **화면 하단 고정** (키보드 영역 고려)
- 입력 후 **즉시 피드백** (내 단어 제출됨 표시)
- 워드 클라우드는 호스트 화면에서만 실시간 업데이트
- 참가자는 자신이 입력한 단어 목록만 확인

---

## 2. 유사 서비스 분석

### 2.1 경쟁 서비스

| 서비스 | 장점 | 단점 |
|--------|------|------|
| **Mentimeter** | 아름다운 디자인, 다양한 색상 테마 | 무료 50명 제한, 월 $8.99 |
| **AhaSlides** | 무료 티어 관대, 실시간 동기화 | 한글 렌더링 이슈 |
| **Slido** | Webex/Teams 통합 | 워드 클라우드는 유료 |
| **Poll Everywhere** | 기업용 기능 | 비쌈 ($240/년) |

### 2.2 차별화 전략
1. **한글 최적화**: Pretendard 폰트, 한글 형태소 분석
2. **완전 무료**: 참가자 수/단어 수 무제한
3. **오프라인 지원**: localStorage 백업
4. **커스터마이징**: 색상, 폰트, 배경 선택

---

## 3. 기술 스택

### 3.1 프론트엔드
- **Next.js 15 App Router**
- **React 19 + TypeScript**
- **Tailwind CSS v3**
- **react-wordcloud**: 워드 클라우드 렌더링
- **d3-cloud**: 레이아웃 알고리즘 (대안)

### 3.2 백엔드/실시간
- **Supabase Realtime**: 단어 수집 동기화
- **Supabase Database**: 세션/단어 저장

### 3.3 라이브러리 설치
```bash
pnpm add @supabase/supabase-js nanoid react-wordcloud d3-cloud
pnpm add -D @types/d3-cloud
```

---

## 4. 핵심 기능

### 4.1 세션 생성 (호스트)

#### 4.1.1 타입 정의
```typescript
// types/word-cloud.ts
export interface WordCloudSession {
  id: string;           // 6자리 코드
  hostId: string;
  title: string;        // "오늘 기분을 한 단어로 표현하면?"
  settings: WordCloudSettings;
  status: 'collecting' | 'closed';
  createdAt: string;
}

export interface WordCloudSettings {
  maxWordsPerPerson: number;     // 1인당 최대 단어 수 (1-5)
  allowDuplicates: boolean;      // 같은 단어 중복 허용
  minWordLength: number;         // 최소 단어 길이
  maxWordLength: number;         // 최대 단어 길이
  colorScheme: ColorScheme;      // 색상 테마
  fontFamily: string;            // 폰트
  shape: 'circle' | 'rectangle' | 'heart';  // 구름 모양
}

export interface WordEntry {
  id: string;
  sessionId: string;
  word: string;
  participantId: string;
  createdAt: string;
}

export interface WordCount {
  text: string;
  value: number;  // 빈도
}

export type ColorScheme =
  | 'rainbow'      // 무지개색
  | 'ocean'        // 파랑 계열
  | 'sunset'       // 주황/분홍 계열
  | 'forest'       // 초록 계열
  | 'mono'         // 단색
  | 'custom';      // 사용자 정의
```

#### 4.1.2 호스트 UI 기능
- **질문 입력**: 참가자에게 보여줄 프롬프트
- **설정 조정**: 단어 수, 색상, 폰트 등
- **실시간 모니터링**: 참가자 수, 수집된 단어 수
- **입력 종료**: 더 이상 단어 수집 안 함
- **결과 내보내기**: PNG/SVG 이미지

---

### 4.2 참가자 입력

#### 4.2.1 입력 플로우
```
1. QR 스캔 또는 코드 입력
2. 질문 화면 표시
3. 단어 입력 (최대 N개)
4. 제출 완료 화면
```

#### 4.2.2 입력 검증
```typescript
function validateWord(word: string, settings: WordCloudSettings): { valid: boolean; error?: string } {
  const trimmed = word.trim();

  if (trimmed.length < settings.minWordLength) {
    return { valid: false, error: `최소 ${settings.minWordLength}글자 이상 입력해주세요.` };
  }

  if (trimmed.length > settings.maxWordLength) {
    return { valid: false, error: `최대 ${settings.maxWordLength}글자까지 입력 가능합니다.` };
  }

  // 금칙어 필터링 (선택적)
  if (containsBannedWord(trimmed)) {
    return { valid: false, error: '부적절한 단어입니다.' };
  }

  return { valid: true };
}
```

---

### 4.3 워드 클라우드 렌더링

#### 4.3.1 react-wordcloud 사용
```typescript
import ReactWordcloud from 'react-wordcloud';

interface WordCloudDisplayProps {
  words: WordCount[];
  settings: WordCloudSettings;
}

export function WordCloudDisplay({ words, settings }: WordCloudDisplayProps) {
  const options = {
    colors: getColorPalette(settings.colorScheme),
    fontFamily: settings.fontFamily || 'Pretendard',
    fontSizes: [16, 80] as [number, number],
    rotations: 2,
    rotationAngles: [-10, 10] as [number, number],
    scale: 'sqrt' as const,
    spiral: 'archimedean' as const,
    transitionDuration: 500,
  };

  const callbacks = {
    onWordClick: (word: WordCount) => {
      console.log(`"${word.text}" 클릭됨 (${word.value}회)`);
    },
  };

  return (
    <div className="w-full h-[600px]">
      <ReactWordcloud
        words={words}
        options={options}
        callbacks={callbacks}
      />
    </div>
  );
}

function getColorPalette(scheme: ColorScheme): string[] {
  const palettes: Record<ColorScheme, string[]> = {
    rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
    ocean: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#03045E'],
    sunset: ['#FF6B6B', '#FF8E72', '#FFB347', '#FFD93D', '#FF69B4'],
    forest: ['#2D5016', '#4A7C23', '#6B8E23', '#9ACD32', '#98D8C8'],
    mono: ['#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080'],
    custom: ['#3B82F6', '#8B5CF6', '#EC4899'], // 기본값
  };
  return palettes[scheme];
}
```

#### 4.3.2 실시간 업데이트
```typescript
// hooks/useRealtimeWordCloud.ts
export function useRealtimeWordCloud(sessionId: string) {
  const [words, setWords] = useState<WordCount[]>([]);
  const [rawEntries, setRawEntries] = useState<WordEntry[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`wordcloud:${sessionId}`);

    // 새 단어 수신
    channel.on('broadcast', { event: 'new_word' }, ({ payload }) => {
      const entry = payload as WordEntry;
      setRawEntries(prev => [...prev, entry]);
    });

    channel.subscribe();

    return () => { channel.unsubscribe(); };
  }, [sessionId]);

  // 단어 빈도 계산
  useEffect(() => {
    const wordMap = new Map<string, number>();

    rawEntries.forEach(entry => {
      const word = entry.word.toLowerCase().trim();
      wordMap.set(word, (wordMap.get(word) || 0) + 1);
    });

    const wordCounts: WordCount[] = Array.from(wordMap.entries())
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value);

    setWords(wordCounts);
  }, [rawEntries]);

  return { words, totalEntries: rawEntries.length };
}
```

---

### 4.4 이미지 내보내기

#### 4.4.1 SVG → PNG 변환
```typescript
import { toPng, toSvg } from 'html-to-image';

async function exportWordCloudAsImage(
  elementId: string,
  format: 'png' | 'svg' = 'png'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  const exportFn = format === 'png' ? toPng : toSvg;

  const dataUrl = await exportFn(element, {
    quality: 1,
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  });

  const link = document.createElement('a');
  link.download = `wordcloud-${Date.now()}.${format}`;
  link.href = dataUrl;
  link.click();
}
```

---

## 5. UI 디자인

### 5.1 호스트 프레젠테이션 모드

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 워드 클라우드            code.app/XYZ123      참가자: 45명  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│           " 오늘 기분을 한 단어로 표현하면? "                     │
│                                                                 │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │                                                           │ │
│   │           행복          기대                              │ │
│   │      설렘    피곤         희망                            │ │
│   │  긴장     신남       즐거움                               │ │
│   │    흥분        평화        편안                           │ │
│   │       기쁨    차분    활력                                │ │
│   │                                                           │ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│   📝 총 127개 단어 수집됨                                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│   [입력 종료]  [이미지 저장]  [새 질문]                           │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 참가자 입력 화면

```
┌──────────────────────────────┐
│  워드 클라우드      XYZ123   │
├──────────────────────────────┤
│                              │
│  " 오늘 기분을 한 단어로     │
│    표현하면? "               │
│                              │
│  ┌────────────────────────┐ │
│  │ 행복                   │ │
│  └────────────────────────┘ │
│                              │
│       [ 제출하기 ]           │
│                              │
│  남은 입력 횟수: 2회         │
│                              │
│  내가 입력한 단어:           │
│  • 설렘                      │
│                              │
└──────────────────────────────┘
```

---

## 6. 데이터 모델 (Supabase)

### 6.1 테이블 스키마
```sql
-- 세션 테이블
CREATE TABLE word_cloud_sessions (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  title TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'collecting',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- 단어 엔트리
CREATE TABLE word_cloud_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES word_cloud_sessions(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_entries_session ON word_cloud_entries(session_id);
CREATE INDEX idx_entries_word ON word_cloud_entries(word);

-- RLS
ALTER TABLE word_cloud_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_cloud_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sessions" ON word_cloud_sessions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert entries" ON word_cloud_entries
  FOR INSERT WITH CHECK (true);
```

---

## 7. 컴포넌트 구조

```
src/app/word-cloud/
├── page.tsx                    # 랜딩 (호스트/참여 선택)
├── host/
│   ├── page.tsx                # 세션 생성
│   └── [sessionId]/
│       ├── page.tsx            # 호스트 컨트롤 + 워드 클라우드
│       └── present/
│           └── page.tsx        # 프레젠테이션 모드
├── join/
│   └── page.tsx                # 참여 코드 입력
├── submit/
│   └── [sessionId]/
│       └── page.tsx            # 참가자 단어 입력
├── components/
│   ├── WordCloudDisplay.tsx    # 워드 클라우드 렌더링
│   ├── WordInput.tsx           # 단어 입력 폼
│   ├── ColorPicker.tsx         # 색상 테마 선택
│   ├── ExportButtons.tsx       # 이미지 내보내기
│   └── ParticipantCounter.tsx  # 참가자 수 표시
├── store/
│   └── useWordCloudStore.ts    # Zustand 상태
├── hooks/
│   └── useRealtimeWordCloud.ts # 실시간 동기화
└── types/
    └── index.ts                # 타입 정의
```

---

## 8. 추가 기능 (향후)

### 8.1 한글 형태소 분석
- **es-hangul** 라이브러리 활용
- 조사 제거: "행복이", "행복을" → "행복"으로 통합
- 동의어 통합: "기쁨", "기쁨!" → 하나로 카운트

### 8.2 금칙어 필터링
- 비속어 자동 차단
- 호스트가 수동으로 특정 단어 숨기기

### 8.3 애니메이션
- 새 단어 입력 시 워드 클라우드 애니메이션
- 단어 크기 변화 트랜지션

---

## 9. 구현 우선순위

### Phase 1: MVP (1주)
- [ ] 세션 생성
- [ ] 단어 입력 (참가자)
- [ ] 기본 워드 클라우드 렌더링
- [ ] 실시간 동기화

### Phase 2: 커스터마이징 (3일)
- [ ] 색상 테마
- [ ] 폰트 선택
- [ ] 이미지 내보내기

### Phase 3: 고급 기능 (3일)
- [ ] 한글 형태소 분석
- [ ] 금칙어 필터
- [ ] 프레젠테이션 모드

---

## 10. 참고 자료

### 라이브러리
- [react-wordcloud](https://www.npmjs.com/package/react-wordcloud)
- [d3-cloud](https://github.com/jasondavies/d3-cloud)
- [html-to-image](https://www.npmjs.com/package/html-to-image)

### 유사 서비스
- [Mentimeter Word Cloud](https://www.mentimeter.com/features/word-cloud)
- [AhaSlides Word Cloud](https://ahaslides.com/blog/free-word-cloud-generator/)

---

**작성일**: 2024-12-23
**버전**: 1.0
