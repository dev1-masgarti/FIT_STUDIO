# Plan 02 — Dashboard (Home)

**Phase:** 3  
**Screens:** 2.1 Dashboard, 2.2 Dashboard Empty  
**Tab:** Home (active)

---

## Features

### Screen 2.1 — Dashboard (Populated)
- [ ] Status bar safe area
- [ ] Header: time-based greeting ("Good morning"), user first name, avatar (initial)
- [ ] **Last Workout card** (highlight): title, type, "X days ago", chevron → session detail
- [ ] **Metric row:** Workouts This Month | Day Streak (two cards)
- [ ] **Recent Exercises list:** icon, name, est. 1RM with trend (↑/—), date
- [ ] **FAB (+):** fixed bottom-right above tab bar → Log flow
- [ ] Bottom tab bar (Home active)

### Screen 2.2 — Dashboard Empty
- [ ] Welcome greeting instead of "Good morning"
- [ ] Centred empty state: dashed circle icon, "Log Your First Workout"
- [ ] Subcopy: ownership messaging
- [ ] CTA: "+ Log Workout"
- [ ] **PARQ nudge card** (bottom): "Complete your health form (PARQ)" + 0% progress — non-blocking
- [ ] No FAB or FAB same as populated (wireframe: no FAB on empty — use CTA only)

### Data Logic
- [ ] `workoutsThisMonth`: count sessions in current calendar month
- [ ] `dayStreak`: consecutive days with ≥1 session
- [ ] `lastWorkout`: most recent `workout_sessions` row
- [ ] `recentExercises`: last 3 unique exercises with latest 1RM + trend vs prior

---

## Files to Create

| File | Features |
|------|----------|
| `app/(tabs)/index.tsx` | Dashboard shell, empty vs populated branch |
| `components/dashboard/LastWorkoutCard.tsx` | Highlight card |
| `components/dashboard/MetricCard.tsx` | Stat display |
| `components/dashboard/RecentExerciseList.tsx` | List with 1RM trend |
| `components/dashboard/EmptyState.tsx` | First-time UX |
| `components/dashboard/ParqNudge.tsx` | Non-blocking PARQ prompt |
| `components/navigation/TabBar.tsx` | 5-tab bottom nav |
| `components/navigation/Fab.tsx` | Floating action button |
| `hooks/useDashboardStats.ts` | TanStack Query aggregations |

---

## Acceptance Criteria

- [ ] Empty state shown when zero sessions
- [ ] Populated state updates after first log
- [ ] Last workout tap opens session detail (Phase 5)
- [ ] FAB opens workout type screen
- [ ] Zero-scroll-to-value: key metrics visible without scrolling on standard phone
