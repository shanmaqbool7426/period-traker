import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

interface XPBarProps {
  xp: number;
  maxXP?: number;
}

export function XPBar({ xp, maxXP = 500 }: XPBarProps) {
  const colors = useColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.min(xp / maxXP, 1), { duration: 1200 });
  }, [xp, maxXP]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  const level = Math.floor(xp / maxXP) + 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.level, { color: colors.gold }]}>Lv {level}</Text>
        <Text style={[styles.xpText, { color: colors.textSecondary }]}>{xp} / {maxXP} XP</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <Animated.View
          style={[
            styles.fill,
            barStyle,
            {
              backgroundColor: colors.gold,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  level: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  xpText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
