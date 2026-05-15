import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: 'low' | 'mid' | 'high';
  gradient?: [string, string];
}

export function GlassCard({ children, style, intensity = 'mid', gradient }: GlassCardProps) {
  const colors = useColors();

  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        style={[styles.card, { borderColor: colors.glassBorder }, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }

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
