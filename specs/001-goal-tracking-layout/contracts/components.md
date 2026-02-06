# Component Contracts - Goal Tracking UI

**Version**: 1.0  
**Date**: 2026-02-04  
**Framework**: React + Tailwind CSS + shadcn/ui  

---

## Component Hierarchy

```
<HomePage>
  │
  ├─ <GoalListsContainer>           # Two-column layout wrapper
  │   │
  │   ├─ <ActiveGoalsColumn>        # Left column
  │   │   ├─ <AddGoalButton />      # "Add Goal" CTA
  │   │   ├─ <GoalsList goals={} /> # Scrollable list
  │   │   │   ├─ <ActiveGoalCard /> # Individual active goal
  │   │   │   ├─ <ActiveGoalCard />
  │   │   │   └─ ...
  │   │   └─ <EmptyState />         # If no active goals
  │   │
  │   └─ <CompletedGoalsColumn>    # Right column
  │       ├─ <GoalsList goals={} /> # Reverse chronological
  │       │   ├─ <CompletedGoalCard /> # Individual completed goal
  │       │   ├─ <CompletedGoalCard />
  │       │   └─ ...
  │       └─ <EmptyState />         # If no completed goals
  │
  └─ <AddGoalModal>                # Modal form
      ├─ <Dialog>
      ├─ <Input name="title" />
      ├─ <Input type="date" name="endDate" />
      └─ <Button>Create</Button>
```

---

## Component Contracts

### 1. HomePage / page.tsx

**Purpose**: Root page component, manages global state (active + completed goals), localStorage sync.

**Props**: None (page component)

**State**:
```typescript
const [goals, setGoals] = useState<Goal[]>([]);           // Active goals
const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
const [addModalOpen, setAddModalOpen] = useState(false);
```

**Responsibilities**:
- Load goals from localStorage on mount
- Sync goals to localStorage on change
- Handle checkout (move goal to completed)
- Handle restore (move goal back to active)
- Handle permanent delete
- Handle new goal creation
- Render two-column layout

**Key Functions**:
```typescript
const handleCheckGoal = (id: string) => { /* ... */ };
const handleRestoreGoal = (id: string) => { /* ... */ };
const handleDeleteGoal = (id: string, isCompleted: boolean) => { /* ... */ };
const handleAddGoal = (title: string, endDate: Date) => { /* ... */ };
```

**Renders**:
```tsx
<div className="min-h-screen bg-gray-50 p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
    <ActiveGoalsColumn goals={goals} onCheck={handleCheckGoal} ... />
    <CompletedGoalsColumn goals={completedGoals} onRestore={handleRestoreGoal} ... />
  </div>
  <AddGoalModal open={addModalOpen} onOpenChange={setAddModalOpen} onSubmit={handleAddGoal} />
</div>
```

---

### 2. ActiveGoalsColumn

**Purpose**: Left column header, CTA, and goals list.

**Props**:
```typescript
interface ActiveGoalsColumnProps {
  goals: Goal[];
  onCheck: (id: string) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
}
```

**Renders**:
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-bold">Active Goals</h2>
    <AddGoalButton onClick={onAddClick} />
  </div>
  {goals.length === 0 ? (
    <EmptyState type="active" />
  ) : (
    <GoalsList goals={sortActiveGoals(goals)} onCheck={onCheck} onDelete={onDelete} />
  )}
</div>
```

---

### 3. CompletedGoalsColumn

**Purpose**: Right column with completed goals list.

**Props**:
```typescript
interface CompletedGoalsColumnProps {
  goals: Goal[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Renders**:
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-bold mb-4">Completed Goals</h2>
  {goals.length === 0 ? (
    <EmptyState type="completed" />
  ) : (
    <GoalsList goals={sortCompletedGoals(goals)} isCompleted={true} onRestore={onRestore} onDelete={onDelete} />
  )}
</div>
```

---

### 4. GoalsList

**Purpose**: Renders list of goals (active or completed).

**Props**:
```typescript
interface GoalsListProps {
  goals: Goal[];
  isCompleted?: boolean;
  onCheck?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Renders**:
```tsx
<div className="space-y-3 max-h-[600px] overflow-y-auto">
  {goals.map((goal) => (
    isCompleted ? (
      <CompletedGoalCard key={goal.id} goal={goal} onRestore={onRestore} onDelete={onDelete} />
    ) : (
      <ActiveGoalCard key={goal.id} goal={goal} onCheck={onCheck} onDelete={onDelete} />
    )
  ))}
</div>
```

---

### 5. ActiveGoalCard

**Purpose**: Individual active goal with countdown, warning/critical states, checkbox, and delete.

**Props**:
```typescript
interface ActiveGoalCardProps {
  goal: Goal;
  onCheck: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Derived Data**:
```typescript
const days = daysRemaining(goal.endDate);
const status = getVisualStatus(goal.endDate); // "active" | "warning" | "critical"
const bgColor = status === "warning" ? "bg-warning" : status === "critical" ? "bg-critical" : "bg-white";
```

**Renders**:
```tsx
<div className={`${bgColor} border-l-4 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition`}>
  <div className="flex items-center flex-1 gap-3">
    <input type="checkbox" onChange={() => onCheck(goal.id)} className="h-5 w-5" />
    <div className="flex-1">
      <p className="font-semibold text-gray-800">{goal.title}</p>
      <p className="text-sm text-gray-600">{days} days left</p>
    </div>
  </div>
  <button onClick={() => onDelete(goal.id)} className="text-red-500 hover:text-red-700 transition">
    🗑️
  </button>
</div>
```

---

### 6. CompletedGoalCard

**Purpose**: Individual completed goal with restore and delete buttons.

**Props**:
```typescript
interface CompletedGoalCardProps {
  goal: Goal & { completedAt: Date };
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Renders**:
```tsx
<div className="bg-gray-100 border rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition opacity-75">
  <div className="flex-1">
    <p className="font-semibold text-gray-700 line-through">{goal.title}</p>
    <p className="text-xs text-gray-500">Completed: {formatDate(goal.completedAt)}</p>
  </div>
  <div className="flex gap-2">
    <button onClick={() => onRestore(goal.id)} className="text-blue-500 hover:text-blue-700 transition">
      ↻ Restore
    </button>
    <button onClick={() => onDelete(goal.id)} className="text-red-500 hover:text-red-700 transition">
      🗑️
    </button>
  </div>
</div>
```

---

### 7. AddGoalButton

**Purpose**: CTA button to open "Add Goal" modal.

**Props**:
```typescript
interface AddGoalButtonProps {
  onClick: () => void;
}
```

**Renders**:
```tsx
<button onClick={onClick} className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
  + Add Goal
</button>
```

---

### 8. AddGoalModal

**Purpose**: Modal form to create new goal (title + end date).

**Props**:
```typescript
interface AddGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, endDate: Date) => void;
}
```

**State** (internal):
```typescript
const [title, setTitle] = useState("");
const [endDate, setEndDate] = useState<Date | null>(null);
const [error, setError] = useState<string | null>(null);
```

**Validation**:
```typescript
const handleSubmit = () => {
  const err = validateGoal(title, endDate);
  if (err) {
    setError(err);
    return;
  }
  onSubmit(title, endDate!);
  setTitle("");
  setEndDate(null);
  setError(null);
  onOpenChange(false);
};
```

**Renders** (using shadcn Dialog):
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="sm:max-w-[400px]">
    <DialogHeader>
      <DialogTitle>Add New Goal</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Goal Title</label>
        <Input
          placeholder="e.g., Launch product feature"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">End Date</label>
        <Input type="date" value={endDate?.toISOString().split("T")[0] || ""} onChange={(e) => setEndDate(new Date(e.target.value))} />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Create Goal</Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

---

### 9. EmptyState

**Purpose**: Contextual message when a column has no goals.

**Props**:
```typescript
interface EmptyStateProps {
  type: "active" | "completed";
}
```

**Renders**:
```tsx
<div className="text-center py-12">
  <p className="text-gray-500 text-base">
    {type === "active"
      ? "No active goals. Click 'Add Goal' to get started!"
      : "No completed goals yet. Complete your first goal to celebrate your progress!"}
  </p>
</div>
```

---

### 10. Utility Components

#### cn() Utility (classname helper)

```typescript
// app/utils/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage**:
```tsx
<div className={cn(
  "p-4 rounded-lg",
  status === "warning" && "bg-warning",
  status === "critical" && "bg-critical"
)}>
```

---

## Event Flows

### User Marks Goal Complete

```
ActiveGoalCard (checkbox click)
  → onCheck(id)
  → HomePage.handleCheckGoal(id)
    → Find goal in goals array
    → Create completedGoal with completedAt
    → Add to completedGoals
    → Remove from goals
    → setGoals(), setCompletedGoals() (triggers localStorage sync via useEffect)
  → UI re-renders: goal moves from left to right column
```

### User Restores Completed Goal

```
CompletedGoalCard (↻ button click)
  → onRestore(id)
  → HomePage.handleRestoreGoal(id)
    → Find goal in completedGoals
    → Remove completedAt field
    → Add back to goals
    → Remove from completedGoals
    → setGoals(), setCompletedGoals() (triggers localStorage sync)
  → UI re-renders: goal moves from right back to left column
```

### User Creates New Goal

```
AddGoalModal (submit)
  → onSubmit(title, endDate)
  → HomePage.handleAddGoal(title, endDate)
    → Create Goal object with id, createdAt
    → Add to goals array
    → setGoals() (triggers localStorage sync)
    → Close modal
  → UI re-renders: new goal appears in left column
```

### User Deletes Goal

```
GoalCard (🗑️ button click)
  → onDelete(id, isCompleted)
  → HomePage.handleDeleteGoal(id, isCompleted)
    → Find and remove from appropriate array (goals or completedGoals)
    → setGoals() or setCompletedGoals() (triggers localStorage sync)
  → UI re-renders: goal removed from column
```

---

## Accessibility

- **Keyboard Navigation**: All buttons focusable, modal manages focus trap
- **ARIA Labels**: Dialog/Button shadcn components include semantic ARIA
- **Color Contrast**: Warning/critical colors have sufficient contrast (WCAG AA compliant)
- **Touch Targets**: All interactive elements ≥48px (Tailwind defaults)
- **Screen Readers**: Form labels associated with inputs, semantic HTML

---

## Responsive Behavior

### Mobile (< 768px)
- Columns stack vertically
- Full-width inputs in modal
- Larger touch targets (padding increased)

### Tablet (768px - 1024px)
- Two-column grid, equal width
- Moderate spacing

### Desktop (> 1024px)
- Two-column grid, max-width container (1152px)
- Comfortable spacing, hover states visible

---

## Summary

| Component | Purpose | State | Key Callbacks |
|-----------|---------|-------|---------------|
| HomePage | Root, global state | goals, completedGoals, addModalOpen | handleCheckGoal, handleRestoreGoal, handleDeleteGoal, handleAddGoal |
| ActiveGoalsColumn | Left column wrapper | (via props) | onCheck, onDelete, onAddClick |
| CompletedGoalsColumn | Right column wrapper | (via props) | onRestore, onDelete |
| GoalsList | List renderer | (via props) | onCheck, onRestore, onDelete |
| ActiveGoalCard | Individual active goal | (via props) | onCheck, onDelete |
| CompletedGoalCard | Individual completed goal | (via props) | onRestore, onDelete |
| AddGoalButton | CTA | (via props) | onClick |
| AddGoalModal | Form modal | title, endDate, error | onSubmit, onOpenChange |
| EmptyState | Placeholder | (via props) | N/A |

