# FitOwn — Product Requirements Document (POC v0.1)

**Product:** FitOwn (MASGARTI Fit Tech)  
**Version:** POC v0.1  
**Status:** Planning — not for external distribution  
**Sources:** Meeting Discussion Document (Jun 22 2026), discovery transcripts, PARQ form, Lo-Fi Wireframe v0.1

---

## 1. Executive Summary

FitOwn is a **client-owned fitness and health data platform**. The individual maintains a portable record of training performance, health constraints, and session history — then **selectively shares** that data with professionals (trainers, physios, coaches, doctors) through granular access control.

The central value proposition in one sentence:

> **"Who owns the data?"** — The person whose body is being trained must own their fitness and health data.

Current market apps either let users self-track without professional coordination, or let businesses/trainers **own** client data. FitOwn inverts this: the client is sovereign; professionals are **guests with permission**.

---

## 2. Problem Statement

Every day, individuals must decide what to do to improve and maintain their body. Today this is solved through self-study, group classes, or individual coaching — but **no technology adequately centres the individual** or gives them portable, shareable ownership of their history.

### 2.1 Tree of Problems

| Branch | Pain |
|--------|------|
| Data ownership | Trainers keep logs clients cannot access; switching coaches means starting from zero |
| Multi-professional coordination | Strength coach, running coach, physio, doctor — none share a single constraint/performance view |
| Decision support | No app easily extracts **1RM** from performance or surfaces **previous max with temporal context** |
| Progressive overload | Trainers manually check "what was the heaviest load last time?" — not automated |
| Recovery / overtraining | Largely unaddressed; RP Hypertrophy is the only rudimentary attempt |
| Generic programs | YouTube/e-book plans cannot be compared, adapted, or loaded into a personal plan |
| PARQ repetition | Health intake filled once per professional; client re-enters the same constraints |

### 2.2 Market Gaps (Validated in Discovery)

- **Self-tracking apps:** Log activities; no coach delegation or programming support  
- **Business/gym apps:** Scheduling useful; data owned by business  
- **Trainer-owned apps:** Lock client to one trainer; not integrated with other tracking  
- **Wearables (Garmin, Apple Health):** Physiological data; no 1RM, progression analysis, or coach communication  
- **Garmin specifically:** Movement DB + manual entry + rep timing — but no 1RM history or coach sharing  
- **MyFitnessPal model:** Food DB analogy — FitOwn needs **Movement Library** + **Muscle Activation Mapping**

---

## 3. Vision & Positioning

### 3.1 Health ID Analogy

Like a Hong Kong ID for physical health: one identity the client carries across all professional relationships — eliminating duplication, data loss, and friction when switching providers.

### 3.2 Stakeholder Ecosystem

| Stakeholder | Data needs |
|-------------|------------|
| Strength / fitness coach | Lifting data, 1RM, RPE, muscle frequency |
| Sports / running coach | Cardio sessions, intensity, distance |
| Physiotherapist | Injuries, constraints, session impact |
| Dietician | (Future) nutrition |
| Medical doctor / cardiologist | PARQ flags, medical clearance, constraints |
| Massage therapist | Session logged — affects programming trajectory |

### 3.3 Target Users

| Segment | Profile |
|---------|---------|
| **Primary (long-term)** | Adults 30–45+, intensifying need from 45+ for structured maintenance |
| **Pilot users** | HNW individuals with personal trainers, data-conscious, already manually tracking |
| **Cross-age** | Data-oriented personalities with fitness goals (not age-exclusive) |
| **Test persona** | John Bower (domain expert role-playing as client) |

### 3.4 Competitive Moat

- **Not technology alone** — domain expertise embedded in product (Garmin 25-year lead analogy)  
- **Data quality** — structured capture today enables future AI/hybrid coaching layers  
- **Network effects** — client ↔ professional relationships (future: trainer marketplace, ratings)

---

## 4. POC v0.1 Scope

### 4.1 In Scope (MVP)

| Capability | Description |
|------------|-------------|
| Authentication | Email/password sign-up, Google SSO, minimal friction (<60s to first log) |
| Quick profile | Focus chips, experience level, body weight (skippable) |
| Dashboard | Last workout, monthly stats, streak, recent exercises with 1RM inline |
| Workout logging | Strength (weight, reps, sets, RPE) + Cardio (activity, duration, intensity, optional distance/intervals) |
| Exercise library | Search, categories, recent exercises, last weight shown |
| 1RM derivation | Calculated from sets (Epley/Brzycki-style); shown at point of entry |
| History | Weekly grouping, filter by type, session detail, exercise detail with progression chart |
| PARQ | Progressive Y/N intake, conditional detail, summary, non-blocking |
| Sharing / My Team | Invite professionals, granular toggles, revoke access |
| Trainer view | Read-only client dashboard: 1RM, recent activity, PARQ flags, muscle frequency |
| Profile | Personal details, PARQ link, export data, privacy, delete account |
| Data ownership UX | "Your data stays yours" messaging; export/delete always visible |

### 4.2 Explicitly Out of Scope (Future Layers)

- Computer vision / AI rep counting  
- Wearable integration (Garmin, Apple Health, Hume)  
- Video upload / async coaching review  
- DNA-based personalisation  
- Nutrition tracking  
- LLM / AI recommendations  
- Recovery/fatigue modeling (beyond display)  
- Blockchain / Web3  
- Trainer marketplace & ratings  
- Health checkup / medical record integration  
- Body measurements (POC: profile field only, not full module)

### 4.3 Data Capture Variables

**Strength:** weight (kg), reps, sets, RPE (1–10)  
**Cardio:** intensity (slider), duration (minutes), sets/intervals (optional), distance (optional)  
**Derived:** 1RM per movement, best load, progressive overload context (when previous max achieved)

---

## 5. User Flows & Screens (20 Total)

Reference wireframe: `docs/MASGARTI's Fit Tech.html`

| Flow | Screens | Goal |
|------|---------|------|
| **1. Onboarding** | 1.1 Splash, 1.2 Sign Up, 1.3 Quick Profile | First workout log in <60 seconds |
| **2. Dashboard** | 2.1 Dashboard, 2.2 Empty state | Immediate context: recent + next action |
| **3. Log Workout** | 3.1 Type, 3.2 Exercise, 3.3 Log Sets, 3.4 Cardio | Capture set in <10 seconds |
| **4. History** | 4.1 List, 4.2 Exercise Detail, 4.3 Session Detail | "What did I do?" + "Am I improving?" |
| **5. Sharing** | 5.1 My Team, 5.2 Access Control, 5.3 Trainer View | Client controls who sees what |
| **6. PARQ** | 6.1 Intro, 6.2 Detail, 6.3 Summary | Medical constraints, non-blocking |
| **7. Profile** | 7.1 Profile, 7.2 Invite Trainer | Identity + data sovereignty |

**Navigation:** Bottom tab bar — Home | Log | History | Share | Profile  
**Max depth:** 3 taps from any nav item to any data point

---

## 6. Design Principles

| # | Principle | Requirement |
|---|-----------|-------------|
| 1 | **Data ownership visibility** | Trainer view shows "VIEW ONLY — Data owned by client"; export/delete never hidden |
| 2 | **10-second rule** | Single set loggable in <10s: large targets, pre-filled values, increment buttons |
| 3 | **Context at decision point** | Previous best + est. 1RM visible during set entry — not buried in analytics |
| 4 | **Progressive disclosure** | PARQ skippable; sharing discoverable but not blocking first workout |
| 5 | **Accessibility** | 44×44px min touch; 14px min body text; text labels on all nav; no gesture-only actions |

### 6.1 Visual Direction (Hi-Fi / Figma Phase)

- **Primary:** Monochrome (black/white/greys) — professional, not gamified  
- **Accent:** Single colour for progress/positive (deep teal or forest green)  
- **Alert:** Warm amber for PARQ flags  
- **Avoid:** Neon fitness colours (electric blue, neon green)

---

## 7. PARQ Requirements

Based on `docs/PARQ only 240828.pdf`:

### 7.1 Standard PAR-Q (7 questions)

Heart condition, chest pain (activity/rest), balance/dizziness, bone/joint problem, blood pressure medication, other contraindications — each YES/NO.

### 7.2 Extended Sections (POC: simplified)

- Occupational: sitting, repetitive movement, heel shoes, mental stress  
- Medical: allergies (inhaler location), injuries, surgeries, chronic disease, medications  
- Conditional expansion when YES (e.g., breathing → asthma type, frequency, medication, notes)

### 7.3 Behaviour

- Accessible from Profile + prompted on Dashboard (non-blocking)  
- Valid 12 months; re-prompt on health change  
- Shared per-professional toggle (strength coach sees PARQ; cardio coach may not)

---

## 8. Information Architecture

```
Splash → Signup → Quick Profile → Dashboard
                                      ↓
┌─────────┬─────────┬──────────┬─────────┬──────────┐
│  Home   │   Log   │ History  │  Share  │ Profile  │
└─────────┴─────────┴──────────┴─────────┴──────────┘

PARQ: Profile + Dashboard prompt (parallel track)
Trainer: Separate role → Client list → Client detail (read-only)
```

---

## 9. Required Data Models (Conceptual)

| Entity | Key fields |
|--------|------------|
| **User** | name, email, age, gender, body_weight, focus[], experience_level |
| **Exercise** | name, muscle_groups[], category |
| **WorkoutSession** | user_id, type (strength/cardio/mixed), date, duration, notes |
| **StrengthSet** | exercise_id, set_number, weight_kg, reps, rpe |
| **CardioSession** | activity, duration_min, intensity, distance_km?, intervals? |
| **OneRMRecord** | exercise_id, estimated_1rm, calculated_at, source_sets |
| **PARQResponse** | user_id, answers JSON, flags[], completed_at, valid_until |
| **ShareInvite** | client_id, professional_email, role, permissions{}, status |
| **AccessGrant** | grantee_id, data_types[], active, revoked_at? |

---

## 10. Success Metrics (POC)

| Metric | Target |
|--------|--------|
| Time to first workout log | <60 seconds after install |
| Time per set entry | <10 seconds |
| John Bower daily use | Uses app for own training without frustration |
| Data portability | Export produces complete JSON/CSV of user data |
| Sharing clarity | Client can revoke access in ≤3 taps |

---

## 11. Architectural Principles (From Discovery)

1. **Foundation on known physiology** — muscles, energy systems, cardiovascular systems are stable for decades  
2. **Flexibility for emerging areas** — nutrition, AI, wearables layered later without breaking core schema  
3. **Garbage in, garbage out** — competitive advantage = high-quality structured capture now  
4. **Manual entry first** — anything CV/wearables can capture must also work via manual entry  
5. **RBAC from day one** — architect sharing even if trainer view is minimal in POC

---

## 12. Open Items (From Meeting Action Items)

| # | Item | Owner |
|---|------|-------|
| 1 | Electronic PARQ in app | Product |
| 2 | Sample workout data model (Anthony session: French press, bench press, T-bar row) | Domain |
| 3 | Market gap validation | Product |
| 4 | Movement library + muscle activation mapping research | Engineering |
| 5 | Follow-up discovery session | Both |

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **1RM** | One-rep maximum — estimated max load for one repetition |
| **RPE** | Rate of Perceived Exertion (1 easy → 10 max effort) |
| **RIR** | Reps in Reserve |
| **PARQ** | Physical Activity Readiness Questionnaire |
| **Progressive overload** | Gradual increase in training stimulus over time |
| **Theory of Constraints** | Train to individual limiting factor; optimize the critical path |

---

## 14. Next Phase After POC

1. Hi-Fi Figma designs (all 20 screens + design system)  
2. Movement library seed data (500+ exercises)  
3. Muscle activation mapping database  
4. Recovery/fatigue modeling  
5. Wearable gateway (Garmin export import)  
6. Trainer marketplace layer
