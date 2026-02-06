# Storage Contract: Goal Tracking localStorage API

**Version**: 1.0  
**Date**: 2026-02-04  
**Format**: JSON over browser localStorage  

---

## Overview

The Goal Tracking app persists all state in browser localStorage. Two keys manage the full goal lifecycle:
- `doit_goals` → active goals (not yet completed)
- `doit_completed` → completed goals (marked complete, can be restored)

---

## Key: `doit_goals`

### Schema

```json
[
  {
    "id": "string (UUID or nanoid)",
    "title": "string (1-200 chars, non-empty)",
    "endDate": "ISO 8601 datetime string (RFC3339, today or future)",
    "createdAt": "ISO 8601 datetime string (auto-set, read-only)"
  }
]
```

### Example

```json
[
  {
    "id": "7fa8c0e2-9b1f-4d9f-9e3c-1a2b3c4d5e6f",
    "title": "Launch product feature",
    "endDate": "2026-02-10T00:00:00Z",
    "createdAt": "2026-02-04T10:30:15Z"
  },
  {
    "id": "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
    "title": "Fix critical bugs",
    "endDate": "2026-02-05T00:00:00Z",
    "createdAt": "2026-02-04T11:00:22Z"
  }
]
```

### Read Operations

```typescript
// Read all active goals
const activeGoals = JSON.parse(localStorage.getItem("doit_goals") || "[]");
// Result: Goal[]

// Filter active goals (not expired)
const activeNow = activeGoals.filter(g => daysRemaining(new Date(g.endDate)) >= 0);
```

### Write Operations

```typescript
// Create new goal
const newGoal = {
  id: nanoid(),
  title: "New goal",
  endDate: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};
activeGoals.push(newGoal);
localStorage.setItem("doit_goals", JSON.stringify(activeGoals));

// Delete goal
const filtered = activeGoals.filter(g => g.id !== goalId);
localStorage.setItem("doit_goals", JSON.stringify(filtered));
```

### Lifecycle

- **Created**: When user submits "Add Goal" form (end date validated as today or future)
- **Modified**: Never (title/endDate immutable after creation in MVP)
- **Deleted**: When user clicks delete button OR when goal is marked complete (moved to `doit_completed`)
- **Expired**: Remains in storage but filtered from active column display if `daysRemaining < 0`

---

## Key: `doit_completed`

### Schema

```json
[
  {
    "id": "string (UUID or nanoid, same ID as original goal)",
    "title": "string (1-200 chars, from original goal)",
    "endDate": "ISO 8601 datetime string (from original goal)",
    "createdAt": "ISO 8601 datetime string (from original goal)",
    "completedAt": "ISO 8601 datetime string (auto-set when marked complete, read-only)"
  }
]
```

### Example

```json
[
  {
    "id": "7fa8c0e2-9b1f-4d9f-9e3c-1a2b3c4d5e6f",
    "title": "Design system review",
    "endDate": "2026-01-28T00:00:00Z",
    "createdAt": "2026-01-20T09:15:30Z",
    "completedAt": "2026-01-27T14:22:10Z"
  }
]
```

### Read Operations

```typescript
// Read all completed goals
const completedGoals = JSON.parse(localStorage.getItem("doit_completed") || "[]");
// Result: (Goal & { completedAt: string })[]

// Sort by most recent completion
const sorted = [...completedGoals].sort((a, b) =>
  new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
);
```

### Write Operations

```typescript
// Mark goal as complete (move from doit_goals to doit_completed)
const goal = activeGoals.find(g => g.id === goalId);
const completedGoal = {
  ...goal,
  completedAt: new Date().toISOString(),
};
completedGoals.push(completedGoal);
localStorage.setItem("doit_completed", JSON.stringify(completedGoals));

// Remove from active
const filtered = activeGoals.filter(g => g.id !== goalId);
localStorage.setItem("doit_goals", JSON.stringify(filtered));

// Restore goal (move back to doit_goals)
const goalToRestore = completedGoals.find(g => g.id === goalId);
const { completedAt, ...goalData } = goalToRestore;
activeGoals.push(goalData);
localStorage.setItem("doit_goals", JSON.stringify(activeGoals));

// Remove from completed
const filteredCompleted = completedGoals.filter(g => g.id !== goalId);
localStorage.setItem("doit_completed", JSON.stringify(filteredCompleted));

// Delete goal permanently (remove from both lists)
const activeFiltered = activeGoals.filter(g => g.id !== goalId);
const completedFiltered = completedGoals.filter(g => g.id !== goalId);
localStorage.setItem("doit_goals", JSON.stringify(activeFiltered));
localStorage.setItem("doit_completed", JSON.stringify(completedFiltered));
```

### Lifecycle

- **Created**: When user marks goal complete (copies from `doit_goals`, adds `completedAt`)
- **Modified**: Never (all fields immutable after completion)
- **Deleted**: When user clicks delete button OR when restored (moved back to `doit_goals`)
- **Restored**: Anytime (persistent restore button, even after page refresh)

---

## Error Handling

### Missing Keys (First Load)

```typescript
const activeGoals = JSON.parse(localStorage.getItem("doit_goals") || "[]");
// If key missing, `getItem` returns null, `||` provides "[]" fallback
```

### Corrupted JSON

```typescript
try {
  const goals = JSON.parse(localStorage.getItem("doit_goals") || "[]");
  // Use goals...
} catch (error) {
  console.error("localStorage corruption detected:", error);
  // Show empty state, suggest clearing browser cache
  localStorage.removeItem("doit_goals");
  localStorage.removeItem("doit_completed");
}
```

### Storage Quota Exceeded

```typescript
try {
  localStorage.setItem("doit_goals", JSON.stringify(goals));
} catch (error) {
  if (error.name === "QuotaExceededError") {
    console.error("localStorage full (~5-10MB exceeded)");
    // Show user notification: "Storage full. Please delete old completed goals."
  }
}
```

---

## Consistency Guarantees

1. **Atomicity**: Each `localStorage.setItem` is atomic (single operation).
2. **Uniqueness**: Each goal ID appears in at most one key (`doit_goals` OR `doit_completed`), never both.
3. **Persistence**: Changes persist across page refresh and browser restart.
4. **Cross-Tab Sync**: All tabs see same data (no built-in sync, but users may use localStorage events for multi-tab awareness in future).

---

## Migration / Versioning

No versioning in MVP. Future versions may include:
- Version header in localStorage (e.g., `"doit_version": "1.0"`)
- Migration scripts if schema changes (e.g., adding priority levels, tags)

---

## Data Export / Import (Future Consideration)

For future features:

```typescript
// Export all goals as JSON
const exportData = {
  version: "1.0",
  exportedAt: new Date().toISOString(),
  active: JSON.parse(localStorage.getItem("doit_goals") || "[]"),
  completed: JSON.parse(localStorage.getItem("doit_completed") || "[]"),
};
const json = JSON.stringify(exportData, null, 2);
// Trigger download as .json file

// Import goals from JSON
const imported = JSON.parse(fileContent);
// Validate schema, merge with existing (or replace)
```

---

## Summary

| Aspect | Detail |
|--------|--------|
| **Keys** | 2 (doit_goals, doit_completed) |
| **Format** | JSON array of Goal objects |
| **Size Estimate** | ~100 bytes per goal, ~5-10 MB quota |
| **Sync** | Single-user, single-device (no backend) |
| **Durability** | Persists across refresh, browser restart |
| **Error Handling** | Graceful fallback to empty array on parse failure |

