# Phase 1: Data Model & Entities - DoIt Goal Tracking

**Date**: 2026-02-04  
**Status**: Complete  

---

## Core Entity: Goal

### Goal Interface

```typescript
// app/lib/types.ts
export interface Goal {
  id: string;                    // UUID or nanoid, unique identifier
  title: string;                 // Goal title (e.g., "Complete project X")
  endDate: Date;                 // Target completion date
  createdAt: Date;               // Timestamp when goal was created
  isCompleted?: boolean;         // Optional flag (omitted for active, true for completed)
  completedAt?: Date;            // Timestamp when goal was marked complete (completed goals only)
}

export interface GoalData {
  active: Goal[];                // Currently active goals (not expired, not completed)
  completed: Goal[];             // Goals marked as complete
}
```

### Goal Fields

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|------------|
| `id` | string (UUID/nanoid) | Yes | Unique identifier | Must be unique within localStorage |
| `title` | string | Yes | Goal title | Max 200 chars, min 1 char, no leading/trailing whitespace |
| `endDate` | Date | Yes | Target completion date | Must be today or future (validated on creation) |
| `createdAt` | Date | Yes | Creation timestamp | Set automatically on creation |
| `completedAt` | Date | Conditional | Completion timestamp | Only present if goal marked complete |
| `isCompleted` | boolean | Optional | Completion flag | Derived from presence of `completedAt` |

### Validation Rules

1. **Title**:
   - Required, non-empty after trim
   - Max 200 characters
   - Plain text (no emoji, special chars allowed but not required)

2. **End Date**:
   - Must be today or in the future (no past dates)
   - Accepts dates with any time component (normalized to start of day)
   - Edge case: Today's date is valid ("0 days left" status)

3. **Goal Lifecycle**:
   - Created → Active (visible in left column)
   - Active → Completed (user checks checkbox, moved to right column)
   - Completed → Restored (user clicks restore, returns to active with recalculated days)
   - Any State → Deleted (user clicks delete, permanent removal)

### State Transitions

```
┌─────────────────────────────────────┐
│           Goal Lifecycle            │
└─────────────────────────────────────┘

    ┌──────────────────────────────┐
    │   NEW GOAL (Created)         │
    │   isCompleted: false         │
    │   completedAt: undefined     │
    └──────────────────────────────┘
                 │
                 ├──► [User completes]
                 │
                 ▼
    ┌──────────────────────────────┐
    │   COMPLETED                  │
    │   isCompleted: true          │
    │   completedAt: timestamp     │
    └──────────────────────────────┘
                 │
                 ├──► [User restores]
                 │
                 ▼
    ┌──────────────────────────────┐
    │   ACTIVE (Restored)          │
    │   isCompleted: false         │
    │   completedAt: undefined     │
    └──────────────────────────────┘

    [User deletes from any state]
                 │
                 ▼
    ┌──────────────────────────────┐
    │   DELETED (Permanent)        │
    │   Removed from localStorage  │
    └──────────────────────────────┘
```

---

## Storage Schema

### localStorage Keys

```
Key: "doit_goals"
Value: JSON string of Goal[] (active + expired, not completed)
Example:
[
  {
    "id": "abc123",
    "title": "Launch product",
    "endDate": "2026-02-10T00:00:00Z",
    "createdAt": "2026-02-04T10:30:00Z"
  },
  {
    "id": "def456",
    "title": "Fix bugs",
    "endDate": "2026-02-05T00:00:00Z",
    "createdAt": "2026-02-04T11:00:00Z"
  }
]

Key: "doit_completed"
Value: JSON string of Goal[] (completed goals with completedAt)
Example:
[
  {
    "id": "ghi789",
    "title": "Design mockups",
    "endDate": "2026-01-28T00:00:00Z",
    "createdAt": "2026-01-20T09:00:00Z",
    "completedAt": "2026-01-27T15:30:00Z"
  }
]
```

### Data Consistency Rules

1. **No Goal Duplication**: Each ID must exist in exactly one list (active OR completed), never both.
2. **Expiration Rules**: Goals with `endDate` < today are filtered from active column, but retained in localStorage for potential restoration.
3. **Restoration**: Moving a goal from completed to active preserves original `createdAt`, clears `completedAt`, and recalculates days remaining.
4. **Deletion**: Completely removed from both `doit_goals` and `doit_completed` localStorage keys.
5. **Corruption Handling**: If localStorage parse fails, log error and initialize with empty arrays.

---

## Computed Properties (Derived from Goal)

These are calculated at render time, not stored:

| Property | Calculation | Used For |
|----------|-------------|----------|
| `daysRemaining` | `differenceInDays(startOfDay(endDate), startOfDay(today))` | Display countdown, sorting |
| `isExpired` | `daysRemaining < 0` | Filter from active column |
| `isToday` | `daysRemaining === 0` | Display "0 days left" status |
| `visualStatus` | "active" \| "warning" \| "critical" | Apply CSS bg-warning / bg-critical |
| `formattedEndDate` | `format(endDate, "MMM dd, yyyy")` | Display in goal card |
| `formattedCompletedDate` | `format(completedAt, "MMM dd, yyyy")` | Display in completed goal card |

---

## Relationships & Cardinality

```
┌──────────────────────────┐
│   User (implicit)        │
│  (single browser user)   │
└───────────┬──────────────┘
            │ 1:many
            ▼
┌──────────────────────────┐
│     Goal List            │
│  (managed in localStorage)
│                          │
│  - active: Goal[]        │
│  - completed: Goal[]     │
└──────────────────────────┘
```

**Note**: This MVP has no user authentication. All goals are stored per browser (shared across tabs via localStorage events).

---

## Column-Level Rules

### Active Column (Left)

**Displayed Goals**:
- `daysRemaining >= 0` (including today)
- Sorted by `endDate` (earliest deadline first)
- Secondary sort: `createdAt` (oldest creation first)

**Visual Indicators**:
- Default: white/gray background
- Warning (3-1 days remaining): `bg-warning` (pastel yellow)
- Critical (0 or fewer days): `bg-critical` (pastel red)

**Actions**:
- Checkbox (✓) → Mark complete, move to right column
- Delete button (🗑️) → Permanently remove
- Display format: "Goal Title — X days left"

**Empty State**:
"No active goals. Click 'Add Goal' to get started!"

### Completed Column (Right)

**Displayed Goals**:
- `isCompleted === true` (have `completedAt` timestamp)
- Sorted by `completedAt` descending (newest first)

**Visual Indicators**:
- Faded/grayed-out style (goal is done)
- Display format: "Goal Title — Completed: Feb 04"

**Actions**:
- Restore button (↻) → Move back to active, clear `completedAt`
- Delete button (🗑️) → Permanently remove
- Restore persists across page refresh

**Empty State**:
"No completed goals yet. Complete your first goal to celebrate your progress!"

---

## Validation Logic

### Create Goal Validation

```typescript
function validateNewGoal(title: string, endDate: Date): ValidationError | null {
  // Rule 1: Title required
  if (!title || !title.trim()) {
    return { field: "title", message: "Goal title is required" };
  }

  // Rule 2: Title length
  if (title.trim().length > 200) {
    return { field: "title", message: "Goal title must be 200 characters or less" };
  }

  // Rule 3: End date not in past
  const today = startOfDay(new Date());
  const selectedDay = startOfDay(endDate);
  if (isBefore(selectedDay, today)) {
    return { field: "endDate", message: "End date must be in the future or today" };
  }

  return null; // Valid
}
```

### Create Goal Success

```typescript
function createGoal(title: string, endDate: Date): Goal {
  return {
    id: nanoid(),
    title: title.trim(),
    endDate: startOfDay(endDate), // Normalize to start of day
    createdAt: new Date(),
  };
}
```

---

## Edge Cases & Handling

| Edge Case | Behavior | Implementation |
|-----------|----------|-----------------|
| Goal end date = today | Display "0 days left", include in active column, NOT critical | `daysRemaining === 0` stays active |
| Goal end date = yesterday | Expired, hidden from active, but can be restored | `daysRemaining < 0`, filter from display, keep in storage |
| 100+ completed goals | Maintained in right column, paginated if needed in future | Current MVP: show all, rely on scroll |
| localStorage full (~5-10MB) | Show graceful error, suggest cleanup | Try-catch JSON parse/stringify, fallback to console error + empty state |
| Timezone changes (user travels) | Days recalculate based on new timezone (date-fns `startOfDay` handles this) | No special handling needed, calculation is dynamic |
| Duplicate goal titles | Allowed (no unique constraint on titles) | Differentiate by ID, not title |
| Rapid checkbox clicks | Debounce state updates, no duplicate entries | React re-render batching handles this |

---

## Summary

**Entities**: 1 primary entity (Goal)  
**Storage**: localStorage (client-side, JSON-serialized)  
**Validation**: Client-side only, immediate feedback  
**Relationships**: Single user (implicit) → many Goals  
**Cardinality**: 1:many (user:goals)  
**Constraints**: No server-side logic, ~5-10MB localStorage limit  

**Phase 1a Status**: ✅ Data model complete

