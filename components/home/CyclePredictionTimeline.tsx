import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface CyclePredictionTimelineProps {
  cycleDay: number;
  cycleLength: number;
  periodLength: number;
}

export function CyclePredictionTimeline({
  cycleDay,
  cycleLength,
  periodLength,
}: CyclePredictionTimelineProps) {
  const colors = useColors();

  const getPhaseColor = (day: number): string => {
    if (day <= periodLength) return colors.accent;
    if (day <= 13) return colors.primary;
    if (day <= 16) return colors.teal;
    return colors.accentLight;
  };

  const days = Array.from({ length: cycleLength }, (_, i) => i + 1);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {days.map((d) => {
        const isToday = d === cycleDay;
        const color = getPhaseColor(d);
        return (
          <View key={d} style={styles.dayCol}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isToday ? color : color + '30',
                  borderColor: color,
                  borderWidth: isToday ? 2 : 0,
                  width: isToday ? 28 : 18,
                  height: isToday ? 28 : 18,
                  borderRadius: isToday ? 14 : 9,
                },
              ]}
            />
            {isToday && (
              <Text style={[styles.todayLabel, { color: color }]}>Today</Text>
            )}
            {!isToday && (
              <Text style={[styles.dayNum, { color: colors.mutedForeground }]}>{d}</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 8,
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
    minWidth: 28,
  },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  dayNum: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 9,
  },
});
