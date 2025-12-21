# GPA Calculator - UI Improvements

## Design Philosophy
Academic/Professional aesthetic with a clean, trustworthy feel appropriate for a GPA calculator.

## Color Palette
- **Primary**: Blue (#2563eb / blue-600) - Academic, trustworthy
- **Accent**: Purple (#7c3aed / purple-600) - For charts and secondary elements
- **Success**: Green (#16a34a / green-600) - For positive results
- **Error**: Red (#dc2626 / red-600) - For destructive actions
- **Neutral**: Gray scale (50-900) - For backgrounds, text, borders

## Key Improvements Made

### 1. Header Enhancement
**Before**: Simple header with icon and title
**After**:
- Icon wrapped in blue background circle (bg-blue-100)
- Added subtitle "학기별 성적 관리 및 GPA 계산"
- Better responsive layout (flex-col on mobile, flex-row on desktop)
- Improved spacing and visual hierarchy

### 2. GPA Display Cards
**Improvements**:
- Larger, bolder GPA numbers (text-3xl)
- Color-coded cards:
  - Cumulative GPA: Blue border (border-blue-200) with blue accent
  - Major GPA: Purple accent
  - General GPA: Gray accent
- Subtle hover effect (shadow-sm → shadow-md)
- Better icon sizing (h-5 w-5)
- Improved text hierarchy with semibold labels
- Consistent spacing with mt-3 and space-y-1

### 3. Chart Improvements
**Changes**:
- Chart line colors updated to match design system:
  - 학기 GPA: Blue (#2563eb)
  - 누적 GPA: Purple (#7c3aed)
- Added fill color to chart dots
- Cleaner, more professional look

### 4. Tabs Component
**Enhancements**:
- White background with border for tab list
- Active tab uses blue background (bg-blue-600) with white text
- Consistent padding and spacing
- Better visual feedback on tab selection

### 5. Course Input Form
**Improvements**:
- Card border styling (border-gray-200 shadow-sm)
- P/F toggle wrapped in gray box with border
- Blue submit button (bg-blue-600 hover:bg-blue-700)
- Consistent label styling

### 6. Semester List
**Enhancements**:
- Enhanced table header with background (bg-gray-50)
- Better column padding and alignment
- Color-coded grade badges:
  - A grades: Blue (bg-blue-100 text-blue-700)
  - B grades: Green (bg-green-100 text-green-700)
  - C grades: Yellow (bg-yellow-100 text-yellow-700)
  - Other: Gray
- Delete button hover states (hover:bg-red-50 hover:text-red-600)
- Smoother row transitions

### 7. Goal Simulator
**Improvements**:
- Result box uses white background with colored borders
- Larger required GPA display (text-2xl)
- Better information hierarchy
- Enhanced formula explanation box with bullet points

### 8. Data Manager
**Enhancements**:
- Improved info box styling with borders
- Better button layout and spacing
- Clearer destructive action styling

### 9. Add Semester Dialog
**Updates**:
- Blue primary button
- Better form spacing (space-y-5)
- Improved label styling
- Larger dialog title

### 10. Footer
**Changes**:
- Increased padding and margin
- Better text hierarchy
- Cleaner layout

## Typography Hierarchy
- **Page Title**: text-2xl md:text-3xl font-bold text-gray-900
- **Section Title**: text-xl font-bold text-gray-900
- **Card Title**: text-lg font-bold text-gray-900
- **Label**: text-sm font-medium text-gray-700
- **Body**: text-sm text-gray-600
- **Helper**: text-xs text-gray-500

## Spacing System
- **Section gaps**: space-y-8
- **Card gaps**: space-y-6
- **Form fields**: space-y-4
- **Tight spacing**: space-y-2
- **Grid gaps**: gap-6 (large), gap-4 (medium)

## Border & Shadow
- **Cards**: border-gray-200 shadow-sm
- **Hover states**: hover:shadow-md transition-shadow
- **Primary elements**: border-blue-200
- **Interactive hover**: hover:bg-gray-50 transition-colors

## Button Styles
- **Primary**: bg-blue-600 hover:bg-blue-700 text-white
- **Destructive**: hover:bg-red-50 hover:text-red-600
- **Ghost**: variant="ghost" with custom hover states

## Responsive Design
- Mobile-first approach
- Flexible layouts with sm: and md: breakpoints
- Grid columns adjust: grid-cols-1 md:grid-cols-3
- Padding adjusts: px-4 sm:px-6

## No Gradients
Following UI guidelines, all gradient backgrounds have been eliminated in favor of:
- Solid white backgrounds (bg-white)
- Light gray backgrounds (bg-gray-50)
- Single-color accents

## Files Modified
1. `/src/App.tsx` - Main layout, header, tabs, dialog
2. `/src/components/GPADisplay.tsx` - GPA summary cards
3. `/src/components/GPAChart.tsx` - Chart colors
4. `/src/components/CourseInput.tsx` - Form styling
5. `/src/components/SemesterList.tsx` - Table and badges
6. `/src/components/Simulator.tsx` - Result display
7. `/src/components/DataManager.tsx` - Info boxes

## Result
A clean, professional, academic-focused interface that:
- Builds trust through consistent, professional styling
- Improves readability with clear typography hierarchy
- Provides better visual feedback through subtle hover states
- Maintains accessibility with good color contrast
- Follows modern design principles with minimal, clean aesthetics
