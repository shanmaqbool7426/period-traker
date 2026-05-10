import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIdx((i) => (i + 1) % list.length);
  };

  const gradColors: Record<Phase, [string, string]> = {
    menstrual: [colors.accent + '30', colors.accentLight + '10'],
    follicular: [colors.primary + '30', colors.primaryLight + '10'],
    ovulation: [colors.teal + '30', colors.teal + '10'],
    luteal: [colors.accentLight + '30', colors.peach + '10' as any],
  };
  const [g1, g2] = gradColors[phase];

  return (
    <LinearGradient
      colors={[g1, g2]}
      style={[styles.card, { borderColor: colors.glassBorder }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name="sparkles" size={18} color={colors.gold} style={{ marginBottom: 8 }} />
      <Text style={[styles.text, { color: colors.text }]}>{list[idx]}</Text>
      <TouchableOpacity onPress={next} style={styles.refreshBtn}>
        <Ionicons name="refresh" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    position: 'relative',
  },
  text: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  refreshBtn: {
    alignSelf: 'flex-end',
    marginTop: 12,
    padding: 4,
  },
});
