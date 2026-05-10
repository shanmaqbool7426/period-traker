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
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/contexts/AppContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { MoonIcon } from '@/components/ui/MoonIcon';
import { XPBar } from '@/components/ui/XPBar';

const achievements = [
  { id: 'streak7', icon: 'flame', label: '7-Day Streak', unlocked: true, color: '#e8c96a' },
  { id: 'log10', icon: 'journal', label: '10 Logs', unlocked: true, color: '#9b72cf' },
  { id: 'hydro', icon: 'water', label: 'Hydration Hero', unlocked: true, color: '#6fd6c8' },
  { id: 'streak30', icon: 'trophy', label: '30-Day Streak', unlocked: false, color: '#e879a0' },
  { id: 'insights', icon: 'analytics', label: 'Insight Master', unlocked: false, color: '#f0a0c0' },
  { id: 'partner', icon: 'heart', label: 'Couple Synced', unlocked: false, color: '#ffb6a3' },
];

const wellnessStats = [
  { label: 'Logs', value: '12', icon: 'journal-outline' },
  { label: 'Avg Energy', value: '3.8', icon: 'battery-half-outline' },
  { label: 'Best Streak', value: '7', icon: 'flame-outline' },
  { label: 'Insights', value: '24', icon: 'sparkles-outline' },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, streak, xp, currentPhase } = useApp();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [privacy, setPrivacy] = useState(true);

  const toggle = (setter: (v: boolean) => void, val: boolean) => {
    Haptics.selectionAsync();
    setter(!val);
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.primary + '0a', colors.background]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}>
              <MoonIcon size={60} phase={currentPhase} animate />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.profileSub, { color: colors.textSecondary }]}>Cycle Day {28 - profile.cycleLength + 14} · {currentPhase}</Text>
              <View style={[styles.premiumBadge, { backgroundColor: colors.gold + '20', borderColor: colors.gold + '40' }]}>
                <Ionicons name="star" size={12} color={colors.gold} />
                <Text style={[styles.premiumText, { color: colors.gold }]}>Cycle Master</Text>
              </View>
            </View>
          </View>
          <XPBar xp={xp} />
        </GlassCard>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {wellnessStats.map(stat => (
            <GlassCard key={stat.label} style={styles.statCard}>
              <Ionicons name={stat.icon as any} size={18} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Streak */}
        <GlassCard style={styles.streakCard}>
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={28} color={colors.gold} />
            <View>
              <Text style={[styles.streakNum, { color: colors.gold }]}>{streak} day streak</Text>
              <Text style={[styles.streakDesc, { color: colors.textSecondary }]}>Keep logging to maintain your streak!</Text>
            </View>
          </View>
        </GlassCard>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACHIEVEMENTS</Text>
          <View style={styles.achieveGrid}>
            {achievements.map(a => (
              <GlassCard
                key={a.id}
                style={[
                  styles.achieveCard,
                  !a.unlocked && { opacity: 0.4 },
                ]}
              >
                <View style={[styles.achieveIcon, { backgroundColor: a.color + '20' }]}>
                  <Ionicons name={a.icon as any} size={22} color={a.unlocked ? a.color : colors.mutedForeground} />
                </View>
                <Text style={[styles.achieveLabel, { color: a.unlocked ? colors.text : colors.mutedForeground }]}>
                  {a.label}
                </Text>
                {!a.unlocked && (
                  <Ionicons name="lock-closed" size={12} color={colors.mutedForeground} />
                )}
              </GlassCard>
            ))}
          </View>
        </View>

        {/* Cycle Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CYCLE SETTINGS</Text>
          <GlassCard style={styles.settingsCard}>
            {[
              { label: 'Cycle Length', value: `${profile.cycleLength} days`, icon: 'refresh-outline' },
              { label: 'Period Length', value: `${profile.periodLength} days`, icon: 'water-outline' },
              { label: 'Last Period', value: profile.lastPeriodStart, icon: 'calendar-outline' },
            ].map((item, i) => (
              <View key={item.label}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.settingRow}>
                  <Ionicons name={item.icon as any} size={16} color={colors.primary} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{item.value}</Text>
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
              { label: 'Notifications', value: notifications, setter: setNotifications, icon: 'notifications-outline' },
              { label: 'Privacy Mode', value: privacy, setter: setPrivacy, icon: 'shield-outline' },
              { label: 'Dark Mode', value: darkMode, setter: setDarkMode, icon: 'moon-outline' },
            ].map((item, i) => (
              <View key={item.label}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.settingRow}>
                  <Ionicons name={item.icon as any} size={16} color={colors.primary} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                  <Switch
                    value={item.value}
                    onValueChange={() => toggle(item.setter, item.value)}
                    trackColor={{ false: colors.muted, true: colors.primary + '80' }}
                    thumbColor={item.value ? colors.primary : colors.mutedForeground}
                  />
                </View>
              </View>
            ))}
          </GlassCard>
        </View>

        {/* Premium CTA */}
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={styles.premiumCta}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="star" size={24} color="#fff" />
          <View>
            <Text style={styles.premiumCtaTitle}>Unlock Premium</Text>
            <Text style={styles.premiumCtaSub}>AI assistant, partner sync & more</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </LinearGradient>

        <View style={{ height: Platform.OS === 'web' ? 34 : 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 20 },
  profileCard: { gap: 16 },
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileInfo: { flex: 1, gap: 6 },
  profileName: { fontFamily: 'Nunito_700Bold', fontSize: 22 },
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
  premiumText: { fontFamily: 'Nunito_600SemiBold', fontSize: 11 },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statValue: { fontFamily: 'Nunito_700Bold', fontSize: 18 },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 11, textAlign: 'center' },
  streakCard: { padding: 16 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  streakNum: { fontFamily: 'Nunito_700Bold', fontSize: 18 },
  streakDesc: { fontFamily: 'Nunito_400Regular', fontSize: 13 },
  section: { gap: 10 },
  sectionTitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 11, letterSpacing: 1.5 },
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achieveCard: { width: '30%', alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 8 },
  achieveIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  achieveLabel: { fontFamily: 'Nunito_500Medium', fontSize: 10, textAlign: 'center' },
  settingsCard: { gap: 4, padding: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 14 },
  settingLabel: { fontFamily: 'Nunito_500Medium', fontSize: 14, flex: 1 },
  settingValue: { fontFamily: 'Nunito_400Regular', fontSize: 13 },
  divider: { height: 1, marginHorizontal: 12 },
  premiumCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    padding: 20,
  },
  premiumCtaTitle: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#fff' },
  premiumCtaSub: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.85)' },
});
