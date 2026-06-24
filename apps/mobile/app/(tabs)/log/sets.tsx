import type { StrengthSet } from '@fitown/types';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { LogScreenShell } from '@/components/log/LogScreenShell';
import { colors, fonts } from '@/constants/theme';
import { createId } from '@/lib/api/workouts';
import { goBackOrHome } from '@/lib/navigation';
import { useWorkoutDraft } from '@/providers/WorkoutDraftProvider';

const formatNumber = (value: number): string => String(value);

const EditableStepper = ({
  value,
  min,
  max,
  step,
  decimals = false,
  highlight,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  decimals?: boolean;
  highlight?: boolean;
  onChange: (next: number) => void;
}) => {
  const [text, setText] = useState(formatNumber(value));

  useEffect(() => {
    setText(formatNumber(value));
  }, [value]);

  const clamp = (next: number) => Math.max(min, Math.min(max, next));

  const handleChangeText = (raw: string) => {
    const sanitized = decimals ? raw.replace(/[^0-9.]/g, '') : raw.replace(/[^0-9]/g, '');
    setText(sanitized);
    const parsed = decimals ? Number.parseFloat(sanitized) : Number.parseInt(sanitized, 10);
    if (!Number.isNaN(parsed)) {
      onChange(clamp(parsed));
    }
  };

  const handleBlur = () => {
    const parsed = decimals ? Number.parseFloat(text) : Number.parseInt(text, 10);
    const safe = Number.isNaN(parsed) ? min : clamp(parsed);
    onChange(safe);
    setText(formatNumber(safe));
  };

  return (
    <View style={[styles.stepperWrap, highlight && styles.stepperWrapActive]}>
      <Pressable
        style={styles.stepperBtn}
        onPress={() => onChange(clamp(Number((value - step).toFixed(2))))}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
      >
        <Text style={styles.stepperBtnText}>−</Text>
      </Pressable>
      <TextInput
        style={[styles.inputText, highlight && styles.inputTextActive]}
        value={text}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        keyboardType={decimals ? 'decimal-pad' : 'number-pad'}
        selectTextOnFocus
        accessibilityLabel="Value"
      />
      <Pressable
        style={styles.stepperBtn}
        onPress={() => onChange(clamp(Number((value + step).toFixed(2))))}
        accessibilityRole="button"
        accessibilityLabel="Increase"
      >
        <Text style={styles.stepperBtnText}>+</Text>
      </Pressable>
    </View>
  );
};

const LogSetsScreen = () => {
  const { exerciseId } = useLocalSearchParams<{ exerciseId?: string }>();
  const { getExercise, updateExerciseSets } = useWorkoutDraft();

  const exercise = exerciseId ? getExercise(String(exerciseId)) : undefined;

  const [sets, setSets] = useState<StrengthSet[]>(
    exercise?.sets ?? [{ id: createId(), weight_kg: 20, reps: 10, rpe: 7, done: false }],
  );

  const estimatedOneRm = useMemo(() => {
    const best = sets.reduce((current, item) => {
      const estimate = item.weight_kg * (1 + item.reps / 30);
      return estimate > current ? estimate : current;
    }, 0);
    return Math.round(best);
  }, [sets]);

  const updateSet = (setId: string, patch: Partial<StrengthSet>) => {
    setSets((previous) =>
      previous.map((item) => (item.id === setId ? { ...item, ...patch } : item)),
    );
  };

  const handleAddSet = () => {
    setSets((previous) => {
      const last = previous[previous.length - 1];
      return [
        ...previous,
        {
          id: createId(),
          weight_kg: last?.weight_kg ?? 20,
          reps: last?.reps ?? 10,
          rpe: last?.rpe ?? 7,
          done: false,
        },
      ];
    });
  };

  const handleRemoveSet = () => {
    setSets((previous) => (previous.length > 1 ? previous.slice(0, -1) : previous));
  };

  const handleSave = () => {
    if (exercise) {
      updateExerciseSets(exercise.id, sets);
    }
    goBackOrHome();
  };

  if (!exercise) {
    return (
      <LogScreenShell title="Log Sets">
        <View style={styles.missingWrap}>
          <Text style={styles.missingTitle}>No exercise selected</Text>
          <Text style={styles.missingSub}>
            Start a workout and pick an exercise to log your sets.
          </Text>
          <Pressable style={styles.saveButton} onPress={goBackOrHome} accessibilityRole="button">
            <Text style={styles.saveButtonText}>Back to workout</Text>
          </Pressable>
        </View>
      </LogScreenShell>
    );
  }

  return (
    <LogScreenShell title={exercise.name}>
      <Text style={styles.muscles}>{exercise.muscles}</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.statLabel}>EST. 1RM</Text>
        <View style={styles.inline}>
          <Text style={styles.statValue}>{estimatedOneRm}</Text>
          <Text style={styles.statUnit}>KG</Text>
        </View>
        <Text style={styles.statSub}>Calculated from the sets you log</Text>
      </View>

      <View style={styles.tableCard}>
        <View style={styles.tableHead}>
          <Text style={[styles.colHead, styles.colSet]}>SET</Text>
          <Text style={[styles.colHead, styles.colWeight]}>WEIGHT</Text>
          <Text style={[styles.colHead, styles.colReps]}>REPS</Text>
          <Text style={[styles.colHead, styles.colRpe]}>RPE</Text>
          <Text style={[styles.colHead, styles.colDone]}>✓</Text>
        </View>
        {sets.map((setItem, index) => (
          <View key={setItem.id} style={styles.tableRow}>
            <Text style={[styles.colValue, styles.colSet]}>
              {String(index + 1).padStart(2, '0')}
            </Text>
            <View style={styles.colWeight}>
              <EditableStepper
                value={setItem.weight_kg}
                min={0}
                max={500}
                step={2.5}
                decimals
                onChange={(next) => updateSet(setItem.id, { weight_kg: next })}
              />
            </View>
            <View style={styles.colReps}>
              <EditableStepper
                value={setItem.reps}
                min={0}
                max={100}
                step={1}
                onChange={(next) => updateSet(setItem.id, { reps: next })}
              />
            </View>
            <View style={styles.colRpe}>
              <EditableStepper
                value={setItem.rpe ?? 7}
                min={1}
                max={10}
                step={1}
                onChange={(next) => updateSet(setItem.id, { rpe: next })}
              />
            </View>
            <Pressable
              style={styles.colDone}
              onPress={() => updateSet(setItem.id, { done: !setItem.done })}
              accessibilityRole="button"
              accessibilityLabel={`Mark set ${index + 1} as ${setItem.done ? 'pending' : 'done'}`}
            >
              <Text style={setItem.done ? styles.doneMark : styles.pendingMark}>
                {setItem.done ? '✓' : '○'}
              </Text>
            </Pressable>
          </View>
        ))}
        <View style={styles.setActions}>
          <Pressable
            style={styles.addSet}
            accessibilityRole="button"
            accessibilityLabel="Add new set"
            onPress={handleAddSet}
          >
            <Text style={styles.addSetText}>+ ADD SET</Text>
          </Pressable>
          {sets.length > 1 ? (
            <Pressable
              style={styles.removeSet}
              accessibilityRole="button"
              accessibilityLabel="Remove last set"
              onPress={handleRemoveSet}
            >
              <Text style={styles.removeSetText}>− REMOVE</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Pressable
        style={styles.saveButton}
        onPress={handleSave}
        accessibilityRole="button"
        accessibilityLabel="Save exercise"
      >
        <Text style={styles.saveButtonText}>Save Exercise ({sets.length} sets)</Text>
      </Pressable>
    </LogScreenShell>
  );
};

export default LogSetsScreen;

const styles = StyleSheet.create({
  muscles: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#666',
  },
  scoreCard: {
    marginTop: 12,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 12,
    color: '#828282',
    letterSpacing: 0.6,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginTop: 6,
  },
  statValue: {
    fontFamily: fonts.semiBold,
    fontSize: 32,
    lineHeight: 40,
    color: colors.white,
  },
  statUnit: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#a7a7a7',
    marginBottom: 7,
  },
  statSub: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 10,
    color: '#828282',
  },
  tableCard: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  colHead: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: '#919191',
  },
  colSet: { width: 30 },
  colWeight: { flex: 1.25, alignItems: 'center' as const },
  colReps: { flex: 1, alignItems: 'center' as const },
  colRpe: { flex: 1, alignItems: 'center' as const },
  colDone: { width: 28, alignItems: 'center' as const },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  colValue: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.white,
  },
  stepperWrap: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 5,
    gap: 2,
  },
  stepperWrapActive: {
    borderColor: colors.accent,
  },
  stepperBtn: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fonts.bold,
    marginTop: -1,
  },
  inputText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#e5e2e1',
    padding: 0,
    minWidth: 28,
  },
  inputTextActive: {
    color: '#e5e2e1',
  },
  doneMark: {
    color: colors.accent,
    fontSize: 22,
  },
  pendingMark: {
    color: '#444',
    fontSize: 20,
  },
  setActions: {
    flexDirection: 'row',
    gap: 8,
    margin: 10,
  },
  addSet: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSetText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.black,
    letterSpacing: 1,
  },
  removeSet: {
    paddingHorizontal: 16,
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  removeSetText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: '#aaa',
    letterSpacing: 1,
  },
  saveButton: {
    marginTop: 18,
    marginBottom: 8,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.black,
  },
  missingWrap: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  missingTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
  },
  missingSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
});
