# Calculator Apps - E2E Test Suite

이 디렉토리는 4개의 계산기 앱에 대한 포괄적인 Playwright E2E 테스트를 포함합니다.

## 테스트 파일

### 1. salary-calculator.spec.ts (연봉 계산기)
**Base URL**: `http://localhost:5171/mini-apps/salary-calculator/`

**테스트 범위**:
- **Edge Cases**: 0원, 음수, 10억원, 소수점, 문자 입력, 천단위 콤마
- **UI Tests**: 반응형(모바일/태블릿/데스크톱), 입력 모드 전환, 툴팁, 차트 렌더링, 접근성
- **E2E Journeys**: 연봉/월급 입력 → 계산, 퇴직금 포함 토글, 부양가족/자녀 변경, 시뮬레이터
- **Calculation Accuracy**: 실수령액 계산, 4대보험 요율, 경계값(2천만원/2억원), 자녀 세액공제

**주요 검증 항목**:
- 4대보험 공제 (국민연금 4.5%, 건강보험 3.545%, 요양보험 12.95%, 고용보험 0.9%)
- 소득세 간이세액표 적용
- 지방소득세 (소득세의 10%)
- 부양가족/자녀 세액공제
- 월 실수령액 범위: 연봉 5천만원 → 약 350만원

---

### 2. rent-calculator.spec.ts (전월세 계산기)
**Base URL**: `http://localhost:5172/mini-apps/rent-calculator/`

**테스트 범위**:
- **Edge Cases**: 0원, 보증금 > 전세금, 전환율 경계값(0.1%~10%), 10억원, 문자 입력
- **UI Tests**: 반응형, 탭 전환, 슬라이더, 통화 포맷, Info 툴팁, 차트 렌더링
- **E2E Journeys**: 전세→월세, 월세→전세, 전환율 변경 시 실시간 재계산, 비용 비교
- **Calculation Accuracy**: 전세→월세 공식, 월세→전세 공식, 법정 전환율 4.5%, 반올림

**주요 검증 항목**:
- 전세→월세: `(전세금 - 보증금) × 전환율 ÷ 12`
- 월세→전세: `보증금 + (월세 × 12) ÷ 전환율`
- 법정 상한: 기준금리 + 2% (약 4.5%)
- 예시: 전세 2억, 보증금 1억, 4.5% → 월세 375,000원

---

### 3. gpa-calculator.spec.ts (학점 계산기)
**Base URL**: `http://localhost:5173/mini-apps/gpa-calculator/`

**테스트 범위**:
- **Edge Cases**: 학기 없음, P/F 과목, F 학점, 학점 체계 변경(4.5/4.3/4.0), 0.5 학점
- **UI Tests**: 반응형, 탭 전환, 학기 추가 다이얼로그, 차트 렌더링, 접근성
- **E2E Journeys**: 학기 추가 → 과목 입력 → GPA 계산, 여러 학기 누적 GPA, 과목/학기 삭제, 목표 학점, 데이터 백업
- **Calculation Accuracy**: GPA 계산, 전공/교양 GPA, 누적 GPA, 목표 시뮬레이터, 소수점 2자리

**주요 검증 항목**:
- GPA 계산: `Σ(학점 × 평점) / Σ학점`
- 4.5 만점: A+ = 4.5, A0 = 4.0, B+ = 3.5, ...
- P/F 과목은 GPA 계산에서 제외
- F 학점은 이수 학점에서 제외
- 전공/교양 GPA 분리 계산
- IndexedDB 로컬 저장

---

### 4. id-validator.spec.ts (주민번호 검증기)
**Base URL**: `http://localhost:5174/mini-apps/id-validator/`

**테스트 범위**:
- **Edge Cases**: 13자리 미만/초과, 문자 입력, 잘못된 월/일, 윤년, 체크섬 실패, 2020년 이후 발급
- **UI Tests**: 반응형, 하이픈 자동 삽입, 실시간 검증, 탭 전환(주민/사업자/법인), 결과 카드 색상
- **E2E Journeys**: 입력 → 검증 → 상세 정보, 테스트 번호 생성, 초기화, 연속 검증
- **Calculation Accuracy**: 체크섬 알고리즘, 나이 계산, 성별 판별, 내외국인 판별, 윤년, 2020.10 기준

**주요 검증 항목**:
- 체크섬 알고리즘 (2020년 10월 이전):
  ```
  weights = [2,3,4,5,6,7,8,9,2,3,4,5]
  checksum = (11 - (Σ(digit × weight) % 11)) % 10
  ```
- 성별 코드:
  - 1,3,5,7 = 남성
  - 2,4,6,8 = 여성
  - 1,2 = 1900년대 내국인
  - 3,4 = 2000년대 내국인
  - 5,6 = 1900년대 외국인
  - 7,8 = 2000년대 외국인
- 2020년 10월 이후 발급: 뒷자리 임의번호, 체크섬 미적용
- 사업자등록번호 (BRN): NNN-NN-NNNNN
- 법인등록번호 (CRN): NNNNNN-NNNNNNN

---

## 테스트 실행

### 전체 계산기 앱 테스트
```bash
cd /Users/sdh/Dev/02_production/seolcoding.com/agents/mini-apps
npx playwright test tests/calculator/
```

### 개별 앱 테스트
```bash
# 연봉 계산기
npx playwright test tests/calculator/salary-calculator.spec.ts

# 전월세 계산기
npx playwright test tests/calculator/rent-calculator.spec.ts

# 학점 계산기
npx playwright test tests/calculator/gpa-calculator.spec.ts

# 주민번호 검증기
npx playwright test tests/calculator/id-validator.spec.ts
```

### UI 모드 (디버깅)
```bash
npx playwright test tests/calculator/salary-calculator.spec.ts --ui
```

### 특정 브라우저
```bash
npx playwright test tests/calculator/ --project=chromium
npx playwright test tests/calculator/ --project=firefox
npx playwright test tests/calculator/ --project=webkit
```

### 헤드풀 모드 (브라우저 보이기)
```bash
npx playwright test tests/calculator/ --headed
```

### 특정 테스트만 실행
```bash
npx playwright test tests/calculator/salary-calculator.spec.ts -g "연봉 5천만원 실수령액"
```

---

## 사전 준비

### 1. 개발 서버 실행
각 앱의 개발 서버를 실행해야 합니다:

```bash
# 연봉 계산기 (포트 5171)
pnpm --filter salary-calculator dev

# 전월세 계산기 (포트 5172)
pnpm --filter rent-calculator dev

# 학점 계산기 (포트 5173)
pnpm --filter gpa-calculator dev

# 주민번호 검증기 (포트 5174)
pnpm --filter id-validator dev
```

또는 모든 앱을 동시에:
```bash
pnpm dev
```

### 2. Playwright 설치
```bash
npm install -D @playwright/test
npx playwright install
```

---

## 테스트 커버리지

### 전체 통계
- **총 테스트 수**: ~150개
- **앱당 평균**: ~37개 테스트
- **테스트 분류**:
  - Edge Cases: 25%
  - UI Tests: 30%
  - E2E Journeys: 25%
  - Calculation Accuracy: 20%

### 커버리지 영역
✅ **기능 테스트**:
- 입력 유효성 검사
- 계산 로직 정확도
- 결과 표시
- 에러 핸들링

✅ **UI/UX 테스트**:
- 반응형 레이아웃 (모바일/태블릿/데스크톱)
- 접근성 (aria, label, 키보드 내비게이션)
- 사용자 인터랙션 (클릭, 입력, 탭 전환)

✅ **데이터 무결성**:
- 경계값 테스트
- 극단적 입력 (0, 음수, 초대형 숫자)
- 데이터 타입 검증

✅ **비즈니스 로직**:
- 세금/보험 계산 공식
- 전월세 전환율 적용
- GPA 계산 알고리즘
- 주민번호 체크섬 검증

---

## 알려진 이슈 및 주의사항

### 1. 포트 충돌
각 앱은 고정 포트를 사용합니다:
- salary-calculator: 5171
- rent-calculator: 5172
- gpa-calculator: 5173
- id-validator: 5174

다른 서비스가 이 포트를 사용 중이면 테스트가 실패합니다.

### 2. 실시간 검증 타이밍
일부 앱은 입력 시 실시간 검증을 수행합니다. `waitForTimeout()`을 사용하여 debounce/throttle을 고려합니다.

### 3. IndexedDB 초기화
gpa-calculator는 IndexedDB를 사용하므로, 테스트 간 데이터 격리를 위해 각 테스트 후 초기화가 필요할 수 있습니다.

### 4. 랜덤 값 테스트
id-validator의 테스트 번호 생성은 랜덤이므로, 재현성을 위해 seed 설정이 필요할 수 있습니다.

---

## 한국어 특화 테스트

이 테스트 스위트는 한국 사용자를 위한 다음 기능을 검증합니다:

### 통화 형식
- 천단위 콤마 (1,000,000)
- "원" 단위 표시
- NumberInput 컴포넌트

### 한국 세법
- 4대보험 요율 (2024년 기준)
- 간이세액표 적용
- 부양가족/자녀 세액공제

### 전월세 제도
- 법정 전환율 (기준금리 + 2%)
- 보증금/월세 변환 공식

### 한국 학점 체계
- 4.5 만점 (A+ = 4.5)
- 4.3 만점 (A+ = 4.3)
- 4.0 만점 (A = 4.0)
- P/F 과목

### 한국 신분증 체계
- 주민등록번호 (13자리, 체크섬)
- 사업자등록번호 (10자리)
- 법인등록번호 (13자리)

---

## 기여 가이드

새로운 테스트를 추가할 때:

1. **명확한 테스트명** (한국어 OK)
2. **Given-When-Then 패턴** 사용
3. **독립적인 테스트** (순서 무관)
4. **cleanup** (각 테스트 후 초기화)
5. **주석** 추가 (복잡한 계산 설명)

예시:
```typescript
test('연봉 5천만원 실수령액 계산 정확도', async ({ page }) => {
  // Given: 연봉 5천만원, 비과세 20만원, 부양가족 1명
  await page.locator('#annualSalary').fill('50000000');
  await page.locator('#taxFreeAmount').fill('200000');
  await page.locator('#dependents').fill('1');

  // When: 계산 버튼 클릭
  await page.getByRole('button', { name: /실수령액 계산하기/i }).click();

  // Then: 실수령액이 300만원~400만원 범위인지 확인
  const netPayText = await page.locator('text=실수령액').first().textContent();
  const netPay = parseInt(netPayText?.match(/[\d,]+/)?.[0].replace(/,/g, '') || '0');
  expect(netPay).toBeGreaterThan(3000000);
  expect(netPay).toBeLessThan(4000000);
});
```

---

## 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [한국 국세청 간이세액표](https://www.nts.go.kr/)
- [전월세 전환율 안내](https://www.molit.go.kr/)
- [주민등록번호 체크섬 알고리즘](https://ko.wikipedia.org/wiki/주민등록번호)

---

## 라이센스

MIT License - SeolCoding.com Mini Apps
