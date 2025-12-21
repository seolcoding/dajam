# Lunch Roulette - Vite to Next.js App Router Migration

## Migration Summary

Successfully migrated the lunch-roulette app from Vite to Next.js App Router.

**Source:** `/Users/sdh/Dev/02_production/seolcoding-apps/apps/lunch-roulette/`  
**Target:** `/Users/sdh/Dev/02_production/seolcoding-apps/src/app/lunch-roulette/`

---

## Directory Structure

```
src/app/lunch-roulette/
├── components/
│   ├── CategoryRoulette.tsx        # 'use client' - 카테고리 룰렛 컴포넌트
│   ├── FilterPanel.tsx             # 'use client' - 검색 반경 필터
│   ├── LunchRouletteApp.tsx        # 'use client' - 메인 앱 래퍼
│   ├── RestaurantCard.tsx          # 'use client' - 음식점 정보 카드
│   ├── RestaurantRoulette.tsx      # 'use client' - 음식점 룰렛
│   └── ShareButtons.tsx            # 'use client' - 공유 버튼
├── constants/
│   └── foodCategories.ts           # 음식 카테고리 상수
├── hooks/
│   └── useGeolocation.ts           # 'use client' - 위치 정보 훅
├── lib/
│   └── kakao/
│       ├── init.ts                 # Kakao Maps SDK 초기화
│       └── places.ts               # Kakao Places API 래퍼
├── store/
│   └── useAppStore.ts              # 'use client' - Zustand 상태 관리
├── types/
│   ├── food.ts                     # 음식/음식점 타입 정의
│   └── kakao.d.ts                  # Kakao Maps SDK 타입
└── page.tsx                        # Server Component with metadata
```

---

## Key Changes

### 1. Import Path Updates

#### Before (Vite)
```typescript
import { Button } from '@mini-apps/ui';
import { useGeolocation } from '@/hooks/useGeolocation';
```

#### After (Next.js)
```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGeolocation } from '../hooks/useGeolocation';
```

### 2. Environment Variables

#### Before (Vite)
```typescript
const appKey = import.meta.env.VITE_KAKAO_APP_KEY;
```

#### After (Next.js)
```typescript
const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
```

### 3. Client Components

All components with the following features now have `'use client'` directive:
- `useState`, `useEffect` hooks
- Event handlers (`onClick`, etc.)
- Browser APIs (`navigator.geolocation`, `navigator.share`, `navigator.clipboard`)
- Zustand store hooks

**Files with 'use client':**
- `components/CategoryRoulette.tsx`
- `components/FilterPanel.tsx`
- `components/LunchRouletteApp.tsx`
- `components/RestaurantCard.tsx`
- `components/RestaurantRoulette.tsx`
- `components/ShareButtons.tsx`
- `hooks/useGeolocation.ts`
- `store/useAppStore.ts`

### 4. Page Structure

Created a Server Component wrapper:

**`page.tsx`** (Server Component)
```typescript
import type { Metadata } from 'next';
import LunchRouletteApp from './components/LunchRouletteApp';

export const metadata: Metadata = {
  title: '점심 메뉴 룰렛 | SeolCoding',
  description: '오늘 점심 뭐 먹지? 룰렛으로 결정하세요!',
  // ... other metadata
};

export default function LunchRoulettePage() {
  return <LunchRouletteApp />;
}
```

---

## Components Overview

### Client Components

1. **LunchRouletteApp.tsx** - Main app wrapper
   - Uses `useGeolocation` hook
   - Uses `useAppStore` for state management
   - Loads Kakao Maps SDK
   - Coordinates all child components

2. **CategoryRoulette.tsx** - First roulette wheel
   - Uses `react-custom-roulette` library
   - Handles category selection

3. **RestaurantRoulette.tsx** - Second roulette wheel
   - Searches for restaurants using Kakao Places API
   - Displays restaurant options

4. **RestaurantCard.tsx** - Display selected restaurant
   - Shows restaurant details (name, address, phone, etc.)

5. **FilterPanel.tsx** - Radius filter
   - Allows users to set search radius

6. **ShareButtons.tsx** - Social sharing
   - Kakao Talk share
   - Native Web Share API
   - Clipboard copy

### Hooks

1. **useGeolocation.ts** - Geolocation hook
   - Gets user's current location
   - Handles permission errors
   - Falls back to default location (Seoul)

### State Management

1. **useAppStore.ts** - Zustand store
   - Manages app state (step, location, category, restaurants, etc.)
   - Provides actions for state updates

### Utilities

1. **lib/kakao/init.ts** - Kakao Maps SDK initialization
2. **lib/kakao/places.ts** - Kakao Places API wrapper

---

## Environment Variables Required

Add to `.env.local`:

```env
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_app_key_here
```

---

## Dependencies

The app requires the following dependencies:

```json
{
  "dependencies": {
    "react-custom-roulette": "^1.4.1",
    "zustand": "^4.x.x",
    "lucide-react": "latest"
  }
}
```

---

## Migration Checklist

- [x] Create route folder structure
- [x] Copy and update types
- [x] Copy and update constants
- [x] Copy and update hooks with 'use client'
- [x] Copy and update lib utilities
- [x] Copy and update store with 'use client'
- [x] Copy and update components with 'use client'
- [x] Create main client component wrapper
- [x] Create page.tsx with metadata
- [x] Update import paths (@mini-apps/ui → @/components/ui)
- [x] Update environment variables (VITE_ → NEXT_PUBLIC_)

---

## Testing

To test the migrated app:

```bash
# Development
npm run dev

# Access at:
# http://localhost:3000/lunch-roulette
```

---

## Notes

1. **Geolocation API**: Requires HTTPS in production
2. **Kakao Maps SDK**: Script is loaded dynamically in the browser
3. **Client-Side Only**: All interactive features require client-side rendering
4. **Metadata**: Added comprehensive SEO metadata in page.tsx

---

## Future Improvements

- [ ] Add loading states for Kakao SDK
- [ ] Implement error boundaries
- [ ] Add analytics tracking
- [ ] Optimize bundle size (code splitting)
- [ ] Add unit tests
- [ ] Add E2E tests with Playwright

---

**Migration completed successfully!** ✅
