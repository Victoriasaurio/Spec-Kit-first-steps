# Implementation Plan: DoIt Goal Tracking - Initial Page Setup

**Branch**: `001-goal-tracking-layout` | **Date**: 2026-02-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-goal-tracking-layout/spec.md`

## Summary

Build the initial goal tracking layout for "DoIt" web app with a two-column design: active goals (left) with countdown timers and visual warnings, and completed goals (right) with restore capability. Use localStorage for persistence, Tailwind CSS @theme for theming, shadcn components for UI, and date-fns for date calculations.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 16.1.6)  
**Primary Dependencies**: React 19.2.3, Tailwind CSS 4, shadcn/ui, date-fns  
**Storage**: Browser localStorage (client-side persistence)  
**Testing**: NONE - Constitution mandates no automated tests (manual verification only)  
**Target Platform**: Web (Browser, responsive design—mobile, tablet, desktop)
**Project Type**: Web (Next.js App Router)  
**Performance Goals**: 60 fps interactions, <100ms state updates, instant localStorage reads  
**Constraints**: Client-side only (no backend), responsive at all viewport sizes, localStorage data limit (~5-10MB)  
**Scale/Scope**: 2 columns, 4 user stories (P1: view goals, manage completion; P2: delete, add goals), support 100+ goals without performance degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **I. Clean Code**: Committed—clear component naming, utility functions in lib/, descriptive variable names.  
✅ **II. Simple UX**: Committed—two-column layout, obvious actions (checkbox, restore, delete buttons), empty states, plain error messages.  
✅ **III. Responsive Design**: Committed—Tailwind breakpoints (md: stacked to side-by-side), touch targets ≥48px, scalable typography.  
✅ **IV. Minimal Dependencies**: Committed—only shadcn/ui (composable, zero bloat), date-fns (date utilities), Tailwind CSS (already required).  
✅ **V. No Testing**: **STRICTLY ADHERED**—zero unit/integration/e2e tests. Manual verification via dev mode and manual flows only.  

**Gate Status**: ✅ PASS - All principles aligned. No violations or justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-goal-tracking-layout/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── goals-api.md     # localStorage schema
│   └── components.md    # UI component contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js App Router Structure (REQUIRED)
app/
├── layout.tsx                          # Root layout (providers, global styles)
├── page.tsx                            # Home page (goal tracking UI)
├── components/
│   ├── GoalsList.tsx                   # Column wrapper for goals
│   ├── GoalCard.tsx                    # Individual goal item (active/completed)
│   ├── ActiveGoal.tsx                  # Active goal with checkbox + delete
│   ├── CompletedGoal.tsx               # Completed goal with restore + delete
│   ├── AddGoalButton.tsx               # "Add Goal" button
│   ├── AddGoalModal.tsx                # Modal form for new goal
│   ├── GoalCountdown.tsx               # Days remaining badge with warning/critical styles
│   ├── EmptyState.tsx                  # Empty column placeholder
│   └── VisualWarningBadge.tsx          # Warning (3-1 days) and critical (≤0 days) styles
├── lib/
│   ├── goalStorage.ts                  # localStorage getter/setter/helpers
│   ├── goalUtils.ts                    # daysRemaining(), isExpired(), sortGoals(), etc.
│   ├── dateFormatting.ts               # date-fns wrappers for consistent date display
│   └── types.ts                        # Goal interface, constants
├── styles/
│   └── globals.css                     # Tailwind directives (@layer, @theme)
└── utils/
    └── cn.ts                           # classname utility (shadcn pattern)

public/                                 # Static assets

# NO tests/ directory - Constitution mandates zero automated testing
```

**Structure Decision**: Selected Next.js App Router with feature-agnostic component organization in `/components`. Each component is focused and reusable. Business logic (date calculations, storage) isolated in `/lib` for clarity. Tailwind CSS @theme customizations in global styles for consistent theming (warning/critical colors).

## Complexity Tracking

✅ **No violations to justify.** All design decisions align with Constitution principles and project constraints. No simplifications needed or justified.

---

## Phase Summary

### Phase 0: Research ✅ COMPLETE
- Resolved all unknowns: localStorage strategy, Tailwind @theme, shadcn integration, date-fns approach
- Documented rationale for each technology choice
- All NEEDS CLARIFICATION items addressed

**Output**: [research.md](research.md)

### Phase 1: Design ✅ COMPLETE
- Designed data model with Goal entity, state transitions, validation rules
- Created API contract for localStorage schema (2 keys: `doit_goals`, `doit_completed`)
- Designed 10 React components with full prop/event contracts
- Defined responsive layout strategy (mobile-first, 2 columns at md breakpoint)
- Documented 10 manual testing workflows covering all user stories
- Updated Copilot agent context with new technology stack

**Outputs**:
- [data-model.md](data-model.md)
- [contracts/goals-storage.md](contracts/goals-storage.md)
- [contracts/components.md](contracts/components.md)
- [quickstart.md](quickstart.md)
- `.github/agents/copilot-instructions.md` (updated)

---

## Next Steps: Phase 2 (Implementation)

1. **Run `/speckit.tasks`** — Generate implementation task checklist (Phase 2)
2. **Follow tasks.md** — Implement components, utils, styling per checklist
3. **Manual Testing** — Use workflows in [quickstart.md](quickstart.md) to validate
4. **Code Review** — Verify Constitution compliance (I-V principles)
5. **Merge** — Commit to `001-goal-tracking-layout` branch, squash and merge to main

---

## Constitution Re-Check (Post-Phase 1)

✅ **I. Clean Code**: Components named clearly, lib utilities single-purpose, comments explain *why*  
✅ **II. Simple UX**: Two-column layout is intuitive, actions obvious (checkbox, restore, delete buttons), empty states guide users  
✅ **III. Responsive Design**: Tailwind breakpoints ensure mobile/tablet/desktop compatibility, touch targets ≥48px  
✅ **IV. Minimal Dependencies**: Only shadcn/ui, date-fns, Tailwind CSS—no bloat, all justified  
✅ **V. No Testing**: STRICTLY ADHERED—zero test code, manual verification workflows only  

**Final Gate Status**: ✅ PASS - Ready for Phase 2 implementation
