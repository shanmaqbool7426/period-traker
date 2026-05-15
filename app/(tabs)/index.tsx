import React from 'react';
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
  ovulation: "You're at peak power. Shine bright!",
  luteal: 'Turn inward. Your intuition is heightened.',
};

const quickActions = [
  { icon: 'water-outline' as const, label: 'Flow', color: '#f472b6' },
  { icon: 'fitness-outline' as const, label: 'Symptoms', color: '#a78bfa' },
  { icon: 'moon-outline' as const, label: 'Sleep', color: '#2dd4bf' },
  { icon: 'heart-outline' as const, label: 'Energy', color: '#fbbf24' },
];

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

  const phaseGradients: Record<string, [string, string, string]> = {
    menstrual: ['#f472b6' + '28', '#c084fc' + '18', colors.background],
    follicular: ['#c084fc' + '28', '#818cf8' + '18', colors.background],
    ovulation: ['#2dd4bf' + '28', '#c084fc' + '18', colors.background],
    luteal: ['#fb923c' + '22', '#f472b6' + '18', colors.background],
  };

  const phaseMoonGradients: Record<string, [string, string]> = {
    menstrual: ['#f472b620', '#c084fc18'],
    follicular: ['#c084fc22', '#818cf818'],
    ovulation: ['#2dd4bf22', '#c084fc18'],
    luteal: ['#fb923c20', '#f472b618'],
  };

  const [g1, g2, g3] = phaseGradients[currentPhase];
  const moonGrad = phaseMoonGradients[currentPhase] as [string, string];

  return (
    <LinearGradient colors={[g1, g2, g3]} locations={[0, 0.4, 1]} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good morning,</Text>
            <Text style={[styles.name, { color: colors.text }]}>{profile.name} ✨</Text>
          </View>
          <View style={[styles.streakBadge, { backgroundColor: colors.gold + '25', borderColor: colors.gold + '60' }]}>
            <Ionicons name="flame" size={18} color={colors.gold} />
            <Text style={[styles.streakText, { color: colors.gold }]}>{streak}</Text>
          </View>
        </View>

        {/* XP Bar */}
        <GlassCard style={styles.xpCard}>
          <XPBar xp={xp} />
        </GlassCard>

        {/* Moon + Phase Card */}
        <LinearGradient
          colors={moonGrad}
          style={[styles.moonCard, { borderColor: colors.glassBorder }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.moonRow}>
            <View style={styles.moonInfo}>
              <PhaseBadge phase={currentPhase} compact />
              <Text style={[styles.phaseTitle, { color: colors.text }]}>
                {phaseLabels[currentPhase]}
              </Text>
              <Text style={[styles.phaseDesc, { color: colors.textSecondary }]}>
                {phaseDescriptions[currentPhase]}
              </Text>
              <View style={[styles.cycleStat, { backgroundColor: colors.glassBg, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 }]}>
                <Ionicons name="calendar-outline" size={13} color={colors.primary} />
                <Text style={[styles.cycleStatText, { color: colors.text }]}>
                  Day {cycleDay} · Next in {daysUntilNextPeriod}d
                </Text>
              </View>
            </View>
            <MoonIcon size={96} phase={currentPhase} animate />
          </View>
        </LinearGradient>

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
            {quickActions.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.quickBtn, { backgroundColor: item.color + '20', borderColor: item.color + '50' }]}
              >
                <View style={[styles.quickIconWrap, { backgroundColor: item.color + '25' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
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
    fontSize: 28,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  streakText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
  },
  xpCard: { paddingVertical: 14 },
  moonCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  moonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moonInfo: { flex: 1, gap: 10, paddingRight: 10 },
  phaseTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
  },
  phaseDesc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  cycleStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  cycleStatText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
  },
  section: { gap: 10 },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickBtn: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  quickIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
  },
});
