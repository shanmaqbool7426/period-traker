import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/contexts/AppContext';
import { GlassCard } from '@/components/ui/GlassCard';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['S','M','T','W','T','F','S'];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

export default function CalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentPhase, profile, cycleDay, logs } = useApp();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const calDays = getCalendarDays(viewYear, viewMonth);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const getDayType = (day: number): string | null => {
    if (viewYear !== today.getFullYear() || viewMonth !== today.getMonth()) return null;
    const offset = day - today.getDate() + cycleDay;
    if (offset < 1 || offset > profile.cycleLength) return null;
    if (offset <= profile.periodLength) return 'menstrual';
    if (offset <= 13) return 'follicular';
    if (offset <= 16) return 'ovulation';
    return 'luteal';
  };

  const phaseColors: Record<string, string> = {
    menstrual: colors.accent,
    follicular: colors.primary,
    ovulation: colors.teal,
    luteal: colors.accentLight,
  };

  const prevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectedLog = selectedDay
    ? logs.find(l => l.date === `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`)
    : null;

  return (
    <LinearGradient
      colors={[colors.background, colors.primary + '10', colors.background]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Cycle Calendar</Text>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {MONTHS[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <GlassCard style={styles.calCard}>
          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {DAYS.map((d, i) => (
              <Text key={i} style={[styles.dayHeader, { color: colors.textSecondary }]}>{d}</Text>
            ))}
          </View>
          {/* Calendar grid */}
          <View style={styles.grid}>
            {calDays.map((day, idx) => {
              if (!day) return <View key={idx} style={styles.cell} />;
              const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
              const isSelected = day === selectedDay;
              const phaseType = getDayType(day);
              const pColor = phaseType ? phaseColors[phaseType] : null;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.cell,
                    pColor && { backgroundColor: pColor + '20' },
                    isSelected && { backgroundColor: colors.primary + '40', borderColor: colors.primary, borderWidth: 1.5 },
                    isToday && !isSelected && { borderColor: colors.primary + '60', borderWidth: 1 },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedDay(day);
                  }}
                >
                  <Text style={[
                    styles.dayNum,
                    { color: isSelected ? colors.primary : pColor || colors.text },
                    isToday && { fontFamily: 'Nunito_700Bold' },
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* Phase Legend */}
        <GlassCard style={styles.legend}>
          <Text style={[styles.legendTitle, { color: colors.textSecondary }]}>PHASE LEGEND</Text>
          <View style={styles.legendRow}>
            {Object.entries(phaseColors).map(([phase, color]) => (
              <View key={phase} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
                  {phase.charAt(0).toUpperCase() + phase.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Selected Day Info */}
        {selectedDay && (
          <GlassCard style={styles.dayInfo}>
            <Text style={[styles.dayInfoTitle, { color: colors.text }]}>
              {MONTHS[viewMonth]} {selectedDay}
            </Text>
            {selectedLog ? (
              <View style={{ gap: 8 }}>
                <Text style={[styles.dayInfoDetail, { color: colors.textSecondary }]}>
                  Mood: {selectedLog.mood}
                </Text>
                <Text style={[styles.dayInfoDetail, { color: colors.textSecondary }]}>
                  Energy: {selectedLog.energy}/5
                </Text>
                {selectedLog.notes ? (
                  <Text style={[styles.dayInfoDetail, { color: colors.textSecondary }]}>
                    {selectedLog.notes}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text style={[styles.dayInfoDetail, { color: colors.mutedForeground }]}>
                No log for this day
              </Text>
            )}
          </GlassCard>
        )}

        <View style={{ height: Platform.OS === 'web' ? 34 : 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 16 },
  title: { fontFamily: 'Nunito_700Bold', fontSize: 26 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: { padding: 8 },
  monthTitle: { fontFamily: 'Nunito_700Bold', fontSize: 18 },
  calCard: { gap: 12, padding: 12 },
  dayHeaders: {
    flexDirection: 'row',
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayNum: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
  },
  legend: { gap: 10 },
  legendTitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
  },
  dayInfo: { gap: 8 },
  dayInfoTitle: { fontFamily: 'Nunito_700Bold', fontSize: 16 },
  dayInfoDetail: { fontFamily: 'Nunito_400Regular', fontSize: 14 },
});
