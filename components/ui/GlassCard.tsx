import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: 'low' | 'mid' | 'high';
  gradient?: [string, string];
}

export function GlassCard({ children, style }: GlassCardProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
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
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
});
