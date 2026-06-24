# Plan 07 — Profile & Settings

**Phase:** 8  
**Screens:** 7.1 My Profile, 7.2 Invite Professional  
**Tab:** Profile (active)

---

## Features

### Screen 7.1 — My Profile
- [ ] Centred avatar (initial), name, "Member since {month year}"
- [ ] **Data Summary card:** Workouts count | Coaches count | PARQ Done (✓/—)
- [ ] Settings list (chevron rows):
  - Personal Details → edit name, age, gender, weight
  - Health Form (PARQ) → PARQ flow
  - Body Measurements → stub screen (POC: "Coming soon")
  - Data & Privacy → static policy + consent info
  - **Export My Data** → triggers export
  - **Delete Account** → red text, confirmation flow
- [ ] Reinforce data ownership in copy

### Export My Data
- [ ] Edge function aggregates: profile, sessions, sets, cardio, PARQ, grants
- [ ] Format: JSON file (+ optional CSV for sessions)
- [ ] Share sheet / save to files (iOS + Android)
- [ ] Includes export timestamp

### Delete Account
- [ ] Two-step confirmation with typed "DELETE"
- [ ] Cascade delete all user rows (or soft-delete + scheduled purge)
- [ ] Sign out + redirect to splash
- [ ] Irreversible warning copy

### Screen 7.2 — Invite Professional
- [ ] (Shared with Plan 05 — route: `share/invite.tsx` or profile link)
- [ ] Email, role chips, permission toggles, Send Invitation

### Personal Details
- [ ] Edit fields from onboarding
- [ ] Save to profiles table

---

## Files to Create

| File | Features |
|------|----------|
| `app/(tabs)/profile/index.tsx` | Profile home |
| `app/(tabs)/profile/personal-details.tsx` | Edit profile |
| `app/(tabs)/profile/privacy.tsx` | Data & privacy |
| `app/(tabs)/profile/export.tsx` | Export UX + share sheet |
| `components/profile/DataSummaryCard.tsx` | Metrics row |
| `components/profile/SettingsRow.tsx` | List item with chevron |
| `components/profile/DeleteAccountDialog.tsx` | Confirmation |
| `supabase/functions/export-user-data/index.ts` | Data export |
| `hooks/useExportData.ts` | Trigger + download |

---

## Acceptance Criteria

- [ ] Export file contains complete workout history
- [ ] Delete removes user from auth + all data tables
- [ ] PARQ Done reflects actual completion state
- [ ] Personal details edit persists
- [ ] Delete and Export never hidden below fold
