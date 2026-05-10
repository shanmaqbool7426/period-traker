import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/contexts/AppContext';
import { GlassCard } from '@/components/ui/GlassCard';

const flowOptions = ['none', 'light', 'medium', 'heavy'] as const;
const symptoms = ['Cramps', 'Bloating', 'Headache', 'Back pain', 'Fatigue', 'Mood swings', 'Tender breasts', 'Cravings'];
const energyLabels = ['Drained', 'Low', 'Okay', 'Good', 'Amazing'];

export default function JournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { logs, addLog, addXP, currentPhase } = useApp();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const today = new Date().toISOString().split('T')[0];

  const [flow, setFlow] = useState<typeof flowOptions[number]>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const toggleSymptom = (s: string) => {
    Haptics.selectionAsync();
    setSelectedSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addLog({
      id: Date.now().toString(),
      date: today,
      flow,
      mood: 'calm',
      symptoms: selectedSymptoms,
      energy,
      notes,
    });
    addXP(20);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const flowColors: Record<string, string> = {
    none: colors.mutedForeground,
    light: colors.primaryLight,
    medium: colors.accent,
    heavy: colors.error,
  };

  const phaseInsight: Record<string, string> = {
    menstrual: 'Your hormones are at their lowest. Be gentle with yourself today.',
    follicular: 'Estrogen is rising — you may feel more energetic and social.',
    ovulation: 'Peak estrogen! Great day for creative work and connection.',
    luteal: 'Progesterone is high. You may crave comfort foods and alone time.',
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.accent + '08', colors.background]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Daily Journal</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Hormone Insight */}
        <GlassCard style={styles.insight}>
          <Ionicons name="flask-outline" size={16} color={colors.primary} />
          <Text style={[styles.insightText, { color: colors.textSecondary }]}>
            {phaseInsight[currentPhase]}
          </Text>
        </GlassCard>

        {/* Flow */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>FLOW INTENSITY</Text>
          <View style={styles.flowRow}>
            {flowOptions.map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFlow(f);
                }}
                style={[
                  styles.flowBtn,
                  {
                    backgroundColor: flow === f ? flowColors[f] + '25' : colors.glassBg,
                    borderColor: flow === f ? flowColors[f] : colors.glassBorder,
                  },
                ]}
              >
                <Text style={[styles.flowLabel, { color: flow === f ? flowColors[f] : colors.textSecondary }]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Symptoms */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SYMPTOMS</Text>
          <View style={styles.chipGrid}>
            {symptoms.map(s => {
              const sel = selectedSymptoms.includes(s);
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => toggleSymptom(s)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: sel ? colors.primary + '25' : colors.glassBg,
                      borderColor: sel ? colors.primary : colors.glassBorder,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: sel ? colors.primary : colors.textSecondary }]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Energy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ENERGY LEVEL</Text>
          <View style={styles.energyRow}>
            {energyLabels.map((label, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  Haptics.selectionAsync();
                  setEnergy(i + 1);
                }}
                style={[
                  styles.energyBtn,
                  {
                    backgroundColor: energy === i + 1 ? colors.teal + '25' : colors.glassBg,
                    borderColor: energy === i + 1 ? colors.teal : colors.glassBorder,
                  },
                ]}
              >
                <Text style={[styles.energyNum, { color: energy === i + 1 ? colors.teal : colors.mutedForeground }]}>
                  {i + 1}
                </Text>
                <Text style={[styles.energyLabel, { color: colors.mutedForeground }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>NOTES</Text>
          <GlassCard style={{ padding: 12 }}>
            <TextInput
              style={[styles.notes, { color: colors.text }]}
              placeholder="How are you feeling today? What's on your mind?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
            />
          </GlassCard>
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: saved ? colors.teal : colors.primary }]}
        >
          <Ionicons name={saved ? 'checkmark' : 'save-outline'} size={18} color="#fff" />
          <Text style={styles.saveBtnText}>{saved ? 'Saved! +20 XP' : 'Save Journal Entry'}</Text>
        </TouchableOpacity>

        {/* Past Entries */}
        {logs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>RECENT ENTRIES</Text>
            {logs.slice(0, 3).map(log => (
              <GlassCard key={log.id} style={styles.logCard}>
                <Text style={[styles.logDate, { color: colors.primary }]}>{log.date}</Text>
                <Text style={[styles.logDetail, { color: colors.textSecondary }]}>
                  Flow: {log.flow} · Energy: {log.energy}/5
                </Text>
                {log.symptoms.length > 0 && (
                  <Text style={[styles.logDetail, { color: colors.mutedForeground }]}>
                    {log.symptoms.join(', ')}
                  </Text>
                )}
              </GlassCard>
            ))}
          </View>
        )}

        <View style={{ height: Platform.OS === 'web' ? 34 : 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 20 },
  header: { gap: 4 },
  title: { fontFamily: 'Nunito_700Bold', fontSize: 26 },
  date: { fontFamily: 'Nunito_400Regular', fontSize: 14 },
  insight: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  insightText: { fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 19, flex: 1 },
  section: { gap: 10 },
  sectionTitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 11, letterSpacing: 1.5 },
  flowRow: { flexDirection: 'row', gap: 8 },
  flowBtn: { flex: 1, borderRadius: 14, borderWidth: 1, paddingVertical: 12, alignItems: 'center' },
  flowLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 13 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontFamily: 'Nunito_500Medium', fontSize: 13 },
  energyRow: { flexDirection: 'row', gap: 6 },
  energyBtn: { flex: 1, borderRadius: 14, borderWidth: 1, paddingVertical: 12, alignItems: 'center', gap: 4 },
  energyNum: { fontFamily: 'Nunito_700Bold', fontSize: 16 },
  energyLabel: { fontFamily: 'Nunito_400Regular', fontSize: 9, textAlign: 'center' },
  notes: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 22, minHeight: 80 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 20,
    paddingVertical: 16,
  },
  saveBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#fff' },
  logCard: { gap: 4 },
  logDate: { fontFamily: 'Nunito_600SemiBold', fontSize: 14 },
  logDetail: { fontFamily: 'Nunito_400Regular', fontSize: 13 },
});
