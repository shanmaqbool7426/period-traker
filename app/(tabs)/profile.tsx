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
import { useRouter } from 'expo-router';
import { hapticSelection, hapticImpact } from '@/utils/haptics';
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
  const router = useRouter();
  const { profile, streak, xp, currentPhase, partner } = useApp();
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border, borderTopColor: phaseColor, borderTopWidth: 3 }]}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { borderColor: phaseColor + '60', borderWidth: 2 }]}>
              <MoonIcon size={64} phase={currentPhase} animate />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.profileSub, { color: colors.textSecondary }]}>
                {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase
              </Text>
              <View style={[styles.premiumBadge, { backgroundColor: colors.gold + '15', borderColor: colors.gold + '40' }]}>
                <Ionicons name="star" size={12} color={colors.gold} />
                <Text style={[styles.premiumText, { color: colors.gold }]}>Cycle Master</Text>
              </View>
            </View>
          </View>
          <XPBar xp={xp} />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {wellnessStats.map(stat => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderTopColor: stat.color, borderTopWidth: 3 }]}>
              <View style={[styles.statIconWrap, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Streak */}
        <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: colors.gold, borderLeftWidth: 4 }]}>
          <View style={[styles.streakIconWrap, { backgroundColor: colors.gold + '15' }]}>
            <Ionicons name="flame" size={26} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.streakNum, { color: colors.text }]}>{streak} day streak 🔥</Text>
            <Text style={[styles.streakDesc, { color: colors.textSecondary }]}>Keep logging to maintain your streak!</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACHIEVEMENTS</Text>
          <View style={styles.achieveGrid}>
            {achievements.map(a => (
              <View
                key={a.id}
                style={[
                  styles.achieveCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: a.unlocked ? a.color + '40' : colors.border,
                    borderTopColor: a.unlocked ? a.color : colors.border,
                    borderTopWidth: a.unlocked ? 3 : 1,
                    borderWidth: 1,
                  },
                  !a.unlocked && { opacity: 0.45 },
                ]}
              >
                <View style={[styles.achieveIcon, { backgroundColor: a.color + '15' }]}>
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
              </View>
            ))}
          </View>
        </View>

        {/* Cycle Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CYCLE SETTINGS</Text>
            <TouchableOpacity
              onPress={() => {
                hapticSelection();
                router.push('/modal/edit-cycle');
              }}
              style={[styles.editBtn, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}
            >
              <Ionicons name="create-outline" size={13} color={colors.primary} />
              <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>
          <GlassCard style={styles.settingsCard}>
            {[
              { label: 'Cycle Length', value: `${profile.cycleLength} days`, icon: 'refresh-outline', color: colors.primary },
              { label: 'Period Length', value: `${profile.periodLength} days`, icon: 'water-outline', color: '#f472b6' },
              { label: 'Last Period', value: profile.lastPeriodStart, icon: 'calendar-outline', color: '#2dd4bf' },
            ].map((item, i) => (
              <View key={item.label}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.settingRow}>
                  <View style={[styles.settingIconWrap, { backgroundColor: item.color + '12' }]}>
                    <Ionicons name={item.icon as any} size={15} color={item.color} />
                  </View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.settingValue, { color: item.color }]}>{item.value}</Text>
                </View>
              </View>
            ))}
          </GlassCard>
        </View>

        {/* Preferences */}
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
                  <View style={[styles.settingIconWrap, { backgroundColor: item.color + '12' }]}>
                    <Ionicons name={item.icon as any} size={15} color={item.color} />
                  </View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                  <Switch
                    value={item.value}
                    onValueChange={() => toggle(item.setter, item.value)}
                    trackColor={{ false: colors.muted, true: item.color + '70' }}
                    thumbColor={item.value ? item.color : colors.mutedForeground}
                  />
                </View>
              </View>
            ))}
          </GlassCard>
        </View>

        {/* Partner Sync */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PARTNER SYNC</Text>
          <TouchableOpacity
            onPress={() => {
              hapticImpact();
              router.push('/modal/partner-sync');
            }}
            style={[
              styles.partnerSyncCard,
              {
                backgroundColor: colors.card,
                borderColor: partner.linked ? '#f472b6' + '50' : colors.border,
                borderLeftColor: '#f472b6',
                borderLeftWidth: 4,
              },
            ]}
          >
            <View style={[styles.partnerSyncIcon, { backgroundColor: partner.linked ? '#f472b6' + '15' : colors.muted }]}>
              <Ionicons name={partner.linked ? 'heart' : 'heart-outline'} size={22} color="#f472b6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.partnerSyncTitle, { color: colors.text }]}>
                {partner.linked ? `Connected with ${partner.partnerName}` : 'Connect with Your Partner'}
              </Text>
              <Text style={[styles.partnerSyncSub, { color: colors.textSecondary }]}>
                {partner.linked
                  ? 'They can see your phase & daily support tips'
                  : 'Share cycle insights so they can support you better'}
              </Text>
            </View>
            {partner.linked ? (
              <View style={[styles.linkedBadge, { backgroundColor: '#f472b6' + '15', borderColor: '#f472b6' + '35' }]}>
                <View style={[styles.linkedDot, { backgroundColor: '#f472b6' }]} />
                <Text style={[styles.linkedText, { color: '#f472b6' }]}>Live</Text>
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            )}
          </TouchableOpacity>
        </View>

        {/* Premium CTA */}
        <LinearGradient
          colors={['#7c3aed', '#be185d']}
          style={styles.premiumCta}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 20 },
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 18,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#f3eeff',
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
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
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
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  streakIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNum: { fontFamily: 'Nunito_700Bold', fontSize: 17 },
  streakDesc: { fontFamily: 'Nunito_400Regular', fontSize: 13, marginTop: 2 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: 'Nunito_700Bold', fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 12 },
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achieveCard: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 6,
    borderRadius: 16,
    position: 'relative',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  achieveIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
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
  settingsCard: { gap: 0, padding: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  settingIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { fontFamily: 'Nunito_500Medium', fontSize: 14, flex: 1 },
  settingValue: { fontFamily: 'Nunito_600SemiBold', fontSize: 14 },
  divider: { height: 1, marginHorizontal: 14 },
  premiumCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
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
  partnerSyncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  partnerSyncIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerSyncTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15 },
  partnerSyncSub: { fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 3, lineHeight: 18 },
  linkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  linkedDot: { width: 6, height: 6, borderRadius: 3 },
  linkedText: { fontFamily: 'Nunito_700Bold', fontSize: 11 },
});
