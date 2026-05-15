import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { hapticImpact, hapticSelection } from '@/utils/haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/contexts/AppContext';

const PERIOD_OPTIONS = [
  { label: 'Today', days: 0 },
  { label: '2 days ago', days: 2 },
  { label: '5 days ago', days: 5 },
  { label: '7 days ago', days: 7 },
  { label: '10 days ago', days: 10 },
  { label: '14 days ago', days: 14 },
  { label: '21 days ago', days: 21 },
  { label: '28 days ago', days: 28 },
];

function dateFromDaysAgo(n: number) {
  const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
}

function daysAgoFromDate(iso: string): number {
  const d = new Date(iso + 'T00:00:00');
  const now = new Date();
  return Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function Stepper({ label, value, min, max, onChange, color }: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.stepperCard, { backgroundColor: '#ffffff', borderColor: colors.border, borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={[styles.stepperLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={[styles.stepperBtn, { backgroundColor: colors.muted }, value <= min && { opacity: 0.35 }]}
          onPress={() => { if (value > min) { hapticSelection(); onChange(value - 1); } }}
        >
          <Text style={[styles.stepperBtnText, { color: colors.primary }]}>−</Text>
        </TouchableOpacity>
        <View style={styles.stepperValueWrap}>
          <Text style={[styles.stepperValue, { color: colors.text }]}>{value}</Text>
          <Text style={[styles.stepperUnit, { color: colors.textSecondary }]}>days</Text>
        </View>
        <TouchableOpacity
          style={[styles.stepperBtn, { backgroundColor: colors.muted }, value >= max && { opacity: 0.35 }]}
          onPress={() => { if (value < max) { hapticSelection(); onChange(value + 1); } }}
        >
          <Text style={[styles.stepperBtnText, { color: colors.primary }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function EditCycleModal() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateProfile } = useApp();

  const currentDaysAgo = daysAgoFromDate(profile.lastPeriodStart);
  const closestOption = PERIOD_OPTIONS.reduce((prev, curr) =>
    Math.abs(curr.days - currentDaysAgo) < Math.abs(prev.days - currentDaysAgo) ? curr : prev
  );

  const [cycleLength, setCycleLength] = useState(profile.cycleLength);
  const [periodLength, setPeriodLength] = useState(profile.periodLength);
  const [selectedDays, setSelectedDays] = useState(closestOption.days);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    hapticImpact('medium');
    updateProfile({
      cycleLength,
      periodLength,
      lastPeriodStart: dateFromDaysAgo(selectedDays),
    });
    setSaved(true);
    setTimeout(() => {
      router.back();
    }, 900);
  };

  const bottomPad = Platform.OS === 'web' ? 24 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Handle + Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Cycle Settings</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.muted }]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
          Updating these improves your phase predictions.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cycle Length */}
        <Stepper
          label="Cycle Length"
          value={cycleLength}
          min={21}
          max={40}
          onChange={setCycleLength}
          color={colors.primary}
        />

        {/* Period Duration */}
        <Stepper
          label="Period Duration"
          value={periodLength}
          min={2}
          max={10}
          onChange={setPeriodLength}
          color="#f472b6"
        />

        {/* Last Period */}
        <View style={[styles.dateSection, { backgroundColor: '#ffffff', borderColor: colors.border, borderLeftColor: '#2dd4bf', borderLeftWidth: 4 }]}>
          <Text style={[styles.stepperLabel, { color: colors.textSecondary, marginBottom: 12 }]}>Last Period Started</Text>
          <View style={styles.optionGrid}>
            {PERIOD_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.days}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: selectedDays === opt.days ? colors.primary + '12' : colors.muted,
                    borderColor: selectedDays === opt.days ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => { hapticSelection(); setSelectedDays(opt.days); }}
              >
                <Text style={[
                  styles.optionChipText,
                  { color: selectedDays === opt.days ? colors.primary : colors.textSecondary },
                  selectedDays === opt.days && { fontFamily: 'Nunito_700Bold' },
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.dateBadge, { backgroundColor: colors.muted }]}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.dateBadgeText, { color: colors.text }]}>
              {formatDate(dateFromDaysAgo(selectedDays))}
            </Text>
          </View>
        </View>

        {/* Save */}
        <LinearGradient
          colors={saved ? ['#0f766e', '#0f766e'] : ['#7c3aed', '#be185d']}
          style={styles.saveBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity style={styles.saveBtnInner} onPress={handleSave}>
            <Ionicons name={saved ? 'checkmark-circle' : 'save-outline'} size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
    gap: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontFamily: 'Nunito_700Bold', fontSize: 22 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSub: { fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 19 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  stepperCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  stepperLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 24,
    fontFamily: 'Nunito_400Regular',
    lineHeight: 28,
  },
  stepperValueWrap: { alignItems: 'center', flex: 1 },
  stepperValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 40,
    lineHeight: 48,
  },
  stepperUnit: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
    marginTop: -4,
  },
  dateSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 0,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  optionChip: {
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  optionChipText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  dateBadgeText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
  },
  saveBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  saveBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#fff',
  },
});
