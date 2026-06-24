# Plan 01 — Auth & Onboarding

**Phase:** 2  
**Screens:** 1.1 Splash, 1.2 Sign Up, 1.3 Quick Profile  
**Goal:** First workout log in under 60 seconds

---

## Features

### Screen 1.1 — Splash
- [ ] FitOwn logo mark (rounded square "F")
- [ ] Tagline: "Your body. Your data."
- [ ] Primary CTA: "Get Started" → Sign Up
- [ ] Secondary link: "Already have an account? Log in"
- [ ] Full-screen centred layout; no nav bar

### Screen 1.2 — Sign Up
- [ ] Fields: Full Name, Email, Password
- [ ] Row: Age (numeric), Gender (dropdown/picker)
- [ ] Subtitle: "Your data stays yours. Always."
- [ ] CTA: "Create My Account"
- [ ] Divider + "Continue with Google" (outline button)
- [ ] No phone verification (POC)
- [ ] Validation: email format, password min 8 chars
- [ ] On success → Quick Profile (or Dashboard if returning user)

### Screen 1.3 — Quick Profile
- [ ] Progress bar (33% on first step)
- [ ] Focus chips (multi-select): Strength, Cardio, General Health, Sports, Rehab
- [ ] Experience chips (single): Beginner, Intermediate, Advanced
- [ ] Body weight input (kg, numeric)
- [ ] CTA: "Continue"
- [ ] "Skip for now →" link → Dashboard empty state
- [ ] Save profile to `profiles` table

### Auth Infrastructure
- [ ] Supabase Auth email signup
- [ ] Google OAuth (iOS + Android redirect URIs)
- [ ] Session persistence via `expo-secure-store`
- [ ] Auth guard: unauthenticated → `(auth)` group
- [ ] Log in flow (reuse sign-up screen in login mode)

---

## Files to Create

| File | Features |
|------|----------|
| `app/(auth)/splash.tsx` | Splash UI, navigation |
| `app/(auth)/sign-up.tsx` | Form, validation, Google SSO |
| `app/(auth)/quick-profile.tsx` | Chips, weight, skip |
| `app/(auth)/_layout.tsx` | Auth stack layout |
| `hooks/useAuth.ts` | Session state, signIn/signOut |
| `lib/supabase.ts` | Supabase client init |
| `components/auth/AuthForm.tsx` | Shared input + button patterns |
| `components/auth/ChipSelector.tsx` | Reusable chip group |

---

## Data / API

```typescript
// profiles insert on signup
{ full_name, age?, gender?, body_weight_kg?, focus: string[], experience_level?, onboarding_complete: boolean }
```

---

## Acceptance Criteria

- [ ] Cold install → account created → dashboard reachable in <60s (timed test)
- [ ] Google sign-in works on both platforms
- [ ] Skip profile still creates usable account
- [ ] Age/gender available for 1RM context (stored, not blocking)
