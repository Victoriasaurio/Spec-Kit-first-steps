# Implementation Plan: Goal Drag-and-Drop Reordering

**Branch**: `002-goal-drag-drop` | **Date**: February 5, 2026 | **Spec**: [spec.md](spec.md)

## Summary

Enable users to reorder their personal active and completed goals via drag-and-drop (mouse/touch) and keyboard navigation (Arrow + Shift + Enter). The feature persists reorder changes immediately to localStorage, supports offline-first reordering with automatic sync, and provides visual feedback during drag operations. Implementation uses the **Sortable.js** library for drag-and-drop interactions and **Tailwind CSS** for visual styling and feedback states. Priority: P1 (active goal reordering + visual feedback) and P2 (completed goal reordering) only; P3 (undo) deferred to post-MVP.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 16.1.6)  
**Primary Dependencies**: React 19.2.3, Tailwind CSS 4, **Sortable.js** (drag-and-drop library)  
**Storage**: localStorage (primary), backend sync planned for future phases  
**Testing**: NONE - Constitution mandates no automated tests (manual verification only)  
**Target Platform**: Web (Browser, responsive design - desktop mouse + mobile touch)  
**Project Type**: Next.js App Router single-user web application  
**Performance Goals**: Reorder operation completes in under 1 second (SC-006); list supports 10+ goals without degradation (SC-001)  
**Constraints**: 
- Offline-capable: reordering works without internet; syncs when connection restored
- Keyboard accessible: full WCAG compliance for keyboard-only users (FR-009)
- Cross-tab aware: detects and notifies when another tab reorders goals (FR-011)  
**Scale/Scope**: Single user, 2 independent goal lists (active + completed), max 100 goals per list (assumed reasonable per typical goal-tracking apps)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Code | ✅ PASS | Component names are descriptive; sortable library abstracts complexity; Tailwind utility classes keep styling readable |
| II. Simple UX | ✅ PASS | Drag-and-drop is intuitive; visual feedback (elevated card + insertion indicator) is clear; keyboard shortcuts match WCAG patterns |
| III. Responsive Design | ✅ PASS | Sortable.js handles mouse + touch natively; Tailwind responsive utilities ensure mobile/tablet/desktop parity |
| IV. Minimal Dependencies | ⚠️ PASS (NEW DEPENDENCY) | Adding **Sortable.js** (13.4 KB minified) is justified: it's the industry-standard for drag-and-drop, avoids reinventing low-level drag event handling; Minimal.Dependencies principle evaluated and accepted |
| V. No Testing | ✅ PASS | Plan includes zero test files, zero test frameworks, zero test specifications; manual verification only (see Verification section below) |

**Dependency Justification (Sortable.js)**:
- **Rationale**: Building accessible drag-and-drop from scratch requires handling mouse events, touch events, keyboard accessibility, viewport calculations, and browser edge cases. Sortable.js is 13.4 KB and eliminates 200+ lines of custom code.
- **Alternative Rejected**: Reimplementing drag-and-drop logic (native React hooks + onMouseDown/onTouchStart/onDragOver) would be 3–4x more code, harder to maintain, and more error-prone for accessibility.
- **Trade-off Accepted**: Single, well-maintained external library < custom implementation complexity.

## Project Structure

### Documentation (this feature)

```text
specs/002-goal-drag-drop/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # [Phase 0] Technical research
├── data-model.md        # [Phase 1] Data model and schema
├── contracts/           # [Phase 1] API/component contracts
│   └── drag-drop-api.md
├── quickstart.md        # [Phase 1] Developer quickstart
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # [Phase 2 / next command] Implementation tasks
```

### Source Code (repository root)

```text
app/
├── layout.tsx                    # Root layout
├── page.tsx                      # Home page (goals list)
├── components/
│   ├── GoalsList.tsx            # Main goals container (MODIFIED)
│   ├── ActiveGoalsColumn.tsx    # Active goals wrapper (MODIFIED)
│   ├── CompletedGoalsColumn.tsx # Completed goals wrapper (MODIFIED)
│   ├── ActiveGoalCard.tsx       # Individual goal card (MODIFIED for drag states)
│   ├── CompletedGoalCard.tsx    # Individual goal card (MODIFIED for drag states)
│   ├── DraggableGoalsList.tsx   # [NEW] Sortable.js integration wrapper
│   ├── GoalReorderObserver.tsx  # [NEW] Cross-tab sync observer
│   └── ... (other existing components)
├── lib/
│   ├── types.ts                 # [MODIFIED] Add order field to Goal type
│   ├── goalStorage.ts           # [MODIFIED] Add order-aware get/update methods
│   ├── goalUtils.ts             # [MODIFIED] Add reorder logic
│   ├── dragDropHelpers.ts       # [NEW] Sortable.js setup, drag event handlers
│   └── crossTabSync.ts          # [NEW] localStorage observer for cross-tab sync
├── styles/
│   └── globals.css              # [MODIFIED] Tailwind for drag-drop visual states
└── (other existing files)

public/                           # Static assets (no changes)

# NOTE: Zero files in tests/, test directories, or test-related folders
```

**Structure Decision**: Using Next.js App Router (required by constitution). DraggableGoalsList will wrap Sortable.js; drag visual feedback handled entirely by Tailwind utility classes (opacity, scale, shadow, border). Cross-tab sync uses localStorage events to detect concurrent reorders from other tabs. No test files created (per Constitution Principle V).

## Complexity Tracking

No constitutional violations requiring justification. Sortable.js dependency evaluated and approved under Principle IV (Minimal Dependencies) as a justified external library that reduces custom drag-event complexity.

---

## Phase 0: Research

### Research Objectives

1. **Sortable.js Integration**: Understand Sortable.js API for React, event lifecycle, and configuration options
2. **Offline Persistence**: Design localStorage strategy for goal order storage and sync queuing
3. **Cross-Tab Synchronization**: Investigate localStorage events and BroadcastChannel for detecting concurrent edits
4. **Keyboard Accessibility**: Document WCAG 2.1 AA patterns for keyboard-driven drag-and-drop
5. **Tailwind Visual States**: Catalog Tailwind utilities for drag feedback (shadow, opacity, scale, border)

### Research Output

→ See **research.md** (Phase 0 output) for detailed findings, implementation patterns, and code examples.

---

## Phase 1: Design & Contracts

### Data Model (data-model.md)

**Goal Entity Enhancement**:
- Add `order: number` field to Goal interface (integer, 0-indexed, sequential, no gaps)
- Add `syncStatus?: 'synced' | 'pending-sync'` for offline reorder tracking
- Update goalStorage.ts to handle order-aware queries (getActiveGoalsOrdered, getCompletedGoalsOrdered)

**GoalList State**:
- Maintain two independent ordered lists: `activeGoals` and `completedGoals`
- On reorder: renumber all affected goals sequentially (e.g., moving goal at index 2 to index 0 renumbers indices 0–2)
- Persist to localStorage immediately; queue for backend sync if offline

### API Contracts (contracts/)

**Component Contract: DraggableGoalsList**
- Input: `goals: Goal[]`, `onReorder: (newOrder: Goal[]) => void`, `listType: 'active' | 'completed'`
- Output: Rendered sorted list with Sortable.js integration
- Visual States: Normal, Dragging (elevated card), Drop Indicator (border), Keyboard Mode (focus outline)

**Storage Contract: goalStorage.ts**
- `getGoalsOrdered(status: GoalStatus): Promise<Goal[]>` - retrieve in order
- `updateGoalOrder(goalId: string, newOrder: number, status: GoalStatus): Promise<void>` - single goal update
- `reorderGoals(goals: Goal[], status: GoalStatus): Promise<void>` - bulk reorder
- `syncPendingReorders(): Promise<void>` - sync offline changes to backend

**Cross-Tab Sync: crossTabSync.ts**
- `initializeSync()` - set up localStorage observer
- `onRemoteReorder: (event: StorageEvent) => void` - handle changes from other tabs
- Emit `reorder-override` event to trigger UI toast notification

### API Specifications

See **contracts/drag-drop-api.md** and **contracts/storage-api.md** for detailed signatures and examples.

### Quickstart

See **quickstart.md** for:
- Installing Sortable.js: `npm install --save sortablejs`
- Basic DraggableGoalsList usage example
- Testing drag operations manually in dev mode
- Debugging cross-tab sync with localStorage inspector

---

## Phase 2: Implementation Tasks

**Note**: Implementation tasks are generated by `/speckit.tasks` (not created by this /speckit.plan command).

See **tasks.md** (Phase 2 output, created separately) for:
- Specific file modifications (line-by-line)
- New file creation with full code templates
- Integration points with existing components
- Manual verification checklist (no automated tests)

---

## Verification Strategy

Per Constitution Principle V (No Testing), manual verification ONLY:

### Manual Verification Checklist (Pre-Merge)

- [ ] **P1: Reorder Active Goals** – Drag a goal in active list, verify order persists after refresh
- [ ] **P1: Visual Feedback** – Observe elevated card + insertion line while dragging
- [ ] **P1: Keyboard Reorder** – Tab to goal, Shift+Up/Down arrows, Enter to confirm
- [ ] **P2: Reorder Completed Goals** – Drag completed goal, verify independent from active list
- [ ] **Offline Reorder** – Disconnect internet (DevTools), reorder a goal, verify stored locally, reconnect and observe auto-sync
- [ ] **Cross-Tab Sync** – Open app in 2 tabs, reorder in tab A, verify toast appears in tab B and order updates
- [ ] **Touch Reorder** – Test on mobile device (or Chrome DevTools mobile emulation) - drag to reorder
- [ ] **Escape Cancel** – Start drag, press Escape, verify original order restored
- [ ] **Keyboard Accessibility** – Screen reader test: Tab navigates goals, arrow keys announce position, Shift+arrows announce move, Enter confirms
- [ ] **Responsive Design** – Test on mobile (375px), tablet (768px), desktop (1024px+); layout remains functional

**Verification Owner**: Developer completing implementation (manual browser testing)

**Sign-Off**: Update tasks.md with ✅ completion and timestamp; open PR for code review

---

## Dependencies

### New External Dependency
- **Sortable.js** (^1.15.0): Drag-and-drop library, 13.4 KB minified
  - **Justification**: Avoids 200+ lines of custom drag-event handling; supports mouse, touch, and keyboard accessibility
  - **Added to**: package.json devDependencies (per Constitution amendment)
  
### Existing Dependencies (No Changes)
- Next.js 16.1.6, React 19.2.3, Tailwind CSS 4 (as per constitution)
- localStorage (native browser API, no dependency)

---

## Notes for Implementation

1. **Sortable.js Configuration**: Use `ghostClass: 'sortable-ghost'` and `dragClass: 'sortable-drag'` to apply Tailwind classes via CSS (see tailwind.config.ts for custom classes if needed, or use inline Tailwind modifiers)
2. **Keyboard Mode**: Sortable.js v1.15+ has built-in keyboard support; ensure `onChoose` event fires when user tabs into list; use custom ARIA attributes to announce "Use arrow keys to move item"
3. **Offline Queue**: Store reorder operations in localStorage with timestamp; on reconnection, apply queued operations with last-write-wins for conflicts
4. **Cross-Tab Observer**: Use `window.addEventListener('storage')` to detect changes from other tabs; emit app-level event to trigger toast
5. **Performance**: Sortable.js is highly optimized; expect <50ms reorder completion on lists of 100 items
6. **Accessibility**: Ensure WCAG 2.1 AA compliance by testing with keyboard-only and screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)

---

## Timeline Estimate (Relative)

(No absolute dates; relative complexity)

- **Phase 0 (Research)**: 1–2 hours (Sortable.js docs, offline patterns, keyboard ARIA)
- **Phase 1 (Design & Contracts)**: 1–2 hours (data-model.md, contracts, quickstart)
- **Phase 2 (Implementation)**: 4–6 hours (component creation, storage integration, cross-tab sync setup)
- **Manual Verification**: 1–2 hours (browser testing across devices, accessibility checks)

**Total**: ~8–12 hours (development + verification)
