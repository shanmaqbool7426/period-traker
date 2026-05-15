import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { hapticSelection } from '@/utils/haptics';
import { useColors } from '@/hooks/useColors';
import { useApp, CycleLog } from '@/contexts/AppContext';

type Phase = 'all' | 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

const phaseColors: Record<string, string> = {
  menstrual: '#f472b6',
  follicular: '#c084fc',
  ovulation: '#2dd4bf',
  luteal: '#fb923c',
};

const phaseLabels: Record<string, string> = {
  all: 'All Phases',
  menstrual: 'Menstrual',
  follicular: 'Follicular',
  ovulation: 'Ovulation',
  luteal: 'Luteal',
};

const energyColors = ['#60a5fa', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'];
const energyLabels = ['Drained', 'Low', 'Okay', 'Good', 'Amazing'];

function getDayPhase(
  date: string,
  lastPeriodStart: string,
  cycleLength: number,
  periodLength: number
): string {
  const start = new Date(lastPeriodStart + 'T00:00:00');
  const d = new Date(date + 'T00:00:00');
  const diff = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
  if (cycleDay <= periodLength) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulation';
  return 'luteal';
}

/** Generate 90 days of realistic mock logs based on the user's cycle */
function generateMockLogs(
  lastPeriodStart: string,
  cycleLength: number,
  periodLength: number
): CycleLog[] {
  const symptomsByPhase: Record<string, string[][]> = {
    menstrual: [
      ['Cramps', 'Fatigue'],
      ['Cramps', 'Bloating', 'Back pain'],
      ['Fatigue', 'Bloating'],
      ['Cramps', 'Mood swings', 'Fatigue'],
      ['Back pain', 'Headache'],
      ['Fatigue'],
      ['Cramps', 'Fatigue', 'Bloating'],
    ],
    follicular: [
      [],
      ['Tender breasts'],
      [],
      ['Headache'],
      [],
      ['Tender breasts'],
      [],
    ],
    ovulation: [
      ['Tender breasts'],
      [],
      ['Tender breasts', 'Headache'],
    ],
    luteal: [
      ['Bloating', 'Mood swings'],
      ['Cravings', 'Fatigue'],
      ['Headache', 'Bloating'],
      ['Mood swings', 'Cravings'],
      ['Fatigue', 'Tender breasts'],
      ['Bloating'],
      ['Mood swings', 'Headache', 'Cravings'],
      ['Fatigue'],
    ],
  };
  const flowByPhase: Record<string, CycleLog['flow'][]> = {
    menstrual: ['heavy', 'heavy', 'medium', 'medium', 'light', 'light', 'none'],
    follicular: ['none', 'none', 'none', 'none', 'none', 'none', 'none'],
    ovulation: ['none', 'none', 'none'],
    luteal: ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'],
  };
  const energyByPhase: Record<string, number[]> = {
    menstrual: [1, 1, 2, 2, 2, 3, 2],
    follicular: [3, 3, 4, 4, 4, 3, 4],
    ovulation: [5, 5, 4],
    luteal: [3, 3, 2, 2, 3, 2, 2, 3],
  };

  const logs: CycleLog[] = [];
  const today = new Date();

  for (let i = 89; i >= 1; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const phase = getDayPhase(dateStr, lastPeriodStart, cycleLength, periodLength);

    // ~70% of days have a log
    if (Math.random() > 0.3) {
      const phaseIdx = Math.floor(Math.random() * symptomsByPhase[phase].length);
      const flowIdx = Math.floor(Math.random() * flowByPhase[phase].length);
      const energyIdx = Math.floor(Math.random() * energyByPhase[phase].length);

      logs.push({
        id: `mock-${dateStr}`,
        date: dateStr,
        flow: flowByPhase[phase][flowIdx],
        mood: 'calm',
        symptoms: symptomsByPhase[phase][phaseIdx] ?? [],
        energy: energyByPhase[phase][energyIdx],
        notes: '',
      });
    }
  }
  return logs;
}

function HorizBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={barStyles.track}>
      <View style={[barStyles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ede9fe',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
});

export default function InsightsModal() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logs: sessionLogs, profile, currentPhase } = useApp();

  const [selectedPhase, setSelectedPhase] = useState<Phase>('all');
  const bottomPad = Platform.OS === 'web' ? 24 : insets.bottom;

  // Merge mock + session logs, deduplicate by date
  const allLogs = useMemo(() => {
    const mock = generateMockLogs(
      profile.lastPeriodStart,
      profile.cycleLength,
      profile.periodLength
    );
    const sessionDates = new Set(sessionLogs.map(l => l.date));
    const base = mock.filter(l => !sessionDates.has(l.date));
    return [...sessionLogs, ...base].sort((a, b) => b.date.localeCompare(a.date));
  }, [sessionLogs, profile]);

  // Annotate each log with its phase
  const annotated = useMemo(() =>
    allLogs.map(l => ({
      ...l,
      phase: getDayPhase(l.date, profile.lastPeriodStart, profile.cycleLength, profile.periodLength),
    })),
    [allLogs, profile]
  );

  const filtered = useMemo(() =>
    selectedPhase === 'all' ? annotated : annotated.filter(l => l.phase === selectedPhase),
    [annotated, selectedPhase]
  );

  // Symptom frequency
  const symptomFreq = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of filtered) {
      for (const s of log.symptoms) {
        counts[s] = (counts[s] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [filtered]);

  const maxSymptomCount = symptomFreq[0]?.[1] ?? 1;

  // Energy per phase
  const energyByPhase = useMemo(() => {
    const result: Record<string, { sum: number; count: number }> = {
      menstrual: { sum: 0, count: 0 },
      follicular: { sum: 0, count: 0 },
      ovulation: { sum: 0, count: 0 },
      luteal: { sum: 0, count: 0 },
    };
    for (const log of annotated) {
      if (result[log.phase]) {
        result[log.phase].sum += log.energy;
        result[log.phase].count += 1;
      }
    }
    return result;
  }, [annotated]);

  // Flow distribution
  const flowDist = useMemo(() => {
    const counts: Record<string, number> = { none: 0, light: 0, medium: 0, heavy: 0 };
    for (const log of filtered) counts[log.flow] = (counts[log.flow] ?? 0) + 1;
    const total = filtered.length || 1;
    return Object.entries(counts).map(([k, v]) => ({ label: k, count: v, pct: Math.round((v / total) * 100) }));
  }, [filtered]);

  // Summary stats
  const totalLogs = filtered.length;
  const avgEnergy = filtered.length
    ? (filtered.reduce((s, l) => s + l.energy, 0) / filtered.length).toFixed(1)
    : '—';
  const topSymptom = symptomFreq[0]?.[0] ?? 'None logged';
  const symptomFreeSessions = filtered.filter(l => l.symptoms.length === 0).length;
  const symptomFreePercent = totalLogs > 0 ? Math.round((symptomFreeSessions / totalLogs) * 100) : 0;

  // Insights text
  const insightChips = useMemo(() => {
    const chips: { text: string; icon: string; color: string }[] = [];
    const lutealLogs = annotated.filter(l => l.phase === 'luteal');
    const menstrualLogs = annotated.filter(l => l.phase === 'menstrual');
    const ovulationLogs = annotated.filter(l => l.phase === 'ovulation');

    const lutealEnergy = lutealLogs.length
      ? lutealLogs.reduce((s, l) => s + l.energy, 0) / lutealLogs.length : 3;
    const ovulEnergy = ovulationLogs.length
      ? ovulationLogs.reduce((s, l) => s + l.energy, 0) / ovulationLogs.length : 4;

    chips.push({
      icon: 'trending-up',
      color: '#2dd4bf',
      text: `Your energy peaks during ovulation (avg ${ovulEnergy.toFixed(1)}/5) — schedule demanding work then.`,
    });

    const crampCount = menstrualLogs.filter(l => l.symptoms.includes('Cramps')).length;
    const crampPct = menstrualLogs.length > 0 ? Math.round((crampCount / menstrualLogs.length) * 100) : 0;
    chips.push({
      icon: 'heart',
      color: '#f472b6',
      text: `Cramps appear in ${crampPct}% of your menstrual days. A heating pad and magnesium may help.`,
    });

    const cravingCount = lutealLogs.filter(l => l.symptoms.includes('Cravings')).length;
    if (cravingCount > 0) {
      chips.push({
        icon: 'sparkles',
        color: '#fbbf24',
        text: `Cravings show up ${cravingCount}x in your luteal phase — dark chocolate and complex carbs are your friend.`,
      });
    } else {
      chips.push({
        icon: 'sparkles',
        color: '#fbbf24',
        text: `You log ${symptomFreePercent}% of days symptom-free — great awareness of your body!`,
      });
    }
    return chips;
  }, [annotated, symptomFreePercent]);

  const phaseTabs: Phase[] = ['all', 'menstrual', 'follicular', 'ovulation', 'luteal'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: '#c084fc' + '18' }]}>
              <Ionicons name="analytics" size={20} color="#c084fc" />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Symptom Trends</Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                Last 90 days · {totalLogs} entries
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.muted }]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Phase Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {phaseTabs.map(p => {
            const active = selectedPhase === p;
            const color = p === 'all' ? colors.primary : phaseColors[p];
            return (
              <TouchableOpacity
                key={p}
                onPress={() => { hapticSelection(); setSelectedPhase(p); }}
                style={[
                  styles.tab,
                  {
                    backgroundColor: active ? color + '15' : 'transparent',
                    borderColor: active ? color : colors.border,
                    borderWidth: active ? 1.5 : 1,
                  },
                ]}
              >
                {p !== 'all' && (
                  <View style={[styles.tabDot, { backgroundColor: color }]} />
                )}
                <Text style={[styles.tabText, { color: active ? color : colors.textSecondary }]}>
                  {phaseLabels[p]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Entries', value: String(totalLogs), icon: 'journal-outline', color: '#c084fc' },
            { label: 'Avg Energy', value: `${avgEnergy}/5`, icon: 'battery-half-outline', color: '#2dd4bf' },
            { label: 'Symptom-free', value: `${symptomFreePercent}%`, icon: 'happy-outline', color: '#fbbf24' },
          ].map(stat => (
            <View
              key={stat.label}
              style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border, borderTopColor: stat.color, borderTopWidth: 3 }]}
            >
              <View style={[styles.summaryIcon, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon as any} size={16} color={stat.color} />
              </View>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Symptom Frequency */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bar-chart-outline" size={15} color={colors.textSecondary} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SYMPTOM FREQUENCY</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {symptomFreq.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No symptoms logged yet. Start tracking in your journal!
              </Text>
            ) : (
              <View style={styles.barList}>
                {symptomFreq.map(([name, count], i) => {
                  const phaseColor =
                    selectedPhase !== 'all' ? phaseColors[selectedPhase] : '#c084fc';
                  return (
                    <View key={name} style={styles.barRow}>
                      <Text style={[styles.barLabel, { color: colors.text }]}>{name}</Text>
                      <HorizBar value={count} max={maxSymptomCount} color={phaseColor} />
                      <Text style={[styles.barCount, { color: phaseColor }]}>{count}x</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Energy by Phase */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash-outline" size={15} color={colors.textSecondary} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>AVERAGE ENERGY BY PHASE</Text>
          </View>
          <View style={styles.energyPhaseGrid}>
            {(['menstrual', 'follicular', 'ovulation', 'luteal'] as const).map(ph => {
              const { sum, count } = energyByPhase[ph];
              const avg = count > 0 ? sum / count : 0;
              const avgRounded = Math.round(avg * 10) / 10;
              const color = phaseColors[ph];
              const pct = (avg / 5) * 100;
              return (
                <View key={ph} style={[styles.energyPhaseCard, { backgroundColor: colors.card, borderColor: colors.border, borderTopColor: color, borderTopWidth: 3 }]}>
                  <Text style={[styles.energyPhaseName, { color }]}>
                    {ph.charAt(0).toUpperCase() + ph.slice(1)}
                  </Text>
                  <Text style={[styles.energyPhaseValue, { color: colors.text }]}>{avgRounded > 0 ? avgRounded : '—'}</Text>
                  <View style={[styles.energyPhaseTrack, { backgroundColor: colors.muted }]}>
                    <View
                      style={[styles.energyPhaseFill, { width: `${pct}%` as any, backgroundColor: color }]}
                    />
                  </View>
                  <Text style={[styles.energyPhaseLabel, { color: colors.mutedForeground }]}>
                    {avgRounded > 0 ? energyLabels[Math.round(avg) - 1] ?? '' : 'No data'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Flow Distribution */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="water-outline" size={15} color={colors.textSecondary} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>FLOW DISTRIBUTION</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.flowRow}>
              {flowDist.map(({ label, count, pct }) => {
                const fColors: Record<string, string> = {
                  none: colors.mutedForeground,
                  light: '#c084fc',
                  medium: '#f472b6',
                  heavy: '#fb7185',
                };
                const color = fColors[label];
                return (
                  <View key={label} style={styles.flowItem}>
                    <View style={[styles.flowBar, { backgroundColor: color + '20', borderColor: color + '40' }]}>
                      <View
                        style={[
                          styles.flowBarFill,
                          {
                            height: `${pct}%` as any,
                            backgroundColor: color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.flowPct, { color }]}>{pct}%</Text>
                    <Text style={[styles.flowLabel, { color: colors.textSecondary }]}>
                      {label.charAt(0).toUpperCase() + label.slice(1)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles-outline" size={15} color={colors.textSecondary} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PATTERN INSIGHTS</Text>
          </View>
          <View style={styles.insightList}>
            {insightChips.map((chip, i) => (
              <View
                key={i}
                style={[styles.insightChip, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: chip.color, borderLeftWidth: 4 }]}
              >
                <View style={[styles.insightIcon, { backgroundColor: chip.color + '15' }]}>
                  <Ionicons name={chip.icon as any} size={15} color={chip.color} />
                </View>
                <Text style={[styles.insightText, { color: colors.text }]}>{chip.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Symptom Callout */}
        <View style={[styles.topSymptomCard, { backgroundColor: '#c084fc' + '10', borderColor: '#c084fc' + '35', borderWidth: 1 }]}>
          <Ionicons name="podium-outline" size={18} color="#c084fc" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.topSymptomLabel, { color: colors.textSecondary }]}>Most tracked symptom</Text>
            <Text style={[styles.topSymptomValue, { color: '#c084fc' }]}>{topSymptom}</Text>
          </View>
          <Text style={[styles.topSymptomCount, { color: colors.mutedForeground }]}>
            {symptomFreq[0]?.[1] ?? 0}x logged
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: 'Nunito_700Bold', fontSize: 20 },
  headerSub: { fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 1 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  tabDot: { width: 6, height: 6, borderRadius: 3 },
  tabText: { fontFamily: 'Nunito_600SemiBold', fontSize: 12 },
  content: { paddingHorizontal: 20, paddingTop: 18, gap: 18 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  summaryIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  summaryValue: { fontFamily: 'Nunito_700Bold', fontSize: 17 },
  summaryLabel: { fontFamily: 'Nunito_400Regular', fontSize: 10, textAlign: 'center' },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyText: { fontFamily: 'Nunito_400Regular', fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  barList: { gap: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { fontFamily: 'Nunito_500Medium', fontSize: 13, width: 100 },
  barCount: { fontFamily: 'Nunito_700Bold', fontSize: 13, width: 30, textAlign: 'right' },
  energyPhaseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  energyPhaseCard: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  energyPhaseName: { fontFamily: 'Nunito_700Bold', fontSize: 12, textTransform: 'capitalize' },
  energyPhaseValue: { fontFamily: 'Nunito_700Bold', fontSize: 28 },
  energyPhaseTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  energyPhaseFill: { height: '100%', borderRadius: 3 },
  energyPhaseLabel: { fontFamily: 'Nunito_400Regular', fontSize: 11 },
  flowRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-around' },
  flowItem: { alignItems: 'center', gap: 6, flex: 1 },
  flowBar: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  flowBarFill: { width: '100%', borderRadius: 8 },
  flowPct: { fontFamily: 'Nunito_700Bold', fontSize: 14 },
  flowLabel: { fontFamily: 'Nunito_400Regular', fontSize: 11, textTransform: 'capitalize' },
  insightList: { gap: 10 },
  insightChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  insightIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  insightText: { fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 20, flex: 1 },
  topSymptomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
  },
  topSymptomLabel: { fontFamily: 'Nunito_400Regular', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  topSymptomValue: { fontFamily: 'Nunito_700Bold', fontSize: 18, marginTop: 2 },
  topSymptomCount: { fontFamily: 'Nunito_500Medium', fontSize: 13 },
});
