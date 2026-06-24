# Plan 05 — Sharing & RBAC (Trainer)

**Phase:** 6  
**Screens:** 5.1 My Team, 5.2 Access Control, 5.3 Trainer View  
**Tab:** Share (active)

---

## Features

### Screen 5.1 — My Team
- [ ] Header: "My Team", "+ Invite" action
- [ ] Subtitle: "You control who sees your data"
- [ ] **Active professional card:** avatar, name, role, status dot (Active/Pending)
- [ ] Card detail: "Can see: …", "Since: … | Sessions shared: N"
- [ ] Tap card → Access Control
- [ ] Dashed **Add a Professional** card
- [ ] List pending invites with muted styling

### Screen 5.2 — Access Control
- [ ] Header: ← back, "{Name} — Access"
- [ ] Centred professional avatar + name + role + since date
- [ ] **Data Access toggles:**
  - Strength workouts
  - Cardio sessions
  - PARQ / Health form
  - Session notes
  - Body measurements
- [ ] Toggle saves immediately to `access_grants.permissions`
- [ ] **Revoke All Access** destructive outline button + confirmation dialog

### Screen 5.3 — Trainer View (Professional Role)
- [ ] **VIEW ONLY banner:** "👁 VIEW ONLY — Data owned by client"
- [ ] Header: "Client: {name}", "Notes" action (read-only notes view)
- [ ] **Key Metrics:** Bench 1RM, Squat 1RM, Last Session (days)
- [ ] Recent Activity list (permitted data only)
- [ ] **PARQ Flags** card (if permitted): warning icons + clearance status
- [ ] **Muscle Group Frequency (14 days):** chips with counts, zero-state muted
- [ ] No edit controls anywhere
- [ ] RLS enforces read-only at DB level

### Screen 7.2 — Invite Professional (also in Plan 07)
- [ ] Email/username input
- [ ] Role chips: Strength Coach, Cardio Coach, Physio, Doctor, Nutritionist, Other
- [ ] Permission toggles (defaults by role)
- [ ] "Send Invitation" + footer: "You can change or revoke access anytime"

### Backend
- [ ] `share_invites` table + email edge function
- [ ] `access_grants` with JSONB permissions
- [ ] RLS policy: grantee SELECT on permitted tables only
- [ ] Revoke: `active = false`, immediate

---

## Files to Create

| File | Features |
|------|----------|
| `app/(tabs)/share/index.tsx` | My Team list |
| `app/(tabs)/share/access/[id].tsx` | Permission toggles |
| `app/(tabs)/share/invite.tsx` | Invite form |
| `app/(trainer)/client/[id].tsx` | Trainer read-only view |
| `components/share/ProfessionalCard.tsx` | Team member card |
| `components/share/PermissionToggle.tsx` | Toggle row |
| `components/share/ViewOnlyBanner.tsx` | Trainer banner |
| `components/share/MuscleFrequencyBadges.tsx` | 14-day frequency |
| `hooks/useMyTeam.ts` | Grants + invites query |
| `hooks/useUpdatePermissions.ts` | Mutation |
| `supabase/functions/send-invite/index.ts` | Email invite |

---

## Permission Matrix (Default by Role)

| Permission | Strength Coach | Cardio Coach | Physio | Doctor |
|------------|----------------|--------------|--------|--------|
| Strength | ✓ | — | ✓ | — |
| Cardio | — | ✓ | — | — |
| PARQ | ✓ | — | ✓ | ✓ |
| Notes | ✓ | ✓ | ✓ | — |
| Body measurements | — | — | ✓ | ✓ |

---

## Acceptance Criteria

- [ ] Client invites trainer; trainer accepts and sees client data
- [ ] Toggling cardio off hides cardio from trainer view
- [ ] Revoke removes all access within one session refresh
- [ ] Trainer cannot POST/PUT/PATCH client workout rows (RLS test)
- [ ] Pending invite shows correct state
