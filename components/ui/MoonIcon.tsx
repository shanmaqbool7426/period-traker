import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

interface MoonIconProps {
  size?: number;
  phase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  animate?: boolean;
}

const phaseColors: Record<string, string> = {
  menstrual: '#e879a0',
  follicular: '#9b72cf',
  ovulation: '#6fd6c8',
  luteal: '#ffb6a3',
};

export function MoonIcon({ size = 80, phase = 'follicular', animate = true }: MoonIconProps) {
  const glow = useSharedValue(0.7);
  const color = phaseColors[phase] || phaseColors.follicular;

  useEffect(() => {
    if (animate) {
      glow.value = withRepeat(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }
  }, [animate]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.5,
    transform: [{ scale: 0.85 + glow.value * 0.2 }],
  }));

  const moonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.95 + glow.value * 0.05 }],
  }));

  const cr = size * 0.38;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow effect */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: size / 2,
            backgroundColor: color,
          },
          glowStyle,
        ]}
      />
      {/* Moon crescent shape */}
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, moonStyle]}>
        <View
          style={{
            width: cr * 2,
            height: cr * 2,
            borderRadius: cr,
            backgroundColor: color,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: -cr * 0.2,
              left: cr * 0.35,
              width: cr * 1.8,
              height: cr * 1.8,
              borderRadius: cr * 0.9,
              backgroundColor: '#1a0a2e',
            }}
          />
        </View>
        {/* Stars */}
        <View style={[styles.star, { top: -size * 0.05, right: -size * 0.08, backgroundColor: color, width: size * 0.06, height: size * 0.06, borderRadius: size * 0.03, opacity: 0.7 }]} />
        <View style={[styles.star, { top: -size * 0.12, right: size * 0.1, backgroundColor: color, width: size * 0.04, height: size * 0.04, borderRadius: size * 0.02, opacity: 0.5 }]} />
        <View style={[styles.star, { bottom: -size * 0.08, right: -size * 0.05, backgroundColor: color, width: size * 0.04, height: size * 0.04, borderRadius: size * 0.02, opacity: 0.4 }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
  },
});
