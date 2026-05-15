import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { hapticSelection } from '@/utils/haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/contexts/AppContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { MoonIcon } from '@/components/ui/MoonIcon';
import { XPBar } from '@/components/ui/XPBar';

const achievements = [
  { id: 'streak7', icon: 'flame', label: '7-Day Streak', unlocked: true, color: '#fbbf24' },
  { id: 'log10', icon: 'journal', label: '10 Logs', unlocked: true, color: '#c084fc' },
  { id: 'hydro', icon: 'water', label: 'Hydro Hero', unlocked: true, color: '#2dd4bf' },
  { id: 'streak30', icon: 'trophy', label: '30-Day Streak', unlocked: false, color: '#f472b6' },
  { id: 'insights', icon: 'analytics', label: 'Insight Master', unlocked: false, color: '#a78bfa' },
  { id: 'partner', icon: 'heart', label: 'Couple Synced', unlocked: false, color: '#fb923c' },
];

const wellnessStats = [
  { label: 'Logs', value: '12', icon: 'journal-outline', color: '#c084fc' },
  { label: 'Avg Energy', value: '3.8', icon: 'battery-half-outline', color: '#2dd4bf' },
  { label: 'Best Streak', value: '7', icon: 'flame-outline', color: '#fbbf24' },
  { label: 'Insights', value: '24', icon: 'sparkles-outline', color: '#f472b6' },
];

const phaseColors: Record<string, string> = {
  menstrual: '#f472b6',
  follicular: '#c084fc',
  ovulation: '#2dd4bf',
  luteal: '#fb923c',
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, streak, xp, currentPhase } = useApp();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const phaseColor = phaseColors[currentPhase] || colors.primary;

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [privacy, setPrivacy] = useState(true);

  const toggle = (setter: (v: boolean) => void, val: boolean) => {
    hapticSelection();
    setter(!val);
  };

  return (
    <LinearGradient
      colors={[phaseColor + '22', colors.background, colors.primary + '14']}
      locations={[0, 0.4, 1]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <LinearGradient
          colors={[phaseColor + '28', colors.primary + '18']}
          style={[styles.profileCard, { borderColor: phaseColor + '40', borderWidth: 1 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { borderColor: phaseColor, borderWidth: 2.5, shadowColor: phaseColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 }]}>
              <MoonIcon size={64} phase={currentPhase} animate />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.profileSub, { color: colors.textSecondary }]}>
                {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase
              </Text>
              <View style={[styles.premiumBadge, { backgroundColor: colors.gold + '28', borderColor: colors.gold + '60' }]}>
                <Ionicons name="star" size={12} color={colors.gold} />
                <Text style={[styles.premiumText, { color: colors.gold }]}>Cycle Master</Text>
              </View>
            </View>
          </View>
          <XPBar xp={xp} />
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {wellnessStats.map(stat => (
            <GlassCard key={stat.label} style={[styles.statCard, { borderColor: stat.color + '35' }]}>
              <View style={[styles.statIconWrap, { backgroundColor: stat.color + '22' }]}>
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Streak */}
        <LinearGradient
          colors={[colors.gold + '28', colors.gold + '10']}
          style={[styles.streakCard, { borderColor: colors.gold + '50', borderWidth: 1 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.streakIconWrap, { backgroundColor: colors.gold + '25' }]}>
            <Ionicons name="flame" size={28} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.streakNum, { color: colors.gold }]}>{streak} day streak 🔥</Text>
            <Text style={[styles.streakDesc, { color: colors.textSecondary }]}>Keep logging to maintain your streak!</Text>
          </View>
        </LinearGradient>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACHIEVEMENTS</Text>
          <View style={styles.achieveGrid}>
            {achievements.map(a => (
              <LinearGradient
                key={a.id}
                colors={a.unlocked ? [a.color + '28', a.color + '12'] : [colors.glassBg, colors.glassBg]}
                style={[
                  styles.achieveCard,
                  { borderColor: a.unlocked ? a.color + '50' : colors.glassBorder, borderWidth: 1 },
                  !a.unlocked && { opacity: 0.45 },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.achieveIcon, { backgroundColor: a.color + '25' }]}>
                  <Ionicons name={a.icon as any} size={22} color={a.unlocked ? a.color : colors.mutedForeground} />
                </View>
                <Text style={[styles.achieveLabel, { color: a.unlocked ? colors.text : colors.mutedForeground }]}>
                  {a.label}
                </Text>
                {!a.unlocked && (
                  <View style={[styles.lockBadge, { backgroundColor: colors.muted }]}>
                    <Ionicons name="lock-closed" size={9} color={colors.mutedForeground} />
                  </View>
                )}
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Cycle Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CYCLE SETTINGS</Text>
          <GlassCard style={styles.settingsCard}>
            {[
              { label: 'Cycle Length', value: `${profile.cycleLength} days`, icon: 'refresh-outline', color: colors.primary },
              { label: 'Period Length', value: `${profile.periodLength} days`, icon: 'water-outline', color: '#f472b6' },
              { label: 'Last Period', value: profile.lastPeriodStart, icon: 'calendar-outline', color: '#2dd4bf' },
            ].map((item, i) => (
              <View key={item.label}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.settingRow}>
                  <View style={[styles.settingIconWrap, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={15} color={item.color} />
                  </View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                  <View style={[styles.settingValueBadge, { backgroundColor: item.color + '18' }]}>
                    <Text style={[styles.settingValue, { color: item.color }]}>{item.value}</Text>
                  </View>
                </View>
              </View>
            ))}
          </GlassCard>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
          <GlassCard style={styles.settingsCard}>
            {[
              { label: 'Notifications', value: notifications, setter: setNotifications, icon: 'notifications-outline', color: '#fbbf24' },
              { label: 'Privacy Mode', value: privacy, setter: setPrivacy, icon: 'shield-outline', color: '#2dd4bf' },
              { label: 'Dark Mode', value: darkMode, setter: setDarkMode, icon: 'moon-outline', color: '#c084fc' },
            ].map((item, i) => (
              <View key={item.label}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.settingRow}>
                  <View style={[styles.settingIconWrap, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={15} color={item.color} />
                  </View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                  <Switch
                    value={item.value}
                    onValueChange={() => toggle(item.setter, item.value)}
                    trackColor={{ false: colors.muted, true: item.color + '80' }}
                    thumbColor={item.value ? item.color : colors.mutedForeground}
                  />
                </View>
              </View>
            ))}
          </GlassCard>
        </View>

        {/* Premium CTA */}
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={[styles.premiumCta, { shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.premiumIconWrap}>
            <Ionicons name="star" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.premiumCtaTitle}>Unlock Premium</Text>
            <Text style={styles.premiumCtaSub}>AI assistant, partner sync & more</Text>
          </View>
          <View style={styles.premiumArrow}>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </View>
        </LinearGradient>

        <View style={{ height: Platform.OS === 'web' ? 34 : 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 20 },
  profileCard: { borderRadius: 24, padding: 20, gap: 18 },
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(192,132,252,0.12)',
  },
  profileInfo: { flex: 1, gap: 6 },
  profileName: { fontFamily: 'Nunito_700Bold', fontSize: 24 },
  profileSub: { fontFamily: 'Nunito_400Regular', fontSize: 13 },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  premiumText: { fontFamily: 'Nunito_700Bold', fontSize: 11 },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 6,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontFamily: 'Nunito_700Bold', fontSize: 18 },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 10, textAlign: 'center' },
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 24, padding: 18 },
  streakIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNum: { fontFamily: 'Nunito_700Bold', fontSize: 18 },
  streakDesc: { fontFamily: 'Nunito_400Regular', fontSize: 13, marginTop: 2 },
  section: { gap: 12 },
  sectionTitle: { fontFamily: 'Nunito_700Bold', fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase' },
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achieveCard: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 6,
    borderRadius: 20,
    position: 'relative',
  },
  achieveIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  achieveLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 10, textAlign: 'center' },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsCard: { gap: 4, padding: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 14 },
  settingIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { fontFamily: 'Nunito_500Medium', fontSize: 14, flex: 1 },
  settingValueBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  settingValue: { fontFamily: 'Nunito_600SemiBold', fontSize: 13 },
  divider: { height: 1, marginHorizontal: 12 },
  premiumCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 22,
    padding: 20,
  },
  premiumIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumCtaTitle: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#fff' },
  premiumCtaSub: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  premiumArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
