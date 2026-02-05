# Contract: Goal Storage API

**Phase**: Phase 1 Design  
**Type**: Module Interface  
**Purpose**: localStorage abstraction for persisting and retrieving goal order

---

## Module: goalStorage.ts

Location: `app/lib/goalStorage.ts`

### Exported Functions

#### 1. getGoalsOrdered

```typescript
/**
 * Retrieve all goals of a given type, ordered by sequence
 * 
 * @param listType - 'active' or 'completed'
 * @returns Promise resolving to ordered Goal array
 * @throws Error if localStorage is unavailable
 * 
 * @example
 * const activeGoals = await getGoalsOrdered('active');
 * // Returns: [Goal(order:0), Goal(order:1), ...]
 */
export async function getGoalsOrdered(
  listType: 'active' | 'completed'
): Promise<Goal[]>;
```

**Behavior**:
- Fetches JSON from `goals:{listType}` key
- Parses and returns array sorted by `order` field
- Returns empty array if key doesn't exist
- Invariant: No gaps in order sequence

**Example**:
```typescript
const activeGoals = await getGoalsOrdered('active');
console.log(activeGoals);
// [
//   { id: 'g1', title: 'Learn React', order: 0, ... },
//   { id: 'g2', title: 'Exercise', order: 1, ... }
// ]
```

---

#### 2. reorderGoals

```typescript
/**
 * Replace entire goal list with new sequence
 * Automatically renumbers all goals to maintain sequential order
 * 
 * @param goalIds - Array of goal IDs in desired order
 * @param listType - 'active' or 'completed'
 * @returns Promise resolving when persisted
 * @throws Error if any goal ID not found
 * 
 * @example
 * await reorderGoals(['g3', 'g1', 'g2'], 'active');
 * // After: g3.order=0, g1.order=1, g2.order=2
 */
export async function reorderGoals(
  goalIds: string[],
  listType: 'active' | 'completed'
): Promise<void>;
```

**Behavior**:
1. Fetch current goals from storage
2. Build map of ID → Goal
3. Construct new array in `goalIds` order
4. Renumber each goal: `order = index`
5. Save to localStorage key `goals:{listType}`
6. Queue operation if offline (syncStatus: 'pending-sync')
7. Return when complete

**Example**:
```typescript
// Before: g1(0), g2(1), g3(2)
await reorderGoals(['g3', 'g1', 'g2'], 'active');
// After: g3(0), g1(1), g2(2)
```

**Error Handling**:
```typescript
try {
  await reorderGoals(['g3', 'g1', 'invalid'], 'active');
} catch (error) {
  // Error: Goal 'invalid' not found
  // Original order unchanged
}
```

---

#### 3. moveGoal

```typescript
/**
 * Move a single goal to a new position
 * Convenience method that calls reorderGoals internally
 * 
 * @param goalId - Goal to move
 * @param newPosition - Target index (0-based)
 * @param listType - 'active' or 'completed'
 * @returns Promise resolving when complete
 * @throws Error if goal not found or index invalid
 * 
 * @example
 * await moveGoal('g3', 0, 'active'); // Move g3 to top
 */
export async function moveGoal(
  goalId: string,
  newPosition: number,
  listType: 'active' | 'completed'
): Promise<void>;
```

**Behavior**:
1. Get current ordered list
2. Find goal by ID
3. Remove from current position
4. Insert at newPosition
5. Call reorderGoals with new sequence

**Example**:
```typescript
// Before: [g1, g2, g3]
await moveGoal('g3', 0, 'active');
// After: [g3, g1, g2]
```

---

#### 4. syncPendingReorders

```typescript
/**
 * Process all pending offline reorder operations
 * Called when internet connection is restored
 * 
 * @returns Promise resolving when sync complete or offline
 * @throws Error if sync fails (will retry on next call)
 * 
 * @example
 * window.addEventListener('online', () => {
 *   await goalStorage.syncPendingReorders();
 * });
 */
export async function syncPendingReorders(): Promise<void>;
```

**Behavior**:
1. Check `navigator.onLine`
2. If offline, return immediately
3. Fetch `reorder-queue` from localStorage
4. For each operation in queue:
   - Attempt backend sync (Phase 2)
   - Mark as 'syncing', then 'synced' or revert to 'pending'
5. Clear queue on success
6. Leave queue on failure (retry next time)

**Example**:
```typescript
// Offline: user reorders goals
await reorderGoals(['g3', 'g1', 'g2'], 'active');
// Goals saved locally with syncStatus: 'pending-sync'
// localStorage.reorder-queue: [{ timestamp: ..., listType: 'active', ... }]

// Later, user goes online
window.dispatchEvent(new Event('online'));
await syncPendingReorders();
// Queue processed and cleared
```

---

#### 5. clearAllGoals

```typescript
/**
 * Remove all goals (for cleanup or testing)
 * 
 * @param listType - 'active' or 'completed', or 'all'
 * @returns Promise resolving when complete
 */
export async function clearAllGoals(
  listType: 'active' | 'completed' | 'all'
): Promise<void>;
```

**Behavior**:
- Removes localStorage entries for specified list type(s)
- Also clears sync queue if `listType === 'all'`

---

## Internal Helpers (Not Exported)

```typescript
/**
 * Check if user is online
 */
function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Queue a reorder operation for later sync
 */
function queueReorderOperation(operation: ReorderOperation): void {
  const queue = JSON.parse(localStorage.getItem('reorder-queue') || '[]');
  queue.push(operation);
  localStorage.setItem('reorder-queue', JSON.stringify(queue));
}

/**
 * Announce message to screen readers
 */
function announceToScreenReader(message: string): void {
  // Creates ARIA live region
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}
```

---

## localStorage Schema

| Key | Type | Example |
|-----|------|---------|
| `goals:active` | JSON array | `[Goal, Goal, ...]` |
| `goals:completed` | JSON array | `[Goal, Goal, ...]` |
| `reorder-queue` | JSON array | `[ReorderOperation, ...]` |

---

## Error Scenarios

### Scenario 1: Goal Not Found
```typescript
await reorderGoals(['g1', 'invalid', 'g3'], 'active');
// Throws: Error: Goal 'invalid' not found
// localStorage unchanged; original order preserved
```

### Scenario 2: localStorage Full
```typescript
// If localStorage exceeds quota
try {
  await reorderGoals(newOrder, 'active');
} catch (error) {
  // QuotaExceededError
  // Handle gracefully; suggest clearing completed goals
}
```

### Scenario 3: Offline Sync Failure
```typescript
// Backend error during sync
await syncPendingReorders();
// Logs error but doesn't throw
// Queue remains in localStorage, will retry next time user goes online
```

---

## Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| getGoalsOrdered (100 items) | <5ms | Array parse + sort |
| reorderGoals (100 items) | <10ms | Renumber + localStorage.setItem |
| moveGoal (single item) | <2ms | Calculated as reorderGoals |
| syncPendingReorders | Varies | Network-dependent (Phase 2) |

---

## Testing Checklist (Manual)

- [ ] Call getGoalsOrdered, verify correct order
- [ ] Reorder via reorderGoals, verify renumbering
- [ ] Call moveGoal, verify single item moves
- [ ] Go offline, reorder, verify queued
- [ ] Go online, call syncPendingReorders, verify processing
- [ ] Exceed localStorage quota, verify error handling
- [ ] Close browser, reopen, verify persistence

---

## Integration Points

### From DraggableGoalsList.tsx

```typescript
import { reorderGoals } from '@/lib/goalStorage';

async function handleReorder(newOrder: Goal[]) {
  await reorderGoals(
    newOrder.map((g) => g.id),
    listType
  );
}
```

### From GoalsList.tsx (Parent)

```typescript
import { getGoalsOrdered, syncPendingReorders } from '@/lib/goalStorage';

// On page load
useEffect(() => {
  const loadGoals = async () => {
    const goals = await getGoalsOrdered('active');
    setActiveGoals(goals);
  };
  loadGoals();
}, []);

// On online event
useEffect(() => {
  window.addEventListener('online', syncPendingReorders);
  return () => window.removeEventListener('online', syncPendingReorders);
}, []);
```

### From crossTabSync.ts

```typescript
import { getGoalsOrdered } from '@/lib/goalStorage';

window.addEventListener('storage', async (event: StorageEvent) => {
  if (event.key === 'goals:active' || event.key === 'goals:completed') {
    const listType = event.key.split(':')[1] as 'active' | 'completed';
    const updatedGoals = await getGoalsOrdered(listType);
    // Update UI
  }
});
```

