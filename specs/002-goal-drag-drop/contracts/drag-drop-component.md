# Contract: DraggableGoalsList Component

**Phase**: Phase 1 Design  
**Type**: React Component Interface  
**Purpose**: Wrapper component that integrates Sortable.js for drag-and-drop reordering

---

## Component Signature

```typescript
interface DraggableGoalsListProps {
  /**
   * Ordered list of goals to display
   */
  goals: Goal[];

  /**
   * Called when user completes a drag operation
   * Receives new goal order after reordering
   * 
   * @param newOrder - Goals array in new order
   */
  onReorder: (newOrder: Goal[]) => void;

  /**
   * List type: active or completed goals
   * Used to determine styling and accessibility labels
   */
  listType: 'active' | 'completed';

  /**
   * Optional: Custom CSS class for wrapper div
   */
  className?: string;

  /**
   * Optional: Show loading indicator during sync
   * @default false
   */
  isSyncing?: boolean;

  /**
   * Optional: Disable drag-and-drop (e.g., while editing)
   * @default false
   */
  isDisabled?: boolean;
}

export function DraggableGoalsList(
  props: DraggableGoalsListProps
): React.ReactElement;
```

---

## Component Behavior

### Rendering

```typescript
<DraggableGoalsList
  goals={activeGoals}
  listType="active"
  onReorder={handleReorder}
  isSyncing={syncInProgress}
/>
```

Renders as:
```html
<div class="draggable-goals-list active">
  <div class="goal-card" data-goal-id="g1">
    <!-- Goal 1 content -->
  </div>
  <div class="goal-card" data-goal-id="g2">
    <!-- Goal 2 content -->
  </div>
  <!-- ... -->
</div>
```

### Visual Feedback States

| State | CSS Classes | When Applied |
|-------|---------|--------------|
| **Normal** | `goal-card bg-white border border-slate-200` | Default state |
| **Dragging** | `sortable-drag scale-105 shadow-xl opacity-75` | While user drags |
| **Drop Target** | `border-t-2 border-blue-500 opacity-70` | Hover during drag |
| **Keyboard Focus** | `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` | Tab navigation |
| **Syncing** | `opacity-50 pointer-events-none` | `isSyncing={true}` |

### Event Flow

1. **User initiates drag** (mouse/touch)
   - Sortable.js applies `dragClass`
   - Visual feedback shows elevation + shadow
   - `onMouseDown` / `onTouchStart` captured

2. **User hovers over drop target**
   - Sortable.js calculates insertion point
   - Border/line inserted visually

3. **User releases (drop)**
   - Sortable.js fires `onEnd` event
   - Component reads new DOM order
   - Calls `onReorder(newOrder)`

4. **Callback handler processes reorder**
   - Updates state / localStorage
   - Component re-renders with new goal order

### Keyboard Interaction

1. **User tabs to goal**
   - Goal card receives focus outline
   - Screen reader announces: "Goal: [title], Position [n] of [total]"

2. **User presses Shift+Up Arrow**
   - Component moves focus goal up one position
   - New order calculated
   - `onReorder(newOrder)` called
   - Focus moves with the goal

3. **User presses Enter**
   - Goal move is confirmed (visual feedback changes)
   - Temporary "move pending" state clears

4. **User presses Escape**
   - Pending move cancelled
   - Goal returns to original position
   - Focus remains on goal

---

## Access Points (from Parent)

### Parent Component Usage

```typescript
// In GoalsList.tsx or similar parent
function GoalsList() {
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);

  async function handleReorder(newOrder: Goal[]) {
    // Update state
    setActiveGoals(newOrder);

    // Persist to storage (async)
    try {
      await goalStorage.reorderGoals(
        newOrder.map((g) => g.id),
        'active'
      );
    } catch (error) {
      // Revert on error
      setActiveGoals(originalOrder);
      showNotification({ type: 'error', message: 'Reorder failed' });
    }
  }

  return (
    <DraggableGoalsList
      goals={activeGoals}
      listType="active"
      onReorder={handleReorder}
    />
  );
}
```

---

## Implementation Details (Component Internals)

### useEffect: Sortable.js Setup

```typescript
useEffect(() => {
  if (!listRef.current || goals.length === 0) {
    return;
  }

  const sortable = new Sortable(listRef.current, {
    // Ghost element styling (dragging element)
    ghostClass: 'sortable-ghost',
    
    // Element being dragged styling
    dragClass: 'sortable-drag',
    
    // CSS selector for drag handle
    handle: '.goal-card',
    
    // Animation speed (ms)
    animation: 150,
    
    // Prevent drag outside this list
    sort: true,
    
    // Event: Drag started
    onStart: () => {
      // Announce to screen readers
      announceToScreenReader('Drag started. Use arrow keys to move, Enter to confirm.');
    },
    
    // Event: Drag ended
    onEnd: (event) => {
      // Calculate new order
      const newOrder = Array.from(listRef.current!.children).map((el) => {
        const goalId = el.getAttribute('data-goal-id');
        return goals.find((g) => g.id === goalId);
      }).filter(Boolean) as Goal[];

      // Call parent callback
      onReorder(newOrder);
    },
  });

  // Cleanup on unmount
  return () => sortable.destroy();
}, [goals, onReorder, listType]);
```

### ARIA Attributes

```html
<div
  ref={listRef}
  role="list"
  aria-label="Goals list: {active/completed}"
  class="draggable-goals-list {listType}"
>
  {goals.map((goal) => (
    <div
      key={goal.id}
      role="listitem"
      data-goal-id={goal.id}
      tabIndex={0}
      aria-label={`Goal: ${goal.title}`}
      aria-describedby="goal-move-help"
      class="goal-card"
      onKeyDown={handleKeyDown}
    >
      {/* Goal card content (existing) */}
    </div>
  ))}

  <div id="goal-move-help" class="sr-only">
    Use Shift+Up/Down arrows to move, Enter to confirm, Escape to cancel
  </div>
</div>
```

---

## Error Handling

If `onReorder` throws:
```typescript
try {
  onReorder(newOrder);
} catch (error) {
  console.error('Reorder failed:', error);
  // Revert DOM to original state
  sortable.sort(originalIds);
  // Show user notification (handled by parent)
}
```

---

## Accessibility Compliance

| WCAG Criterion | Implementation |
|---|---|
| 1.4.3 Contrast | Tailwind colors meet AA standard (3:1 minimum) |
| 2.1.1 Keyboard | Arrow keys, Shift+Arrow, Enter, Escape all work |
| 2.1.2 Keyboard (No Trap) | Tab order not trapped; focus moves logically |
| 2.4.3 Focus Order | Focus visible with ring; order follows DOM |
| 3.2.4 Consistent Navigation | Keyboard shortcuts consistent across lists |
| 4.1.2 Name, Role, Value | ARIA labels + roles ensure screen readers announce correctly |

---

## Testing Checklist (Manual)

- [ ] Drag a goal with mouse, observe shadow + scale
- [ ] Drag on mobile, observe touch feedback
- [ ] Tab to goal, press Shift+Up Arrow, observe move + announcement
- [ ] Press Escape during keyboard move, observe revert
- [ ] Disable component with `isDisabled`, verify drag blocked
- [ ] Set `isSyncing={true}`, verify opacity + pointer-events-none applied
- [ ] Test with 50+ goals, verify performance smooth
- [ ] Test in Firefox, Safari, Chrome; observe consistent behavior

---

## Performance Notes

- Sortable.js initialization: ~5ms per 100 goals
- Reorder calculation: <1ms
- Re-render: React efficiently updates order field only (not full re-render)
- No virtual scrolling (not needed for typical goal lists)

