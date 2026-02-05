# Data Model: Goal Drag-and-Drop Reordering

**Date**: February 5, 2026  
**Phase**: Phase 1 Design  
**Scope**: Data structures, storage schema, and persistence layer for drag-and-drop reordering feature

---

## 1. Entity Models

### Goal Entity (Extended)

```typescript
/**
 * Goal represents a user's goal with reordering support
 * 
 * Key change from MVP: Added `order` field for maintaining visual sequence
 * in active/completed lists independently
 */
export interface Goal {
  // Existing fields
  id: string; // Unique identifier (UUID or nanoid)
  title: string; // Goal title, max 255 characters
  description?: string; // Optional goal description
  endDate: Date; // Target completion date
  createdAt: Date; // When goal was created
  completedAt?: Date; // When goal was marked complete (null if active)

  // New fields for drag-and-drop
  order: number; // Sequential position within active or completed list
                 // 0-indexed: first goal = 0, second = 1, etc.
                 // CONSTRAINT: Must be sequential with no gaps within list type
                 // Updated when reordering occurs

  syncStatus?: 'synced' | 'pending-sync'; // Offline sync tracking
                                           // 'synced' = backend is aware
                                           // 'pending-sync' = saved locally, awaiting sync
}
```

### Derived Types

```typescript
/**
 * GoalList - logical container for ordered goals
 * Two instances exist per user: active goals, completed goals
 */
export type GoalList = {
  type: 'active' | 'completed';
  goals: Goal[]; // Always sorted by order field (0, 1, 2, ...)
  lastSyncTime?: number; // Timestamp of last successful backend sync
};

/**
 * ReorderOperation - record of a single reorder action
 * Stored in sync queue for offline operations
 */
export type ReorderOperation = {
  timestamp: number; // When operation occurred (milliseconds)
  listType: 'active' | 'completed';
  goalIds: string[]; // New order of goal IDs
  syncStatus: 'pending' | 'syncing' | 'synced';
};
```

---

## 2. Storage Schema

### localStorage Layout

User's goal data is stored in browser localStorage under the following keys:

```
KEY: "goals:active"
TYPE: JSON array of Goal objects
EXAMPLE:
[
  { "id": "g1", "title": "Learn React", "order": 0, "endDate": "...", ... },
  { "id": "g2", "title": "Exercise daily", "order": 1, "endDate": "...", ... },
  { "id": "g3", "title": "Read a book", "order": 2, "endDate": "...", ... }
]
CONSTRAINT: Array length matches highest order value + 1 (no gaps)

---

KEY: "goals:completed"
TYPE: JSON array of Goal objects
EXAMPLE:
[
  { "id": "c1", "title": "Learn JavaScript", "order": 0, "completedAt": "...", ... },
  { "id": "c2", "title": "Finish project", "order": 1, "completedAt": "...", ... }
]
CONSTRAINT: Independent from active list, maintains own sequence

---

KEY: "reorder-queue"
TYPE: JSON array of ReorderOperation objects
EXAMPLE:
[
  {
    "timestamp": 1707123456000,
    "listType": "active",
    "goalIds": ["g3", "g1", "g2"],
    "syncStatus": "pending"
  }
]
CONSTRAINT: Only exists if offline operations are pending
CLEARED: After successful sync to backend
```

---

## 3. Core Operations

### 3.1 Get Goals (Ordered)

```typescript
/**
 * Retrieve goals for a specific list type, ordered by sequence
 * 
 * @param listType - 'active' or 'completed'
 * @returns Promise resolving to ordered Goal array
 */
export async function getGoalsOrdered(
  listType: 'active' | 'completed'
): Promise<Goal[]> {
  const key = `goals:${listType}`;
  const storedData = localStorage.getItem(key);
  
  if (!storedData) {
    return [];
  }

  const goals: Goal[] = JSON.parse(storedData);
  
  // Ensure sorted by order field (defensive)
  return goals.sort((a, b) => a.order - b.order);
}
```

**Invariants**:
- Returned array is always sorted by `order` field (ascending)
- All goals in array have matching `listType` status
- No gaps in order sequence (e.g., [0, 1, 2, 4] would be invalid)

### 3.2 Reorder Goals (Bulk Update)

```typescript
/**
 * Replace entire ordered list with new sequence
 * Automatically renumbers goals to maintain sequential order
 * 
 * @param goalIds - New order of goal IDs
 * @param listType - 'active' or 'completed'
 * @returns Promise resolving when persisted
 */
export async function reorderGoals(
  goalIds: string[],
  listType: 'active' | 'completed'
): Promise<void> {
  const key = `goals:${listType}`;
  const currentGoals = await getGoalsOrdered(listType);
  
  // Build map of ID -> Goal for quick lookup
  const goalMap = new Map(currentGoals.map((g) => [g.id, g]));

  // Reconstruct goals in new order with renumbered sequence
  const reorderedGoals = goalIds
    .map((id) => goalMap.get(id))
    .filter(Boolean) as Goal[];

  // Renumber: assign order 0, 1, 2, ...
  const renumberedGoals = reorderedGoals.map((goal, index) => ({
    ...goal,
    order: index,
    syncStatus: isOnline() ? 'synced' : 'pending-sync',
  }));

  // Persist to localStorage
  localStorage.setItem(key, JSON.stringify(renumberedGoals));

  // Queue for backend sync if offline
  if (!isOnline()) {
    queueReorderOperation({
      listType,
      goalIds,
      timestamp: Date.now(),
      syncStatus: 'pending',
    });
  } else {
    // TODO: Sync to backend immediately (Phase 2)
    // await syncReorderToBackend(listType, renumberedGoals);
  }
}
```

**Invariants**:
- After completion, all goals in the list have sequential order: [0, 1, 2, ..., n-1]
- Goals not in `goalIds` are removed from the list (or could be preserved—specify in Phase 1)
- `syncStatus` updated based on online/offline state

### 3.3 Update Single Goal Order

```typescript
/**
 * Move a single goal to a new position, renumbering affected goals
 * Used internally by DraggableGoalsList after drag-end event
 * 
 * @param goalId - Goal to move
 * @param newPosition - New index (0-based)
 * @param listType - 'active' or 'completed'
 */
export async function moveGoal(
  goalId: string,
  newPosition: number,
  listType: 'active' | 'completed'
): Promise<void> {
  const goals = await getGoalsOrdered(listType);
  
  // Find current position
  const currentIndex = goals.findIndex((g) => g.id === goalId);
  if (currentIndex === -1) {
    throw new Error(`Goal ${goalId} not found in ${listType} list`);
  }

  // Remove goal from current position
  const [movedGoal] = goals.splice(currentIndex, 1);

  // Insert at new position
  goals.splice(newPosition, 0, movedGoal);

  // Persist reordered list
  await reorderGoals(
    goals.map((g) => g.id),
    listType
  );
}
```

**Invariant**:
- Single operation; uses `reorderGoals` internally for renumbering

### 3.4 Queue and Sync Offline Operations

```typescript
/**
 * Add a reorder operation to the sync queue
 * Called when user reorders while offline
 */
function queueReorderOperation(operation: ReorderOperation): void {
  const queue = JSON.parse(localStorage.getItem('reorder-queue') || '[]');
  queue.push(operation);
  localStorage.setItem('reorder-queue', JSON.stringify(queue));
}

/**
 * Process pending reorder operations
 * Called when connection is restored
 */
export async function syncPendingReorders(): Promise<void> {
  if (!isOnline()) {
    return; // Still offline
  }

  const queueData = localStorage.getItem('reorder-queue');
  if (!queueData) {
    return; // Nothing to sync
  }

  const queue: ReorderOperation[] = JSON.parse(queueData);

  for (const operation of queue) {
    try {
      // TODO: Send to backend
      // const response = await fetch('/api/goals/reorder', {
      //   method: 'POST',
      //   body: JSON.stringify(operation),
      // });

      // Mark as synced
      operation.syncStatus = 'synced';
    } catch (error) {
      console.error('Sync failed, will retry later', error);
      return; // Stop processing on first failure
    }
  }

  // Clear queue after successful sync
  localStorage.removeItem('reorder-queue');
}

function isOnline(): boolean {
  return navigator.onLine;
}
```

---

## 4. Invariants & Constraints

### Data Integrity Constraints

| Constraint | Rationale | Enforcement |
|-----------|-----------|-------------|
| No gaps in `order` | Ensures deterministic sort order | `reorderGoals()` renumbers to [0, 1, 2, ...] |
| Order ∈ [0, n-1] | Valid indices for list of size n | Validated after renumbering |
| Sequential within type | Active and completed lists independent | Separate localStorage keys (`goals:active`, `goals:completed`) |
| Exactly one sync queue | Prevents duplicate operations | Single `reorder-queue` key |
| Soft deletes only | Completed status, not removed | `completedAt` field marks completion, goal remains in data |

### State Machine: Sync Status

```
[pending-sync]
      ↓
   (user online)
      ↓
[syncing] → [synced] (success)
      ↓
   (error)
      ↓
[pending-sync] (retry next time)
```

---

## 5. Migration Strategy (Existing Goals)

If the app already has goals without the `order` field, migration is automatic:

```typescript
/**
 * Migrate existing goals to add order field
 * Runs once on app startup
 */
export async function migrateGoalsAddOrder(): Promise<void> {
  const listTypes = ['active', 'completed'] as const;

  for (const listType of listTypes) {
    const goals = await getGoalsOrdered(listType);
    
    // Check if already migrated
    if (goals.length > 0 && 'order' in goals[0]) {
      continue; // Already migrated
    }

    // Add order field to each goal
    const migratedGoals = goals.map((goal, index) => ({
      ...goal,
      order: index,
      syncStatus: 'synced',
    }));

    // Persist
    const key = `goals:${listType}`;
    localStorage.setItem(key, JSON.stringify(migratedGoals));
  }
}

// Call on app startup in layout.tsx or useEffect
```

---

## 6. Offline Scenario Example

**Scenario**: User is offline, reorders 3 goals in active list.

**Step 1: Reorder initiated**
```
Current (localStorage): goals:active = [G1(order:0), G2(order:1), G3(order:2)]
User drags G3 to position 0
```

**Step 2: reorderGoals() called**
```typescript
await reorderGoals(
  ['g3', 'g1', 'g2'], // New order
  'active'
);
```

**Step 3: Renumbering**
```
New (localStorage): goals:active = [G3(order:0), G1(order:1), G2(order:2)]
G3 marked: syncStatus: 'pending-sync'
```

**Step 4: Queue operation**
```
localStorage.reorder-queue = [{
  timestamp: 1707123456000,
  listType: 'active',
  goalIds: ['g3', 'g1', 'g2'],
  syncStatus: 'pending'
}]
```

**Step 5: User goes online**
```
1. syncPendingReorders() detects online status
2. Sends queue to backend (Phase 2)
3. Backend confirms: reorder applied
4. localStorage.reorder-queue cleared
5. syncStatus updated to 'synced'
```

---

## 7. Cross-Tab Sync: Data Flow

**Scenario**: User reorders in Tab A; Tab B detects change.

**Tab A**:
```
DraggableGoalsList → onReorder → reorderGoals()
reorderGoals() → localStorage.setItem('goals:active', ...) → StorageEvent fired
```

**Tab B**:
```
window.addEventListener('storage', (event) => {
  if (event.key === 'goals:active' || event.key === 'goals:completed') {
    // Re-fetch from localStorage
    const newGoals = await getGoalsOrdered(event.key.split(':')[1]);
    // Update UI
  }
});
```

**Result**: Tab B automatically reflects Tab A's reorder within 50–100ms.

---

## 8. Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| getGoalsOrdered(100 items) | <5ms | Array sort is O(n log n) |
| reorderGoals(100 items) | <10ms | Includes renumbering + persistence |
| localStorage.setItem (20 KB) | <5ms | Typical goal list size |
| StorageEvent propagation | 50–100ms | Cross-tab sync latency |

---

## 9. Backend Integration (Phase 2, Not In Scope)

For future phases, goals will sync to a backend API:

```typescript
// Pseudocode (not implemented in Phase 1)
async function syncReorderToBackend(
  listType: 'active' | 'completed',
  goals: Goal[]
): Promise<void> {
  const response = await fetch('/api/goals/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      listType,
      goals: goals.map((g) => ({ id: g.id, order: g.order })),
    }),
  });

  if (!response.ok) {
    throw new Error(`Backend sync failed: ${response.status}`);
  }

  // Mark all as synced
  goals.forEach((g) => {
    g.syncStatus = 'synced';
  });

  localStorage.setItem(`goals:${listType}`, JSON.stringify(goals));
}
```

---

## Summary

| Aspect | Decision |
|--------|----------|
| Primary Key | Goal.id (UUID/nanoid) |
| Ordering | Sequential `order` field [0, 1, 2, ...] |
| Storage | localStorage (client-side) |
| Renumbering | Automatic on reorder (no gaps) |
| Offline Support | Queue-based sync (Phase 1 local, Phase 2 backend) |
| Cross-Tab Sync | StorageEvent listener |
| Sync Status | Tracked per-goal, used for UI indicators |

---

## Next Steps

→ Proceed to **Phase 1: API Contracts**
- Define component interfaces (DraggableGoalsList props, callbacks)
- Define storage API signatures (getGoalsOrdered, reorderGoals, syncPendingReorders)
- Define cross-tab sync event system
