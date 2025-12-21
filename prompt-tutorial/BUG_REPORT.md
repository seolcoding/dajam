# Prompt Tutorial Web App - 버그 리포트

작성일: 2025-12-18
점검 대상: `/agents/mini-apps/prompt-tutorial/web/`

---

## 🔴 심각한 버그 (Critical)

### 1. 잘못된 OpenAI 모델명 사용
**위치**: `src/lib/llm.ts:3`

```typescript
const DEFAULT_MODEL = 'gpt-4.1-mini';  // ❌ 존재하지 않는 모델
```

**문제**:
- `gpt-4.1-mini`는 OpenAI에서 제공하지 않는 모델명입니다
- API 호출 시 400/404 에러 발생 가능

**해결 방법**:
```typescript
// 옵션 1: GPT-4o Mini (가장 최신)
const DEFAULT_MODEL = 'gpt-4o-mini';

// 옵션 2: GPT-3.5 Turbo (비용 효율적)
const DEFAULT_MODEL = 'gpt-3.5-turbo';

// 옵션 3: GPT-4 Turbo (고성능)
const DEFAULT_MODEL = 'gpt-4-turbo';
```

**영향도**:
- ⚠️ 모든 AI 기능이 작동하지 않을 가능성 있음
- 우선순위: **최우선 수정 필요**

---

### 2. API 키 보안 노출
**위치**: `.env` 파일

**문제**:
- OpenAI API 키가 평문으로 저장되어 Git에 커밋될 위험
- 현재 키: `sk-proj-nmGAVfi...` (일부 마스킹)

**해결 방법**:
1. `.env` 파일을 `.gitignore`에 추가 (이미 되어있는지 확인)
2. `.env.example` 파일 생성:
```bash
VITE_OPENAI_API_KEY=your_api_key_here
VITE_GOOGLE_SHEETS_WEBHOOK_URL=your_webhook_url_here
```
3. 현재 노출된 API 키는 OpenAI 대시보드에서 즉시 폐기(revoke)
4. 새 API 키 발급 후 로컬에서만 사용

**영향도**:
- 🚨 **보안 위험**: 키 도용 시 비용 청구 가능
- 우선순위: **즉시 조치 필요**

---

## 🟡 중요한 버그 (High)

### 3. 문서와 실제 코드의 불일치
**위치**: `CLAUDE.md` vs `src/lib/llm.ts`

**문제**:
- **문서**: "Gemini 2.5 Flash API 사용"
- **실제 코드**: OpenAI API 사용
- `@google/genai` 패키지는 설치되어 있으나 미사용

**해결 방법**:
1. 옵션 A: OpenAI 사용으로 문서 수정
```markdown
## Tech Stack
- @google/genai SDK  ❌ 삭제
+ OpenAI SDK
```

2. 옵션 B: Gemini API로 코드 변경
- `llm.ts`를 Gemini API로 전환
- 모든 API 호출 로직 수정

**권장**: 옵션 A (문서 수정)
- 이유: OpenAI API가 이미 구현되어 있고 안정적

**영향도**:
- 혼란 유발 및 유지보수 어려움
- 우선순위: **빠른 시일 내 수정**

---

### 4. 비동기 처리 타이밍 문제
**위치**: `src/components/Exercise.tsx:59`

```typescript
setTimeout(() => {
  const gradingResult = gradeExercise(exercise, input, response);
  // ...
}, 100);  // ❌ 신뢰할 수 없는 타이밍
```

**문제**:
- `setTimeout` 100ms는 `response` 상태 업데이트를 기다리는 임시방편
- 네트워크가 느리거나 응답이 길 경우 채점이 빈 응답으로 실행될 수 있음
- React 상태 업데이트는 비동기이므로 타이밍 보장 안 됨

**해결 방법**:
```typescript
const handleSubmit = async () => {
  let finalResponse = response;

  // 응답이 필요한 경우 먼저 실행
  if (needsLLMResponse(exercise) && !response) {
    setIsLoading(true);
    const messages: Message[] = [];
    if (systemPrompt.trim()) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userPrompt });

    try {
      // streamCompletion 대신 getCompletion 사용 (전체 응답 반환)
      finalResponse = await streamCompletion(messages, {
        onChunk: (chunk) => {
          setResponse((prev) => prev + chunk);
        },
      });
      setResponse(finalResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류 발생');
      setIsLoading(false);
      return;
    } finally {
      setIsLoading(false);
    }
  }

  // setTimeout 제거하고 즉시 채점
  const input = exercise.systemPromptEditable ? systemPrompt : userPrompt;
  const gradingResult = gradeExercise(exercise, input, finalResponse);
  setResult(gradingResult);

  // 진행상황 저장
  updateExerciseProgress(chapterId, exercise.id, {
    completed: gradingResult.passed,
    bestScore: gradingResult.score,
    lastAttempt: new Date().toISOString(),
    userSolution: {
      systemPrompt,
      userPrompt,
    },
  });
};
```

**영향도**:
- 채점 신뢰성 저하
- 사용자 경험 저해
- 우선순위: **중요**

---

## 🟢 개선 사항 (Medium)

### 5. 모델명 하드코딩
**위치**: `src/lib/llm.ts:68-72, 76-80`

**문제**:
```typescript
export async function fetchAvailableModels(): Promise<ModelInfo[]> {
  return [{
    id: DEFAULT_MODEL,
    name: 'GPT-4.1 Mini',  // ❌ 잘못된 이름
    description: 'OpenAI GPT-4.1 Mini model',
  }];
}
```

**해결 방법**:
```typescript
export async function fetchAvailableModels(): Promise<ModelInfo[]> {
  return [{
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Latest efficient GPT-4 model from OpenAI',
  }];
}
```

---

### 6. TypeScript 엄격 모드 경고
**위치**: `src/lib/grading.ts:32`

```typescript
const regex = new RegExp(grading.pattern!, grading.flags || '');
//                                     ^ non-null assertion
```

**권장**:
```typescript
if (!grading.pattern) {
  details.push({
    passed: false,
    feedback: '채점 패턴이 정의되지 않았습니다.',
  });
  break;
}
const regex = new RegExp(grading.pattern, grading.flags || '');
```

---

## 📋 점검 완료 항목

✅ 빌드 성공 (`pnpm run build` 통과)
✅ TypeScript 컴파일 에러 없음
✅ 주요 컴포넌트 구조 확인
✅ API 로직 검토
✅ 채점 로직 검토

---

## 🔧 수정 우선순위

1. **즉시**: API 키 보안 조치 (Git에서 제거, 키 재발급)
2. **최우선**: 모델명 수정 (`gpt-4.1-mini` → `gpt-4o-mini`)
3. **빠른 시일**: 문서-코드 불일치 해결
4. **중요**: 비동기 처리 타이밍 개선
5. **개선**: 하드코딩된 모델 정보 수정

---

## 테스트 권장사항

1. **API 연결 테스트**:
   ```bash
   # 올바른 API 키로 실제 API 호출 테스트
   pnpm dev
   # 브라우저에서 예제 실행
   ```

2. **채점 로직 테스트**:
   - 각 챕터의 연습문제 제출
   - 정답/오답 케이스 모두 확인

3. **보안 점검**:
   ```bash
   git log -S "sk-proj" --all  # API 키 커밋 히스토리 확인
   ```

---

## 연락처

버그 수정 관련 문의: ssalssi1@gmail.com
