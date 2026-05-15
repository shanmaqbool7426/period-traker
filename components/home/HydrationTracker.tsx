import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hapticImpact } from '@/utils/haptics';
import { useColors } from '@/hooks/useColors';

const TEAL = '#0f766e';

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
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: TEAL, borderLeftWidth: 4 }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: TEAL + '15' }]}>
          <Ionicons name="water" size={18} color={TEAL} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Hydration</Text>
        <Text style={[styles.count, { color: TEAL }]}>{glasses}/{goal} glasses</Text>
      </View>

      <View style={styles.progressWrap}>
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: TEAL }]} />
        </View>
        <Text style={[styles.pctText, { color: TEAL }]}>{pct}%</Text>
      </View>

      <View style={styles.dots}>
        {Array.from({ length: goal }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < glasses
                ? { backgroundColor: TEAL }
                : { backgroundColor: colors.muted },
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={handleAdd}
        style={[styles.btn, { backgroundColor: TEAL }]}
      >
        <Ionicons name="add" size={16} color="#fff" />
        <Text style={styles.btnText}>Add glass</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
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
  count: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 7,
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
