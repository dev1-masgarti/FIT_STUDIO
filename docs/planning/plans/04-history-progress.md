# Plan 04 — History & Progress

**Phase:** 5  
**Screens:** 4.1 Workout History, 4.2 Exercise Detail, 4.3 Session Detail  
**Tab:** History (active)

---

## Features

### Screen 4.1 — Workout History
- [ ] Header: "History", "Filter ▾" (type filter modal/sheet)
- [ ] Filter chips: All (active), Strength, Cardio
- [ ] **THIS WEEK** section: session cards (title, exercises summary, date, duration)
- [ ] **LAST WEEK** section: same layout, reduced opacity
- [ ] Tap card → Session Detail
- [ ] Infinite scroll / pagination for older weeks

### Screen 4.2 — Exercise Detail
- [ ] Header: ← back, exercise name
- [ ] **Metrics card:** Est. 1RM | Best Load | Total Sets (Month)
- [ ] **Progression chart:** 8-bar vertical chart, 8 weeks ago → Today labels
- [ ] **Recent Sessions list:** date, set summary, avg RPE
- [ ] Muscle annotation footer: "Muscles: Chest (primary), Triceps…"
- [ ] Chart data from `one_rm_estimates` weekly snapshots

### Screen 4.3 — Session Detail
- [ ] Header: ← back, "Jun 22 — Upper Push", "Edit" action
- [ ] Meta line: duration, exercise count, total sets
- [ ] Per-exercise cards: name, set lines (weight×reps @ RPE), est. 1RM
- [ ] Session notes block
- [ ] Bottom actions: **Share** (outline) | **Repeat** (primary)
- [ ] Repeat: clone session structure into new draft workout
- [ ] Share: trigger share sheet / invite link (Phase 6 integration)

---

## Files to Create

| File | Features |
|------|----------|
| `app/(tabs)/history/index.tsx` | Grouped list + filters |
| `app/(tabs)/history/[sessionId].tsx` | Session detail |
| `app/(tabs)/history/exercise/[id].tsx` | Exercise detail + chart |
| `components/history/SessionCard.tsx` | Week grouped card |
| `components/history/FilterChips.tsx` | Type filter |
| `components/history/ProgressionChart.tsx` | 8-week bar chart |
| `components/history/SetSummary.tsx` | Formatted set lines |
| `hooks/useWorkoutHistory.ts` | Query grouped sessions |
| `hooks/useExerciseProgress.ts` | 1RM time series |
| `hooks/useRepeatWorkout.ts` | Clone session to draft |

---

## Acceptance Criteria

- [ ] Sessions grouped correctly by ISO week
- [ ] Filter chips filter without reload flash
- [ ] Progression chart reflects real 1RM history (min 2 data points)
- [ ] Repeat opens Log flow with pre-filled sets
- [ ] Edit allows modifying session notes (POC: notes only)
