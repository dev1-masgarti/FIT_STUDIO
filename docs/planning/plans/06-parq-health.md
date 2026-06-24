# Plan 06 — PARQ Health Form

**Phase:** 7  
**Screens:** 6.1 Intro, 6.2 Detail, 6.3 Summary  
**Source:** `docs/PARQ only 240828.pdf`, wireframe Flow 6

---

## Features

### Screen 6.1 — PARQ Intro
- [ ] Header: ← back, "Health Form"
- [ ] Progress bar (~10%)
- [ ] Title: "Physical Activity Readiness"
- [ ] Subtitle: ownership + team messaging
- [ ] **7 standard PAR-Q questions** (Y/N buttons each):
  1. Heart condition — doctor restricted activity?
  2. Chest pain during physical activity?
  3. Chest pain in past month when not active?
  4. Balance/dizziness or loss of consciousness?
  5. Bone/joint problem worsened by activity?
  6. Doctor prescribing BP/heart medication?
  7. Any other reason not to engage?
- [ ] "Next →" primary CTA
- [ ] "Complete later →" on every step (non-blocking)

### Screen 6.2 — PARQ Detail (Conditional)
- [ ] Progress bar (~60%)
- [ ] Context header: "You indicated: {condition}"
- [ ] Conditional sub-questions via chips + text:
  - Type of condition (e.g., Asthma, Exercise-induced, COPD, Other)
  - Frequency: Rarely / Sometimes / Often / Always
  - Medication Y/N + medication name field
  - Additional notes (multiline)
- [ ] Extended sections (POC simplified from PDF):
  - Occupational flags (sitting, repetitive, heel shoes, stress) — optional step
  - Allergies + inhaler location — if indicated
- [ ] Only shown when parent question = Yes

### Screen 6.3 — PARQ Summary
- [ ] Success card: "Health Form Complete" + last updated date
- [ ] **Health Flags list:** ⚠ flagged conditions + ✓ cleared items
- [ ] "Shared with:" professional avatars list
- [ ] "Update Health Form" outline CTA
- [ ] Edit action in header → back to intro with pre-filled answers

### Business Rules
- [ ] `valid_until` = completed_at + 12 months
- [ ] Dashboard nudge shows 0% until complete, hidden when complete
- [ ] Re-prompt if user edits health status
- [ ] Flags surface in Trainer View when PARQ permission granted
- [ ] Does NOT block workout logging at any point

---

## Files to Create

| File | Features |
|------|----------|
| `app/(tabs)/profile/parq/index.tsx` | Intro questions |
| `app/(tabs)/profile/parq/detail.tsx` | Conditional expansion |
| `app/(tabs)/profile/parq/summary.tsx` | Summary + flags |
| `components/parq/YesNoButtons.tsx` | Binary answer UI |
| `components/parq/ConditionDetailForm.tsx` | Chip + text detail |
| `components/parq/HealthFlagCard.tsx` | Flag display |
| `packages/constants/src/parq-schema.ts` | Question tree definition |
| `hooks/useParq.ts` | Load/save PARQ response |

---

## PARQ Schema (Constants)

```typescript
// packages/constants/src/parq-schema.ts
export const PARQ_CORE_QUESTIONS = [ /* 7 items */ ];
export const PARQ_CONDITION_DETAILS = { breathing: { /* chips */ }, heart: { /* */ } };
```

---

## Acceptance Criteria

- [ ] Complete PARQ end-to-end with one flagged condition
- [ ] Skip at any step; dashboard still allows logging
- [ ] Summary shows correct flags
- [ ] Trainer sees PARQ flags when permitted
- [ ] valid_until enforced; stale form shows update prompt
