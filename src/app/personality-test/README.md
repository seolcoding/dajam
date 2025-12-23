# Personality Test (성격 유형 테스트)

MBTI 스타일의 성격 유형 테스트 앱입니다. 16문항으로 5분 내에 완료할 수 있으며, 16가지 성격 유형 중 하나로 분류됩니다.

## 주요 기능

### 개인 모드
- ⚡ **빠른 테스트**: 16문항, 5분 소요
- 🎯 **정확한 분석**: MBTI 기반 4차원 분석 (E/I, S/N, T/F, J/P)
- 📊 **상세한 결과**: 16가지 유형별 설명, 강점, 약점, 추천 직업
- 📱 **SNS 공유**: 9:16 비율 결과 카드 이미지 생성 및 다운로드
- 💾 **결과 저장**: localStorage에 저장하여 언제든 다시 보기

### 그룹 모드 (향후 구현 예정)
- 👥 **실시간 세션**: 여러 명이 동시에 테스트
- 📊 **그룹 분석**: 유형 분포, 차원별 비교
- 🎨 **시각화**: 차트와 그래프로 팀 성향 파악

## 디렉토리 구조

```
personality-test/
├── page.tsx                    # 메타데이터 + Suspense 래퍼
├── components/
│   ├── PersonalityTestApp.tsx  # 메인 앱 컴포넌트 (홈/테스트/결과)
│   ├── TestQuestion.tsx        # 질문 카드 (모바일 최적화)
│   ├── ResultCard.tsx          # 결과 카드 (SNS 공유용 9:16)
│   └── GroupResults.tsx        # 그룹 결과 분석 (차트)
├── data/
│   ├── questions.ts            # 16개 MBTI 질문 데이터
│   └── personalities.ts        # 16가지 성격 유형 정보
├── types/
│   └── index.ts                # TypeScript 타입 정의
└── utils/
    └── calculator.ts           # 점수 계산 로직
```

## 성격 유형 (16 Types)

### Analysts (NT) - 분석가형
- **INTJ** 🧠 용의주도한 전략가
- **INTP** 🔬 논리적인 사색가
- **ENTJ** 👑 대담한 통솔자
- **ENTP** 💡 뜨거운 논쟁을 즐기는 변론가

### Diplomats (NF) - 외교관형
- **INFJ** 🌟 선의의 옹호자
- **INFP** 🌈 열정적인 중재자
- **ENFJ** 🎭 정의로운 사회운동가
- **ENFP** 🦋 재기발랄한 활동가

### Sentinels (SJ) - 관리자형
- **ISTJ** 📋 청렴결백한 논리주의자
- **ISFJ** 🛡️ 용감한 수호자
- **ESTJ** ⚖️ 엄격한 관리자
- **ESFJ** 🤝 사교적인 외교관

### Explorers (SP) - 탐험가형
- **ISTP** 🔧 만능 재주꾼
- **ISFP** 🎨 호기심 많은 예술가
- **ESTP** 🏄 모험을 즐기는 사업가
- **ESFP** 🎉 자유로운 영혼의 연예인

## 점수 계산 방식

각 질문은 4가지 차원 중 하나에 대응:
- **EI**: 외향형(E) vs 내향형(I) - 에너지 방향
- **SN**: 감각형(S) vs 직관형(N) - 인식 기능
- **TF**: 사고형(T) vs 감정형(F) - 판단 기능
- **JP**: 판단형(J) vs 인식형(P) - 생활 양식

각 차원당 4문항씩 측정하며, 더 많이 선택된 쪽으로 유형이 결정됩니다.

## UI/UX 특징

### 모바일 최적화
- 세로 모드에 최적화된 레이아웃
- 한 손으로 쉽게 선택 가능한 큰 버튼
- 터치 친화적인 인터페이스

### 결과 공유
- 9:16 비율의 SNS 공유용 카드
- html-to-image 라이브러리로 이미지 생성
- 다운로드 및 Web Share API 지원

### 시각화
- 차원별 점수 막대 그래프
- 그룹 결과 분포 차트 (Recharts)
- 색상으로 구분된 16가지 유형

## 사용 기술

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (Button, Card, Progress)
- **Recharts** (차트)
- **html-to-image** (이미지 생성)
- **localStorage** (결과 저장)

## 로컬 스토리지

테스트 결과는 `personality-test-result` 키로 저장됩니다:

```typescript
{
  code: 'ENFP',
  scores: DimensionScore[],
  completedAt: '2024-12-23T...'
}
```

## 향후 개선 사항

### Phase 2: 그룹 모드
- [ ] Supabase Realtime 통합
- [ ] 세션 생성/참여 기능
- [ ] 실시간 참가자 목록
- [ ] 그룹 결과 집계 및 시각화

### Phase 3: 고급 기능
- [ ] 커스텀 테스트 제작
- [ ] 결과 공유 URL 생성
- [ ] 유형별 궁합 분석
- [ ] 다국어 지원

## 참고 자료

- [16Personalities](https://www.16personalities.com/)
- [MBTI Foundation](https://www.myersbriggs.org/)
- [html-to-image](https://www.npmjs.com/package/html-to-image)
- [Recharts](https://recharts.org/)
