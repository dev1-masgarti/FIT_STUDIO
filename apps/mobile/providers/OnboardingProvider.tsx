import type { GenderType } from '@fitown/types';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type HeightUnit = 'cm' | 'ft';
export type WeightUnit = 'kg' | 'lb';

export type OnboardingDraft = {
  fullName: string;
  dateOfBirth: Date | null;
  gender: GenderType | null;
  heightCm: number;
  heightUnit: HeightUnit;
  weightKg: number;
  weightUnit: WeightUnit;
  goals: string[];
};

type OnboardingContextValue = {
  draft: OnboardingDraft;
  setFullName: (fullName: string) => void;
  setDateOfBirth: (dateOfBirth: Date | null) => void;
  setGender: (gender: GenderType | null) => void;
  setHeightCm: (heightCm: number) => void;
  setHeightUnit: (heightUnit: HeightUnit) => void;
  setWeightKg: (weightKg: number) => void;
  setWeightUnit: (weightUnit: WeightUnit) => void;
  toggleGoal: (goal: string) => void;
  resetDraft: () => void;
};

const defaultDraft: OnboardingDraft = {
  fullName: '',
  dateOfBirth: null,
  gender: null,
  heightCm: 170,
  heightUnit: 'cm',
  weightKg: 70,
  weightUnit: 'kg',
  goals: [],
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [draft, setDraft] = useState<OnboardingDraft>(defaultDraft);

  const setFullName = useCallback((fullName: string) => {
    setDraft((prev) => (prev.fullName === fullName ? prev : { ...prev, fullName }));
  }, []);

  const setDateOfBirth = useCallback((dateOfBirth: Date | null) => {
    setDraft((prev) => {
      const prevTs = prev.dateOfBirth?.getTime() ?? null;
      const nextTs = dateOfBirth?.getTime() ?? null;
      if (prevTs === nextTs) return prev;
      return { ...prev, dateOfBirth };
    });
  }, []);

  const setGender = useCallback((gender: GenderType | null) => {
    setDraft((prev) => (prev.gender === gender ? prev : { ...prev, gender }));
  }, []);

  const setHeightCm = useCallback((heightCm: number) => {
    setDraft((prev) => (prev.heightCm === heightCm ? prev : { ...prev, heightCm }));
  }, []);

  const setHeightUnit = useCallback((heightUnit: HeightUnit) => {
    setDraft((prev) => (prev.heightUnit === heightUnit ? prev : { ...prev, heightUnit }));
  }, []);

  const setWeightKg = useCallback((weightKg: number) => {
    setDraft((prev) => (prev.weightKg === weightKg ? prev : { ...prev, weightKg }));
  }, []);

  const setWeightUnit = useCallback((weightUnit: WeightUnit) => {
    setDraft((prev) => (prev.weightUnit === weightUnit ? prev : { ...prev, weightUnit }));
  }, []);

  const toggleGoal = useCallback((goal: string) => {
    setDraft((prev) => {
      const hasGoal = prev.goals.includes(goal);
      return {
        ...prev,
        goals: hasGoal
          ? prev.goals.filter((item) => item !== goal)
          : [...prev.goals, goal],
      };
    });
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(defaultDraft);
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      draft,
      setFullName,
      setDateOfBirth,
      setGender,
      setHeightCm,
      setHeightUnit,
      setWeightKg,
      setWeightUnit,
      toggleGoal,
      resetDraft,
    }),
    [
      draft,
      setFullName,
      setDateOfBirth,
      setGender,
      setHeightCm,
      setHeightUnit,
      setWeightKg,
      setWeightUnit,
      toggleGoal,
      resetDraft,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
