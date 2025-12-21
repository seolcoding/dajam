# @mini-apps/ui

Mini Apps 공용 UI 컴포넌트 라이브러리.
shadcn/ui 패턴 기반, React 19 + Tailwind CSS v4 지원.

## 설치

```bash
# 워크스페이스 내 앱에서
pnpm add @mini-apps/ui
```

또는 package.json에 직접 추가:

```json
{
  "dependencies": {
    "@mini-apps/ui": "workspace:*"
  }
}
```

## 사용법

### 스타일 import (필수)

```tsx
// src/main.tsx
import "@mini-apps/ui/styles.css";
```

### 컴포넌트 import

```tsx
import { Button, Card, Input, Label } from "@mini-apps/ui";

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>제목</CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor="name">이름</Label>
        <Input id="name" placeholder="이름을 입력하세요" />
        <Button>제출</Button>
      </CardContent>
    </Card>
  );
}
```

## 컴포넌트 목록

### 기본 UI

| 컴포넌트 | 설명 | 기반 |
|----------|------|------|
| `Button` | 버튼 (variant: default, outline, ghost, link) | - |
| `Card` | 카드 컨테이너 | - |
| `Input` | 텍스트 입력 | - |
| `Label` | 폼 레이블 | Radix |
| `Dialog` | 모달 다이얼로그 | Radix |
| `DropdownMenu` | 드롭다운 메뉴 | Radix |
| `Select` | 선택 박스 | Radix |
| `Tabs` | 탭 네비게이션 | Radix |
| `Progress` | 진행률 바 | Radix |
| `Slider` | 슬라이더 | Radix |
| `Toast` | 토스트 알림 | Radix |
| `Tooltip` | 툴팁 | Radix |
| `Checkbox` | 체크박스 | Radix |
| `RadioGroup` | 라디오 그룹 | Radix |
| `Switch` | 토글 스위치 | Radix |

### 공용 컴포넌트 (shared)

| 컴포넌트 | 설명 |
|----------|------|
| `ShareButtons` | SNS 공유 버튼 (카카오, 트위터, 링크 복사) |
| `ResultCard` | 결과 이미지 생성용 카드 |
| `NumberInput` | 숫자 입력 (천단위 콤마 포맷) |
| `LoadingSpinner` | 로딩 스피너 |

## Tailwind 설정 확장

앱에서 UI 패키지의 Tailwind 설정을 확장하려면:

```typescript
// tailwind.config.ts
import baseConfig from "@mini-apps/ui/tailwind.config";

export default {
  ...baseConfig,
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};
```

## 테마 커스터마이징

CSS 변수로 테마 색상 변경 가능:

```css
:root {
  --primary: 199 89% 48%;           /* 브랜드 컬러 */
  --primary-foreground: 210 40% 98%;
  --radius: 0.5rem;                 /* 모서리 둥글기 */
}
```

## 개발

```bash
# 패키지 빌드
pnpm build

# watch 모드
pnpm dev
```
