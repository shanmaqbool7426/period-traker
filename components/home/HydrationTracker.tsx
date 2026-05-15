import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticImpact } from '@/utils/haptics';
import { useColors } from '@/hooks/useColors';

interface HydrationTrackerProps {
  glasses: number;
  goal?: number;
  onAdd: () => void;
}

export function HydrationTracker({ glasses, goal = 8, onAdd }: HydrationTrackerProps) {
  const colors = useColors();
  const pct = Math.round((glasses / goal) * 100);

  const handleAdd = () => {
    hapticImpact();
    onAdd();
  };

  return (
    <LinearGradient
      colors={[colors.teal + '22', colors.primary + '18']}
      style={[styles.card, { borderColor: colors.teal + '50' }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.teal + '30' }]}>
          <Ionicons name="water" size={18} color={colors.teal} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Hydration</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.teal + '25', borderColor: colors.teal + '50' }]}>
          <Text style={[styles.count, { color: colors.teal }]}>{glasses}/{goal}</Text>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: colors.teal }]} />
        </View>
        <Text style={[styles.pctText, { color: colors.teal }]}>{pct}%</Text>
      </View>

      <View style={styles.dots}>
        {Array.from({ length: goal }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < glasses
                ? { backgroundColor: colors.teal, shadowColor: colors.teal, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4 }
                : { backgroundColor: colors.muted },
            ]}
          />
        ))}
      </View>

      <TouchableOpacity onPress={handleAdd} style={[styles.btn, { backgroundColor: colors.teal, shadowColor: colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 }]}>
        <Ionicons name="add" size={16} color="#fff" />
        <Text style={styles.btnText}>Add glass</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    flex: 1,
  },
  countBadge: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  count: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  pctText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    minWidth: 32,
    textAlign: 'right',
  },
  dots: {
    flexDirection: 'row',
    gap: 7,
    flexWrap: 'wrap',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  btnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#fff',
  },
});
