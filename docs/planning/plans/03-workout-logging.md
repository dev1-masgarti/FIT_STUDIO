# Plan 03 — Workout Logging

**Phase:** 4  
**Screens:** 3.1 Select Type, 3.2 Select Exercise, 3.3 Log Sets, 3.4 Log Cardio  
**Tab:** Log (active)  
**Goal:** Capture weight, reps, sets, RPE in under 10 seconds per set

---

## Features

### Screen 3.1 — Select Workout Type
- [ ] Header: ✕ close, "New Workout"
- [ ] Three type cards: Strength Training, Cardio, Mixed Session
- [ ] Each card: icon, title, subtitle
- [ ] Footer: today's date display
- [ ] Tap → exercise selection (strength/mixed) or cardio log

### Screen 3.2 — Select Exercise
- [ ] Header: ← back, "Add Exercise", "Done" action
- [ ] Search input with 🔍 placeholder
- [ ] **RECENT** section: exercise name, muscle groups, "Last: Xkg"
- [ ] **CATEGORIES** section: Chest, Back, Legs, Shoulders… → drill-down list
- [ ] Tap exercise → Log Sets screen
- [ ] Multi-exercise session: Done returns to session summary (add more)

### Screen 3.3 — Log Sets (Strength)
- [ ] Header: ← back, exercise name, "💡 History" → exercise detail
- [ ] **Context card:** Est. 1RM | Previous Best | "Last performed: X days ago"
- [ ] **Set table header:** SET | KG | REPS | RPE
- [ ] Set rows: number, editable weight/reps/RPE, completion checkmark
- [ ] Active row: dashed border; completed: filled background
- [ ] "+ Add Set" outline button
- [ ] RPE helper text: "RPE: 1 (easy) → 10 (max effort)"
- [ ] Notes field (optional)
- [ ] "Save Exercise ✓" primary CTA
- [ ] **10-second UX:** increment/decrement buttons on numeric fields; pre-fill weight from last session
- [ ] On save: compute 1RM, insert `strength_sets`, update `one_rm_estimates`

### Screen 3.4 — Log Cardio
- [ ] Activity chips: Running, Cycling, Swimming, Rowing, Walking, Other
- [ ] Duration: numeric + "minutes" label
- [ ] Intensity slider: Easy → Moderate → Hard → Max
- [ ] Distance (optional): km
- [ ] Intervals (optional): count
- [ ] "Save Cardio ✓"

### Session Management
- [ ] Create `workout_sessions` on type select
- [ ] Zustand draft store for in-progress sets before save
- [ ] Mixed session: alternate strength + cardio entries under one session
- [ ] Auto timestamp start; duration computed on complete

---

## Files to Create

| File | Features |
|------|----------|
| `app/(tabs)/log/index.tsx` | Workout type selection |
| `app/(tabs)/log/exercise.tsx` | Search + browse exercises |
| `app/(tabs)/log/sets.tsx` | Set entry table |
| `app/(tabs)/log/cardio.tsx` | Cardio form |
| `components/log/WorkoutTypeCard.tsx` | Type picker |
| `components/log/SetRow.tsx` | Single set editor |
| `components/log/ContextCard.tsx` | 1RM + previous best |
| `components/log/IntensitySlider.tsx` | Cardio intensity |
| `components/log/ActivityChips.tsx` | Activity selector |
| `stores/workoutDraftStore.ts` | Zustand draft state |
| `hooks/useExerciseSearch.ts` | Filter exercises |
| `hooks/usePreviousBest.ts` | Last session data for exercise |
| `packages/utils/src/one-rm.ts` | Epley formula |

---

## Seed Data

- [ ] `@fitown/constants/exercises.ts` — minimum 50 movements with muscle_groups
- [ ] Categories: Chest, Back, Legs, Shoulders, Arms, Core, Cardio

---

## Acceptance Criteria

- [ ] Full strength workout: 3 exercises × 3 sets saved
- [ ] 1RM updates after each exercise save
- [ ] Previous best pre-fills next session
- [ ] Cardio saves with optional fields null-safe
- [ ] Set entry achievable in <10s with pre-fill (timed on device)
