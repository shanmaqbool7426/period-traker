import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

const phaseInfo: Record<Phase, { label: string; emoji: string; desc: string }> = {
  menstrual: { label: 'Menstrual', emoji: '🌑', desc: 'Rest & restore' },
  follicular: { label: 'Follicular', emoji: '🌒', desc: 'Energy rising' },
  ovulation: { label: 'Ovulation', emoji: '🌕', desc: 'Peak power' },
  luteal: { label: 'Luteal', emoji: '🌖', desc: 'Turn inward' },
};

interface PhaseBadgeProps {
  phase: Phase;
  compact?: boolean;
}

export function PhaseBadge({ phase, compact = false }: PhaseBadgeProps) {
  const colors = useColors();
  const info = phaseInfo[phase];

  const phaseColors: Record<Phase, string> = {
    menstrual: colors.accent,
    follicular: colors.primary,
    ovulation: colors.teal,
    luteal: colors.accentLight,
  };

  const bg = phaseColors[phase];

  if (compact) {
    return (
      <View style={[styles.compact, { backgroundColor: bg + '30', borderColor: bg + '60' }]}>
        <Text style={[styles.compactText, { color: bg }]}>{info.label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg + '20', borderColor: bg + '40' }]}>
      <Text style={[styles.label, { color: bg }]}>{info.label} Phase</Text>
      <Text style={[styles.desc, { color: colors.textSecondary }]}>{info.desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  desc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  compact: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  compactText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
  },
});
