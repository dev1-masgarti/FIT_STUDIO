import type {
  CardioEntry,
  LoggedExercise,
  StrengthSet,
  WorkoutSession,
  WorkoutType,
} from '@fitown/types';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { createId, saveWorkoutSession } from '@/lib/api/workouts';
import { useAuth } from '@/providers/AuthProvider';
import { useSync } from '@/providers/SyncProvider';

type WorkoutDraft = {
  id: string;
  type: WorkoutType;
  exercises: LoggedExercise[];
  cardio: CardioEntry | null;
  performedAt: string;
};

const createDefaultSet = (): StrengthSet => ({
  id: createId(),
  weight_kg: 20,
  reps: 10,
  rpe: 7,
  done: false,
});

const titleForDraft = (draft: WorkoutDraft): string => {
  if (draft.type === 'cardio') {
    return draft.cardio?.activity ? `${draft.cardio.activity} Session` : 'Cardio Session';
  }
  if (draft.exercises.length === 1) return draft.exercises[0].name;
  if (draft.exercises.length > 1) {
    return draft.type === 'mixed' ? 'Mixed Session' : 'Strength Session';
  }
  return draft.type === 'mixed' ? 'Mixed Session' : 'Strength Session';
};

type WorkoutDraftContextValue = {
  draft: WorkoutDraft | null;
  startDraft: (type: WorkoutType) => void;
  addExercise: (name: string, muscles: string) => string;
  removeExercise: (exerciseId: string) => void;
  getExercise: (exerciseId: string) => LoggedExercise | undefined;
  updateExerciseSets: (exerciseId: string, sets: StrengthSet[]) => void;
  setCardio: (cardio: CardioEntry) => void;
  discardDraft: () => void;
  saveDraft: () => Promise<WorkoutSession | null>;
};

const WorkoutDraftContext = createContext<WorkoutDraftContextValue | null>(null);

export const WorkoutDraftProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth();
  const { triggerSync } = useSync();
  const [draft, setDraft] = useState<WorkoutDraft | null>(null);

  const startDraft = useCallback((type: WorkoutType) => {
    setDraft({
      id: createId(),
      type,
      exercises: [],
      cardio: null,
      performedAt: new Date().toISOString(),
    });
  }, []);

  const ensureDraft = useCallback(
    (type: WorkoutType): WorkoutDraft => ({
      id: createId(),
      type,
      exercises: [],
      cardio: null,
      performedAt: new Date().toISOString(),
    }),
    [],
  );

  const addExercise = useCallback(
    (name: string, muscles: string): string => {
      const exerciseId = createId();
      const exercise: LoggedExercise = {
        id: exerciseId,
        name,
        muscles,
        sets: [createDefaultSet()],
      };
      setDraft((previous) => {
        const base = previous ?? ensureDraft('strength');
        return { ...base, exercises: [...base.exercises, exercise] };
      });
      return exerciseId;
    },
    [ensureDraft],
  );

  const removeExercise = useCallback((exerciseId: string) => {
    setDraft((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        exercises: previous.exercises.filter((item) => item.id !== exerciseId),
      };
    });
  }, []);

  const getExercise = useCallback(
    (exerciseId: string): LoggedExercise | undefined =>
      draft?.exercises.find((item) => item.id === exerciseId),
    [draft],
  );

  const updateExerciseSets = useCallback(
    (exerciseId: string, sets: StrengthSet[]) => {
      setDraft((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          exercises: previous.exercises.map((item) =>
            item.id === exerciseId ? { ...item, sets } : item,
          ),
        };
      });
    },
    [],
  );

  const setCardio = useCallback((cardio: CardioEntry) => {
    setDraft((previous) => {
      const base = previous ?? {
        id: createId(),
        type: 'cardio' as WorkoutType,
        exercises: [],
        cardio: null,
        performedAt: new Date().toISOString(),
      };
      return { ...base, cardio };
    });
  }, []);

  const discardDraft = useCallback(() => setDraft(null), []);

  const saveDraft = useCallback(async (): Promise<WorkoutSession | null> => {
    if (!draft || !session?.user.id) return null;
    const hasContent = draft.exercises.length > 0 || draft.cardio !== null;
    if (!hasContent) return null;

    const nowIso = new Date().toISOString();
    const workout: WorkoutSession = {
      id: draft.id,
      owner_id: session.user.id,
      type: draft.type,
      title: titleForDraft(draft),
      performed_at: draft.performedAt,
      exercises: draft.exercises,
      cardio: draft.cardio,
      notes: null,
      created_at: nowIso,
      updated_at: nowIso,
    };

    await saveWorkoutSession(workout);
    triggerSync().catch(() => undefined);
    setDraft(null);
    return workout;
  }, [draft, session?.user.id, triggerSync]);

  const value = useMemo<WorkoutDraftContextValue>(
    () => ({
      draft,
      startDraft,
      addExercise,
      removeExercise,
      getExercise,
      updateExerciseSets,
      setCardio,
      discardDraft,
      saveDraft,
    }),
    [
      draft,
      startDraft,
      addExercise,
      removeExercise,
      getExercise,
      updateExerciseSets,
      setCardio,
      discardDraft,
      saveDraft,
    ],
  );

  return (
    <WorkoutDraftContext.Provider value={value}>
      {children}
    </WorkoutDraftContext.Provider>
  );
};

export const useWorkoutDraft = (): WorkoutDraftContextValue => {
  const context = useContext(WorkoutDraftContext);
  if (!context) {
    throw new Error('useWorkoutDraft must be used within WorkoutDraftProvider');
  }
  return context;
};
