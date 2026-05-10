import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: 'low' | 'mid' | 'high';
}

export function GlassCard({ children, style, intensity = 'mid' }: GlassCardProps) {
  const colors = useColors();

  const bgMap = {
    low: colors.glassBg,
    mid: colors.glassBg,
    high: colors.card,
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bgMap[intensity],
          borderColor: colors.glassBorder,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
});
