import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type ProfessionalCardProps = {
  name: string;
  specialty: string;
  effectiveness: string;
  status: string;
  statusColor: string;
  avatarLabel: string;
  avatarTint: string;
  onPress?: () => void;
};

export const ProfessionalCard = ({
  name,
  specialty,
  effectiveness,
  status,
  statusColor,
  avatarLabel,
  avatarTint,
  onPress,
}: ProfessionalCardProps) => (
  <Pressable
    style={styles.card}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Open ${name} access details`}
  >
    <View style={styles.headerRow}>
      <View style={[styles.avatarWrap, { borderColor: 'rgba(255,255,255,0.2)' }]}>
        <View style={[styles.avatarInner, { backgroundColor: avatarTint }]}>
          <Text style={styles.avatarText}>{avatarLabel}</Text>
        </View>
      </View>
      <View style={styles.identity}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.specialty}>{specialty}</Text>
      </View>
      <View style={styles.dot} />
    </View>

    <View style={styles.statsCard}>
      <View>
        <Text style={styles.metricLabel}>EFFECTIVENESS</Text>
        <Text style={styles.metricValue}>{effectiveness}</Text>
      </View>
      <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 21,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 16,
    color: colors.white,
  },
  identity: {
    flex: 1,
    gap: 0,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.white,
  },
  specialty: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 12,
    color: '#919191',
    textTransform: 'uppercase',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  statsCard: {
    borderRadius: 8,
    backgroundColor: 'rgba(53,53,52,0.4)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metricLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: '#8c8c8c',
  },
  metricValue: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 28,
    color: colors.accent,
  },
  status: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
  },
});
