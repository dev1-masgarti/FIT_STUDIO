import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { LogScreenShell } from '@/components/log/LogScreenShell';
import { colors, fonts } from '@/constants/theme';
import { goBackOrHome } from '@/lib/navigation';
import { useWorkoutDraft } from '@/providers/WorkoutDraftProvider';

const activities = ['Running', 'Cycling', 'Hiking', 'Rowing', 'Swimming', 'HIIT'] as const;

const clampInt = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(value)));

const NumberField = ({
  label,
  value,
  unit,
  decimals = false,
  onChangeNumber,
}: {
  label: string;
  value: string;
  unit?: string;
  decimals?: boolean;
  onChangeNumber: (raw: string) => void;
}) => (
  <View style={styles.fieldBox}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.fieldInline}>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeNumber}
        keyboardType={decimals ? 'decimal-pad' : 'number-pad'}
        placeholder="0"
        placeholderTextColor="#444"
        selectTextOnFocus
        accessibilityLabel={label}
      />
      {unit ? <Text style={styles.fieldUnit}>{unit}</Text> : null}
    </View>
  </View>
);

const CardioSessionScreen = () => {
  const { setCardio, saveDraft } = useWorkoutDraft();
  const [activity, setActivity] = useState<string>('Running');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [distance, setDistance] = useState('0');
  const [intensity, setIntensity] = useState(60);
  const [saving, setSaving] = useState(false);

  const durationSec = useMemo(() => {
    const mins = Number.parseInt(minutes, 10) || 0;
    const secs = Number.parseInt(seconds, 10) || 0;
    return mins * 60 + secs;
  }, [minutes, seconds]);

  const distanceKm = useMemo(() => Number.parseFloat(distance) || 0, [distance]);

  const pace = useMemo(() => {
    if (durationSec <= 0 || distanceKm <= 0) return '--:--';
    const secPerKm = durationSec / distanceKm;
    const mins = Math.floor(secPerKm / 60);
    const secs = Math.round(secPerKm % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [durationSec, distanceKm]);

  const intensityLabel = useMemo(() => {
    if (intensity <= 30) return 'EASY';
    if (intensity <= 65) return 'MODERATE';
    if (intensity <= 85) return 'HARD';
    return 'MAX';
  }, [intensity]);

  const handleMinutes = (raw: string) => setMinutes(raw.replace(/[^0-9]/g, '').slice(0, 3));
  const handleSeconds = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 2);
    const parsed = Number.parseInt(digits, 10);
    if (!Number.isNaN(parsed) && parsed > 59) {
      setSeconds('59');
      return;
    }
    setSeconds(digits);
  };
  const handleDistance = (raw: string) => setDistance(raw.replace(/[^0-9.]/g, ''));

  const handleSave = async () => {
    if (durationSec <= 0) {
      goBackOrHome();
      return;
    }
    setSaving(true);
    try {
      setCardio({
        activity,
        duration_sec: durationSec,
        distance_km: distanceKm,
        intensity_pct: intensity,
      });
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
    <LogScreenShell title="Cardio Session">
      <View style={styles.activitiesRow}>
        {activities.map((label) => (
          <Pressable
            key={label}
            style={[styles.activityChip, activity === label && styles.activityChipActive]}
            onPress={() => setActivity(label)}
            accessibilityRole="button"
            accessibilityLabel={`Select ${label}`}
          >
            <Text style={[styles.activityLabel, activity === label && styles.activityLabelActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.durationCard}>
        <Text style={styles.fieldLabel}>DURATION</Text>
        <View style={styles.durationInline}>
          <TextInput
            style={styles.durationInput}
            value={minutes}
            onChangeText={handleMinutes}
            keyboardType="number-pad"
            placeholder="00"
            placeholderTextColor="#444"
            selectTextOnFocus
            accessibilityLabel="Minutes"
          />
          <Text style={styles.durationColon}>:</Text>
          <TextInput
            style={styles.durationInput}
            value={seconds}
            onChangeText={handleSeconds}
            keyboardType="number-pad"
            placeholder="00"
            placeholderTextColor="#444"
            selectTextOnFocus
            accessibilityLabel="Seconds"
          />
          <Text style={styles.durationUnit}>min : sec</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <NumberField
          label="DISTANCE"
          value={distance}
          unit="KM"
          decimals
          onChangeNumber={handleDistance}
        />
        <View style={styles.fieldBox}>
          <Text style={styles.fieldLabel}>AVG PACE</Text>
          <View style={styles.fieldInline}>
            <Text style={styles.paceValue}>{pace}</Text>
            <Text style={styles.fieldUnit}>/KM</Text>
          </View>
        </View>
      </View>

      <View style={styles.intensityCard}>
        <View style={styles.intensityHeader}>
          <Text style={styles.intensityTitle}>TARGET INTENSITY</Text>
          <Text style={styles.intensityValue}>
            {intensityLabel} ({intensity}%)
          </Text>
        </View>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${intensity}%` }]} />
        </View>
        <View style={styles.intensityActions}>
          <Pressable
            style={styles.intensityStep}
            onPress={() => setIntensity((v) => clampInt(v - 5, 0, 100))}
            accessibilityRole="button"
            accessibilityLabel="Decrease intensity"
          >
            <Text style={styles.intensityStepText}>−5%</Text>
          </Pressable>
          {[40, 60, 80, 95].map((val) => (
            <Pressable
              key={val}
              style={[styles.intensityChip, intensity === val && styles.intensityChipActive]}
              onPress={() => setIntensity(val)}
              accessibilityRole="button"
              accessibilityLabel={`Set intensity ${val} percent`}
            >
              <Text style={[styles.intensityChipText, intensity === val && styles.intensityChipTextActive]}>
                {val}%
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.intensityStep}
            onPress={() => setIntensity((v) => clampInt(v + 5, 0, 100))}
            accessibilityRole="button"
            accessibilityLabel="Increase intensity"
          >
            <Text style={styles.intensityStepText}>+5%</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={styles.startButton}
        onPress={handleSave}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel="Save cardio session"
      >
        <Text style={styles.startButtonText}>{saving ? 'Saving…' : 'Save Session'}</Text>
      </Pressable>
    </LogScreenShell>
  );
};

export default CardioSessionScreen;

const styles = StyleSheet.create({
  activitiesRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  activityChip: {
    minWidth: 80,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  activityChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  activityLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#888',
  },
  activityLabelActive: {
    color: colors.black,
  },
  durationCard: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(28,27,27,0.4)',
    padding: 14,
    alignItems: 'center',
  },
  durationInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  durationInput: {
    minWidth: 64,
    fontFamily: fonts.bold,
    fontSize: 38,
    lineHeight: 46,
    color: colors.white,
    textAlign: 'center',
    padding: 0,
  },
  durationColon: {
    fontFamily: fonts.bold,
    fontSize: 38,
    lineHeight: 46,
    color: '#868686',
  },
  durationUnit: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#868686',
    marginLeft: 8,
    marginBottom: 6,
    alignSelf: 'flex-end',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldBox: {
    flex: 1,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(28,27,27,0.4)',
    alignItems: 'center',
    padding: 14,
  },
  fieldLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#808080',
    letterSpacing: 1,
  },
  fieldInline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 6,
    gap: 3,
  },
  fieldInput: {
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 42,
    color: colors.white,
    textAlign: 'center',
    minWidth: 70,
    padding: 0,
  },
  fieldUnit: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    color: '#868686',
    marginBottom: 5,
  },
  paceValue: {
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 42,
    color: colors.white,
  },
  intensityCard: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(28,27,27,0.4)',
    padding: 14,
  },
  intensityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intensityTitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    letterSpacing: 1,
    color: '#808080',
  },
  intensityValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.accent,
  },
  sliderTrack: {
    marginTop: 10,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 999,
  },
  intensityActions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  intensityStep: {
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  intensityStepText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#bdbdbd',
  },
  intensityChip: {
    flex: 1,
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityChipActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(27,243,203,0.15)',
  },
  intensityChipText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#bdbdbd',
  },
  intensityChipTextActive: {
    color: colors.accent,
  },
  startButton: {
    marginTop: 16,
    marginBottom: 8,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.black,
  },
});
