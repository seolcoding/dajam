# UI 디자인 가이드라인 (Shadcn UI 기반)

## ❌ 금지사항

### 1. 그라디언트 배경 사용 금지
```tsx
// ❌ 나쁜 예
<div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
<h1 className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
<button className="bg-gradient-to-r from-blue-500 to-purple-500">

// ✅ 좋은 예
<div className="bg-white">
<h1 className="text-gray-900">
<button className="bg-blue-600 hover:bg-blue-700">
```

### 2. 과도한 색상 사용 금지
- 한 화면에 3가지 색상 이내 사용
- 주 색상 1개 + 강조 색상 1개 + 중성 색상(회색)

## ✅ 필수 사항

### 1. Shadcn UI 사용
**모든 주요 컴포넌트는 Shadcn UI에서 가져올 것**

```bash
# 컴포넌트 추가
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add input
```

```tsx
// 사용 예시
import { Button, Card, CardHeader, CardTitle, CardContent } from "@mini-apps/ui";

<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="default">클릭</Button>
  </CardContent>
</Card>
```

### 2. 깔끔한 배경
```tsx
// 배경 옵션 (우선순위 순)
bg-white              // 흰색 (1순위)
bg-gray-50            // 연한 회색
bg-slate-50           // 슬레이트 회색
```

### 3. 단색 버튼
```tsx
// Primary 버튼
className="bg-blue-600 hover:bg-blue-700 text-white"

// Secondary 버튼
className="bg-gray-100 hover:bg-gray-200 text-gray-900"

// Accent 버튼
className="bg-purple-600 hover:bg-purple-700 text-white"
```

### 4. 카드 디자인
```tsx
<Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
  <CardHeader className="bg-white">
    <CardTitle className="text-xl font-semibold text-gray-900">
  </CardHeader>
  <CardContent className="bg-white">
```

### 5. 모던한 간격
```tsx
// 여백
px-6 py-4      // 카드 내부
space-y-6      // 섹션 간
gap-4          // 그리드/플렉스

// 둥근 모서리
rounded-xl     // 카드
rounded-lg     // 버튼
rounded-full   // 아바타, 배지
```

## 📐 레이아웃 패턴

### 앱 헤더
```tsx
<header className="border-b bg-white">
  <div className="container mx-auto px-6 py-4">
    <h1 className="text-2xl font-bold text-gray-900">앱 이름</h1>
    <p className="text-sm text-gray-600">간단한 설명</p>
  </div>
</header>
```

### 메인 컨텐츠
```tsx
<main className="container mx-auto px-6 py-8 max-w-7xl">
  <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
    {/* 사이드바 */}
    <aside className="space-y-4">
      <Card>...</Card>
    </aside>

    {/* 메인 영역 */}
    <div className="space-y-6">
      <Card>...</Card>
    </div>
  </div>
</main>
```

## 🎨 색상 팔레트

### Primary (Blue)
- `bg-blue-600` - 주 버튼
- `text-blue-600` - 링크, 강조

### Accent (Purple)
- `bg-purple-600` - 보조 버튼
- `text-purple-600` - 액센트

### Neutral (Gray)
- `bg-gray-50` - 배경
- `bg-gray-100` - 카드 배경
- `text-gray-900` - 제목
- `text-gray-600` - 본문
- `text-gray-400` - 보조

### Semantic
- `bg-green-600` - 성공
- `bg-red-600` - 에러/삭제
- `bg-yellow-600` - 경고

## 🚀 Shadcn UI 컴포넌트 활용

### Hero Section
```tsx
import { Button } from "@mini-apps/ui";

<section className="container mx-auto px-6 py-16 text-center">
  <h1 className="text-4xl font-bold text-gray-900">제목</h1>
  <p className="mt-4 text-lg text-gray-600">설명</p>
  <Button size="lg" className="mt-8">시작하기</Button>
</section>
```

### Dashboard Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@mini-apps/ui";

<Card>
  <CardHeader className="flex flex-row items-center gap-4">
    <Icon className="h-8 w-8 text-blue-600" />
    <CardTitle>통계</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">1,234</p>
  </CardContent>
</Card>
```

### Form Input
```tsx
import { Input, Label } from "@mini-apps/ui";

<div className="space-y-2">
  <Label htmlFor="name">이름</Label>
  <Input id="name" placeholder="이름을 입력하세요" />
</div>
```

### Result Display
```tsx
import { Card, CardContent, Badge } from "@mini-apps/ui";

<Card className="text-center">
  <CardContent className="py-8">
    <Badge className="mb-4">🏆 우승</Badge>
    <h2 className="text-2xl font-bold">{winner.name}</h2>
  </CardContent>
</Card>
```

## ⚡ 즉시 적용

모든 앱은 Shadcn UI 컴포넌트를 사용하여 **일관된 디자인**을 유지할 것.
