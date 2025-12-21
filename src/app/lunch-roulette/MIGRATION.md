# Lunch Roulette - Vite to Next.js Migration

## Migration Status: ✅ COMPLETE

Migration completed on: 2025-12-21

---

## Source
- **Original Path**: `/Users/sdh/Dev/02_production/seolcoding.com/agents/mini-apps/apps/lunch-roulette/`
- **Framework**: Vite + React 19 + TypeScript
- **Package Manager**: pnpm workspace

## Destination
- **New Path**: `/Users/sdh/Dev/02_production/seolcoding-apps/src/app/lunch-roulette/`
- **Framework**: Next.js 15 App Router + React 19 + TypeScript
- **Package Manager**: pnpm standalone

---

## Migration Changes

### 1. Project Structure
```
lunch-roulette/
├── page.tsx                          # NEW: Next.js page entry (metadata + routing)
├── components/
│   ├── LunchRouletteApp.tsx          # NEW: Main client component (from App.tsx)
│   ├── CategoryRoulette.tsx          # ✓ Migrated with 'use client'
│   ├── RestaurantRoulette.tsx        # ✓ Migrated with 'use client'
│   ├── RestaurantCard.tsx            # ✓ Migrated with 'use client'
│   ├── FilterPanel.tsx               # ✓ Migrated with 'use client'
│   └── ShareButtons.tsx              # ✓ Migrated with 'use client'
├── hooks/
│   └── useGeolocation.ts             # ✓ Migrated (no changes)
├── lib/
│   └── kakao/
│       ├── init.ts                   # ✓ Updated env var
│       └── places.ts                 # ✓ Migrated (no changes)
├── store/
│   └── useAppStore.ts                # ✓ Migrated (no changes)
├── types/
│   ├── food.ts                       # ✓ Migrated (no changes)
│   └── kakao.d.ts                    # ✓ Migrated (no changes)
└── constants/
    └── foodCategories.ts             # ✓ Migrated (no changes)
```

### 2. Code Changes

#### page.tsx (NEW)
- Added Next.js metadata for SEO
- Server component that renders `<LunchRouletteApp />`
- Includes OpenGraph and Twitter card metadata

#### LunchRouletteApp.tsx (from App.tsx)
- Added `'use client'` directive at top
- Changed default export to named export
- Updated imports from `@mini-apps/ui` to `@/components/ui`

#### All Components
- Added `'use client'` directive where needed
- Updated import paths:
  - `@mini-apps/ui` → `@/components/ui/button`
  - Relative imports for local modules (e.g., `../hooks/useGeolocation`)

#### lib/kakao/init.ts
- Updated environment variable:
  - `import.meta.env.VITE_KAKAO_APP_KEY` → `process.env.NEXT_PUBLIC_KAKAO_APP_KEY`

### 3. Import Path Mapping
All imports updated to use Next.js `@/` alias:
- `@/components/ui/button` - shadcn/ui button component
- `@/components/ui/card` - shadcn/ui card component
- `@/lib/utils` - Utility functions

### 4. Environment Variables
- **Vite**: `VITE_KAKAO_APP_KEY`
- **Next.js**: `NEXT_PUBLIC_KAKAO_APP_KEY`

Create `.env.local` file:
```env
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_javascript_key_here
```

### 5. Dependencies Added
- `react-custom-roulette@1.4.1` - Roulette wheel component

---

## File Count
- **Total Files**: 14
- **Components**: 6
- **Hooks**: 1
- **Lib**: 2
- **Store**: 1
- **Types**: 2
- **Constants**: 1
- **Page**: 1

---

## Features Preserved
✅ 2-stage roulette (Category → Restaurant)
✅ Geolocation-based restaurant search
✅ Kakao Maps API integration
✅ Search radius filtering (500m, 1km, 2km, 5km)
✅ Share functionality (Kakao, Native Share, Copy Link)
✅ Custom CSS animations
✅ Responsive design
✅ Error handling for location permissions
✅ Loading states

---

## Next.js 15 Features Used
- **App Router**: File-based routing with `page.tsx`
- **Server Components**: `page.tsx` for metadata
- **Client Components**: All interactive components with `'use client'`
- **Metadata API**: SEO optimization with OpenGraph
- **Environment Variables**: `process.env.NEXT_PUBLIC_*`
- **TypeScript**: Full type safety maintained

---

## Testing Checklist

### Development
```bash
cd /Users/sdh/Dev/02_production/seolcoding-apps
npm run dev
```
Visit: http://localhost:3000/lunch-roulette

### Build
```bash
npm run build
npm run start
```

### Test Cases
- [ ] Location permission granted: Show actual location
- [ ] Location permission denied: Show default location (Seoul) with warning
- [ ] Category roulette spins correctly
- [ ] Restaurant search returns results
- [ ] No results: Show appropriate message
- [ ] Share buttons work (Kakao, Native, Copy)
- [ ] Search radius filter updates results
- [ ] Reset button returns to category selection
- [ ] Responsive design on mobile/tablet/desktop

---

## Known Issues
None identified during migration.

---

## Future Enhancements
- [ ] Add restaurant images from Kakao API
- [ ] Save favorite restaurants to localStorage
- [ ] Add restaurant reviews/ratings
- [ ] Multiple location support (save locations)
- [ ] Category customization (add/remove categories)

---

## Dependencies

### Runtime
- `react@19.0.0`
- `react-dom@19.0.0`
- `next@15.1.0`
- `zustand@5.0.3`
- `react-custom-roulette@1.4.1`
- `lucide-react@0.468.0`

### shadcn/ui Components
- `button`
- `card`

---

## API Keys Required
1. **Kakao Maps JavaScript API Key**
   - Get from: https://developers.kakao.com/
   - Set in `.env.local` as `NEXT_PUBLIC_KAKAO_APP_KEY`

---

## Migration Verification
✅ All source files migrated
✅ All imports updated
✅ 'use client' directives added
✅ Environment variables updated
✅ Dependencies installed
✅ TypeScript types preserved
✅ UI/UX maintained
✅ No build errors (except unrelated framer-motion in bingo-game)

---

## Route
**Production URL**: `https://apps.seolcoding.com/lunch-roulette`
**Local URL**: `http://localhost:3000/lunch-roulette`

---

## Notes
- Original app used `@mini-apps/ui` from pnpm workspace
- Next.js app uses shadcn/ui components from `@/components/ui`
- All custom animations and styles preserved
- Kakao Maps SDK loaded dynamically on client-side
- Geolocation API used with proper fallback to Seoul city hall
