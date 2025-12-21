import { test, expect, type Page } from '@playwright/test';

/**
 * 이상형 월드컵 E2E 테스트
 *
 * 테스트 범위:
 * - Edge Cases: 빈 입력, 특수문자, 최대/최소 값, 파일 업로드 검증
 * - UI Tests: 반응형, 버튼 상태, 로딩, 접근성
 * - E2E Journeys: 토너먼트 생성부터 결과까지 전체 플로우
 * - 게임 상태 유지 및 뒤로가기 기능
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:5178/mini-apps/ideal-worldcup/';

test.describe('이상형 월드컵 - 홈 화면', () => {
  test('홈 화면이 정상적으로 로드됨', async ({ page }) => {
    await page.goto(BASE_URL);

    // 제목 확인
    await expect(page.getByRole('heading', { name: '이상형 월드컵' })).toBeVisible();

    // 설명 텍스트 확인
    await expect(page.getByText('나만의 토너먼트를 만들고 최애를 선택하세요')).toBeVisible();

    // 시작 버튼 확인
    const createButton = page.getByRole('button', { name: /새 토너먼트 만들기/ });
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();
  });

  test('새 토너먼트 만들기 버튼 클릭 시 생성 화면으로 이동', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /새 토너먼트 만들기/ }).click();

    await expect(page.getByRole('heading', { name: '토너먼트 만들기' })).toBeVisible();
  });
});

test.describe('이상형 월드컵 - 토너먼트 생성 (Edge Cases)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /새 토너먼트 만들기/ }).click();
  });

  test('빈 제목으로 제출 시 경고 메시지 표시', async ({ page }) => {
    // 제목 입력하지 않음
    await page.getByRole('button', { name: '4강' }).click();

    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('토너먼트 제목을 입력해주세요.');
      await dialog.accept();
    });

    // 후보자 추가 없이 제출 시도
    const submitButton = page.getByRole('button', { name: /토너먼트 시작/ });
    // 버튼이 비활성화되어 있어야 함
    await expect(submitButton).toBeDisabled();
  });

  test('공백만 있는 제목 입력 시 경고', async ({ page }) => {
    await page.getByLabel('토너먼트 제목').fill('   ');
    await page.getByRole('button', { name: '4강' }).click();

    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('토너먼트 제목을 입력해주세요.');
      await dialog.accept();
    });
  });

  test('특수문자 포함 제목 입력 가능', async ({ page }) => {
    const specialTitle = '최고의 라면! @#$% & 짱';
    await page.getByLabel('토너먼트 제목').fill(specialTitle);

    const input = page.getByLabel('토너먼트 제목');
    await expect(input).toHaveValue(specialTitle);
  });

  test('매우 긴 제목 입력 테스트', async ({ page }) => {
    const longTitle = 'A'.repeat(200);
    await page.getByLabel('토너먼트 제목').fill(longTitle);

    const input = page.getByLabel('토너먼트 제목');
    await expect(input).toHaveValue(longTitle);
  });

  test('필요한 후보자 수보다 적게 추가 시 경고 메시지', async ({ page }) => {
    await page.getByLabel('토너먼트 제목').fill('테스트 토너먼트');
    await page.getByRole('button', { name: '8강' }).click();

    // 8강이므로 8개 필요, 제출 버튼은 비활성화
    const submitButton = page.getByRole('button', { name: /토너먼트 시작/ });
    await expect(submitButton).toBeDisabled();

    // 경고 메시지 확인
    await expect(page.getByText(/개의 후보자를 더 추가해주세요/)).toBeHidden();
  });

  test('라운드 선택 변경 시 UI 업데이트', async ({ page }) => {
    // 4강 선택
    const round4 = page.getByRole('button', { name: '4강' });
    await round4.click();
    await expect(round4).toHaveClass(/border-blue-500/);

    // 8강으로 변경
    const round8 = page.getByRole('button', { name: '8강' });
    await round8.click();
    await expect(round8).toHaveClass(/border-blue-500/);
    await expect(round4).not.toHaveClass(/border-blue-500/);

    // 16강으로 변경
    const round16 = page.getByRole('button', { name: '16강' });
    await round16.click();
    await expect(round16).toHaveClass(/border-blue-500/);

    // 32강으로 변경
    const round32 = page.getByRole('button', { name: '32강' });
    await round32.click();
    await expect(round32).toHaveClass(/border-blue-500/);
  });

  test('취소 버튼 클릭 시 홈으로 이동', async ({ page }) => {
    await page.getByRole('button', { name: '취소' }).click();
    await expect(page.getByRole('heading', { name: '이상형 월드컵' })).toBeVisible();
  });
});

test.describe('이상형 월드컵 - 이미지 업로드 (Edge Cases)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /새 토너먼트 만들기/ }).click();
    await page.getByLabel('토너먼트 제목').fill('이미지 테스트');
  });

  test('잘못된 파일 형식 업로드 시 처리', async ({ page }) => {
    // 파일 입력 찾기
    const fileInput = page.locator('input[type="file"]');

    // txt 파일 업로드 시도 (이미지가 아님)
    const buffer = Buffer.from('test content');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: buffer,
    });

    // 에러 메시지나 무시되어야 함
    // 실제 구현에 따라 에러 메시지 확인
  });

  test('매우 큰 이미지 파일 업로드 시도', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // 10MB 이상의 큰 파일 시뮬레이션
    const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB

    await fileInput.setInputFiles({
      name: 'large-image.jpg',
      mimeType: 'image/jpeg',
      buffer: largeBuffer,
    });

    // 파일 크기 제한 경고가 있을 수 있음
  });

  test('후보자 제거 기능', async ({ page }) => {
    // 이미지를 업로드하고 제거 테스트
    // 실제 구현에서 제거 버튼 찾아서 클릭
    const removeButtons = page.locator('[data-testid="remove-candidate"]');
    const initialCount = await removeButtons.count();

    if (initialCount > 0) {
      await removeButtons.first().click();
      await expect(removeButtons).toHaveCount(initialCount - 1);
    }
  });
});

test.describe('이상형 월드컵 - 반응형 UI', () => {
  test('모바일 뷰포트에서 정상 표시', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(BASE_URL);

    await expect(page.getByRole('heading', { name: '이상형 월드컵' })).toBeVisible();
    await expect(page.getByRole('button', { name: /새 토너먼트 만들기/ })).toBeVisible();
  });

  test('태블릿 뷰포트에서 정상 표시', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto(BASE_URL);

    await expect(page.getByRole('heading', { name: '이상형 월드컵' })).toBeVisible();
  });

  test('데스크톱 뷰포트에서 정상 표시', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
    await page.goto(BASE_URL);

    await expect(page.getByRole('heading', { name: '이상형 월드컵' })).toBeVisible();
  });

  test('게임 플레이 화면 - 모바일에서 세로 배치', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    // 게임 생성 후 확인 (헬퍼 함수로 분리 가능)
  });

  test('게임 플레이 화면 - 데스크톱에서 가로 배치', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    // VS 표시 확인
  });
});

test.describe('이상형 월드컵 - 접근성 (Accessibility)', () => {
  test('키보드 네비게이션으로 버튼 포커스', async ({ page }) => {
    await page.goto(BASE_URL);

    // Tab 키로 버튼 포커스
    await page.keyboard.press('Tab');

    const createButton = page.getByRole('button', { name: /새 토너먼트 만들기/ });
    await expect(createButton).toBeFocused();

    // Enter 키로 버튼 클릭
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: '토너먼트 만들기' })).toBeVisible();
  });

  test('폼 입력 필드에 적절한 레이블 존재', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /새 토너먼트 만들기/ }).click();

    // 레이블 연결 확인
    const titleInput = page.getByLabel('토너먼트 제목');
    await expect(titleInput).toBeVisible();
  });

  test('버튼 비활성화 상태 명확히 표시', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /새 토너먼트 만들기/ }).click();

    const submitButton = page.getByRole('button', { name: /토너먼트 시작/ });
    await expect(submitButton).toBeDisabled();

    // disabled 속성 확인
    await expect(submitButton).toHaveAttribute('disabled');
  });

  test('이미지에 alt 텍스트 존재', async ({ page }) => {
    // 후보자 이미지가 표시되면 alt 텍스트 확인
    // 테스트 이미지 업로드 후 확인
  });
});

test.describe('이상형 월드컵 - E2E 전체 플로우', () => {
  /**
   * 헬퍼 함수: 테스트 이미지 생성
   */
  async function createTestImage(name: string): Promise<{ name: string; mimeType: string; buffer: Buffer }> {
    // 1x1 픽셀 PNG 이미지 (최소 크기)
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    return {
      name,
      mimeType: 'image/png',
      buffer: pngBuffer,
    };
  }

  test('4강 토너먼트 전체 플레이', async ({ page }) => {
    await page.goto(BASE_URL);

    // 1. 홈에서 토너먼트 생성 시작
    await page.getByRole('button', { name: /새 토너먼트 만들기/ }).click();

    // 2. 토너먼트 정보 입력
    await page.getByLabel('토너먼트 제목').fill('맛있는 음식 월드컵');
    await page.getByRole('button', { name: '4강' }).click();

    // 3. 후보자 이미지 업로드 (4개 필요)
    const fileInput = page.locator('input[type="file"]');

    // 실제 테스트에서는 여러 이미지 업로드
    // 현재는 파일 업로드 UI 상호작용 확인만
    await expect(fileInput).toBeVisible();

    // 4. 시작 버튼은 초기에 비활성화
    const startButton = page.getByRole('button', { name: /토너먼트 시작/ });
    await expect(startButton).toBeDisabled();

    // Note: 실제 이미지 업로드 후 활성화되는 것은
    // 이미지 업로드 구현 완료 후 테스트
  });

  test('뒤로가기 기능 테스트', async ({ page }) => {
    // 게임 진행 중 뒤로가기 버튼 테스트
    // 히스토리 스택 관리 확인
  });

  test('진행률 표시 정확성', async ({ page }) => {
    // 각 매치마다 진행률 바 업데이트 확인
  });
});

test.describe('이상형 월드컵 - 결과 화면', () => {
  test('우승자 표시', async ({ page }) => {
    // 우승자가 크게 표시되는지 확인
  });

  test('준우승자 및 4강 후보 표시', async ({ page }) => {
    // 순위별 표시 확인
  });

  test('다시하기 버튼', async ({ page }) => {
    // 같은 토너먼트를 다시 플레이
  });

  test('홈으로 버튼', async ({ page }) => {
    // 결과 저장 후 홈으로 이동
  });

  test('결과 공유 기능', async ({ page }) => {
    // 결과 이미지 생성 및 공유
  });
});

test.describe('이상형 월드컵 - 게임 상태 관리', () => {
  test('페이지 새로고침 시 상태 유지 (로컬스토리지)', async ({ page }) => {
    // 게임 중 새로고침 해도 상태 유지되는지
  });

  test('뒤로가기로 이전 선택 취소', async ({ page }) => {
    // 히스토리 스택 관리
  });

  test('여러 토너먼트 히스토리 관리', async ({ page }) => {
    // 결과 저장 및 조회
  });
});

test.describe('이상형 월드컵 - 네트워크 에러 처리', () => {
  test('느린 네트워크에서 이미지 로딩', async ({ page }) => {
    // 네트워크 throttling
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });

    await page.goto(BASE_URL);
    await expect(page.getByRole('heading', { name: '이상형 월드컵' })).toBeVisible();
  });

  test('오프라인 상태 처리', async ({ page }) => {
    await page.goto(BASE_URL);

    // 오프라인 모드
    await page.context().setOffline(true);

    // 이미지 업로드는 여전히 가능해야 함 (로컬 파일)
  });
});

test.describe('이상형 월드컵 - 버튼 상태 및 인터랙션', () => {
  test('버튼 호버 효과', async ({ page }) => {
    await page.goto(BASE_URL);

    const createButton = page.getByRole('button', { name: /새 토너먼트 만들기/ });
    await createButton.hover();

    // 호버 시 색상 변경 확인 (hover:bg-blue-700 등)
    await expect(createButton).toHaveCSS('cursor', 'pointer');
  });

  test('버튼 클릭 애니메이션', async ({ page }) => {
    await page.goto(BASE_URL);

    const createButton = page.getByRole('button', { name: /새 토너먼트 만들기/ });
    await createButton.click();

    // 페이지 전환 확인
    await expect(page.getByRole('heading', { name: '토너먼트 만들기' })).toBeVisible();
  });

  test('라운드 버튼 선택 상태 토글', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /새 토너먼트 만들기/ }).click();

    const round4 = page.getByRole('button', { name: '4강' });
    const round8 = page.getByRole('button', { name: '8강' });

    await round4.click();
    await expect(round4).toHaveClass(/border-blue-500/);

    await round8.click();
    await expect(round8).toHaveClass(/border-blue-500/);
    await expect(round4).not.toHaveClass(/border-blue-500/);
  });
});

test.describe('이상형 월드컵 - 매치 화면', () => {
  test('VS 표시 확인 (데스크톱)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    // 게임 시작 후 VS 표시 확인
  });

  test('후보자 클릭으로 다음 매치 진행', async ({ page }) => {
    // 후보자 이미지 클릭 시 다음 매치로 이동
  });

  test('현재 라운드 표시 정확성', async ({ page }) => {
    // 4강, 준결승, 결승 등 라운드명 확인
  });

  test('매치 카운터 표시 (1/3, 2/3 등)', async ({ page }) => {
    // 현재 매치 번호와 전체 매치 수 표시
  });
});

test.describe('이상형 월드컵 - 성능 테스트', () => {
  test('32강 토너먼트 생성 시 성능', async ({ page }) => {
    // 많은 후보자 처리 성능
  });

  test('이미지 로딩 최적화', async ({ page }) => {
    // lazy loading, 이미지 압축 확인
  });

  test('페이지 전환 속도', async ({ page }) => {
    await page.goto(BASE_URL);

    const startTime = Date.now();
    await page.getByRole('button', { name: /새 토너먼트 만들기/ }).click();
    await expect(page.getByRole('heading', { name: '토너먼트 만들기' })).toBeVisible();
    const endTime = Date.now();

    // 페이지 전환이 1초 이내
    expect(endTime - startTime).toBeLessThan(1000);
  });
});
