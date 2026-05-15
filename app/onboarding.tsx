import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { hapticImpact, hapticSelection } from '@/utils/haptics';

const { width } = Dimensions.get('window');

const STEPS = 5;

const CYCLE_DAYS_OPTIONS = [
  { label: 'Today', days: 0 },
  { label: '2 days ago', days: 2 },
  { label: '5 days ago', days: 5 },
  { label: '7 days ago', days: 7 },
  { label: '10 days ago', days: 10 },
  { label: '14 days ago', days: 14 },
];

function dateFromDaysAgo(n: number) {
  const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
}

function formatDateLabel(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateProfile } = useApp();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [lastPeriodDaysAgo, setLastPeriodDaysAgo] = useState(5);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function animateToNext(direction: 1 | -1) {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -40 * direction, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(s => s + direction);
      slideAnim.setValue(40 * direction);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  }

  function goNext() {
    hapticImpact('light');
    if (step < STEPS - 1) animateToNext(1);
  }

  function goBack() {
    hapticImpact('light');
    if (step > 0) animateToNext(-1);
  }

  function finish() {
    hapticImpact('medium');
    updateProfile({
      name: name.trim() || 'Luna',
      lastPeriodStart: dateFromDaysAgo(lastPeriodDaysAgo),
      cycleLength,
      periodLength,
      onboardingComplete: true,
    });
    router.replace('/(tabs)');
  }

  const progress = (step + 1) / STEPS;

  return (
    <LinearGradient
      colors={['#c084fc', '#a855f7', '#7c3aed', '#5b21b6']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          {step > 0 ? (
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={styles.stepCount}>{step + 1}/{STEPS}</Text>
        </View>

        <Animated.View
          style={[styles.content, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}
        >
          {step === 0 && (
            <Step0
              name={name}
              setName={setName}
              onNext={goNext}
              canContinue={name.trim().length > 0}
            />
          )}
          {step === 1 && (
            <Step1
              selected={lastPeriodDaysAgo}
              setSelected={(d) => { hapticSelection(); setLastPeriodDaysAgo(d); }}
              onNext={goNext}
            />
          )}
          {step === 2 && (
            <Step2
              value={cycleLength}
              min={21}
              max={40}
              onChange={(v) => { hapticSelection(); setCycleLength(v); }}
              onNext={goNext}
            />
          )}
          {step === 3 && (
            <Step3
              value={periodLength}
              min={2}
              max={10}
              onChange={(v) => { hapticSelection(); setPeriodLength(v); }}
              onNext={goNext}
            />
          )}
          {step === 4 && (
            <Step4
              name={name.trim() || 'Luna'}
              lastPeriodDate={formatDateLabel(dateFromDaysAgo(lastPeriodDaysAgo))}
              cycleLength={cycleLength}
              periodLength={periodLength}
              onFinish={finish}
            />
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Step0({
  name,
  setName,
  onNext,
  canContinue,
}: {
  name: string;
  setName: (s: string) => void;
  onNext: () => void;
  canContinue: boolean;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.moonEmoji}>🌙</Text>
      <Text style={styles.title}>Welcome to LunaSync</Text>
      <Text style={styles.subtitle}>
        Your personal cycle companion. Let's set things up in just a minute.
      </Text>
      <View style={styles.card}>
        <Text style={styles.label}>What should we call you?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={canContinue ? onNext : undefined}
        />
      </View>
      <NextButton onPress={onNext} disabled={!canContinue} label="Let's go →" />
    </View>
  );
}

function Step1({
  selected,
  setSelected,
  onNext,
}: {
  selected: number;
  setSelected: (d: number) => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.moonEmoji}>🩸</Text>
      <Text style={styles.title}>Last period start</Text>
      <Text style={styles.subtitle}>When did your most recent period begin?</Text>
      <View style={styles.optionGrid}>
        {CYCLE_DAYS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.days}
            style={[styles.optionChip, selected === opt.days && styles.optionChipSelected]}
            onPress={() => setSelected(opt.days)}
          >
            <Text style={[styles.optionChipText, selected === opt.days && styles.optionChipTextSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.dateDisplay}>
        <Text style={styles.dateDisplayLabel}>Selected date</Text>
        <Text style={styles.dateDisplayValue}>{formatDateLabel(dateFromDaysAgo(selected))}</Text>
      </View>
      <NextButton onPress={onNext} label="Next →" />
    </View>
  );
}

function Step2({
  value,
  min,
  max,
  onChange,
  onNext,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.moonEmoji}>🔄</Text>
      <Text style={styles.title}>Cycle length</Text>
      <Text style={styles.subtitle}>
        How many days between the first day of one period and the next? Most cycles are 28 days.
      </Text>
      <Stepper value={value} min={min} max={max} onChange={onChange} unit="days" />
      <View style={styles.infoRow}>
        <InfoChip label="Short" value="21–24 days" />
        <InfoChip label="Average" value="25–30 days" highlight={value >= 25 && value <= 30} />
        <InfoChip label="Long" value="31–40 days" />
      </View>
      <NextButton onPress={onNext} label="Next →" />
    </View>
  );
}

function Step3({
  value,
  min,
  max,
  onChange,
  onNext,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.moonEmoji}>📅</Text>
      <Text style={styles.title}>Period duration</Text>
      <Text style={styles.subtitle}>
        How many days does your period typically last? Most periods are 3–7 days.
      </Text>
      <Stepper value={value} min={min} max={max} onChange={onChange} unit="days" />
      <View style={styles.infoRow}>
        <InfoChip label="Short" value="2–3 days" highlight={value <= 3} />
        <InfoChip label="Average" value="4–6 days" highlight={value >= 4 && value <= 6} />
        <InfoChip label="Long" value="7–10 days" highlight={value >= 7} />
      </View>
      <NextButton onPress={onNext} label="Next →" />
    </View>
  );
}

function Step4({
  name,
  lastPeriodDate,
  cycleLength,
  periodLength,
  onFinish,
}: {
  name: string;
  lastPeriodDate: string;
  cycleLength: number;
  periodLength: number;
  onFinish: () => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.moonEmoji}>✨</Text>
      <Text style={styles.title}>You're all set, {name}!</Text>
      <Text style={styles.subtitle}>
        Here's your cycle profile. You can update these anytime from your settings.
      </Text>
      <View style={styles.summaryCard}>
        <SummaryRow icon="🩸" label="Last period" value={lastPeriodDate} />
        <View style={styles.summaryDivider} />
        <SummaryRow icon="🔄" label="Cycle length" value={`${cycleLength} days`} />
        <View style={styles.summaryDivider} />
        <SummaryRow icon="📅" label="Period duration" value={`${periodLength} days`} />
      </View>
      <NextButton onPress={onFinish} label="Start tracking 🌙" />
    </View>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
  unit,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit: string;
}) {
  return (
    <View style={styles.stepperRow}>
      <TouchableOpacity
        style={[styles.stepperBtn, value <= min && styles.stepperBtnDisabled]}
        onPress={() => value > min && onChange(value - 1)}
      >
        <Text style={styles.stepperBtnText}>−</Text>
      </TouchableOpacity>
      <View style={styles.stepperValue}>
        <Text style={styles.stepperNumber}>{value}</Text>
        <Text style={styles.stepperUnit}>{unit}</Text>
      </View>
      <TouchableOpacity
        style={[styles.stepperBtn, value >= max && styles.stepperBtnDisabled]}
        onPress={() => value < max && onChange(value + 1)}
      >
        <Text style={styles.stepperBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function InfoChip({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={[styles.infoChip, highlight && styles.infoChipHighlight]}>
      <Text style={[styles.infoChipLabel, highlight && styles.infoChipLabelHighlight]}>{label}</Text>
      <Text style={[styles.infoChipValue, highlight && styles.infoChipValueHighlight]}>{value}</Text>
    </View>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function NextButton({
  onPress,
  label,
  disabled,
}: {
  onPress: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.nextBtn, disabled && styles.nextBtnDisabled]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={disabled ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.1)'] : ['#f9a8d4', '#f472b6', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.nextBtnGradient}
      >
        <Text style={[styles.nextBtnText, disabled && styles.nextBtnTextDisabled]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 22,
    fontWeight: '600',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#f9a8d4',
    borderRadius: 2,
  },
  stepCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    width: 32,
    textAlign: 'right',
  },
  content: { flex: 1, paddingHorizontal: 24 },
  stepContainer: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 20,
  },
  moonEmoji: { fontSize: 52, textAlign: 'center' },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 12,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 22,
    color: '#ffffff',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(249,168,212,0.8)',
    paddingVertical: 8,
    outlineStyle: 'none' as any,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  optionChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  optionChipSelected: {
    backgroundColor: 'rgba(249,168,212,0.35)',
    borderColor: '#f9a8d4',
  },
  optionChipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  optionChipTextSelected: {
    color: '#ffffff',
  },
  dateDisplay: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dateDisplayLabel: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  dateDisplayValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: '#ffffff',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 8,
  },
  stepperBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperBtnText: {
    fontSize: 26,
    color: '#ffffff',
    fontFamily: 'Nunito_400Regular',
    lineHeight: 30,
  },
  stepperValue: {
    alignItems: 'center',
    minWidth: 100,
  },
  stepperNumber: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 56,
    color: '#ffffff',
    lineHeight: 64,
  },
  stepperUnit: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginTop: -4,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  infoChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  infoChipHighlight: {
    backgroundColor: 'rgba(249,168,212,0.2)',
    borderColor: 'rgba(249,168,212,0.5)',
  },
  infoChipLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoChipLabelHighlight: { color: '#f9a8d4' },
  infoChipValue: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  infoChipValueHighlight: { color: '#ffffff' },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 16,
  },
  summaryIcon: { fontSize: 22 },
  summaryLabel: {
    flex: 1,
    fontFamily: 'Nunito_500Medium',
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#ffffff',
  },
  nextBtn: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  nextBtnDisabled: {
    shadowOpacity: 0,
  },
  nextBtnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 24,
  },
  nextBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  nextBtnTextDisabled: {
    color: 'rgba(255,255,255,0.45)',
  },
});
