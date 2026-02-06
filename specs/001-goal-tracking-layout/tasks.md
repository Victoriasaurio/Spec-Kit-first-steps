# Implementation Tasks: DoIt Goal Tracking - Initial Page Setup

**Feature**: Goal Tracking Layout (001-goal-tracking-layout)  
**Branch**: `001-goal-tracking-layout` | **Date**: 2026-02-05  
**Plan Reference**: [plan.md](plan.md) | **Spec Reference**: [spec.md](spec.md)  
**Architecture**: Next.js 16.1.6 + React 19.2.3 + Tailwind CSS 4 + shadcn/ui + date-fns  

---

## Overview

This document provides the complete implementation task checklist for the DoIt Goal Tracking MVP. Tasks are organized by **user story** for independent implementation and testing. Each task is scoped to a single file and is independently verifiable.

**Testing Strategy**: ZERO automated tests (Constitution mandate). Manual verification workflows documented in [quickstart.md](quickstart.md).

---

## Phase 1: Project Setup & Infrastructure

### Setup Tasks (Non-Parallelizable - Prerequisites)

- [x] T001 Initialize Next.js project structure and verify dependencies in `package.json`
  - Verify: Next.js 16.1.6, React 19.2.3, TypeScript 5.x, Tailwind CSS 4, date-fns, nanoid, clsx, tailwind-merge
  - Ensure no test runners installed (no Jest, Vitest, Cypress, etc.)

- [x] T002 Initialize shadcn/ui components with `npx shadcn-ui@latest init`
  - Add Dialog, Button, Input components via CLI
  - Verify components available in `components/ui/`

- [x] T003 Configure Tailwind CSS `@theme` directive in `app/styles/globals.css`
  - Define `--colors-warning: #fef3c7` (pastel yellow for 3-1 days)
  - Define `--colors-critical: #fecaca` (pastel red for ≤0 days)
  - Include standard Tailwind directives: `@tailwind base`, `@tailwind components`, `@tailwind utilities`

- [x] T004 Create TypeScript configuration and types in `app/lib/types.ts`
  - Export Goal interface: `{ id: string; title: string; endDate: Date; createdAt: Date }`
  - Export GoalStatus type: `"active" | "warning" | "critical"`

- [x] T005 Create utility function `cn()` in `app/utils/cn.ts`
  - Use clsx + tailwind-merge pattern for safe class composition
  - Export default: `export function cn(...inputs: ClassValue[]): string`

- [x] T006 Create `app/lib/goalStorage.ts` module for localStorage operations
  - Export `loadActiveGoals(): Goal[]` — reads `doit_goals` key with fallback `[]`
  - Export `saveActiveGoals(goals: Goal[]): void` — writes to `doit_goals` key, handles QuotaExceededError
  - Export `loadCompletedGoals(): Goal[]` — reads `doit_completed` key with fallback `[]`
  - Export `saveCompletedGoals(goals: Goal[]): void` — writes to `doit_completed` key
  - Include error logging for parse failures

- [x] T007 Create `app/lib/goalUtils.ts` module for business logic
  - Export `daysRemaining(endDate: Date): number` — returns `differenceInDays(startOfDay(endDate), startOfDay(today))`
  - Export `isExpired(endDate: Date): boolean` — returns `daysRemaining(endDate) < 0`
  - Export `isToday(endDate: Date): boolean` — returns `daysRemaining(endDate) === 0`
  - Export `getVisualStatus(endDate: Date): GoalStatus` — returns "active" | "warning" (≤3 days) | "critical" (≤0 days)
  - Export `sortActiveGoals(goals: Goal[]): Goal[]` — sort by `daysRemaining` (ascending), then by `createdAt` (ascending)
  - Export `sortCompletedGoals(goals: Goal[]): Goal[]` — sort by `completedAt` (descending, newest first)
  - Export `validateGoal(title: string, endDate: Date): string | null` — validate title non-empty and endDate ≥ today

- [x] T008 Create `app/lib/dateFormatting.ts` module for date-fns wrappers
  - Export `formatDate(date: Date): string` — returns date in "MMM dd, yyyy" format (e.g., "Feb 05, 2026")
  - Export `formatCompletedDate(date: Date): string` — same as above
  - Export `daysRemainingDisplay(days: number): string` — returns "$days days left" (handle singular "1 day left")

- [x] T009 Update `app/layout.tsx` root layout with global styles
  - Import Tailwind directives from `app/styles/globals.css`
  - Add metadata: `{ title: "DoIt Goal Tracking", description: "Track and celebrate your goals" }`
  - Ensure responsive meta viewport tag present
  - Structure: HTML → body → {children}

---

## Phase 2: Foundational Components & State Management

### Core Component Infrastructure (Parallelizable - [P])

- [x] T010 [P] Create `app/components/EmptyState.tsx` component
  - Props: `{ type: "active" | "completed" }`
  - Render: Centered text message with contextual copy
  - Active: "No active goals. Click 'Add Goal' to get started!"
  - Completed: "No completed goals yet. Complete your first goal to celebrate your progress!"
  - Styling: `text-center py-12 text-gray-500`

- [x] T011 [P] Create `app/components/AddGoalButton.tsx` component
  - Props: `{ onClick: () => void }`
  - Render: Blue button with "+ Add Goal" text
  - Styling: `bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 px-4 font-semibold`
  - Accessibility: Focus-visible outline, 48px min touch target

- [x] T012 [P] Create `app/components/GoalCountdown.tsx` component
  - Props: `{ days: number; status: GoalStatus }`
  - Render: Badge showing "$days days left" (or "0 days left" for today)
  - Styling: Apply status color — default text-gray-600, warning text-yellow-700, critical text-red-700
  - Logic: Use `daysRemainingDisplay()` helper to format singular/plural

- [x] T013 [P] Create `app/components/ActiveGoalCard.tsx` component
  - Props: `{ goal: Goal; onCheck: (id: string) => void; onDelete: (id: string) => void }`
  - Render: Flexbox card with:
    - Left: Checkbox (h-5 w-5) + goal title (font-semibold) + GoalCountdown component
    - Right: Delete button (🗑️ or trash icon)
  - Styling: Border-left-4 (color by status), padding, rounded, shadow, hover:shadow-lg
  - Interactions: Checkbox triggers onCheck(goal.id), delete button triggers onDelete(goal.id)
  - Accessibility: Label associated with checkbox

- [x] T014 [P] Create `app/components/CompletedGoalCard.tsx` component
  - Props: `{ goal: Goal & { completedAt: Date }; onRestore: (id: string) => void; onDelete: (id: string) => void }`
  - Render: Flexbox card with:
    - Left: Goal title (line-through, text-gray-700) + "Completed: $date" subtitle
    - Right: Restore button (↻ or "Restore" text) + Delete button (🗑️)
  - Styling: `bg-gray-100 opacity-75 rounded-lg border`
  - Interactions: Restore button calls onRestore(goal.id), delete button calls onDelete(goal.id)

- [x] T015 [P] Create `app/components/GoalsList.tsx` component
  - Props: `{ goals: Goal[]; isCompleted?: boolean; onCheck?: (id: string) => void; onRestore?: (id: string) => void; onDelete: (id: string) => void }`
  - Render: Scrollable div with space-y-3 gap
  - Logic: Map goals array, render ActiveGoalCard or CompletedGoalCard based on `isCompleted` flag
  - Styling: `max-h-[600px] overflow-y-auto space-y-3`

- [x] T016 [P] Create `app/components/ActiveGoalsColumn.tsx` component
  - Props: `{ goals: Goal[]; onCheck: (id: string) => void; onDelete: (id: string) => void; onAddClick: () => void }`
  - Render: Column div with:
    - Header: "Active Goals" title + AddGoalButton
    - Body: If goals.length === 0 render EmptyState type="active", else GoalsList
  - Styling: `bg-white rounded-lg shadow p-6`

- [x] T017 [P] Create `app/components/CompletedGoalsColumn.tsx` component
  - Props: `{ goals: Goal[]; onRestore: (id: string) => void; onDelete: (id: string) => void }`
  - Render: Column div with:
    - Header: "Completed Goals" title
    - Body: If goals.length === 0 render EmptyState type="completed", else GoalsList
  - Styling: `bg-white rounded-lg shadow p-6`

---

## Phase 3: Modal & Form Component

### Add Goal Form (Non-Parallelizable - Modal Requires Validation)

- [x] T018 Create `app/components/AddGoalModal.tsx` component
  - Props: `{ open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (title: string, endDate: Date) => void }`
  - State: `{ title: string; endDate: Date | null; error: string | null }`
  - Render (using shadcn Dialog):
    - DialogContent with max-width 400px
    - DialogHeader with title "Add New Goal"
    - Form section with:
      - Label "Goal Title" + Input (placeholder: "e.g., Launch feature")
      - Label "End Date" + Input type="date"
      - Error message display (text-red-500 if error)
      - Button group: Cancel + Create
  - Validation (on submit):
    - Call `validateGoal(title, endDate)`
    - If error: set error state, show message
    - If valid: call `onSubmit(title, endDate)`, reset form, close modal
  - Interactions: Cancel button closes modal, Create button validates and submits
  - Accessibility: Dialog traps focus, inputs labeled, error announcements

---

## Phase 3a: User Story 1 - View Active Goals with Countdown (P1)

### US1: Display Active Goals with Real-Time Countdown

**Story Goal**: Users see all active goals displayed in left column with countdown timers, warning/critical states, and empty state messaging.

**Acceptance Criteria**:
- All active goals visible with title and days remaining
- Warning state (3-1 days, yellow) and critical state (≤0 days, red) visually applied
- Expired goals hidden from active column
- Empty state shown when no active goals
- Page loads in <2s, updates in <100ms

**Independent Test**: Load app with 3 active goals → verify left column displays all with correct days, colors, and empty state message.

**Implementation Tasks**:

- [x] T019 [US1] Implement goal loading from localStorage in `app/page.tsx`
  - useEffect hook: on mount, call `loadActiveGoals()` and `loadCompletedGoals()`
  - setGoals() and setCompletedGoals() with loaded data
  - Handle parse errors gracefully (show empty state)

- [x] T020 [US1] Create initial state and rendering in `app/page.tsx` home page
  - State: `const [goals, setGoals] = useState<Goal[]>([])`
  - State: `const [completedGoals, setCompletedGoals] = useState<Goal[]>([])`
  - Render: Two-column grid (grid-cols-1 md:grid-cols-2) with ActiveGoalsColumn + CompletedGoalsColumn
  - Pass sorted active goals to ActiveGoalsColumn: `sortActiveGoals(goals)`

- [x] T021 [P] [US1] Filter expired goals from display in `app/components/ActiveGoalsColumn.tsx`
  - Receive goals prop
  - Filter: only display goals where `daysRemaining(goal.endDate) >= 0`
  - Pass filtered list to GoalsList component

- [x] T022 [P] [US1] Apply visual warning/critical states in `app/components/ActiveGoalCard.tsx`
  - Compute `status = getVisualStatus(goal.endDate)` from goalUtils
  - Apply conditional styling:
    - `status === "warning"`: `bg-warning border-l-4` (yellow background)
    - `status === "critical"`: `bg-critical border-l-4` (red background)
    - default: `bg-white border-l-4 border-gray-300`
  - Use `cn()` utility for safe class merging

- [x] T023 [US1] Render empty state when no active goals in `app/components/ActiveGoalsColumn.tsx`
  - Condition: if `goals.filter(g => daysRemaining(g.endDate) >= 0).length === 0`
  - Render: `<EmptyState type="active" />`

---

## Phase 3b: User Story 2 - Manage Goal Completion (P1)

### US2: Mark Goals Complete & Move to Completed Column

**Story Goal**: Users can check goals off, move them to completed column (right), restore them to active (left), and see restore persist across page refresh.

**Acceptance Criteria**:
- Checkbox triggers move from active to completed column
- Completed goals show in right column, sorted newest first
- Restore button moves goal back to active, recalculates days
- Restore persists across page refresh
- Multiple completed goals display in correct order

**Independent Test**: Create goal → check it → verify moved to right column → restore → verify moved back to left → refresh page → verify remains in left.

**Implementation Tasks**:

- [x] T024 [US2] Implement checkbox completion handler in `app/page.tsx`
  - Function: `handleCheckGoal(id: string): void`
  - Logic:
    - Find goal in goals array by id
    - Create completedGoal with `...goal, completedAt: new Date()`
    - Add to completedGoals array
    - Remove from goals array
    - Call setGoals() and setCompletedGoals() (triggers localStorage sync)

- [x] T025 [US2] Implement restore handler in `app/page.tsx`
  - Function: `handleRestoreGoal(id: string): void`
  - Logic:
    - Find goal in completedGoals by id
    - Remove `completedAt` field
    - Add back to goals array
    - Remove from completedGoals array
    - Call setGoals() and setCompletedGoals()

- [x] T026 [US2] Add localStorage sync useEffect in `app/page.tsx`
  - Effect on [goals] dependency: `saveActiveGoals(goals)` after render
  - Effect on [completedGoals] dependency: `saveCompletedGoals(completedGoals)` after render
  - Ensures all state changes persist to localStorage

- [x] T027 [P] [US2] Implement checkbox handler in `app/components/ActiveGoalCard.tsx`
  - Checkbox onChange: call `onCheck(goal.id)`

- [x] T028 [P] [US2] Implement restore handler in `app/components/CompletedGoalCard.tsx`
  - Restore button onClick: call `onRestore(goal.id)`

- [x] T029 [US2] Sort completed goals by date in `app/components/CompletedGoalsColumn.tsx`
  - Pass sorted goals to GoalsList: `sortCompletedGoals(completedGoals)`
  - Ensure newest-first order (reverse chronological)

- [x] T030 [US2] Render empty state when no completed goals in `app/components/CompletedGoalsColumn.tsx`
  - Condition: if `completedGoals.length === 0`
  - Render: `<EmptyState type="completed" />`

---

## Phase 3c: User Story 3 - Delete Goals Permanently (P2)

### US3: Permanently Remove Goals with Confirmation

**Story Goal**: Users can delete any goal (active or completed) with confirmation dialog, and deletion persists across refresh.

**Acceptance Criteria**:
- Delete button (🗑️) visible on all goal cards
- Confirmation dialog shown on delete attempt
- Cancel keeps goal, confirm removes permanently
- Deleted goal absent after page refresh
- Works for both active and completed goals

**Independent Test**: Create goal → click delete → confirm → verify removed → refresh → verify not restored.

**Implementation Tasks**:

- [x] T031 [US3] Implement delete handler in `app/page.tsx`
  - Function: `handleDeleteGoal(id: string, isCompleted: boolean): void`
  - Logic:
    - If isCompleted: remove from completedGoals
    - Else: remove from goals
    - Call appropriate setState() (triggers localStorage sync)
    - Note: Confirmation dialog handled in component, this is post-confirm handler

- [x] T032 [US3] Add delete button to `app/components/ActiveGoalCard.tsx`
  - Button: Delete (🗑️ icon or text)
  - Styling: `text-red-500 hover:text-red-700 transition`
  - Interaction: onClick, call `onDelete(goal.id)`
  - Add onClick handler: show confirm() dialog → if confirmed call onDelete()

- [x] T033 [US3] Add delete button to `app/components/CompletedGoalCard.tsx`
  - Button: Delete (🗑️ icon or text)
  - Styling: `text-red-500 hover:text-red-700 transition`
  - Interaction: onClick, show confirm() dialog → if confirmed call `onDelete(goal.id)`

- [x] T034 [US3] Wire delete handlers in `app/page.tsx`
  - Pass `onDelete={handleDeleteGoal}` to both ActiveGoalsColumn and CompletedGoalsColumn
  - ActiveGoalsColumn passes to GoalsList, then to ActiveGoalCard
  - CompletedGoalsColumn passes to GoalsList, then to CompletedGoalCard

---

## Phase 3d: User Story 4 - Add New Goals via Modal Form (P2)

### US4: Create New Goals with Modal Form

**Story Goal**: Users can click "Add Goal" button, open modal form, enter title + date, create goal, and see it appear in active column.

**Acceptance Criteria**:
- "Add Goal" button opens modal form
- Modal has title input, date input, Create/Cancel buttons
- Form validates: title required, date ≥ today
- Valid submission creates goal in active column
- Form resets and closes after submit
- Today's date accepted (creates "0 days left" goal)
- Modal closes on Cancel or outside click

**Independent Test**: Click "Add Goal" → enter title + future date → click Create → verify appears in left column with correct days remaining.

**Implementation Tasks**:

- [x] T035 [US4] Add modal state to `app/page.tsx`
  - State: `const [addModalOpen, setAddModalOpen] = useState(false)`
  - Handler: `handleAddGoalClick = () => setAddModalOpen(true)`

- [x] T036 [US4] Implement goal creation handler in `app/page.tsx`
  - Function: `handleAddGoal(title: string, endDate: Date): void`
  - Logic:
    - Create Goal object: `{ id: nanoid(), title: title.trim(), endDate: startOfDay(endDate), createdAt: new Date() }`
    - Add to goals array
    - Call setGoals() (triggers localStorage sync)
    - Close modal: setAddModalOpen(false)

- [x] T037 [US4] Integrate AddGoalButton in `app/components/ActiveGoalsColumn.tsx`
  - Pass `onAddClick={handleAddClick}` prop from page.tsx
  - Render AddGoalButton with `onClick={onAddClick}`

- [x] T038 [US4] Integrate AddGoalModal in `app/page.tsx`
  - Render AddGoalModal after two-column grid
  - Props:
    - `open={addModalOpen}`
    - `onOpenChange={setAddModalOpen}`
    - `onSubmit={handleAddGoal}`

- [x] T039 [US4] Implement form validation in `app/components/AddGoalModal.tsx`
  - Title validation: `validateGoal()` helper checks non-empty and ≤200 chars
  - Date validation: `validateGoal()` checks endDate ≥ today (using startOfDay)
  - Display errors inline: error state shows message below inputs
  - Disable submit until valid (optional enhancement)

---

## Phase 4: Responsive Design & Styling Refinements

### Responsive Layout & Polish (Parallelizable - [P])

- [x] T040 [P] Implement two-column grid layout in `app/page.tsx`
  - Grid: `grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto`
  - Mobile (< 768px): stacked vertically (grid-cols-1)
  - Tablet/Desktop (≥ 768px): side-by-side (grid-cols-2)
  - Max-width container for comfortable reading on large screens

- [x] T041 [P] Style ActiveGoalsColumn and CompletedGoalsColumn containers
  - Card styling: `bg-white rounded-lg shadow p-6 h-fit` (sticky on desktop)
  - Header: `text-xl font-bold mb-4`
  - Ensure consistent padding and spacing

- [x] T042 [P] Apply Tailwind responsive typography in all components
  - Component titles: `text-lg sm:text-xl font-bold` (scales on mobile)
  - Goal titles: `font-semibold text-base` (readable at all sizes)
  - Captions: `text-xs sm:text-sm text-gray-600`

- [x] T043 [P] Ensure all buttons meet 48px touch target minimum
  - Buttons: `h-10 px-4` (Tailwind defaults to 40px, add px padding for 48px+ touch area)
  - Checkbox: `h-5 w-5` with parent padding to 48px
  - Test on mobile device or DevTools device emulation

- [x] T044 [P] Implement focus and hover states for accessibility
  - All buttons: `focus-visible:outline-2 focus-visible:outline-offset-2`
  - All inputs: `focus-visible:ring-2 focus-visible:ring-blue-500`
  - Hover states: `hover:bg-opacity-90 transition` for visual feedback

- [x] T045 [P] Apply color theming using Tailwind @theme tokens
  - Warning state (3-1 days): `bg-warning` or `border-warning` (pastel yellow #fef3c7)
  - Critical state (≤0 days): `bg-critical` or `border-critical` (pastel red #fecaca)
  - Verify Tailwind CSS 4 resolves @theme colors correctly in dev and build

---

## Phase 5: Integration & Cross-Cutting Concerns

### Final Integration & Manual Testing Setup (Non-Parallelizable)

- [x] T046 Verify page.tsx component tree structure
  - Root element: `<div className="min-h-screen bg-gray-50 p-6">`
  - Children: Grid container, AddGoalModal
  - All state and handlers properly threaded to child components
  - All callbacks connected (onCheck, onDelete, onRestore, onAdd)

- [x] T047 Test localStorage persistence across page refresh
  - Manually test: Create 3 goals → refresh → verify all 3 restored
  - Test: Check 1 goal → refresh → verify moved to completed, persists
  - Test: Delete 1 goal → refresh → verify deleted (not restored)
  - Test: Restore 1 goal → refresh → verify remains restored

- [x] T048 Test responsive layout on mobile/tablet/desktop
  - Mobile (<480px): Columns stacked, text readable, buttons tappable
  - Tablet (768px): Columns side-by-side, comfortable spacing
  - Desktop (>1024px): Max-width container, balanced layout
  - Use DevTools device emulation or real device

- [x] T049 Test form validation flows
  - Empty title → error "Goal title is required"
  - Past date → error "End date must be in the future or today"
  - Today's date → accepted (creates "0 days left" goal)
  - Valid submission → goal appears in left column, modal closes

- [x] T050 Test warning/critical state calculations
  - Goal ending tomorrow: 1 day left → yellow warning
  - Goal ending today: 0 days left → red critical
  - Goal ending 10 days away: 10 days left → default white
  - Goal expired: hidden from active column

- [x] T051 Test goal completion flow end-to-end
  - Create goal → checkbox moves to right column → restore button returns to left → delete removes from both

- [x] T052 Test accessibility: keyboard navigation
  - Tab through all buttons, inputs, checkboxes
  - Focus visible on all interactive elements
  - Modals trap focus, can exit with Escape
  - Screen reader: labels associated with inputs

- [x] T053 Test performance with 50+ goals
  - Create/load 50+ goals in localStorage
  - Verify UI renders without lag (<100ms state update)
  - Verify scroll performance smooth (60 fps)
  - Verify interactions responsive (checkbox, delete, restore)

- [x] T054 Verify Constitution compliance in final code
  - **I. Clean Code**: Variable names clear, functions single-purpose, comments explain why
  - **II. Simple UX**: Two-column layout intuitive, actions obvious, errors plain language
  - **III. Responsive Design**: Works on mobile/tablet/desktop, touch targets ≥48px
  - **IV. Minimal Dependencies**: Only shadcn/ui, date-fns, Tailwind CSS used
  - **V. No Testing**: Zero test files, zero test runners, manual verification only

- [x] T055 Perform final manual testing using quickstart.md workflows
  - Workflow 1: Create goal (expected: appears in left column)
  - Workflow 2: Mark complete (expected: moves to right column)
  - Workflow 3: Restore (expected: returns to left, persists after refresh)
  - Workflow 4: Delete (expected: permanently removed, doesn't reappear)
  - Workflow 5: Warning/critical states (expected: correct colors applied)
  - Workflow 6: Empty states (expected: helpful messages shown)
  - Workflow 7: Responsive (expected: adapts to all sizes)
  - Workflow 8: Validation (expected: errors shown for invalid inputs)
  - Workflow 9: Persistence (expected: all data survives refresh)
  - Workflow 10: Performance (expected: 50+ goals remain responsive)

---

## Dependency Graph & Execution Strategy

### Sequential Dependencies

```
Phase 1 (Setup) MUST complete first:
T001-T009: Infrastructure (types, storage, utils, globals, layout)

↓

Phase 2 (Foundation) DEPENDS ON Phase 1:
T010-T017: Reusable components (can run in parallel [P])

↓

Phase 3a-d (User Stories) DEPENDS ON Phase 2:
T019-T039: Story-specific handlers and integrations
    - US1 (T019-T023): Display active goals with states
    - US2 (T024-T030): Manage completion and restore
    - US3 (T031-T034): Delete with confirmation
    - US4 (T035-T039): Add goals via modal

↓

Phase 4 (Styling) CAN RUN PARALLEL with Phase 3 (once Phase 2 complete):
T040-T045: Responsive design and polish [P]

↓

Phase 5 (Integration & Testing) LAST:
T046-T055: Final wiring and manual verification
```

### Parallelization Opportunities

**Parallel Sets** (can develop simultaneously after dependencies resolved):

1. **Phase 2 Component Set** [Can start after T001-T009]:
   - T010, T011, T012, T013, T014, T015, T016, T017 (all independent components)

2. **Phase 3 Story Implementation** [Can interleave]:
   - US1 tasks (T019-T023) independent from US2 (T024-T030), US3 (T031-T034), US4 (T035-T039)
   - Developers can tackle different stories in parallel

3. **Phase 4 Styling** [Can run after Phase 2]:
   - T040-T045 all independent, can be developed in any order

### Recommended Development Sequence (MVP-First)

**Day 1: Setup & Foundation**
- T001-T009 (infrastructure, must complete)
- T010-T017 (reusable components, parallel after T009)

**Day 2: Core User Stories**
- T019-T023 (US1: view active goals with countdown)
- T024-T030 (US2: mark complete / restore)

**Day 3: Secondary Features & Polish**
- T031-T034 (US3: delete)
- T035-T039 (US4: add goals modal)
- T040-T045 (responsive styling)

**Day 4: Integration & Validation**
- T046-T055 (final wiring, manual testing, verification)

---

## Task Format Specification

### Checklist Format (REQUIRED)

Every task follows this format:

```
- [x] [TaskID] [Optional: P] [Optional: Story] Description with file path
```

**Format Components**:

| Component | Example | Required |
|-----------|---------|----------|
| Checkbox | `- [ ]` | YES |
| Task ID | T001 | YES |
| Parallelizable | `[P]` | NO (only if parallelizable) |
| User Story | `[US1]` | NO (only for story phase tasks) |
| Description + Path | `Initialize Next.js project structure in package.json` | YES |

**Format Examples**:
- ✅ `- [ ] T001 Initialize Next.js project structure and verify dependencies in package.json`
- ✅ `- [ ] T010 [P] Create EmptyState component in app/components/EmptyState.tsx`
- ✅ `- [ ] T019 [US1] Implement goal loading from localStorage in app/page.tsx`
- ✅ `- [ ] T040 [P] Implement two-column grid layout in app/page.tsx`

---

## Success Criteria for Task Completion

Each task is complete when:

1. **Code written**: File created/modified with full implementation (no TODOs)
2. **No syntax errors**: TypeScript compiler passes, no red squiggles in IDE
3. **Follows structure**: File in correct location, follows naming conventions
4. **Integrated**: Wired into parent components, handlers connected
5. **Manually verified**: Tested via npm run dev → manual workflow (not automated)
6. **Constitution compliant**: Code aligns with principles I-V

---

## Manual Testing Coverage

Since ZERO automated tests are mandated, manual testing is the quality gate. Refer to [quickstart.md](quickstart.md) for 10 comprehensive manual workflows covering:

1. Goal Creation → Appearance in Active Column
2. Goal Completion → Movement to Completed Column
3. Goal Restoration → Return to Active Column + Persistence
4. Goal Deletion → Permanent Removal (no reappear)
5. Warning/Critical States → Correct Visual Styling
6. Empty States → Contextual Messages
7. Responsive Layout → Mobile/Tablet/Desktop Adaptation
8. Form Validation → Error Messages for Invalid Input
9. localStorage Persistence → Data Survives Page Refresh
10. Performance → 50+ Goals Remain Responsive

---

## Handoff & Merge

Upon completion of all tasks:

1. **Code Review**: Verify Constitution compliance (Principles I-V)
2. **Manual Testing**: Run all 10 workflows in quickstart.md ✅ pass
3. **Commit**: Push to branch `001-goal-tracking-layout` with descriptive message
4. **PR**: Open pull request with reference to spec.md, plan.md, and task checklist
5. **Merge**: Squash and merge to main after review approval

---

## Summary

**Total Tasks**: 55  
**Setup Tasks** (Phase 1): 9  
**Foundation Components** (Phase 2): 8  
**User Story Tasks** (Phase 3): 21  
**Styling & Polish** (Phase 4): 6  
**Integration & Testing** (Phase 5): 10  

**Parallelizable Tasks**: ~30+ (marked with [P])  
**Testing Strategy**: Manual verification only (Constitution mandate V)  
**Estimated Duration**: 3-4 days for experienced developer (single-threaded)  
**Technology Stack**: TypeScript 5.x, Next.js 16.1.6, React 19.2.3, Tailwind CSS 4, shadcn/ui, date-fns  

