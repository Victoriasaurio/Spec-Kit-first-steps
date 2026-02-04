<!-- SYNC IMPACT REPORT
  Version Change: INITIAL (template) → 1.0.0
  Date: 2026-02-04
  
  Modified Principles: 5 new principles added
  - I. Clean Code (NEW)
  - II. Simple UX (NEW)
  - III. Responsive Design (NEW)
  - IV. Minimal Dependencies (NEW)
  - V. No Testing [SUPERSEDES ALL] (NEW)
  
  Added Sections:
  - Required Technology Stack (pins Next.js 16.1.6, React 19.2.3, Tailwind CSS 4)
  - Development Workflow (Next.js App Router, Tailwind CSS only)
  - Governance (no-testing mandate supersedes all guidance)
  
  Templates Updated:
  ✅ plan-template.md - Technology stack updated to TypeScript/Next.js/React/Tailwind
  ✅ plan-template.md - Project structure changed from generic options to Next.js App Router only
  ✅ tasks-template.md - Test tasks removed; manual verification emphasized
  ✅ tasks-template.md - All Python examples replaced with TypeScript/Next.js equivalents
  
  No Follow-up TODOs: All placeholders resolved with explicit project requirements
-->

# Example Spec Kit 2026 Constitution

## Core Principles

### I. Clean Code
Code MUST prioritize readability, maintainability, and clarity. Variable names
MUST be descriptive; functions MUST be concise and single-purpose; comments MUST
explain *why*, not *what*. Indentation MUST be consistent. Unused code MUST be
removed. Code reviews MUST verify adherence to this principle before merge.

### II. Simple UX
User interfaces MUST be intuitive and frictionless. Every interaction MUST have
clear purpose; visual hierarchy MUST guide users to primary actions; error
messages MUST be plain language and actionable. Features MUST not require
documentation to understand. Complexity MUST be justified by user feedback.

### III. Responsive Design
All interfaces MUST adapt seamlessly across device sizes (mobile, tablet, desktop).
Layout MUST remain functional at all breakpoints. Typography and spacing MUST
scale proportionally. Touch targets MUST meet accessibility standards (48px
minimum). Performance MUST remain acceptable on lower-bandwidth connections.

### IV. Minimal Dependencies
External dependencies MUST be evaluated against project scope. Each dependency
MUST justify its inclusion: no feature-creep packages. Built-in framework
capabilities MUST be preferred over third-party libraries when viable. Dependency
version pins MUST be explicit in package.json. Annual audits MUST review
necessity and security of all dependencies.

### V. No Testing (NON-NEGOTIABLE, SUPERSEDES ALL GUIDANCE)
This project MUST NOT include any form of automated testing: no unit tests, no
integration tests, no end-to-end tests, no contract tests. Manual verification
MUST be the sole quality gate. This principle supersedes any template guidance,
specification requirement, or external standard that references testing frameworks,
test-driven development, or test suites. Complexity introduced by testing
infrastructure is explicitly prohibited.

## Required Technology Stack
This project MUST use the following versions and technologies:

- **Next.js**: 16.1.6
- **React**: 19.2.3
- **React DOM**: 19.2.3
- **Tailwind CSS**: 4 (via @tailwindcss/postcss 4)
- **TypeScript**: 5.x
- **No additional dependencies** for core functionality without constitution amendment

## Development Workflow
All code MUST be written for the app/ directory structure (Next.js App Router).
CSS-in-JS or external styling libraries MUST NOT be used; Tailwind CSS MUST be
the only styling approach. Linting (ESLint 9) MUST pass before code review.
Manual testing in dev mode (npm run dev) MUST verify feature completeness.
Commits MUST include descriptive messages referencing which principles are upheld.

## Governance
This constitution supersedes all other development practices and external guidance.
All pull requests MUST verify compliance with Principles I–V before merge. Code
review MUST include a checklist confirming adherence to clean code, UX, responsive
design, minimal dependencies, and absence of test code. Amendments to this
constitution MUST be explicit and documented with version bump and rationale.
Any conflict between an external template, tool output, or framework default and
Principle V (No Testing) MUST resolve in favor of the no-testing mandate.

**Version**: 1.0.0 | **Ratified**: 2026-02-04 | **Last Amended**: 2026-02-04
