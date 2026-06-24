import type { SignInInput, SignUpInput } from '@fitown/types';

export type ValidationResult = { ok: true } | { ok: false; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean =>
  EMAIL_PATTERN.test(email.trim());

export const isValidPassword = (password: string): boolean =>
  password.length >= 8;

export const validateSignUp = (input: SignUpInput): ValidationResult => {
  if (!input.fullName.trim()) {
    return { ok: false, message: 'Full name is required.' };
  }
  if (!isValidEmail(input.email)) {
    return { ok: false, message: 'Enter a valid email address.' };
  }
  if (!isValidPassword(input.password)) {
    return { ok: false, message: 'Password must be at least 8 characters.' };
  }
  return { ok: true };
};

export const validateSignIn = (input: SignInInput): ValidationResult => {
  if (!isValidEmail(input.email)) {
    return { ok: false, message: 'Enter a valid email address.' };
  }
  if (!input.password) {
    return { ok: false, message: 'Password is required.' };
  }
  return { ok: true };
};

/** Epley formula — same as Postgres calculate_one_rm_epley */
export const calculateOneRmEpley = (
  weightKg: number,
  reps: number,
): number | null => {
  if (weightKg <= 0 || reps <= 0) return null;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 100) / 100;
};
