import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/contexts/AppContext';
import { MoonIcon } from '@/components/ui/MoonIcon';
import { PhaseBadge } from '@/components/ui/PhaseBadge';
import { XPBar } from '@/components/ui/XPBar';
import { GlassCard } from '@/components/ui/GlassCard';
import { MoodSelector } from '@/components/home/MoodSelector';
import { HydrationTracker } from '@/components/home/HydrationTracker';
import { AffirmationCard } from '@/components/home/AffirmationCard';
import { CyclePredictionTimeline } from '@/components/home/CyclePredictionTimeline';

const phaseLabels = {
  menstrual: 'Menstrual Phase',
  follicular: 'Follicular Phase',
  ovulation: 'Ovulation Phase',
  luteal: 'Luteal Phase',
};

const phaseDescriptions = {
  menstrual: 'Your body is renewing. Rest is your superpower today.',
  follicular: 'Energy is rising. Perfect for new beginnings.',
  ovulation: 'You\'re at peak power. Shine bright!',
  luteal: 'Turn inward. Your intuition is heightened.',
};

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    profile,
    todayMood,
    setTodayMood,
    hydration,
    setHydration,
    streak,
    xp,
    addXP,
    currentPhase,
    daysUntilNextPeriod,
    cycleDay,
  } = useApp();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const gradients: Record<string, [string, string, string]> = {
    menstrual: [colors.background, colors.accent + '18', colors.background],
    follicular: [colors.background, colors.primary + '18', colors.background],
    ovulation: [colors.background, colors.teal + '18', colors.background],
    luteal: [colors.background, colors.accentLight + '18', colors.background],
  };

  const [g1, g2, g3] = gradients[currentPhase];

  return (
    <LinearGradient colors={[g1, g2, g3]} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Good morning,
            </Text>
            <Text style={[styles.name, { color: colors.text }]}>{profile.name} ✨</Text>
          </View>
          <View style={[styles.streakBadge, { backgroundColor: colors.gold + '20', borderColor: colors.gold + '40' }]}>
            <Ionicons name="flame" size={16} color={colors.gold} />
            <Text style={[styles.streakText, { color: colors.gold }]}>{streak}</Text>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpSection}>
          <XPBar xp={xp} />
        </View>

        {/* Moon + Phase Card */}
        <GlassCard style={styles.moonCard}>
          <View style={styles.moonRow}>
            <View style={styles.moonInfo}>
              <PhaseBadge phase={currentPhase} compact />
              <Text style={[styles.phaseTitle, { color: colors.text }]}>
                {phaseLabels[currentPhase]}
              </Text>
              <Text style={[styles.phaseDesc, { color: colors.textSecondary }]}>
                {phaseDescriptions[currentPhase]}
              </Text>
              <View style={styles.cycleStat}>
                <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                <Text style={[styles.cycleStatText, { color: colors.textSecondary }]}>
                  Day {cycleDay} · Next period in {daysUntilNextPeriod}d
                </Text>
              </View>
            </View>
            <MoonIcon size={90} phase={currentPhase} animate />
          </View>
        </GlassCard>

        {/* Cycle Timeline */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>YOUR CYCLE</Text>
          <GlassCard style={{ paddingVertical: 16, paddingHorizontal: 12 }}>
            <CyclePredictionTimeline
              cycleDay={cycleDay}
              cycleLength={profile.cycleLength}
              periodLength={profile.periodLength}
            />
          </GlassCard>
        </View>

        {/* Mood */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>HOW ARE YOU FEELING?</Text>
          <MoodSelector selected={todayMood} onSelect={setTodayMood} />
        </View>

        {/* Affirmation */}
        <View style={styles.section}>
          <AffirmationCard phase={currentPhase} />
        </View>

        {/* Hydration */}
        <View style={styles.section}>
          <HydrationTracker
            glasses={hydration}
            onAdd={() => {
              setHydration(Math.min(hydration + 1, 8));
              if (hydration === 7) addXP(10);
            }}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>QUICK LOG</Text>
          <View style={styles.quickRow}>
            {[
              { icon: 'water-outline', label: 'Flow', color: colors.accent },
              { icon: 'fitness-outline', label: 'Symptoms', color: colors.primary },
              { icon: 'moon-outline', label: 'Sleep', color: colors.teal },
              { icon: 'heart-outline', label: 'Energy', color: colors.gold },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.quickBtn, { backgroundColor: item.color + '15', borderColor: item.color + '30' }]}
              >
                <Ionicons name={item.icon as any} size={20} color={item.color} />
                <Text style={[styles.quickLabel, { color: item.color }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: Platform.OS === 'web' ? 34 : 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
  },
  name: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 26,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
  },
  xpSection: { marginTop: -4 },
  moonCard: { gap: 0 },
  moonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moonInfo: { flex: 1, gap: 8, paddingRight: 8 },
  phaseTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
  },
  phaseDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  cycleStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cycleStatText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
  },
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickBtn: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  quickLabel: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 11,
  },
});
