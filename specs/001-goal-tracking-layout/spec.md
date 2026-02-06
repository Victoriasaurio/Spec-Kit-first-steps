# Feature Specification: DoIt Goal Tracking - Initial Page Setup

**Feature Branch**: `001-goal-tracking-layout`  
**Created**: 2026-02-04  
**Status**: Draft  
**Input**: User description: "initial page setup - goal tracking web app called 'doit' with two-column layout..."

## Clarifications

### Session 2026-02-04

- Q: Date boundary behavior—what happens when a goal's end date equals today? → A: Goals with end_date=today show "0 days left" and remain in active column. Users can check them off. Only after 11:59 PM (end of day) does the goal expire.
- Q: Sorting & display order for completed goals—should users be able to reorder, or is a fixed sort required? → A: Fixed reverse chronological by completion_date (newest first). No user sorting/filtering in MVP.
- Q: Undo/restore duration & scope—how long should restore work? → A: Persistent restore button on each completed goal (↻ icon or "Restore" button). Works anytime, even after page refresh. Stored in localStorage.
- Q: Visual warning threshold—fixed or configurable? → A: Fixed 3-day threshold for MVP. Two visual levels: warning (3-1 days, pastel yellow), critical (0 or fewer days, pastel red).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Active Goals with Countdown (Priority: P1)

As a goal-focused user, I want to see my current goals displayed prominently with a countdown of days remaining so I can prioritize my efforts on goals that are about to expire.

**Why this priority**: This is the core MVP feature—users need to see their active goals at a glance. Without this, the app has no primary value. This story alone delivers a complete, usable feature.

**Independent Test**: Can be fully tested by: loading the app, verifying the left column displays active goals with remaining day counts, and confirming the display updates correctly based on goal end dates.

**Acceptance Scenarios**:

1. **Given** a user visits the app with 3 active goals, **When** the page loads, **Then** all 3 goals appear in the left column with their titles and days remaining (e.g., "Goal Title — 5 days left")
2. **Given** a goal has 2 days remaining, **When** the page loads, **Then** that goal is highlighted with a warning style (pastel highlight)
3. **Given** a goal expires today, **When** the page displays it, **Then** it shows "0 days left" and is visually highlighted
4. **Given** a goal has expired, **When** the page loads, **Then** it is not displayed in the active column
5. **Given** no goals exist, **When** the page loads, **Then** the left column displays a helpful empty state message

---

### User Story 2 - Manage Goal Completion (Priority: P1)

As a goal tracker, I want to check a goal and move it to a completed column so I can celebrate my wins and keep my active goals focused on what I'm currently working on.

**Why this priority**: Equally critical to US1—users need to mark progress. Without this, goals pile up forever and become stale. This enables the core feedback loop.

**Independent Test**: Can be fully tested by: creating a goal, checking its checkbox, verifying it moves to the right column (or is marked complete), and confirming the active column updates.

**Acceptance Scenarios**:

1. **Given** a user has an active goal in the left column, **When** they click the checkbox next to the goal, **Then** the goal is marked as complete
2. **Given** a goal is marked complete, **When** the action completes, **Then** the goal moves to the right "Completed Goals" column
3. **Given** a goal is in the Completed column, **When** the user views the page, **Then** the completed goal remains visible in the right column
4. **Given** a goal is in the Completed column, **When** the user clicks the "Restore" or ↻ button, **Then** the goal moves back to the Active column with recalculated days remaining
5. **Given** a goal is restored from Completed column, **When** the page is refreshed, **Then** the goal remains in Active column (restore persists)
6. **Given** multiple goals are completed, **When** the user views the page, **Then** all completed goals display in the right column in reverse chronological order (newest first)

---

### User Story 3 - Delete Goals Permanently (Priority: P2)

As a user, I want to permanently delete goals I no longer want to track so I can keep my goal list clean and focused on what matters.

**Why this priority**: Important for maintaining a clean list, but not as critical as viewing and checking goals. Users can still be productive without delete (they just mark complete), making this P2.

**Independent Test**: Can be fully tested by: selecting a goal, clicking delete, confirming the goal is removed from both columns, and verifying it does not reappear on page reload.

**Acceptance Scenarios**:

1. **Given** a goal is displayed (active or completed), **When** the user clicks a delete button/icon, **Then** a confirmation dialog appears asking "Delete goal permanently?"
2. **Given** the confirmation dialog is shown, **When** the user confirms, **Then** the goal is removed from the page immediately
3. **Given** the confirmation dialog is shown, **When** the user cancels, **Then** the goal remains unchanged
4. **Given** a goal is deleted, **When** the page is refreshed, **Then** the goal is not restored (deletion is permanent)

---

### User Story 4 - Add New Goals via Modal Form (Priority: P2)

As a user, I want to click a button to open a modal form where I can enter a goal title and end date, so I can easily add new goals to track.

**Why this priority**: Essential for building the goal list, but users can view/manage existing goals (US1-US3) first. Once that's solid, adding new goals unlocks the full loop.

**Independent Test**: Can be fully tested by: clicking "Add Goal" button, filling in the modal form with a title and date, submitting, and verifying the new goal appears in the left column.

**Acceptance Scenarios**:

1. **Given** the user views the app, **When** they click the "Add Goal" or "+" button, **Then** a modal dialog opens with two input fields: "Goal Title" and "End Date"
2. **Given** the modal is open, **When** the user enters a title and selects an end date and clicks "Create", **Then** the modal closes
3. **Given** the modal closes after creating a goal, **When** the page updates, **Then** the new goal appears in the left "Active Goals" column
4. **Given** the user attempts to submit the form with an empty title, **When** they click "Create", **Then** an error message appears: "Goal title is required"
5. **Given** the user attempts to submit with a date in the past, **When** they click "Create", **Then** an error message appears: "End date must be in the future or today"
6. **Given** the user attempts to submit with today's date, **When** they click "Create", **Then** the form accepts it and creates the goal with "0 days left" status
7. **Given** the modal is open, **When** the user clicks outside the modal or clicks "Cancel", **Then** the modal closes without creating a goal

---

### Edge Cases

- What happens if a user checks a goal and then refreshes the page—does it persist as completed?
- How does the system handle a goal whose end date is exactly today?
- What if the user has 100+ goals in the completed column—does the UI remain responsive?
- How are goals displayed if two goals have the same end date—is there a secondary sort order?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display active goals in a left column with title and days remaining formatted as "Goal Title — X days left"
- **FR-002**: System MUST display completed goals in a right column with their titles, sorted by completion_date in descending order (newest first)
- **FR-003**: System MUST calculate days remaining as: ceiling(end_date - today)
- **FR-004**: System MUST highlight goals with 3 days or fewer remaining with a "warning" visual style (pastel yellow background or border)
- **FR-005**: System MUST highlight goals with 0 or fewer days remaining (overdue/expired) with a "critical" visual style (pastel red background or border), visually distinct from warning style
- **FR-006**: System MUST not display expired goals (end_date < today) in the active column unless explicitly restored
- **FR-007**: System MUST provide a checkbox next to each active goal that marks it complete and moves it to the completed column
- **FR-008**: System MUST provide a delete button/icon for each goal (active or completed) with confirmation dialog
- **FR-009**: System MUST render a "Add Goal" button (or "+ New Goal") that opens a modal dialog
- **FR-010**: System MUST validate goal title is not empty before accepting form submission
- **FR-011**: System MUST validate end date is in the future (end_date ≥ today) before accepting form submission; today is a valid end date
- **FR-011a**: System MUST treat goals with end_date=today as "0 days left" (completable during that day); they only expire and leave active column after 11:59 PM (end of calendar day)
- **FR-012**: System MUST render the modal with input fields: Goal Title (text input) and End Date (date picker)
- **FR-013**: System MUST display a helpful empty state in the left column when no active goals exist (e.g., "No active goals! Time to add one 🎉")
- **FR-014**: System MUST display empty state in the right column when no completed goals exist (e.g., "No completed goals yet. Keep working! 💪")
- **FR-015**: System MUST persist all goal state (active/completed/deleted) to browser storage (localStorage) so data survives page refresh
- **FR-016**: System MUST provide a persistent "Restore" button (or ↻ icon) next to each completed goal; clicking restores the goal to active column and recalculates days remaining
- **FR-016a**: Restore functionality MUST persist across page refreshes (stored in localStorage); users can restore completed goals anytime, indefinitely
- **FR-016b**: When a goal is restored from completed to active, it MUST recalculate days remaining based on its original end_date

### Key Entities

- **Goal**: Represents a single tracked objective
  - Attributes: `id` (unique identifier), `title` (string), `endDate` (ISO date), `status` (enum: "active", "completed", "deleted"), `createdAt` (timestamp)
  - Relationships: Belongs to a user session (no multi-user auth in MVP)

- **UI State**: Represents what the user currently sees
  - Attributes: `activeGoals` (array of Goal), `completedGoals` (array of Goal), `modalOpen` (boolean), `sortOrder` (e.g., "days-remaining" or "created-date")

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User can view all active goals with countdown on initial page load (no errors, all goals render within 2 seconds)
- **SC-002**: User can add a new goal via modal form and see it in the active column within 1 second of submission
- **SC-003**: User can mark a goal complete and see it move to the completed column immediately (instant visual feedback)
- **SC-004**: User can delete a goal and confirm deletion does not reappear after page refresh
- **SC-005**: Goals within 3 days of expiration are visually distinct (highlighted with warning color) from other active goals
- **SC-006**: The layout is fully responsive and usable on mobile (viewport ≤ 480px), tablet (480px–1024px), and desktop (≥1024px)
- **SC-007**: Users find the UI intuitive: 90% of new users successfully complete "add goal → complete goal → delete goal" workflow without documentation
- **SC-008**: All interactive elements (buttons, checkboxes, form inputs) meet accessibility standards (48px minimum touch target, clear focus states, readable contrast ratios per WCAG AA)
- **SC-009**: Page loads and remains responsive even with 50+ goals in memory
- **SC-010**: Modern light theme with fun pastel colors is present and visually cohesive across all UI elements

## Assumptions

- **No authentication required**: MVP is single-user, browser-based (no login/multi-device sync)
- **LocalStorage is acceptable**: Data is stored in browser localStorage; no backend database required
- **Date validation**: End dates must be in the future; users cannot set goals in the past
- **Timezone handling**: All dates treated as local user timezone (no explicit timezone selection needed)
- **Default day calculation**: "Days left" calculated as ceiling of (end_date - today); e.g., a goal ending tomorrow = 1 day left
- **No recurring goals**: All goals are one-time; no support for repeating goals in MVP
- **No goal categories/tags**: Goals are untagged; all goals treated equally for display/prioritization
- **Pastel color theme**: "Fun pastel colours" interpreted as soft, desaturated colors (e.g., pastels from Tailwind CSS or similar library)
