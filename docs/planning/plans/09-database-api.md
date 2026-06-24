# Plan 09 — Database & API (Supabase)

**Phase:** 0 (ongoing)  
**Backend:** Supabase PostgreSQL + Auth + Edge Functions + RLS

---

## Migrations

### 001_profiles.sql
- [ ] `profiles` extends `auth.users`: full_name, age, gender, body_weight_kg, focus text[], experience_level, role (client|professional), onboarding_complete, created_at

### 002_exercises.sql
- [ ] `exercises`: id, name, category, muscle_groups text[], is_system boolean, created_by uuid nullable
- [ ] Seed 50 system exercises
- [ ] Index on name for search

### 003_workouts.sql
- [ ] `workout_sessions`: id, user_id, type, started_at, completed_at, duration_min, notes
- [ ] `strength_sets`: id, session_id, exercise_id, set_number, weight_kg, reps, rpe, created_at
- [ ] `cardio_entries`: id, session_id, activity, duration_min, intensity smallint, distance_km numeric nullable, intervals int nullable

### 004_one_rm.sql
- [ ] `one_rm_estimates`: id, user_id, exercise_id, value_kg, calculated_at, source_set_id
- [ ] Unique constraint on (user_id, exercise_id) for latest — or versioned rows

### 005_parq.sql
- [ ] `parq_responses`: id, user_id, answers jsonb, flags jsonb, completed_at, valid_until

### 006_sharing.sql
- [ ] `share_invites`: id, client_id, invitee_email, role, permissions jsonb, status (pending|accepted|declined), created_at
- [ ] `access_grants`: id, client_id, grantee_id, permissions jsonb, active boolean, granted_at, revoked_at

---

## Row Level Security Policies

### Client owns data
```sql
-- workout_sessions: owner full access
CREATE POLICY "owner_all" ON workout_sessions
  FOR ALL USING (auth.uid() = user_id);

-- strength_sets: via session ownership
CREATE POLICY "owner_sets" ON strength_sets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workout_sessions ws
            WHERE ws.id = session_id AND ws.user_id = auth.uid())
  );
```

### Grantee read-only
```sql
CREATE POLICY "grantee_read_sessions" ON workout_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM access_grants ag
      WHERE ag.client_id = workout_sessions.user_id
        AND ag.grantee_id = auth.uid()
        AND ag.active = true
        AND (ag.permissions->>'strength')::boolean = true
    )
  );
```

- [ ] Separate policies for cardio permission bit
- [ ] PARQ: grantee SELECT when `permissions.parq = true`
- [ ] **Deny** grantee INSERT/UPDATE/DELETE on all client tables

---

## Edge Functions

| Function | Trigger | Features |
|----------|---------|----------|
| `calculate-one-rm` | DB webhook on strength_sets INSERT | Recompute best 1RM |
| `export-user-data` | HTTP POST (authenticated) | Full JSON export |
| `send-invite` | HTTP POST | Email + create invite row |
| `accept-invite` | HTTP POST | Create access_grant |

---

## Database Functions

- [ ] `get_dashboard_stats(user_id)` — monthly count, streak
- [ ] `get_muscle_frequency(user_id, days)` — aggregate for trainer view
- [ ] `get_exercise_progression(user_id, exercise_id, weeks)` — 1RM series

---

## Realtime (Optional POC)

- [ ] Supabase realtime on `access_grants` for instant revoke (Phase 6)

---

## Files

```
supabase/
├── config.toml
├── migrations/
│   ├── 001_profiles.sql
│   ├── 002_exercises.sql
│   ├── 003_workouts.sql
│   ├── 004_one_rm.sql
│   ├── 005_parq.sql
│   └── 006_sharing.sql
├── seed.sql
└── functions/
    ├── calculate-one-rm/
    ├── export-user-data/
    └── send-invite/
```

---

## Acceptance Criteria

- [ ] RLS test suite: owner CRUD, grantee SELECT only, revoke blocks
- [ ] Migrations run clean on `supabase db reset`
- [ ] 1RM updates within 1s of set insert
- [ ] Export returns valid JSON schema matching @fitown/types
