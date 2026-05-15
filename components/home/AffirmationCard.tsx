import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

interface AffirmationCardProps {
  phase: Phase;
}

export function AffirmationCard({ phase }: AffirmationCardProps) {
  const colors = useColors();
  const list = affirmations[phase];
  const [idx, setIdx] = useState(0);

  const next = () => {
    hapticImpact();
    setIdx((i) => (i + 1) % list.length);
  };

  const gradColors: Record<Phase, [string, string]> = {
    menstrual: [colors.accent + '45', colors.accentLight + '25'],
    follicular: [colors.primary + '45', colors.primaryLight + '22'],
    ovulation: [colors.teal + '45', colors.primary + '22'],
    luteal: [colors.accentLight + '45', (colors as any).peach + '25' || colors.accent + '25'],
  };
  const [g1, g2] = gradColors[phase];

  return (
    <LinearGradient
      colors={[g1, g2]}
      style={[styles.card, { borderColor: colors.glassBorder }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.topRow}>
        <View style={[styles.sparkleWrap, { backgroundColor: colors.gold + '30' }]}>
          <Ionicons name="sparkles" size={16} color={colors.gold} />
        </View>
        <Text style={[styles.label, { color: colors.gold }]}>Daily Affirmation</Text>
        <Text style={[styles.counter, { color: colors.textSecondary }]}>{idx + 1}/{list.length}</Text>
      </View>
      <Text style={[styles.text, { color: colors.text }]}>{list[idx]}</Text>
      <TouchableOpacity onPress={next} style={[styles.refreshBtn, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
        <Ionicons name="refresh" size={14} color={colors.textSecondary} />
        <Text style={[styles.refreshText, { color: colors.textSecondary }]}>Next</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    gap: 14,
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
    fontSize: 12,
    letterSpacing: 0.8,
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
    lineHeight: 24,
    fontStyle: 'italic',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  refreshText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
  },
});
