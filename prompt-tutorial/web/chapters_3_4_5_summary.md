# Chapters 3, 4, 5 추출 완료

## 파일 위치
`/Users/sdh/Dev/01_active_projects/prompt-eng-interactive-tutorial/web/chapters_3_4_5.ts`

## 추출된 챕터

### Chapter 3: 역할 부여하기 (Assigning Roles)
**원본:** `03_Assigning_Roles_Role_Prompting.ipynb`

**주요 내용:**
- AI에게 특정 역할을 부여하여 성능 향상
- 역할 프롬프팅으로 어조, 스타일, 답변 방식 변경
- 수학/논리 문제 해결 능력 향상

**예제 (4개):**
1. 역할 없이 스케이트보드에 대한 의견
2. 고양이 역할로 스케이트보드에 대한 의견
3. 역할 없이 논리 문제 (잘못된 답변)
4. 논리 봇 역할로 논리 문제 (올바른 답변)

**연습문제 (1개):**
- **3.1 수학 문제 교정**: 잘못 풀린 수학 문제를 AI가 "틀렸다"고 평가하도록 만들기
  - 채점: `(incorrect|not correct|틀렸|오류|잘못)` 정규식 패턴
  - 힌트: 수학 문제를 더 잘 풀 수 있는 역할 부여

---

### Chapter 4: 데이터와 지시사항 분리하기 (Separating Data from Instructions)
**원본:** `04_Separating_Data_and_Instructions.ipynb`

**주요 내용:**
- 프롬프트 템플릿과 변수 치환
- XML 태그로 데이터 경계 명확히 하기
- 작은 세부사항(오타, 문법)의 중요성

**예제 (5개):**
1. 간단한 변수 치환 (동물 소리)
2. XML 태그 없이 이메일 수정 (잘못된 예)
3. XML 태그로 이메일 수정 (올바른 예)
4. 문장 목록에서 항목 찾기 - XML 태그 없음 (혼란)
5. 문장 목록에서 항목 찾기 - XML 태그 사용 (명확)

**연습문제 (3개):**
- **4.1 하이쿠 주제**: 변수를 사용하는 프롬프트 템플릿 만들기
  - 채점: `(pigs?|pig|돼지|하이쿠|haiku)` 패턴

- **4.2 오타가 있는 개 질문**: XML 태그 추가로 올바른 답변 유도
  - 채점: `(brown|갈색)` 패턴

- **4.3 개 질문 파트 2**: XML 태그 없이 단어 제거로 해결
  - 채점: `(brown|갈색)` 패턴

---

### Chapter 5: 출력 포맷 지정 & AI 응답 시작하기 (Formatting Output and Prefilling)
**원본:** `05_Formatting_Output_and_Speaking_for_Claude.ipynb`

**주요 내용:**
- XML 태그로 출력 형식 지정
- 응답 미리 채우기(prefilling) 기법
- JSON, XML 등 다양한 출력 형식 지원
- stop_sequences로 불필요한 출력 제거

**예제 (4개):**
1. XML 태그로 하이쿠 출력 요청
2. Prefill로 바로 시작 (실제 구현 시 prefill 파라미터 필요)
3. JSON 형식으로 하이쿠 작성
4. 여러 변수와 XML 태그 조합

**연습문제 (3개):**
- **5.1 스테판 커리 GOAT**: AI가 스테판 커리를 선택하도록 유도
  - 채점: `(Warrior|Warriors|워리어|커리)` 패턴
  - 힌트: AI 응답의 시작 부분을 프롬프트에 포함

- **5.2 두 개의 하이쿠**: 한 동물에 대한 하이쿠 2개 작성
  - 채점: `(?=.*cat|고양이)(?=.*<haiku>)(?:.*\\n){5,}` 패턴 (5줄 이상)

- **5.3 두 개의 하이쿠, 두 마리의 동물**: 서로 다른 동물 2마리에 대한 하이쿠
  - 채점: `(?=.*tail|꼬리)(?=.*cat|고양이)(?=.*<haiku>)` 패턴

---

## 번역 및 일반화 작업

### Anthropic 특화 내용 제거:
- "Claude" → "AI" 로 변경
- Anthropic API 특화 내용 일반화
- 프롬프트 엔지니어링 개념을 일반적으로 적용 가능하게 수정

### 한국어 번역:
- 모든 레슨 내용 한국어로 번역
- 예제 설명 한국어로 번역
- 연습문제 제목, 설명, 힌트 모두 한국어로 번역
- 채점 패턴에 한국어 키워드 추가 (예: `incorrect|틀렸|오류`)

### 채점 로직:
- `hints.py` 파일에서 원본 채점 패턴 추출
- 정규식(regex) 패턴 유지
- 한국어 응답도 처리할 수 있도록 패턴 확장

---

## 다음 단계

이 파일을 기존 `chapters.ts` 파일에 통합하려면:

1. `/Users/sdh/Dev/01_active_projects/prompt-eng-interactive-tutorial/web/src/content/chapters.ts` 열기
2. `chapters_3_4_5.ts`의 `newChapters` 배열 내용을 복사
3. 기존 `chapters` 배열에 추가 (Chapter 2 다음에)
4. 파일 저장

또는 자동으로 통합하려면 별도 지시를 주세요.
