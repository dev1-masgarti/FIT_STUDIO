# Plan 08 — Shared Packages (@fitown/*)

**Phase:** 0 (ongoing)  
**Package manager:** pnpm workspaces

---

## Packages

### @fitown/types

**Features:**
- [ ] `UserProfile`, `ExperienceLevel`, `FocusArea`, `Gender`
- [ ] `WorkoutSession`, `WorkoutType`, `StrengthSet`, `CardioEntry`
- [ ] `Exercise`, `MuscleGroup`, `ExerciseCategory`
- [ ] `OneRMEstimate`, `ParqResponse`, `HealthFlag`
- [ ] `ShareInvite`, `AccessGrant`, `PermissionKey`, `ProfessionalRole`
- [ ] `DashboardStats`, `ExerciseProgressPoint`
- [ ] Supabase Database type generation hook (`supabase gen types`)

**Files:**
```
packages/types/
├── package.json
├── tsconfig.json
├── src/index.ts
├── src/user.ts
├── src/workout.ts
├── src/sharing.ts
├── src/parq.ts
└── src/database.ts      # generated
```

---

### @fitown/utils

**Features:**
- [ ] `calculateOneRM(weightKg, reps)` — Epley formula
- [ ] `formatSetLine(set)` → "75kg×8 @ RPE 8"
- [ ] `formatRelativeDate(date)` → "2 days ago"
- [ ] `computeDayStreak(sessions[])` 
- [ ] `groupSessionsByWeek(sessions[])`
- [ ] `computeMuscleFrequency(sets[], days=14)`
- [ ] `validateParqAnswers(answers)` 
- [ ] Unit tests for 1RM + streak logic

**Files:**
```
packages/utils/
├── package.json
├── tsconfig.json
├── src/index.ts
├── src/one-rm.ts
├── src/formatters.ts
├── src/stats.ts
└── src/__tests__/
```

---

### @fitown/constants

**Features:**
- [ ] `EXERCISES_SEED` — 50+ movements with muscle_groups, category
- [ ] `PARQ_CORE_QUESTIONS`, `PARQ_CONDITION_DETAILS`
- [ ] `RPE_LABELS` — 1–10 plain language map
- [ ] `CARDIO_ACTIVITIES` chip list
- [ ] `FOCUS_AREAS`, `EXPERIENCE_LEVELS`
- [ ] `PROFESSIONAL_ROLES`, `DEFAULT_PERMISSIONS_BY_ROLE`
- [ ] `APP_COPY` — ownership taglines, trainer banner text

**Files:**
```
packages/constants/
├── package.json
├── tsconfig.json
├── src/index.ts
├── src/exercises.ts
├── src/parq-schema.ts
├── src/labels.ts
└── src/permissions.ts
```

---

## Workspace Config

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```json
// packages/types/package.json
{ "name": "@fitown/types", "version": "0.0.1", "main": "./src/index.ts" }
```

---

## Acceptance Criteria

- [ ] `pnpm typecheck` passes across all packages
- [ ] Mobile app imports `@fitown/utils` without bundler issues
- [ ] 1RM tests cover edge cases (reps=1, reps=15)
- [ ] No circular dependencies between packages
