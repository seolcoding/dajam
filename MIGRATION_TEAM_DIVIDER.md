# Team Divider Migration Summary

**Date**: 2025-12-21  
**From**: `/apps/team-divider/` (Vite)  
**To**: `/src/app/team-divider/` (Next.js App Router)

## Files Migrated

### Components (6 files)
- ✅ ExportButtons.tsx
- ✅ ParticipantInput.tsx
- ✅ QRCodeDisplay.tsx
- ✅ TeamDivider.tsx (new main client component)
- ✅ TeamResult.tsx
- ✅ TeamSettings.tsx

### Store (1 file)
- ✅ useTeamStore.ts

### Types (1 file)
- ✅ team.ts

### Utils (4 files)
- ✅ colors.ts
- ✅ pdf.ts
- ✅ qrcode.ts
- ✅ shuffle.ts

### Pages (1 file)
- ✅ page.tsx (Server Component with metadata)

**Total**: 13 TypeScript files

## Key Changes

### 1. Import Path Updates
- **Before**: `@mini-apps/ui` 
- **After**: `@/components/ui`

- **Before**: Relative paths (`@/components/...`)
- **After**: Absolute paths (`@/app/team-divider/...`)

### 2. Client Component Directives
Added `'use client'` to all components that use:
- `useState`, `useEffect`
- Event handlers
- Browser APIs (window, navigator)
- Zustand store

Files with 'use client':
- All 6 component files
- TeamDivider.tsx (main wrapper)

### 3. Server Component
Created `page.tsx` as a Server Component with:
- `Metadata` export for SEO
- Simple wrapper that imports TeamDivider client component

### 4. Package Import Fixes
- **QRCode**: `import QRCode from 'qrcode'` → `import * as QRCode from 'qrcode'`
- **PapaParse**: `import Papa from 'papaparse'` → `import * as Papa from 'papaparse'`

### 5. Dependencies Added to package.json
```json
{
  "dependencies": {
    "qrcode": "^1.5.4",
    "jspdf": "^2.5.2",
    "papaparse": "^5.4.1",
    "react-confetti": "^6.1.0"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.5",
    "@types/papaparse": "^5.3.15"
  }
}
```

## Architecture

### Component Hierarchy
```
page.tsx (Server Component)
  └── TeamDivider.tsx (Client Component)
       ├── ParticipantInput.tsx
       ├── TeamSettings.tsx
       ├── TeamResult.tsx
       ├── QRCodeDisplay.tsx
       └── ExportButtons.tsx
```

### State Management
- **Store**: Zustand (`useTeamStore`)
- **State Location**: Client-side only (browser)
- **Persistence**: None (resets on page refresh)

### Data Flow
1. User inputs participants → `useTeamStore`
2. User configures settings → `useTeamStore`
3. Click "팀 나누기" → `divideTeams()` action
4. Fisher-Yates shuffle → Teams created
5. QR codes generated asynchronously → `qrCodes` Map
6. Results displayed with Confetti

## Features Preserved

✅ Direct participant input  
✅ Bulk text input  
✅ CSV file upload  
✅ Team count mode  
✅ Member count mode  
✅ Fisher-Yates shuffle algorithm  
✅ QR code generation  
✅ PDF export  
✅ JSON export  
✅ Share functionality  
✅ Confetti animation  
✅ Responsive design  

## Testing Checklist

- [ ] Page loads correctly at `/team-divider`
- [ ] Participant input (single, bulk, CSV) works
- [ ] Team settings (by count, by member) work
- [ ] Team division produces correct results
- [ ] QR codes generate successfully
- [ ] PDF export works
- [ ] JSON export works
- [ ] Share/clipboard works
- [ ] Reset functionality works
- [ ] Mobile responsive design
- [ ] No console errors

## Known Issues

None at migration time.

## Next Steps

1. Install dependencies: `pnpm install`
2. Test locally: `pnpm dev`
3. Verify all features work
4. Test on mobile devices
5. Build for production: `pnpm build`
6. Deploy to production

## Rollback Plan

If needed, the original Vite version is preserved at:
- `/apps/team-divider/`

To rollback:
1. Remove `/src/app/team-divider/`
2. Remove dependencies from `package.json`
3. Run `pnpm install`

---

**Migration Status**: ✅ Complete  
**Migrated by**: Claude (Anthropic)  
**Verified by**: [Pending human verification]
