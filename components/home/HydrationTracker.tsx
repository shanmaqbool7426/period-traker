import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { GlassCard } from '../ui/GlassCard';

interface HydrationTrackerProps {
  glasses: number;
  goal?: number;
  onAdd: () => void;
}

export function HydrationTracker({ glasses, goal = 8, onAdd }: HydrationTrackerProps) {
  const colors = useColors();

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAdd();
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="water" size={18} color={colors.teal} />
        <Text style={[styles.title, { color: colors.text }]}>Hydration</Text>
        <Text style={[styles.count, { color: colors.teal }]}>{glasses}/{goal}</Text>
      </View>
      <View style={styles.dots}>
        {Array.from({ length: goal }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i < glasses ? colors.teal : colors.muted,
              },
            ]}
          />
        ))}
      </View>
      <TouchableOpacity onPress={handleAdd} style={[styles.btn, { backgroundColor: colors.teal + '20', borderColor: colors.teal + '40' }]}>
        <Ionicons name="add" size={16} color={colors.teal} />
        <Text style={[styles.btnText, { color: colors.teal }]}>Add glass</Text>
      </TouchableOpacity>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    flex: 1,
  },
  count: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  btnText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
  },
});
