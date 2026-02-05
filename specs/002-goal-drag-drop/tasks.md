# Tasks: Goal Drag-and-Drop Reordering

**Input**: Design documents from `/specs/002-goal-drag-drop/`
**Branch**: `002-goal-drag-drop`
**Date**: February 5, 2026

**Tests**: NO TESTING ALLOWED - Constitution Principle V mandates zero automated tests (no unit, integration, or e2e tests). Manual verification is the sole quality gate.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Each task follows the format: `[ID] [P?] [Story] Description with file path`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and type system updates

- [ ] T001 Install Sortable.js library: `npm install --save sortablejs` and `npm install --save-dev @types/sortablejs`
- [ ] T002 [P] Update Goal type in `app/lib/types.ts` to add `order: number` and `syncStatus?: 'synced' | 'pending-sync'` fields
- [ ] T003 [P] Update Tailwind CSS configuration for drag-and-drop visual states (add custom classes for `sortable-drag`, `sortable-ghost`)
- [ ] T004 [P] Create `app/lib/dragDropHelpers.ts` utility file for Sortable.js configuration and event handler setup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core storage and sync infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Implement `getGoalsOrdered(listType)` in `app/lib/goalStorage.ts` to retrieve ordered goals from localStorage
- [ ] T006 Implement `reorderGoals(goalIds, listType)` in `app/lib/goalStorage.ts` with sequential renumbering logic
- [ ] T007 Implement `moveGoal(goalId, newPosition, listType)` helper in `app/lib/goalStorage.ts` (delegates to reorderGoals)
- [ ] T008 Implement offline queue system in `app/lib/goalStorage.ts`: `queueReorderOperation()` and `syncPendingReorders()` functions
- [ ] T009 [P] Create `app/lib/crossTabSync.ts` with `initializeCrossTabSync()` to detect and broadcast storage changes across tabs
- [ ] T010 [P] Create `app/lib/screenReaderAnnouncements.ts` with `announceToScreenReader()` utility for keyboard navigation feedback
- [ ] T011 Update `app/lib/goalStorage.ts` to initialize cross-tab sync and online/offline listeners on module load
- [ ] T012 Add migration function in `app/lib/goalStorage.ts` to auto-add `order` field to existing goals without order (run on first app load)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Reorder Active Goals (Priority: P1) 🎯 MVP

**Goal**: Enable users to drag active goal cards to reorder them by priority, with visual feedback and persistence

**Independent Test**: Open app with 2+ active goals, drag one goal above/below another, verify order changes immediately on screen and persists after page refresh

### ⚠️ NO AUTOMATED TESTING

Per Constitution Principle V, NO automated tests of any kind are permitted. Manual verification by running `npm run dev` and testing features manually is the required quality gate.

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create `app/components/DraggableGoalsList.tsx` component that wraps Sortable.js with props: `goals`, `onReorder`, `listType`, `className`, `isSyncing`, `isDisabled`
- [ ] T014 [P] [US1] Implement Sortable.js initialization in DraggableGoalsList.tsx: `useEffect` hook that creates Sortable instance with `ghostClass`, `dragClass`, event handlers
- [ ] T015 [P] [US1] Add visual feedback CSS in `app/styles/globals.css` for Sortable.js classes: `.sortable-drag` (scale-105, shadow-xl, opacity-75), `.sortable-ghost` (opacity-50, bg-slate-100)
- [ ] T016 [US1] Modify `app/components/ActiveGoalsColumn.tsx` to use DraggableGoalsList instead of static GoalsList, pass `onReorder` handler
- [ ] T017 [US1] Implement `handleReorderActive()` callback in `app/components/GoalsList.tsx` that calls `reorderGoals()` from goalStorage
- [ ] T018 [US1] Add `useEffect` hook in GoalsList to load active goals on mount: `getGoalsOrdered('active')` → setActiveGoals
- [ ] T019 [P] [US1] Add ARIA attributes to DraggableGoalsList: `role="list"`, goal cards with `role="listitem"`, `tabindex="0"`, `aria-label`, `aria-describedby` for keyboard help text
- [ ] T020 [P] [US1] Implement keyboard accessibility in DraggableGoalsList: detect Arrow Up/Down keys (with Shift modifier), call `moveGoal()`, announce changes to screen readers
- [ ] T021 [US1] Handle Escape key during keyboard move: cancel move, restore original position, keep focus on goal
- [ ] T022 [US1] Verify drag events don't propagate between active and completed lists (FR-007): add data attribute `data-list-type="active"` to list container
- [ ] T023 [US1] Manual verification: Run `npm run dev`, test Acceptance Scenarios 1–5 from spec.md for User Story 1
  - [ ] Drag Goal C above Goal A: verify order changes to [C, A, B]
  - [ ] Refresh page: verify order persists
  - [ ] Hover during drag: verify insertion line appears
  - [ ] Press Escape: verify original order restored
  - [ ] Tab + Shift+Up + Enter: verify keyboard reorder works

**Checkpoint**: User Story 1 complete and independently testable

---

## Phase 4: User Story 3 - Visual Feedback During Drag (Priority: P1)

**Goal**: Provide clear visual cues during drag operations so users understand what will happen

**Independent Test**: Initiate drag on active goal, verify: (a) card elevates with shadow, (b) insertion indicator line appears, (c) cursor changes, (d) all feedback clears on drop

### ⚠️ NO AUTOMATED TESTING

Per Constitution Principle V, NO automated tests are permitted. Manual verification is required.

### Implementation for User Story 3

- [ ] T024 [P] [US3] Add drag-over insertion indicator in DraggableGoalsList: create `.insertion-line` element with `border-t-2 border-blue-500` that appears on Sortable.js `onMove` event
- [ ] T025 [P] [US3] Update `app/styles/globals.css` with `.sortable-drag` class styling: `@apply scale-105 shadow-xl opacity-75 cursor-grabbing transition-transform;`
- [ ] T026 [P] [US3] Update `app/styles/globals.css` with `.sortable-ghost` class styling: `@apply opacity-50 bg-slate-100;`
- [ ] T027 [US3] Update goal card styling in ActiveGoalCard.tsx: add `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-md transition-shadow` for hover/focus states
- [ ] T028 [US3] Add cursor feedback: set `cursor-grab` on normal state, `cursor-grabbing` during drag (via Sortable.js dragClass)
- [ ] T029 [US3] Verify drag feedback is responsive: test on mobile (DevTools emulation) and desktop; shadow/scale visible on both
- [ ] T030 [US3] Manual verification: Run `npm run dev`, test Acceptance Scenarios 1–3 from spec.md for User Story 3
  - [ ] Start drag on active goal: card elevates, shadow appears
  - [ ] Hover over drop zones: insertion line appears
  - [ ] End drag or press Escape: visual feedback clears

**Checkpoint**: Visual feedback complete; User Stories 1 & 3 working together

---

## Phase 5: User Story 2 - Reorder Completed Goals (Priority: P2)

**Goal**: Enable reordering of completed goals independently from active goals

**Independent Test**: Drag a completed goal to new position, verify order changes and persists, and doesn't affect active goals order

### ⚠️ NO AUTOMATED TESTING

Per Constitution Principle V, NO automated tests are permitted. Manual verification is required.

### Implementation for User Story 2

- [ ] T031 [P] [US2] Modify `app/components/CompletedGoalsColumn.tsx` to use DraggableGoalsList component (same as active goals but with `listType="completed"`)
- [ ] T032 [P] [US2] Implement `handleReorderCompleted()` callback in `app/components/GoalsList.tsx` that calls `reorderGoals(..., 'completed')`
- [ ] T033 [US2] Add `useEffect` hook in GoalsList to load completed goals on mount: `getGoalsOrdered('completed')` → setCompletedGoals
- [ ] T034 [US2] Verify completed goals list uses independent localStorage key `goals:completed` (separate from `goals:active`)
- [ ] T035 [US2] Verify Sortable.js on completed list prevents dragging to/from active list: both lists configured with separate sort groups or handle validation
- [ ] T036 [US2] Manual verification: Run `npm run dev`, test Acceptance Scenarios 1–2 from spec.md for User Story 2
  - [ ] Drag completed goal to new position: verify completed goals reorder
  - [ ] Refresh page: verify completed goals order persists separately from active goals
  - [ ] Verify active goals order unchanged by completed goals reorder

**Checkpoint**: User Stories 1, 2, 3 all working independently

---

## Phase 6: Cross-Tab Sync & Offline Support

**Goal**: Enable goal reordering offline and synchronization across browser tabs

**Independent Test**: Reorder offline, verify saved locally; disconnect internet, reorder, reconnect, verify sync; open 2 tabs, reorder in one, verify other detects change

### ⚠️ NO AUTOMATED TESTING

Per Constitution Principle V, NO automated tests are permitted. Manual verification is required.

### Implementation for Cross-Tab Sync & Offline

- [ ] T037 [P] [US1] Initialize online/offline event listeners in GoalsList: `window.addEventListener('online', syncPendingReorders)`, `window.addEventListener('offline', ...)`
- [ ] T038 [P] [US1] Call `initializeCrossTabSync()` in GoalsList `useEffect` with callback to reload goals when storage changes detected from other tabs
- [ ] T039 [US1] Implement toast notification component in `app/components/ToastNotification.tsx` (or use existing if available) for cross-tab sync alerts
- [ ] T040 [US1] Show toast "Goals updated in another tab" when storage event fires for `goals:active` or `goals:completed` keys
- [ ] T041 [P] [US1] Update reorderGoals() in goalStorage.ts to check `navigator.onLine` and set `syncStatus: 'pending-sync'` if offline
- [ ] T042 [US1] Update reorderGoals() to call `queueReorderOperation()` if offline (add to sync queue)
- [ ] T043 [US1] Implement `syncPendingReorders()` function in goalStorage.ts to process queue on reconnection (Phase 2 backend integration deferred)
- [ ] T044 [US1] Manual verification: Test offline scenario
  - [ ] DevTools Network → Offline, reorder a goal, check localStorage.reorder-queue
  - [ ] Go online, observe sync completes, queue clears
- [ ] T045 [US1] Manual verification: Test cross-tab sync
  - [ ] Open app in 2 tabs, reorder in Tab A, observe Tab B updates and shows toast

**Checkpoint**: All core functionality (US1, US2, US3) + offline + cross-tab sync working

---

## Phase 7: Accessibility & Mobile Testing

**Goal**: Ensure WCAG 2.1 AA compliance and touch device parity

**Independent Test**: Keyboard-only navigation works, screen reader announces goal positions, touch drag works on mobile, responsive layout on all breakpoints

### ⚠️ NO AUTOMATED TESTING

Per Constitution Principle V, NO automated tests are permitted. Manual verification with screen reader is required.

### Implementation for Accessibility & Mobile

- [ ] T046 [P] [US1] Verify ARIA live region announcements: create sr-only div with `role="status"`, `aria-live="polite"` in DraggableGoalsList
- [ ] T047 [P] [US1] Call `announceToScreenReader()` when drag starts, when position changes, when confirmed (e.g., "Goal moved to position 2 of 5")
- [ ] T048 [P] [US1] Test keyboard navigation in DraggableGoalsList: Tab moves focus, Arrow Up/Down within list, Shift+Arrow moves goal, Enter confirms
- [ ] T049 [US1] Verify focus indicator is visible (ring-2, ring-blue-500) and contrasts against background (AA minimum 3:1)
- [ ] T050 [US1] Verify touch drag works on mobile (DevTools device emulation): single-finger drag initiates reorder, insertion indicator visible
- [ ] T051 [P] [US1] Test responsive layout: mobile (375px), tablet (768px), desktop (1024px+); DraggableGoalsList layout functional at all breakpoints
- [ ] T052 [P] [US1] Verify cursor styles responsive: show grab cursor on non-touch devices, hide on touch (media query `@media (hover: hover)`)
- [ ] T053 [US1] Manual verification: Test with screen reader (NVDA on Windows, VoiceOver on Mac)
  - [ ] Tab to goal card, screen reader reads "Goal: [title], Position [n] of [total]"
  - [ ] Press Shift+Up, screen reader announces "Goal moved to position [n]"
  - [ ] Press Enter, screen reader confirms "Move confirmed"
- [ ] T054 [US1] Manual verification: Test on mobile device or DevTools emulation
  - [ ] Drag goal with single finger, reorder succeeds
  - [ ] Visual feedback appears
  - [ ] Layout remains functional

**Checkpoint**: Full accessibility and mobile support verified

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, performance optimization, and cross-story consistency

- [ ] T055 [P] Review `app/lib/goalStorage.ts` for code clarity: descriptive variable names, concise functions, comments explain *why* not *what*
- [ ] T056 [P] Review `app/components/DraggableGoalsList.tsx` for Clean Code principles: <50 lines per function, single responsibility
- [ ] T057 [P] Verify all Tailwind CSS classes in `app/styles/globals.css` are used and no dead code (search codebase for class names)
- [ ] T058 [P] Optimize responsive design: use Tailwind breakpoints (`md:`, `lg:`) for desktop-specific feedback (larger shadows, more prominent borders)
- [ ] T059 Test performance: reorder in list of 50+ goals, verify <1 second completion (SC-006 target)
- [ ] T060 Final manual verification: Run `npm run dev` and test all features end-to-end
  - [ ] Create 5+ active and 3+ completed goals
  - [ ] Reorder active goals by drag, verify persists after refresh
  - [ ] Reorder completed goals, verify independent from active
  - [ ] Test keyboard: Tab + Shift+Arrow + Enter on both lists
  - [ ] Go offline, reorder, go online, verify sync
  - [ ] Open 2 tabs, reorder in one, verify other updates
  - [ ] Test on mobile (DevTools emulation): touch drag, responsive layout
- [ ] T061 Run quickstart.md validation: follow steps in quickstart.md exactly, verify all code examples work
- [ ] T062 Update README.md or docs with screenshot/GIF of drag-and-drop feature (if desired)
- [ ] T063 Create PR with all changes, reference spec.md, plan.md, tasks.md in PR description
- [ ] T064 Code review checklist:
  - [ ] No automated tests (Constitution Principle V)
  - [ ] All tasks marked complete with verification
  - [ ] Clean code principles followed
  - [ ] Responsive design verified on 3+ breakpoints
  - [ ] Accessibility verified with keyboard + screen reader
  - [ ] Offline scenario tested
  - [ ] Cross-tab sync tested
  - [ ] All user stories independently testable

**Checkpoint**: Feature complete, tested manually, ready for merge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3–5)**: All depend on Foundational completion
  - Can run in priority order (P1 → P3 → P2) or all in parallel if team capacity
- **Cross-Tab Sync & Offline (Phase 6)**: Depends on user stories; enhances all
- **Accessibility (Phase 7)**: Tests all user stories for A11y compliance
- **Polish (Phase 8)**: Final integration, depends on all prior phases

### User Story Dependencies

- **US1 (Reorder Active Goals, P1)**: Start after Foundational - No dependencies on other stories (MVP)
- **US3 (Visual Feedback, P1)**: Start after Foundational - Enhances US1, independently testable
- **US2 (Reorder Completed Goals, P2)**: Start after Foundational - No dependencies on US1/US3 (independent list)
- **US4 (Undo, P3)**: DEFERRED - Not in this release (can implement after MVP is shipped)

### Within Each Phase

- All [P] tasks can run in parallel (different files, no dependencies)
- Sequential tasks must wait for prior task completion
- Checkpoint after each user story to validate independently

### Parallel Opportunities

**Setup Phase**: All [P] tasks (T001, T002, T003, T004) can run in parallel
- T001: Install npm package
- T002: Update types
- T003: Update Tailwind config
- T004: Create utility file

**Foundational Phase**: T005–T008 must run sequentially (storage layer dependencies), T009–T010 [P] can run in parallel
- T005: Implement getGoalsOrdered
- T006: Implement reorderGoals (depends on T005)
- T007: Implement moveGoal (depends on T006)
- T008: Implement sync queue (depends on T006)
- T009: Create crossTabSync (parallel)
- T010: Create screenReader utilities (parallel)

**User Stories**: Once Foundational complete, all story implementation can run in parallel by different developers
- Dev A: US1 (T013–T023)
- Dev B: US3 (T024–T030, can start after T013)
- Dev C: US2 (T031–T036, independent)

**Cross-Tab & Offline (Phase 6)**: Can run in parallel after US1
- T037–T045 enhance all user stories

**Accessibility (Phase 7)**: Can run in parallel with Phase 6
- T046–T054 verify all user stories

---

## Implementation Strategy

### MVP-First Approach (Recommended)

1. **Complete Setup (Phase 1)** → ~1 hour
2. **Complete Foundational (Phase 2)** → ~1–2 hours (BLOCKS all stories, do first)
3. **Complete User Story 1 (Phase 3)** → ~2–3 hours (core drag-and-drop on active goals)
4. **STOP and VALIDATE**: Test US1 manually in dev server ✅
5. **DEPLOY/DEMO**: Show working MVP to stakeholders (reorder active goals works!)
6. **Continue**: Add US3 + US2 + Offline/Cross-Tab (phases 4–6) → ~2–3 hours each
7. **Final Polish**: Accessibility + final verification (phase 7–8) → ~1–2 hours

**Total Time**: ~8–14 hours (dev + manual verification)

### Parallel Team Approach (3+ developers)

1. All developers: Setup + Foundational together (~2–3 hours)
2. Split work:
   - Dev A: US1 (T013–T023)
   - Dev B: US3 (T024–T030)
   - Dev C: US2 (T031–T036)
3. Dev A completes US1 first → integrate US3 (both P1)
4. All: Cross-tab/Offline (Phase 6) together
5. All: Accessibility testing (Phase 7)
6. All: Polish & PR review (Phase 8)

**Total Time**: ~6–10 hours (parallel development)

---

## Manual Verification Checklist (Pre-Merge)

### User Story 1 - Reorder Active Goals
- [ ] Open app with 3+ active goals
- [ ] Drag goal C above goal A: order becomes [C, A, B] ✓
- [ ] Refresh page: order [C, A, B] persists ✓
- [ ] Drag goal again: visual feedback (shadow, scale) visible ✓
- [ ] Press Escape during drag: revert to original order ✓
- [ ] Tab to goal + Shift+Up Arrow + Enter: keyboard reorder works ✓

### User Story 3 - Visual Feedback
- [ ] Start drag: card elevates, shadow appears ✓
- [ ] Hover over drop zones: insertion line appears ✓
- [ ] Stop dragging: visual feedback clears ✓

### User Story 2 - Reorder Completed Goals
- [ ] Complete a goal (move to completed list)
- [ ] Reorder completed goal: order changes ✓
- [ ] Verify active goals order unchanged ✓
- [ ] Refresh: completed order persists separately ✓

### Cross-Tab Sync
- [ ] Open app in 2 browser tabs
- [ ] Reorder in Tab A
- [ ] Tab B automatically updates ✓
- [ ] Toast notification appears in Tab B ✓

### Offline Reordering
- [ ] DevTools Network → Offline
- [ ] Reorder a goal (should work locally) ✓
- [ ] Check localStorage: `reorder-queue` has pending operation ✓
- [ ] Go online (Network → No throttling)
- [ ] Observe sync processes (queue clears) ✓

### Accessibility
- [ ] Tab to goal: focus visible ✓
- [ ] Screen reader reads: "Goal: [title], Position [n] of [total]" ✓
- [ ] Shift+Up arrow: goal moves, reader announces new position ✓
- [ ] Touch device (DevTools emulation): single-finger drag works ✓

### Responsive Design
- [ ] Mobile (375px): layout functional, touch drag works ✓
- [ ] Tablet (768px): layout responsive, shadows visible ✓
- [ ] Desktop (1024px+): full visual feedback ✓

### Performance
- [ ] Reorder in list of 50+ goals: completes in <1 second ✓

---

## Notes

- **[P] tasks**: Can run in parallel (different files, no interdependencies)
- **[Story] label**: Maps task to user story (US1, US2, US3) for traceability
- **No tests**: Zero automated tests per Constitution (manual verification only)
- **Commit strategy**: Commit after each Phase or logical task group
- **Stop points**: Checkpoint after each user story to validate independently
- **Sign-off**: Update this tasks.md with ✅ completion and timestamp after manual verification
- **Avoid**: Vague tasks, cross-story dependencies that break independence, test code

---

## Task Completion Tracking

Use this section to mark progress:

**Phase 1 (Setup)**:
- [ ] T001–T004 Complete

**Phase 2 (Foundational)**:
- [ ] T005–T012 Complete

**Phase 3 (US1 - Active Goals)**:
- [ ] T013–T023 Complete, Manual Verification Passed ✅

**Phase 4 (US3 - Visual Feedback)**:
- [ ] T024–T030 Complete, Manual Verification Passed ✅

**Phase 5 (US2 - Completed Goals)**:
- [ ] T031–T036 Complete, Manual Verification Passed ✅

**Phase 6 (Offline & Cross-Tab)**:
- [ ] T037–T045 Complete, Manual Verification Passed ✅

**Phase 7 (Accessibility)**:
- [ ] T046–T054 Complete, Manual Verification Passed ✅

**Phase 8 (Polish)**:
- [ ] T055–T064 Complete, PR Ready for Merge ✅

---

**Ready for Implementation**: All tasks defined, prerequisites clear, dependencies documented.
