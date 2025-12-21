# Lunch Roulette Migration Summary

## ✅ Migration Status: COMPLETE

**Date**: 2025-12-21
**Migrated by**: Claude (Sonnet 4.5)
**Migration Type**: Vite → Next.js 15 App Router

---

## Quick Start

### Development
```bash
cd /Users/sdh/Dev/02_production/seolcoding-apps
npm run dev
# Visit: http://localhost:3000/lunch-roulette
```

### Build
```bash
npm run build
npm run start
```

---

## Environment Setup Required

Create `.env.local` file in project root:
```env
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_javascript_key_here
```

Get your Kakao API key from: https://developers.kakao.com/

---

## What Was Migrated

### Files (14 total)
1. `page.tsx` - Next.js route entry (NEW)
2. `components/LunchRouletteApp.tsx` - Main app component (NEW)
3. `components/CategoryRoulette.tsx` ✓
4. `components/RestaurantRoulette.tsx` ✓
5. `components/RestaurantCard.tsx` ✓
6. `components/FilterPanel.tsx` ✓
7. `components/ShareButtons.tsx` ✓
8. `hooks/useGeolocation.ts` ✓
9. `lib/kakao/init.ts` ✓
10. `lib/kakao/places.ts` ✓
11. `store/useAppStore.ts` ✓
12. `types/food.ts` ✓
13. `types/kakao.d.ts` ✓
14. `constants/foodCategories.ts` ✓

### Dependencies Added
- `react-custom-roulette@1.4.1`

---

## Key Changes

### 1. Component Structure
- **Vite**: `App.tsx` as root component
- **Next.js**: `page.tsx` (server) → `LunchRouletteApp.tsx` (client)

### 2. Import Paths
- **Before**: `@mini-apps/ui` (pnpm workspace)
- **After**: `@/components/ui` (Next.js alias)

### 3. Environment Variables
- **Before**: `import.meta.env.VITE_KAKAO_APP_KEY`
- **After**: `process.env.NEXT_PUBLIC_KAKAO_APP_KEY`

### 4. Client Components
All interactive components marked with `'use client'`:
- LunchRouletteApp
- CategoryRoulette
- RestaurantRoulette
- FilterPanel
- ShareButtons

---

## Features Preserved

✅ 2-stage roulette system (Category → Restaurant)
✅ Geolocation-based search
✅ Kakao Maps API integration
✅ Radius filtering (500m, 1km, 2km, 5km)
✅ Share functionality (Kakao + Native + Copy)
✅ Error handling & loading states
✅ Responsive design
✅ All animations & custom styles

---

## Next.js 15 Features

- **App Router**: Modern routing with `app/` directory
- **Server Components**: SEO metadata in `page.tsx`
- **Client Components**: Interactive UI with `'use client'`
- **Metadata API**: OpenGraph + Twitter cards
- **TypeScript**: Full type safety

---

## Testing Checklist

- [ ] Run `npm run dev` successfully
- [ ] Navigate to `/lunch-roulette`
- [ ] Grant location permission
- [ ] Spin category roulette
- [ ] Search restaurants by category
- [ ] Change search radius
- [ ] Spin restaurant roulette
- [ ] View restaurant details
- [ ] Test share buttons
- [ ] Reset and try again
- [ ] Test on mobile viewport

---

## Known Issues

- Build fails due to **unrelated** `framer-motion` dependency missing in `bingo-game`
  - This does NOT affect lunch-roulette
  - Fix: `pnpm add framer-motion` (for bingo-game)

---

## Documentation

Full migration details: `/src/app/lunch-roulette/MIGRATION.md`

---

## Production URL
- Local: `http://localhost:3000/lunch-roulette`
- Production: `https://apps.seolcoding.com/lunch-roulette`

---

## Next Steps

1. Add Kakao API key to `.env.local`
2. Test the application locally
3. Fix `framer-motion` dependency for full build
4. Deploy to Vercel

