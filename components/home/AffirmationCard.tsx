import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hapticImpact } from '@/utils/haptics';
import { useColors } from '@/hooks/useColors';

type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

const affirmations: Record<Phase, string[]> = {
  menstrual: [
    'Your body is doing sacred work. Rest is radical.',
    'This is a time to release and renew with grace.',
    'You are a cycle of life — powerful and wise.',
  ],
  follicular: [
    'New energy stirs within you. What will you create?',
    'You are blooming. Your potential is unlimited.',
    'Fresh starts are your superpower right now.',
  ],
  ovulation: [
    'You radiate magnetic energy. Step into your light.',
    'This is your moment to shine brilliantly.',
    'Your voice matters. Speak your truth with confidence.',
  ],
  luteal: [
    'Honor your need for depth and introspection.',
    'Your intuition is incredibly sharp right now.',
    'Slow down, feel deeply, trust your inner wisdom.',
  ],
};

const phaseAccent: Record<Phase, string> = {
  menstrual: '#f472b6',
  follicular: '#c084fc',
  ovulation: '#2dd4bf',
  luteal: '#fb923c',
};

interface AffirmationCardProps {
  phase: Phase;
}

export function AffirmationCard({ phase }: AffirmationCardProps) {
  const colors = useColors();
  const list = affirmations[phase];
  const [idx, setIdx] = useState(0);
  const accent = phaseAccent[phase];

  const next = () => {
    hapticImpact();
    setIdx((i) => (i + 1) % list.length);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: accent, borderLeftWidth: 4 }]}>
      <View style={styles.topRow}>
        <View style={[styles.sparkleWrap, { backgroundColor: colors.gold + '20' }]}>
          <Ionicons name="sparkles" size={16} color={colors.gold} />
        </View>
        <Text style={[styles.label, { color: colors.gold }]}>Daily Affirmation</Text>
        <Text style={[styles.counter, { color: colors.mutedForeground }]}>{idx + 1}/{list.length}</Text>
      </View>
      <Text style={[styles.text, { color: colors.text }]}>{list[idx]}</Text>
      <TouchableOpacity onPress={next} style={[styles.refreshBtn, { backgroundColor: colors.muted }]}>
        <Ionicons name="refresh" size={13} color={colors.textSecondary} />
        <Text style={[styles.refreshText, { color: colors.textSecondary }]}>Next</Text>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkleWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    flex: 1,
    textTransform: 'uppercase',
  },
  counter: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
  },
  text: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-end',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  refreshText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
  },
});
