# Feature Specification: Goal Drag-and-Drop Reordering

**Feature Branch**: `002-goal-drag-drop`  
**Created**: February 5, 2026  
**Status**: Draft  
**Input**: User description: "drag and drop - let's make it so that users can reorder goals by dragging and dropping them above or below other goals in the list."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Reorder Active Goals (Priority: P1)

A user with multiple active goals wants to set their priority order visually. They find that dragging a goal card upward makes it appear earlier in the list, and dragging downward makes it appear later. This allows them to organize goals by personal priority without leaving the interface.

**Why this priority**: This is the core value of the feature—the ability to reorganize goals. It directly addresses the user's stated need and enables the feature to deliver value immediately. Any implementation of goal reordering must include this capability.

**Independent Test**: Can be fully tested by opening the goal list with at least 2 active goals, dragging one goal above/below another, and verifying the new order persists after page refresh.

**Acceptance Scenarios**:

1. **Given** user has 3 active goals in order [Goal A, Goal B, Goal C], **When** user drags Goal C above Goal A, **Then** the order becomes [Goal C, Goal A, Goal B]
2. **Given** user has reordered goals, **When** user refreshes the page, **Then** the new goal order is preserved
3. **Given** user is dragging a goal, **When** user hovers over another goal's position, **Then** a visual indicator shows where the goal will be placed if dropped
4. **Given** user starts dragging a goal, **When** user moves mouse outside goal area, **Then** the drag operation can be canceled and original order is maintained

---

### User Story 2 - Reorder Completed Goals (Priority: P2)

A user wants to organize their completed goals section to see recent completions at the top or group them by category. They can drag completed goal cards to reorder them, similar to active goals.

**Why this priority**: While valuable for organization, completed goals are less critical than active goals since users are less likely to frequently interact with completed items. However, it extends the feature consistency across both goal states.

**Independent Test**: Can be fully tested with 2+ completed goals by dragging one completed goal to a different position and verifying the order persists independently from active goals.

**Acceptance Scenarios**:

1. **Given** user has 2+ completed goals, **When** user drags one completed goal to a new position, **Then** the completed goals reorder without affecting active goals
2. **Given** completed goals are reordered, **When** user refreshes the page, **Then** the completed goals order is preserved separately

---

### User Story 3 - Visual Feedback During Drag (Priority: P1)

A user needs clear visual feedback while dragging to understand what will happen. They see the dragged goal appear raised/highlighted, and insertion points are indicated where the goal can be dropped.

**Why this priority**: While technically part of Story 1, this deserves explicit attention because poor drag-and-drop UX significantly degrades user confidence. Clear visual feedback is essential for usability and prevents user confusion.

**Independent Test**: Can be tested by initiating a drag operation and verifying visual states (raised appearance, insertion indicators, cursor changes) appear at appropriate times.

**Acceptance Scenarios**:

1. **Given** user starts dragging a goal, **When** goal is being dragged, **Then** the goal card appears elevated/highlighted to distinguish it from other goals
2. **Given** user is dragging a goal, **When** user hovers over drop zones, **Then** visual insertion indicators appear showing valid drop positions
3. **Given** user is dragging over invalid areas (if any), **When** user hovers there, **Then** the cursor indicates the action is not allowed or the area is not a valid drop target

---

### User Story 4 - Undo Recent Reordering (Priority: P3)

A user accidentally drops a goal in the wrong position. They want a simple way to undo the last reorder action without manually dragging it back.

**Why this priority**: This is nice-to-have for convenience but not essential for the core feature. Users can always re-drag items to correct positions. Implementation only after P1/P2 stories are complete.

**Independent Test**: Can be tested by reordering a goal, then using an undo action, and verifying the previous order is restored.

**Acceptance Scenarios**:

1. **Given** user has just reordered goals, **When** user triggers undo (e.g., Ctrl+Z or button), **Then** the previous goal order is restored

### Edge Cases

- What happens when a user drags a goal while the list is being updated by another browser tab/window?
- How does the system handle dragging when goals are being added or removed in real-time?
- What is the behavior when a user drags a goal and loses internet connection mid-drag?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to drag and drop goal cards within the active goals list to reorder them
- **FR-002**: System MUST allow users to drag and drop goal cards within the completed goals list to reorder them independently from active goals
- **FR-003**: System MUST persist the new goal order immediately upon drop (not requiring explicit save action)
- **FR-004**: System MUST preserve goal order across page refreshes and browser sessions
- **FR-005**: System MUST display visual feedback during drag operations (raised/highlighted state for dragged goal, insertion indicators for drop positions)
- **FR-006**: System MUST allow users to cancel a drag operation by moving the mouse outside the goal list or pressing Escape, restoring the original order
- **FR-007**: System MUST prevent users from dragging goals between active and completed lists
- **FR-008**: System MUST handle drag operations on touch devices (mobile/tablet) with appropriate touch gestures
- **FR-009**: System MUST maintain accessibility for drag-and-drop operations for users with keyboard navigation

### Key Entities *(include if feature involves data)*

- **Goal**: Represents a user's goal with properties including id, title, description, status (active/completed), and order (sequence position within its list)
  - **order** attribute: Integer representing the sequential position within the active or completed goals list
  - Must support updating this attribute when reordering occurs
- **GoalList**: Container for either active or completed goals with ordering maintained independently

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can reorder a goal within a list of 10 items in under 3 seconds (from drag initiation to drop completion)
- **SC-002**: Goal reorder persists with 100% reliability (verified by immediate check and after page refresh)
- **SC-003**: 95% of users successfully reorder a goal on first attempt without accidental drops in wrong positions
- **SC-004**: Drag-and-drop feature works on desktop (mouse) and mobile (touch) with no functional differences
- **SC-005**: Zero accessible keyboard users are blocked from reordering goals; full keyboard alternative navigation exists
- **SC-006**: Reorder operation completes and persists within 1 second or less, providing instant feedback to user

## Assumptions

- The existing goal storage system (localStorage or backend) supports storing and retrieving goal order
- Goals are displayed in two independent lists (active and completed) as per the existing UI architecture
- Users have either mouse/trackpad (desktop) or touch input (mobile) as their primary interaction method
- The feature is optional/nice-to-have; users can still manage goals if drag-and-drop is unavailable
- Undo functionality (P3) is not required for MVP and can be added later if needed
- Concurrent edits from multiple tabs/windows will use last-write-wins strategy (later reorder overrides earlier)
