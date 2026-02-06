# Quickstart Guide - DoIt Goal Tracking

**Date**: 2026-02-04  
**Feature**: Goal Tracking Layout (Initial Page Setup)  
**Scope**: Two-column responsive UI with active goals (left) and completed goals (right)

---

## Overview

The DoIt app is a goal tracking web application built with **Next.js 16.1.6**, **React 19.2.3**, **Tailwind CSS 4**, and **shadcn/ui**. Goals are persisted in browser localStorage. This quickstart covers the local development setup and key workflows.

---

## Prerequisites

- **Node.js**: 18.17+ (LTS recommended)
- **npm**: 9+ or **pnpm** 8+
- **Git**: For version control

---

## Installation & Setup

### 1. Install Dependencies

```bash
cd /path/to/example-spec-kit-2026
npm install
```

This installs:
- `next`, `react`, `react-dom` (core framework)
- `tailwindcss@4` (CSS framework)
- `shadcn-ui` components (Dialog, Button, Input)
- `date-fns` (date utilities)
- `nanoid` (ID generation)
- `clsx` + `tailwind-merge` (classname utility)
- `typescript`, `eslint` (dev tools)

### 2. Initialize shadcn/ui (if not already done)

```bash
npx shadcn-ui@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes (allows @theme customization)
- Include TypeScript: Yes
- Include utilities: Yes

This creates `/components/ui/` with Dialog, Button, Input components.

### 3. Verify Tailwind CSS Setup

Check `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser. You should see the goal tracking layout.

---

## Project Structure Quick Reference

```
app/
├── layout.tsx              # Root layout (Providers, global styles)
├── page.tsx                # Home page (Main UI: two columns + modal)
├── components/             # Reusable components
│   ├── ActiveGoalsColumn.tsx
│   ├── CompletedGoalsColumn.tsx
│   ├── GoalsList.tsx
│   ├── ActiveGoalCard.tsx
│   ├── CompletedGoalCard.tsx
│   ├── AddGoalButton.tsx
│   ├── AddGoalModal.tsx
│   ├── EmptyState.tsx
│   └── GoalCountdown.tsx
├── lib/
│   ├── types.ts            # Goal interface, constants
│   ├── goalStorage.ts      # localStorage helpers
│   ├── goalUtils.ts        # daysRemaining, isExpired, sort functions
│   └── dateFormatting.ts   # date-fns wrappers
├── utils/
│   └── cn.ts               # classname helper
└── styles/
    └── globals.css         # Tailwind @layer, @theme

public/                      # Static assets (icons, logos)

specs/001-goal-tracking-layout/
├── spec.md                 # Feature specification
├── plan.md                 # This plan
├── research.md             # Phase 0: research & clarifications
├── data-model.md           # Phase 1: data model
├── contracts/
│   ├── goals-storage.md    # localStorage schema
│   └── components.md       # Component contracts
└── quickstart.md           # Phase 1: this file
```

---

## Key Files to Understand

### 1. `app/lib/types.ts` — Goal Interface

```typescript
export interface Goal {
  id: string;
  title: string;
  endDate: Date;
  createdAt: Date;
}
```

### 2. `app/lib/goalStorage.ts` — localStorage Helpers

```typescript
export function loadActiveGoals(): Goal[] { ... }
export function saveActiveGoals(goals: Goal[]): void { ... }
export function loadCompletedGoals(): Goal[] { ... }
export function saveCompletedGoals(goals: Goal[]): void { ... }
```

### 3. `app/lib/goalUtils.ts` — Business Logic

```typescript
export function daysRemaining(endDate: Date): number { ... }
export function isExpired(endDate: Date): boolean { ... }
export function getVisualStatus(endDate: Date): "active" | "warning" | "critical" { ... }
export function sortActiveGoals(goals: Goal[]): Goal[] { ... }
export function sortCompletedGoals(goals: Goal[]): Goal[] { ... }
```

### 4. `app/lib/dateFormatting.ts` — date-fns Wrappers

```typescript
import { differenceInDays, format, isToday } from "date-fns";

export function daysRemaining(endDate: Date): number { ... }
export function formatDate(date: Date): string { ... }
```

### 5. `app/styles/globals.css` — Tailwind Theme Tokens

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@theme {
  --colors-warning: #fef3c7;   /* pastel yellow, 3-1 days */
  --colors-critical: #fecaca;  /* pastel red, ≤0 days */
}
```

---

## Manual Testing Workflows

### Workflow 1: Create a Goal

1. Click **"+ Add Goal"** button
2. Enter title: "Fix critical bugs"
3. Select end date: 5 days from today
4. Click **"Create Goal"**
5. **Verify**: Goal appears in left (Active) column with "5 days left"

### Workflow 2: Mark Goal Complete

1. Find an active goal in the left column
2. Click the **checkbox (✓)** next to it
3. **Verify**: Goal disappears from left column, reappears in right column under "Completed Goals"
4. **Verify**: Right column shows "Completed: [date]" instead of days remaining

### Workflow 3: Restore a Completed Goal

1. Find a completed goal in the right column
2. Click the **"↻ Restore"** button
3. **Verify**: Goal moves back to left column
4. **Verify**: Restore persists after page refresh (press F5)

### Workflow 4: Delete a Goal

1. Find any goal (active or completed)
2. Click the **trash icon (🗑️)**
3. **Verify**: Goal is permanently removed from the page
4. **Verify**: Goal does not reappear after page refresh

### Workflow 5: Verify Warning & Critical States

1. Create three goals:
   - Title: "High priority", End Date: **today** → Displays "0 days left" (critical red background)
   - Title: "Medium priority", End Date: **+2 days** → Displays "2 days left" (warning yellow background)
   - Title: "Low priority", End Date: **+10 days** → Displays "10 days left" (default white)
2. **Verify**: Background colors match expected states
3. Advance system clock (or simulate) to expire high-priority goal → Should disappear from active column after today

### Workflow 6: Empty State Messages

1. Delete all active goals
2. **Verify**: Left column shows "No active goals. Click 'Add Goal' to get started!"
3. Delete all completed goals
4. **Verify**: Right column shows "No completed goals yet. Complete your first goal..."

### Workflow 7: Responsive Layout

1. Open dev tools (F12)
2. Toggle **Device Toolbar** (mobile view, ≤480px)
3. **Verify**: Columns stack vertically (grid-cols-1)
4. Resize to tablet (768px)
5. **Verify**: Columns appear side-by-side (grid-cols-2)
6. **Verify**: All buttons and text remain readable

### Workflow 8: Form Validation

1. Click "Add Goal" → Modal opens
2. Leave title empty, select date, click "Create"
3. **Verify**: Error message "Goal title is required"
4. Clear title, enter valid title
5. Select a date in the **past** (e.g., yesterday)
6. Click "Create"
7. **Verify**: Error message "End date must be in the future or today"
8. Select today's date
9. Click "Create"
10. **Verify**: Form accepts today as valid (goal created with "0 days left")

### Workflow 9: localStorage Persistence

1. Create 3 goals with various end dates
2. Press F5 (page refresh)
3. **Verify**: All 3 goals reappear in left column with same titles and days remaining
4. Mark one as complete
5. Press F5
6. **Verify**: Goal remains in right column (completed state persisted)

### Workflow 10: 100+ Goals Performance

1. In browser console, run:
```javascript
const goals = [];
for (let i = 0; i < 150; i++) {
  goals.push({
    id: `goal-${i}`,
    title: `Goal ${i + 1}`,
    endDate: new Date(Date.now() + (i % 30) * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  });
}
localStorage.setItem("doit_goals", JSON.stringify(goals));
location.reload();
```
2. **Verify**: UI renders all goals without lag
3. Scroll through list smoothly
4. **Verify**: Interactions (checkbox, delete) remain responsive

---

## Common Issues & Troubleshooting

### Issue: Goals Don't Persist After Refresh

**Solution**: 
- Check browser console (F12 → Console tab) for errors
- Verify localStorage is enabled (not in private browsing mode)
- Clear localStorage and retry: `localStorage.clear()` in console

### Issue: Tailwind CSS @theme Colors Not Applying

**Solution**:
- Verify `globals.css` includes `@theme` block with `--colors-warning` and `--colors-critical`
- Check Tailwind CSS version: `npm list tailwindcss` (should be 4.x)
- Hard-refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue: shadcn/ui Components Not Found

**Solution**:
```bash
npx shadcn-ui@latest add dialog button input
```

### Issue: Date Calculations Off by One Day

**Solution**:
- Check that `date-fns` functions use `startOfDay()` to normalize timezones
- Verify in `goalUtils.ts` that `daysRemaining()` uses:
```typescript
const today = startOfDay(new Date());
const end = startOfDay(endDate);
return differenceInDays(end, today);
```

### Issue: Modal Form Not Closing After Submit

**Solution**:
- Verify `AddGoalModal` calls `onOpenChange(false)` after successful submission
- Check that `handleAddGoal` in `page.tsx` updates state correctly

---

## Next Steps (After Approval)

1. **Phase 2: Implementation Tasks** — Run `/speckit.tasks` to generate implementation checklist
2. **Development** — Follow task list to implement components and utils
3. **Manual Testing** — Use workflows above to verify functionality
4. **Styling Refinements** — Adjust colors, spacing, typography as needed
5. **Accessibility Review** — Test keyboard navigation, screen reader support
6. **Browser Compatibility** — Test on Chrome, Firefox, Safari, Edge (responsive design)

---

## Development Tips

### Enable Fast Refresh
- Next.js automatically reloads components on save
- Preserve state using `localStorage` for testing

### Debug localStorage
```javascript
// View all goals
console.log(JSON.parse(localStorage.getItem("doit_goals") || "[]"));
console.log(JSON.parse(localStorage.getItem("doit_completed") || "[]"));

// Clear all data (reset)
localStorage.clear();
```

### Test Date Calculations
```javascript
import { daysRemaining } from "@/lib/goalUtils";

const future = new Date();
future.setDate(future.getDate() + 5);
console.log(daysRemaining(future)); // Should be ~5
```

### Inspect Component Props
```tsx
// Add console.log in any component
useEffect(() => {
  console.log("Goals:", goals);
  console.log("Completed:", completedGoals);
}, [goals, completedGoals]);
```

---

## Performance Considerations

- **localStorage Limit**: ~5-10MB per domain (100+ goals ≈ 15-50KB)
- **Re-rendering**: React batches state updates; no performance issues expected with 100+ goals
- **Date Calculations**: All done at render time (negligible impact with `date-fns`)
- **No Backend Calls**: All operations local (instant feedback)

---

## Constitution Alignment Check ✅

- **Clean Code**: Component names clear, lib functions single-purpose, comments explain why
- **Simple UX**: Two-column layout, obvious actions, empty states guide users
- **Responsive Design**: Tailwind breakpoints (mobile/tablet/desktop), touch targets ≥48px
- **Minimal Dependencies**: Only shadcn/ui, date-fns, Tailwind CSS (no bloat)
- **No Testing**: Manual verification workflows only, ZERO automated tests

---

## Summary

**To Start Development**:
1. `npm install` — Install dependencies
2. `npx shadcn-ui@latest init` — Initialize UI components
3. `npm run dev` — Start dev server at http://localhost:3000
4. Follow manual testing workflows to verify each feature
5. Use `app/lib/` utilities and component contracts as reference

**Key Files**:
- Spec: [spec.md](spec.md)
- Data Model: [data-model.md](data-model.md)
- Storage Contract: [contracts/goals-storage.md](contracts/goals-storage.md)
- Component Contracts: [contracts/components.md](contracts/components.md)

**Testing**: No automated tests. Use manual workflows above for validation.

