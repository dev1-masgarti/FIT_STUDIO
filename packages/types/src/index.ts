/** Domain types — vendor-neutral; mirror Postgres schema in supabase/migrations */

export type FitownUserRole = 'client' | 'professional';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type GenderType = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type WorkoutType = 'strength' | 'cardio' | 'mixed';

export interface Profile {
  id: string;
  full_name: string;
  age: number | null;
  date_of_birth: string | null;
  gender: GenderType | null;
  country_region: string | null;
  height_cm: number | null;
  body_weight_kg: number | null;
  home_image_url: string | null;
  home_image_signature: string | null;
  home_image_generated_at: string | null;
  focus: string[];
  experience_level: ExperienceLevel | null;
  role: FitownUserRole;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingProfileInput {
  full_name: string;
  age: number;
  date_of_birth: string;
  gender: GenderType;
  height_cm: number;
  body_weight_kg: number;
  focus: string[];
}

export interface QuickProfileInput {
  focus: string[];
  experience_level: ExperienceLevel | null;
  body_weight_kg: number | null;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export type DataPermission =
  | 'strength'
  | 'cardio'
  | 'parq'
  | 'notes'
  | 'body_measurements';

export interface AccessPermissions {
  strength: boolean;
  cardio: boolean;
  parq: boolean;
  notes: boolean;
  body_measurements: boolean;
}

export type ConversationType = 'direct' | 'group';

export type MessageReceiptStatus = 'delivered' | 'read';

export interface UserDevice {
  id: string;
  user_id: string;
  device_label: string;
  identity_key_public: string;
  signing_key_public: string;
  registration_id: number;
  is_revoked: boolean;
  revoked_at: string | null;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface SignedPrekey {
  id: string;
  device_id: string;
  prekey_id: number;
  public_key: string;
  signature: string;
  created_at: string;
}

export interface OneTimePrekey {
  id: string;
  device_id: string;
  prekey_id: number;
  public_key: string;
  consumed_at: string | null;
  created_at: string;
}

export interface CryptoEnvelope {
  ciphertext: string;
  nonce: string;
  key_version: number;
}

export interface SyncBlob extends CryptoEnvelope {
  id: string;
  owner_id: string;
  entity_type: string;
  entity_id: string;
  idempotency_key: string;
  record_version: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface SyncChangeInput extends CryptoEnvelope {
  entity_type: string;
  entity_id: string;
  idempotency_key: string;
  record_version: number;
  is_deleted?: boolean;
}

export interface SyncCursor {
  user_id: string;
  device_id: string;
  last_pulled_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  created_by: string;
  created_at: string;
}

export interface ConversationMember {
  conversation_id: string;
  user_id: string;
  joined_at: string;
  left_at: string | null;
}

export interface MessageEnvelope extends CryptoEnvelope {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  sender_device_id: string;
  recipient_user_id: string;
  message_type: string;
  idempotency_key: string;
  created_at: string;
  delivered_at: string | null;
  read_at: string | null;
}

export interface MessageReceipt {
  message_id: string;
  recipient_user_id: string;
  recipient_device_id: string | null;
  status: MessageReceiptStatus;
  created_at: string;
}

export interface GrantWrappedKey extends CryptoEnvelope {
  id: string;
  access_grant_id: string;
  client_id: string;
  grantee_id: string;
  grantee_device_id: string | null;
  is_active: boolean;
  revoked_at: string | null;
  created_at: string;
}

export interface SecurityAuditEvent {
  id: string;
  actor_user_id: string | null;
  event_type: string;
  event_scope: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ChatMessagePayloadV1 {
  id: string;
  body: string;
  created_at: string;
}

// ── Workout logging ──────────────────────────────────────────────────────────

export interface StrengthSet {
  id: string;
  weight_kg: number;
  reps: number;
  rpe: number | null;
  done: boolean;
}

export interface LoggedExercise {
  id: string;
  name: string;
  muscles: string;
  sets: StrengthSet[];
}

export interface CardioEntry {
  activity: string;
  duration_sec: number;
  distance_km: number;
  intensity_pct: number;
}

export interface WorkoutSession {
  id: string;
  owner_id: string;
  type: WorkoutType;
  title: string;
  performed_at: string;
  exercises: LoggedExercise[];
  cardio: CardioEntry | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
