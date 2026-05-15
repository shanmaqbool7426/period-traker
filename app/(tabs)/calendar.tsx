import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { hapticImpact, hapticSelection } from '@/utils/haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/contexts/AppContext';
import { GlassCard } from '@/components/ui/GlassCard';

const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['S','M','T','W','T','F','S'];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

const phaseColors: Record<string, string> = {
  menstrual: '#f472b6',
  follicular: '#c084fc',
  ovulation: '#2dd4bf',
  luteal: '#fb923c',
};

const phaseLabels: Record<string, string> = {
  menstrual: 'Menstrual',
  follicular: 'Follicular',
  ovulation: 'Ovulation',
  luteal: 'Luteal',
};

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

  const getDayPhase = (day: number): string | null => {
    if (viewYear !== today.getFullYear() || viewMonth !== today.getMonth()) return null;
    const offset = day - today.getDate() + cycleDay;
    if (offset < 1 || offset > profile.cycleLength) return null;
    if (offset <= profile.periodLength) return 'menstrual';
    if (offset <= 13) return 'follicular';
    if (offset <= 16) return 'ovulation';
    return 'luteal';
  };

  const prevMonth = () => {
    hapticImpact();
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    hapticImpact();
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectedLog = selectedDay
    ? logs.find(l => l.date === `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`)
    : null;

  const selectedPhase = selectedDay ? getDayPhase(selectedDay) : null;
  const selectedColor = selectedPhase ? phaseColors[selectedPhase] : colors.primary;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Cycle Calendar</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track your phases</Text>
          </View>
          <View style={[styles.phasePill, { backgroundColor: phaseColors[currentPhase] + '15', borderColor: phaseColors[currentPhase] + '50' }]}>
            <View style={[styles.phaseDot, { backgroundColor: phaseColors[currentPhase] }]} />
            <Text style={[styles.phasePillText, { color: phaseColors[currentPhase] }]}>{phaseLabels[currentPhase]}</Text>
          </View>
        </View>

        {/* Month Navigation */}
        <GlassCard style={styles.monthNavCard}>
          <TouchableOpacity onPress={prevMonth} style={[styles.navBtn, { backgroundColor: colors.muted }]}>
            <Ionicons name="chevron-back" size={18} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.monthCenter}>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {FULL_MONTHS[viewMonth]}
            </Text>
            <Text style={[styles.yearText, { color: colors.textSecondary }]}>{viewYear}</Text>
          </View>
          <TouchableOpacity onPress={nextMonth} style={[styles.navBtn, { backgroundColor: colors.muted }]}>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </GlassCard>

        {/* Calendar Grid */}
        <GlassCard style={styles.calCard}>
          <View style={styles.dayHeaders}>
            {DAYS.map((d, i) => (
              <Text key={i} style={[styles.dayHeader, { color: colors.mutedForeground }]}>{d}</Text>
            ))}
          </View>
          <View style={styles.grid}>
            {calDays.map((day, idx) => {
              if (!day) return <View key={idx} style={styles.cell} />;
              const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
              const isSelected = day === selectedDay;
              const phase = getDayPhase(day);
              const pColor = phase ? phaseColors[phase] : null;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.cell,
                    pColor && { backgroundColor: pColor + '18' },
                    isSelected && { backgroundColor: (pColor || colors.primary) + '30', borderColor: pColor || colors.primary, borderWidth: 2 },
                    isToday && !isSelected && { borderColor: colors.primary, borderWidth: 1.5 },
                  ]}
                  onPress={() => {
                    hapticSelection();
                    setSelectedDay(day);
                  }}
                >
                  <Text style={[
                    styles.dayNum,
                    { color: isSelected ? (pColor || colors.primary) : pColor ? pColor : colors.text },
                    isToday && { fontFamily: 'Nunito_700Bold' },
                  ]}>
                    {day}
                  </Text>
                  {isToday && (
                    <View style={[styles.todayDot, { backgroundColor: pColor || colors.primary }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* Phase Legend */}
        <GlassCard style={styles.legend}>
          <Text style={[styles.legendTitle, { color: colors.textSecondary }]}>PHASE GUIDE</Text>
          <View style={styles.legendRow}>
            {Object.entries(phaseColors).map(([phase, color]) => (
              <View key={phase} style={[styles.legendItem, { backgroundColor: color + '12', borderColor: color + '35', borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 }]}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={[styles.legendLabel, { color }]}>
                  {phase.charAt(0).toUpperCase() + phase.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Selected Day Info */}
        {selectedDay && (
          <View style={[styles.dayInfo, { backgroundColor: '#ffffff', borderColor: selectedColor + '40', borderWidth: 1, borderLeftColor: selectedColor, borderLeftWidth: 4 }]}>
            <View style={styles.dayInfoHeader}>
              <View style={[styles.dayNumCircle, { backgroundColor: selectedColor + '15', borderColor: selectedColor + '50', borderWidth: 1 }]}>
                <Text style={[styles.dayNumLarge, { color: selectedColor }]}>{selectedDay}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dayInfoTitle, { color: colors.text }]}>
                  {FULL_MONTHS[viewMonth]} {selectedDay}, {viewYear}
                </Text>
                {selectedPhase && (
                  <Text style={[styles.dayPhaseText, { color: selectedColor }]}>
                    {phaseLabels[selectedPhase]} Phase
                  </Text>
                )}
              </View>
            </View>
            {selectedLog ? (
              <View style={styles.logDetails}>
                <View style={styles.logRow}>
                  <Ionicons name="water-outline" size={14} color={colors.primary} />
                  <Text style={[styles.dayInfoDetail, { color: colors.text }]}>Flow: {selectedLog.flow}</Text>
                </View>
                <View style={styles.logRow}>
                  <Ionicons name="battery-half-outline" size={14} color={colors.teal} />
                  <Text style={[styles.dayInfoDetail, { color: colors.text }]}>Energy: {selectedLog.energy}/5</Text>
                </View>
                {selectedLog.symptoms.length > 0 && (
                  <View style={styles.logRow}>
                    <Ionicons name="medical-outline" size={14} color={colors.accent} />
                    <Text style={[styles.dayInfoDetail, { color: colors.textSecondary }]} numberOfLines={2}>
                      {selectedLog.symptoms.join(' · ')}
                    </Text>
                  </View>
                )}
                {selectedLog.notes ? (
                  <Text style={[styles.dayInfoDetail, { color: colors.textSecondary, fontStyle: 'italic', marginTop: 4 }]}>
                    "{selectedLog.notes}"
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text style={[styles.dayInfoDetail, { color: colors.mutedForeground }]}>
                No entry logged for this day.
              </Text>
            )}
          </View>
        )}

        <View style={{ height: Platform.OS === 'web' ? 34 : 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontFamily: 'Nunito_700Bold', fontSize: 28 },
  subtitle: { fontFamily: 'Nunito_400Regular', fontSize: 13, marginTop: 2 },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  phaseDot: { width: 7, height: 7, borderRadius: 4 },
  phasePillText: { fontFamily: 'Nunito_600SemiBold', fontSize: 12 },
  monthNavCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCenter: { alignItems: 'center', gap: 2 },
  monthTitle: { fontFamily: 'Nunito_700Bold', fontSize: 20 },
  yearText: { fontFamily: 'Nunito_400Regular', fontSize: 13 },
  calCard: { gap: 10, padding: 14 },
  dayHeaders: { flexDirection: 'row' },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%` as any,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'relative',
  },
  dayNum: { fontFamily: 'Nunito_500Medium', fontSize: 13 },
  todayDot: { width: 4, height: 4, borderRadius: 2, position: 'absolute', bottom: 3 },
  legend: { gap: 10 },
  legendTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 12 },
  dayInfo: {
    borderRadius: 20,
    padding: 18,
    gap: 14,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  dayInfoHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dayNumCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumLarge: { fontFamily: 'Nunito_700Bold', fontSize: 20 },
  dayInfoTitle: { fontFamily: 'Nunito_700Bold', fontSize: 16 },
  dayPhaseText: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, marginTop: 2 },
  logDetails: { gap: 8 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayInfoDetail: { fontFamily: 'Nunito_400Regular', fontSize: 14, flex: 1 },
});
