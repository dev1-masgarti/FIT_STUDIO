import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { LogScreenShell } from '@/components/log/LogScreenShell';
import { colors, fonts } from '@/constants/theme';
import {
  exerciseCatalog,
  exerciseCategories,
  type ExerciseCategory,
} from '@/constants/exercises';
import { goBackOrHome } from '@/lib/navigation';
import { useWorkoutDraft } from '@/providers/WorkoutDraftProvider';

const SearchIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 20 20" fill="none">
    <Path d="M14 14 18 18M8.75 15a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z" stroke="#666" strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

const ExerciseGlyph = () => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 9.5 6 7.5l2 2m8 5 2-2 2 2M8 9.5l8 8M8 17.5l8-8"
      stroke={colors.accent}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ExerciseRow = ({
  name,
  muscles,
  meta,
  onPress,
}: {
  name: string;
  muscles: string;
  meta?: string;
  onPress: () => void;
}) => (
  <Pressable style={styles.row} onPress={onPress} accessibilityRole="button" accessibilityLabel={name}>
    <View style={styles.rowIconWrap}>
      <ExerciseGlyph />
    </View>
    <View style={styles.rowText}>
      <Text style={styles.rowTitle}>{name}</Text>
      <Text style={styles.rowSubtitle}>{muscles}</Text>
    </View>
    {meta ? <Text style={styles.rowMeta}>{meta}</Text> : <Text style={styles.rowPlus}>+</Text>}
  </Pressable>
);

const AddExerciseScreen = () => {
  const { draft, addExercise, saveDraft } = useWorkoutDraft();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ExerciseCategory | null>(null);
  const [saving, setSaving] = useState(false);

  const draftExercises = draft?.exercises ?? [];

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return exerciseCatalog.filter((item) => {
      const matchesCategory = !category || item.category === category;
      const matchesQuery =
        normalized.length === 0 ||
        item.name.toLowerCase().includes(normalized) ||
        item.muscles.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const handlePickExercise = (name: string, muscles: string) => {
    const exerciseId = addExercise(name, muscles);
    router.push(`/(tabs)/log/sets?exerciseId=${exerciseId}` as never);
  };

  const handleFinish = async () => {
    if (draftExercises.length === 0) {
      goBackOrHome();
      return;
    }
    setSaving(true);
    try {
      const saved = await saveDraft();
      if (saved) {
        router.replace('/(tabs)/history' as never);
      } else {
        goBackOrHome();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <LogScreenShell
      title="Add Exercise"
      rightSlot={
        <Pressable onPress={handleFinish} accessibilityRole="button" accessibilityLabel="Done">
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      }
    >
      <View style={styles.searchBox}>
        <SearchIcon />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises..."
          placeholderTextColor="#555"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        <Pressable
          style={[styles.chip, category === null && styles.chipActive]}
          onPress={() => setCategory(null)}
          accessibilityRole="button"
          accessibilityLabel="All categories"
        >
          <Text style={[styles.chipText, category === null && styles.chipTextActive]}>All</Text>
        </Pressable>
        {exerciseCategories.map((chip) => {
          const active = chip === category;
          return (
            <Pressable
              key={chip}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setCategory(active ? null : chip)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${chip}`}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {draftExercises.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>IN THIS WORKOUT</Text>
          <View style={styles.listWrap}>
            {draftExercises.map((item) => (
              <ExerciseRow
                key={item.id}
                name={item.name}
                muscles={item.muscles}
                meta={`${item.sets.length} ${item.sets.length === 1 ? 'set' : 'sets'} ›`}
                onPress={() => router.push(`/(tabs)/log/sets?exerciseId=${item.id}` as never)}
              />
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>ALL EXERCISES</Text>
      <View style={styles.listWrap}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No exercises match your search.</Text>
        ) : (
          filtered.map((item) => (
            <ExerciseRow
              key={item.name}
              name={item.name}
              muscles={item.muscles}
              onPress={() => handlePickExercise(item.name, item.muscles)}
            />
          ))
        )}
      </View>

      {draftExercises.length > 0 ? (
        <Pressable
          style={styles.finishButton}
          onPress={handleFinish}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Finish and save workout"
        >
          <Text style={styles.finishButtonText}>
            {saving ? 'Saving…' : `Finish Workout (${draftExercises.length})`}
          </Text>
        </Pressable>
      ) : null}
    </LogScreenShell>
  );
};

export default AddExerciseScreen;

const styles = StyleSheet.create({
  doneText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.accent,
    textAlign: 'right',
  },
  searchBox: {
    marginTop: 4,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.18,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 17,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
    padding: 0,
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 12,
    paddingRight: 30,
  },
  chip: {
    height: 28,
    borderRadius: 999,
    borderWidth: 1.18,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#888',
  },
  chipTextActive: {
    color: colors.black,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 4,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: '#666',
    letterSpacing: 1,
  },
  listWrap: {
    width: '100%',
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#555',
    paddingVertical: 16,
  },
  row: {
    borderBottomWidth: 1.18,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.18,
    borderColor: 'rgba(27,243,203,0.1)',
    backgroundColor: 'rgba(27,243,203,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.white,
  },
  rowSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 16.5,
    color: '#555',
  },
  rowMeta: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.accent,
  },
  rowPlus: {
    fontFamily: fonts.regular,
    fontSize: 22,
    color: '#666',
    width: 22,
    textAlign: 'center',
  },
  finishButton: {
    marginTop: 20,
    marginBottom: 8,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.black,
  },
});
