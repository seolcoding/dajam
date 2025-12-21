# Random Picker App - Next.js Migration

## Migration Summary

Successfully migrated from Vite to Next.js App Router.

### Source
- **From**: `/apps/random-picker/` (Vite)
- **To**: `/src/app/random-picker/` (Next.js App Router)

### Directory Structure

```
src/app/random-picker/
├── components/          # All UI components (7 files)
│   ├── BulkInput.tsx
│   ├── HistoryPanel.tsx
│   ├── ItemInput.tsx
│   ├── ItemList.tsx
│   ├── ResultModal.tsx
│   ├── SettingsPanel.tsx
│   └── WheelCanvas.tsx
├── lib/                 # Utility and renderer classes (3 files)
│   ├── spin-animator.ts
│   ├── utils.ts
│   └── wheel-renderer.ts
├── store/              # Zustand store (1 file)
│   └── wheel-store.ts
├── types/              # TypeScript types (1 file)
│   └── index.ts
├── page.tsx            # Server Component with metadata
└── RandomPickerClient.tsx  # Main Client Component
```

### Key Changes

1. **Server/Client Components**:
   - `page.tsx`: Server Component with metadata export
   - `RandomPickerClient.tsx`: Main Client Component with all interactive logic
   - All component files: Added `"use client"` directive

2. **Import Updates**:
   - Changed `@mini-apps/ui` → `@/components/ui`
   - Changed `@/types` → `../types` (relative imports)
   - Changed `@/lib/*` → `../lib/*` (relative imports)
   - Changed `@/store/*` → `../store/*` (relative imports)

3. **Dependencies**:
   - `zustand`: State management
   - `canvas-confetti`: Confetti effects
   - `lucide-react`: Icons

### Features

- Cryptographically secure random selection using `crypto.getRandomValues()`
- Canvas-based wheel rendering
- Local storage persistence
- History tracking (last 100 results)
- Confetti effects on selection
- Bulk input support
- Responsive design

### Route

The app is now accessible at `/random-picker`

### Metadata

- Title: "랜덤 뽑기 룰렛 | 공정한 랜덤 선택 도구"
- Description: "공정하고 재미있는 랜덤 뽑기 룰렛. 암호학적으로 안전한 랜덤 알고리즘으로 완전한 공정성을 보장합니다."
- Keywords: 랜덤 뽑기, 룰렛, 추첨, 랜덤 선택, 공정한 추첨, 무작위 선택
