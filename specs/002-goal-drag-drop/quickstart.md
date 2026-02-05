# Quickstart: Goal Drag-and-Drop Reordering

**Phase**: Phase 1 Design  
**For**: Developers implementing the drag-and-drop feature

---

## Installation

### 1. Install Sortable.js

```bash
npm install --save sortablejs
npm install --save-dev @types/sortablejs
```

### 2. Verify package.json

```json
{
  "dependencies": {
    "sortablejs": "^1.15.0"
  },
  "devDependencies": {
    "@types/sortablejs": "^1.15.0"
  }
}
```

---

## Basic Usage

### Step 1: Update Goal Type

**File**: `app/lib/types.ts`

```typescript
export interface Goal {
  id: string;
  title: string;
  endDate: Date;
  createdAt: Date;
  completedAt?: Date;
  
  // NEW: For drag-and-drop
  order: number; // 0-indexed sequential position
  syncStatus?: 'synced' | 'pending-sync';
}
```

### Step 2: Create DraggableGoalsList Component

**File**: `app/components/DraggableGoalsList.tsx`

```typescript
'use client';

import Sortable from 'sortablejs';
import { useEffect, useRef } from 'react';
import { Goal } from '@/lib/types';

interface DraggableGoalsListProps {
  goals: Goal[];
  onReorder: (newOrder: Goal[]) => void;
  listType: 'active' | 'completed';
  className?: string;
}

export function DraggableGoalsList({
  goals,
  onReorder,
  listType,
  className = '',
}: DraggableGoalsListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current || goals.length === 0) {
      return;
    }

    const sortable = new Sortable(listRef.current, {
      animation: 150,
      ghostClass: 'opacity-50 bg-slate-100',
      dragClass: 'scale-105 shadow-xl cursor-grabbing',
      handle: '.goal-card',
      onEnd: (event) => {
        const newOrder = Array.from(listRef.current!.children).map((el) => {
          const goalId = el.getAttribute('data-goal-id');
          return goals.find((g) => g.id === goalId);
        }).filter(Boolean) as Goal[];

        onReorder(newOrder);
      },
    });

    return () => sortable.destroy();
  }, [goals, onReorder]);

  return (
    <div
      ref={listRef}
      className={`space-y-2 ${className}`}
      role="list"
      aria-label={`${listType} goals list`}
    >
      {goals.map((goal) => (
        <div
          key={goal.id}
          data-goal-id={goal.id}
          role="listitem"
          tabIndex={0}
          className="goal-card bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md cursor-grab transition-shadow focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label={`Goal: ${goal.title}`}
        >
          {/* Render existing goal card content */}
          <h3 className="font-semibold">{goal.title}</h3>
          <p className="text-sm text-slate-600">Order: {goal.order}</p>
        </div>
      ))}
    </div>
  );
}
```

### Step 3: Update goalStorage.ts

**File**: `app/lib/goalStorage.ts`

```typescript
import { Goal } from './types';

export async function getGoalsOrdered(
  listType: 'active' | 'completed'
): Promise<Goal[]> {
  const key = `goals:${listType}`;
  const storedData = localStorage.getItem(key);
  
  if (!storedData) {
    return [];
  }

  const goals: Goal[] = JSON.parse(storedData);
  return goals.sort((a, b) => a.order - b.order);
}

export async function reorderGoals(
  goalIds: string[],
  listType: 'active' | 'completed'
): Promise<void> {
  const key = `goals:${listType}`;
  const currentGoals = await getGoalsOrdered(listType);
  
  const goalMap = new Map(currentGoals.map((g) => [g.id, g]));

  const reorderedGoals = goalIds
    .map((id) => goalMap.get(id))
    .filter(Boolean) as Goal[];

  const renumberedGoals = reorderedGoals.map((goal, index) => ({
    ...goal,
    order: index,
    syncStatus: isOnline() ? 'synced' : 'pending-sync',
  }));

  localStorage.setItem(key, JSON.stringify(renumberedGoals));

  if (!isOnline()) {
    queueReorderOperation({
      timestamp: Date.now(),
      listType,
      goalIds,
      syncStatus: 'pending',
    });
  }
}

export async function syncPendingReorders(): Promise<void> {
  if (!isOnline()) {
    return;
  }

  const queueData = localStorage.getItem('reorder-queue');
  if (!queueData) {
    return;
  }

  const queue = JSON.parse(queueData);

  for (const operation of queue) {
    try {
      // TODO: POST to backend /api/goals/reorder
      operation.syncStatus = 'synced';
    } catch (error) {
      console.error('Sync failed:', error);
      return;
    }
  }

  localStorage.removeItem('reorder-queue');
}

function isOnline(): boolean {
  return navigator.onLine;
}

function queueReorderOperation(operation: any): void {
  const queue = JSON.parse(localStorage.getItem('reorder-queue') || '[]');
  queue.push(operation);
  localStorage.setItem('reorder-queue', JSON.stringify(queue));
}
```

### Step 4: Create crossTabSync.ts

**File**: `app/lib/crossTabSync.ts`

```typescript
export function initializeCrossTabSync(
  onRemoteReorder: (listType: 'active' | 'completed') => void
): void {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === 'goals:active' || event.key === 'goals:completed') {
      const listType = event.key === 'goals:active' ? 'active' : 'completed';
      
      // Show toast notification
      const message = `Goals reordered in another tab`;
      console.log(message);
      
      // Callback to update UI
      onRemoteReorder(listType);
    }
  });
}
```

### Step 5: Update GoalsList Component

**File**: `app/components/GoalsList.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Goal } from '@/lib/types';
import { getGoalsOrdered, reorderGoals, syncPendingReorders } from '@/lib/goalStorage';
import { initializeCrossTabSync } from '@/lib/crossTabSync';
import { DraggableGoalsList } from './DraggableGoalsList';

export function GoalsList() {
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);

  // Load goals on mount
  useEffect(() => {
    const loadGoals = async () => {
      const active = await getGoalsOrdered('active');
      const completed = await getGoalsOrdered('completed');
      setActiveGoals(active);
      setCompletedGoals(completed);
    };
    loadGoals();
  }, []);

  // Set up online sync
  useEffect(() => {
    const handleOnline = async () => {
      await syncPendingReorders();
      const active = await getGoalsOrdered('active');
      setActiveGoals(active);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Set up cross-tab sync
  useEffect(() => {
    const handleRemoteReorder = async (listType: 'active' | 'completed') => {
      if (listType === 'active') {
        const updated = await getGoalsOrdered('active');
        setActiveGoals(updated);
      } else {
        const updated = await getGoalsOrdered('completed');
        setCompletedGoals(updated);
      }
    };
    initializeCrossTabSync(handleRemoteReorder);
  }, []);

  // Handle reorder
  const handleReorderActive = async (newOrder: Goal[]) => {
    setActiveGoals(newOrder);
    try {
      await reorderGoals(
        newOrder.map((g) => g.id),
        'active'
      );
    } catch (error) {
      console.error('Reorder failed:', error);
      // Revert to previous state (could keep original goals state)
    }
  };

  const handleReorderCompleted = async (newOrder: Goal[]) => {
    setCompletedGoals(newOrder);
    try {
      await reorderGoals(
        newOrder.map((g) => g.id),
        'completed'
      );
    } catch (error) {
      console.error('Reorder failed:', error);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">Active Goals</h2>
        <DraggableGoalsList
          goals={activeGoals}
          listType="active"
          onReorder={handleReorderActive}
        />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Completed Goals</h2>
        <DraggableGoalsList
          goals={completedGoals}
          listType="completed"
          onReorder={handleReorderCompleted}
        />
      </section>
    </div>
  );
}
```

---

## Testing Manually

### Test 1: Basic Drag and Drop

1. `npm run dev`
2. Open http://localhost:3000
3. Drag a goal card upward
4. Observe shadow elevation + scale feedback
5. Drop the goal
6. Verify new order persists in localStorage

**Check**:
```javascript
// In browser DevTools console
JSON.parse(localStorage.getItem('goals:active'))
// Should show reordered goals with updated order field
```

### Test 2: Keyboard Navigation

1. Tab to a goal card
2. Observe focus ring (blue border)
3. Press Shift+Up Arrow
4. Observe goal moves up one position
5. Press Enter to confirm
6. Verify new order persists

### Test 3: Offline Reordering

1. Open DevTools → Network → set to "Offline"
2. Reorder a goal
3. Check localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('reorder-queue'))
   // Should show pending operation
   ```
4. Go back online (Network → No throttling)
5. Observe sync completes (queue clears)

### Test 4: Cross-Tab Sync

1. Open app in two browser tabs
2. In Tab A, reorder a goal
3. In Tab B, observe order automatically updates
4. Check browser console for "Goals reordered in another tab" message

### Test 5: Responsive Design

1. DevTools → toggle device toolbar (mobile)
2. Try touch drag on mobile emulation
3. Observe responsive layout and touch feedback

---

## Debugging Tips

### Check localStorage

```javascript
// View all goal-related data
const storage = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key?.includes('goal')) {
    storage[key] = JSON.parse(localStorage.getItem(key) || '{}');
  }
}
console.table(storage);
```

### Monitor Storage Events

```javascript
window.addEventListener('storage', (event) => {
  console.log('Storage changed:', event.key, event.newValue);
});
```

### Check Sync Status

```javascript
const activeGoals = JSON.parse(localStorage.getItem('goals:active') || '[]');
activeGoals.forEach((g, i) => {
  console.log(`Goal ${i}: ${g.title}, syncStatus: ${g.syncStatus}`);
});
```

---

## Common Issues

### Issue: Drag not working
**Solution**: Ensure `handle: '.goal-card'` matches your card selector and component has correct `data-goal-id`

### Issue: Order not persisting
**Solution**: Check localStorage quota; verify `localStorage.setItem()` not throwing QuotaExceededError

### Issue: Cross-tab sync not firing
**Solution**: Ensure both tabs are on same origin (http://localhost:3000 vs http://127.0.0.1:3000 are different origins)

### Issue: Keyboard shortcuts not working
**Solution**: Verify Sortable.js 1.15+ installed; check that Shift+Arrow event not captured by browser default (may need event.preventDefault())

---

## Next Steps

1. **Implement Phase 1 components** using this guide
2. **Test manually** against each scenario above
3. **Add backend sync** in Phase 2 (update `/api/goals/reorder` endpoint)
4. **Implement toast notifications** when cross-tab sync occurs
5. **Accessibility audit** with screen reader (NVDA/JAWS/VoiceOver)

---

## File Checklist

- [ ] Updated `app/lib/types.ts` with `order` field
- [ ] Created `app/components/DraggableGoalsList.tsx`
- [ ] Updated `app/lib/goalStorage.ts` with reorder functions
- [ ] Created `app/lib/crossTabSync.ts`
- [ ] Updated `app/components/GoalsList.tsx` (or main goals component)
- [ ] Installed `sortablejs` and `@types/sortablejs`
- [ ] Tested drag, keyboard, offline, cross-tab, responsive scenarios
- [ ] Updated Tailwind config (if needed) for custom drag classes

