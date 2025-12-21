# Balance Game - Next.js Migration

This app has been successfully migrated from Vite to Next.js App Router.

## Migration Summary

### Source
- **Original Path**: `/Users/sdh/Dev/02_production/seolcoding-apps/apps/balance-game/`
- **Framework**: Vite + React Router

### Target
- **New Path**: `/Users/sdh/Dev/02_production/seolcoding-apps/src/app/balance-game/`
- **Framework**: Next.js 15 App Router

## Structure

```
src/app/balance-game/
├── components/
│   ├── BalanceGameApp.tsx      # Main client component (replaces App.tsx + all pages)
│   ├── QuestionCard.tsx         # Game card component
│   ├── ResultChart.tsx          # Results visualization
│   ├── ShareButton.tsx          # Share functionality
│   └── CustomQuestionForm.tsx   # Create custom questions
├── data/
│   ├── categories.ts            # Category metadata
│   └── templates.ts             # Question templates
├── types/
│   └── index.ts                 # TypeScript interfaces
├── utils/
│   ├── storage.ts               # LocalStorage utilities
│   └── imageGenerator.ts        # Canvas image generation
└── page.tsx                     # Server Component with metadata
```

## Key Changes

### Routing
- **Before**: React Router with HashRouter (`/#/game/:id`, `/#/result/:id`, etc.)
- **After**: URL search params (`?view=game&id=xyz`, `?view=result&id=xyz`)
- Uses Next.js `useSearchParams()` and `useRouter()` hooks

### Navigation Pattern
```typescript
// Old (React Router)
navigate('/game/123')

// New (Next.js)
const params = new URLSearchParams();
params.set('view', 'game');
params.set('id', '123');
router.push(`?${params.toString()}`);
```

### Components
- All components marked with `'use client'` directive
- Page views consolidated into single `BalanceGameApp.tsx` component
- Imports updated from `@mini-apps/ui` to `@/components/ui`

### Dependencies Added
- `react-swipeable` - Touch gesture support
- `nanoid` - ID generation for custom questions
- `recharts` - Already installed (charts)

### New Components Created
- `LoadingSpinner` component added to `/src/components/ui/loading-spinner.tsx`

## Features Preserved

1. **Home Page**: Category selection and random question
2. **Game Page**: A vs B choice with swipe gestures
3. **Result Page**: Vote statistics, charts, and sharing
4. **Create Page**: Custom question creation
5. **Storage**: LocalStorage for votes and custom questions
6. **Image Generation**: Canvas-based result image sharing

## Usage

Access the app at: `http://localhost:3000/balance-game`

Query parameters:
- `?view=home` - Home page (default)
- `?view=game&id=food-1` - Game page with specific question
- `?view=result&id=food-1` - Results page
- `?view=create` - Create custom question

## Metadata

Optimized SEO metadata included in `page.tsx`:
- Title: "밸런스 게임 - A vs B 당신의 선택은?"
- Description: Korean description for search engines
- OpenGraph tags for social sharing

## Next Steps

- Test all functionality in development mode
- Verify LocalStorage persistence
- Test image generation and sharing features
- Ensure responsive design on mobile devices
