# Phase 0: Research & Clarifications - DoIt Goal Tracking

**Date**: 2026-02-04  
**Status**: Complete  
**All NEEDS CLARIFICATION items resolved below.**

---

## 1. localStorage Persistence Strategy

**Question**: How should goals be persisted client-side? What format? How to handle corruption?

**Decision**: Use browser `localStorage` with JSON serialization.

**Rationale**:
- Matches MVP scope (no backend required)
- Simple, zero-dependency persistence
- Immediate availability on page load
- Sufficient for 100+ goals (localStorage ≈5-10MB cap)

**Implementation Details**:
- Key: `doit_goals` (JSON array of Goal objects)
- Key: `doit_completed_goals` (JSON array of completed Goal objects with completion_date)
- Fallback: Empty array if missing or corrupted
- Error handling: Log to console, show empty state if parse fails
- No encryption (localStorage is not secure; MVP scope accepts this)

**Alternatives Considered**:
- IndexedDB: Overkill for MVP, adds complexity
- Session Storage: Lost on browser close, unacceptable for goal tracking
- Backend API: Out of scope for initial layout

---

## 2. Tailwind CSS @theme Configuration

**Question**: How to implement warning (3-1 days) and critical (≤0 days) visual states?

**Decision**: Use Tailwind CSS 4 `@theme` directive to extend color palette with semantic colors.

**Rationale**:
- Native Tailwind CSS 4 feature, zero dependencies
- Centralized theming in global styles
- Consistent application across all goal cards
- Aligns with Constitution Principle IV (Minimal Dependencies)

**Implementation Details**:
```css
/* app/styles/globals.css */
@theme {
  --colors-warning: #fef3c7; /* pastel yellow */
  --colors-critical: #fecaca; /* pastel red */
}
```

**CSS Usage**:
- Active goal: default white/gray
- Warning (3-1 days): `bg-warning` or `border-l-4 border-warning`
- Critical (≤0 days): `bg-critical` or `border-l-4 border-critical`

**Alternatives Considered**:
- CSS-in-JS (styled-components, emotion): Violates Constitution (Tailwind only)
- Hard-coded color strings: Works but not maintainable
- Tailwind config.ts colors: Valid, but @theme is more explicit for design tokens

---

## 3. shadcn/ui Component Integration

**Question**: Which shadcn components are appropriate for this feature?

**Decision**: Use minimal shadcn components: `Dialog` (modal), `Button`, `Input`, optionally `Card`.

**Rationale**:
- shadcn components are headless, highly customizable via Tailwind
- Dialog provides accessible modal for "Add Goal"
- Button standardizes call-to-action styling
- Input provides form field with built-in state handling
- Card (optional) simplifies goal card layout and styling

**Implementation Details**:
```typescript
// app/components/AddGoalModal.tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Typical pattern: Dialog wraps form, Button submits, Input captures title/date
```

**Installation via shadcn CLI**:
```bash
npx shadcn-ui@latest add dialog button input
```

**Alternatives Considered**:
- Headless UI: More verbose, less styled by default
- Radix UI (direct): More control, more boilerplate
- Custom HTML: Sacrifices accessibility (ARIA labels, keyboard traps)

---

## 4. Date Formatting with date-fns

**Question**: How to handle date calculations, formatting, and edge cases?

**Decision**: Use `date-fns` library for all date operations.

**Rationale**:
- Lightweight (~10kb gzipped), composable functions
- Handles timezone-aware operations (important for "end of day" boundary)
- Well-tested, widely used in React ecosystem
- Clear function naming (e.g., `differenceInDays`, `isToday`, `format`)

**Implementation Details**:

```typescript
// app/lib/dateFormatting.ts
import { differenceInDays, format, isToday, isPast, startOfDay } from "date-fns";

export const daysRemaining = (endDate: Date): number => {
  const today = startOfDay(new Date());
  const end = startOfDay(endDate);
  return differenceInDays(end, today);
};

export const isExpired = (endDate: Date): boolean => {
  return daysRemaining(endDate) < 0;
};

export const formatDate = (date: Date): string => {
  return format(date, "MMM dd, yyyy");
};

export const getVisualStatus = (endDate: Date): "active" | "warning" | "critical" => {
  const days = daysRemaining(endDate);
  if (days < 0) return "critical"; // expired
  if (days <= 3) return "warning";
  return "active";
};
```

**Key Edge Case Handling**:
- End date = today → `daysRemaining()` returns 0 (shows "0 days left")
- End date in past → `daysRemaining()` returns negative (goal expired, hidden from active column)
- Timezone neutrality: Use `startOfDay()` to avoid off-by-one errors across timezones

**Alternatives Considered**:
- Native Date objects: Verbose, error-prone for calculations
- moment.js: Heavier (~70kb), deprecated in favor of date-fns
- day.js: Lighter but less feature-rich for this use case

---

## 5. Component Architecture & State Management

**Question**: How to structure components for max reusability and clarity?

**Decision**: React functional components with hooks, local state via `useState`, localStorage sync via `useEffect`.

**Rationale**:
- Aligns with Modern React patterns (hooks > class components)
- No external state library needed (Constitution Principle IV)
- Simple, predictable data flow
- Easy to test manually in dev mode

**Implementation Details**:

```typescript
// app/page.tsx (main layout)
export default function Home() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("doit_goals");
    if (stored) setGoals(JSON.parse(stored));
  }, []);

  // Save to localStorage on update
  useEffect(() => {
    localStorage.setItem("doit_goals", JSON.stringify(goals));
  }, [goals]);

  const handleCheckGoal = (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      setCompletedGoals([...completedGoals, { ...goal, completedAt: new Date() }]);
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  // ... other handlers (restore, delete, add)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <GoalsList goals={goals} onCheck={handleCheckGoal} onDelete={...} />
      <CompletedGoalsList goals={completedGoals} onRestore={...} onDelete={...} />
    </div>
  );
}
```

**Alternatives Considered**:
- Redux/Zustand: Overkill for single-page MVP
- Context API: Could work, but useState sufficient here
- MobX: Adds complexity, not justified

---

## 6. Responsive Design Breakpoints

**Question**: How to ensure responsive layout across mobile, tablet, desktop?

**Decision**: Use Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`) with mobile-first strategy.

**Implementation Details**:
```html
<!-- Default (mobile): stacked columns -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <!-- Active column -->
  <!-- Completed column -->
</div>
```

**Touch Targets**: All buttons ≥48px (Tailwind default `h-10` = 40px + padding).

**Typography Scaling**: Use Tailwind `text-sm`, `text-base`, `text-lg` (no custom font sizes needed).

**Alternatives Considered**:
- CSS Media Queries (manual): Verbose, error-prone
- CSS Grid/Flexbox only (no Tailwind): Works but loses semantic consistency

---

## 7. Form Validation for "Add Goal" Modal

**Question**: How to validate title and end date input?

**Decision**: Client-side validation with immediate feedback, no async validation needed.

**Validation Rules** (from spec):
1. Title required (error: "Goal title is required")
2. End date must be today or future (error: "End date must be in the future or today")
3. Accept today's date (valid, creates "0 days left" goal)

**Implementation**:
```typescript
const validateGoal = (title: string, endDate: Date): string | null => {
  if (!title.trim()) return "Goal title is required";
  if (isPast(endDate) && !isToday(endDate)) {
    return "End date must be in the future or today";
  }
  return null;
};
```

**UX**: Show error inline in modal, disable submit button until valid.

---

## 8. Sorting & Display Order

**Question**: Clarify sorting rules for active and completed goals.

**Decision from Spec**:
- **Active Goals**: Sorted by end date (earliest first, so urgent goals appear top)
- **Completed Goals**: Reverse chronological by completion date (newest first)
- If two goals have same end date: secondary sort by creation timestamp (oldest creation first)

**Implementation**:
```typescript
const sortActiveGoals = (goals: Goal[]): Goal[] => {
  return [...goals].sort((a, b) => {
    const daysDiffA = daysRemaining(a.endDate);
    const daysDiffB = daysRemaining(b.endDate);
    if (daysDiffA !== daysDiffB) return daysDiffA - daysDiffB; // earliest deadline first
    return a.createdAt.getTime() - b.createdAt.getTime(); // then by creation time
  });
};

const sortCompletedGoals = (goals: Goal[]): Goal[] => {
  return [...goals].sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());
};
```

---

## 9. Empty State Messaging

**Question**: What UX should display when no goals exist?

**Decision**: Show contextual empty state in each column.

**Active Goals Empty State**:
"No active goals. Click 'Add Goal' to get started!"

**Completed Goals Empty State**:
"No completed goals yet. Complete your first goal to celebrate your progress!"

**Implementation**: Check `goals.length === 0` in component, render `<EmptyState />` wrapper instead of list.

---

## Summary: All Decisions Made ✅

| Area | Decision | Rationale | Verified Against Constitution |
|------|----------|-----------|------------------------------|
| Persistence | localStorage | Simple, MVP-scoped, no dependencies | IV (Minimal) ✅ |
| Theming | Tailwind CSS @theme | Native, zero overhead, explicit tokens | IV (Minimal) ✅ |
| UI Components | shadcn/ui (Dialog, Button, Input) | Headless, accessible, Tailwind-integrated | IV (Minimal) ✅ |
| Date Handling | date-fns | Lightweight, composable, well-tested | IV (Minimal) ✅ |
| State Management | React hooks + localStorage sync | No external library, simple, clear | IV (Minimal) ✅ |
| Responsive | Tailwind breakpoints (mobile-first) | CSS-in-JS forbidden, pure Tailwind | I (Clean Code) ✅ |
| Validation | Client-side, immediate feedback | Clear error messages, no backend calls | II (Simple UX) ✅ |
| Sorting | Created order, then completion/deadline order | Deterministic, no user preference bloat | II (Simple UX) ✅ |
| No Testing | Manual verification in dev mode | Constitution Principle V (non-negotiable) | V (No Testing) ✅ |

**Phase 0 Status**: ✅ COMPLETE - All unknowns resolved, no blockers for Phase 1.

