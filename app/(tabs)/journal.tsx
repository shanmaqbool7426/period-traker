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
import { hapticImpact, hapticSelection, hapticNotification } from '@/utils/haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/contexts/AppContext';
import { GlassCard } from '@/components/ui/GlassCard';

const flowOptions = ['none', 'light', 'medium', 'heavy'] as const;
const flowIcons = { none: 'remove-circle-outline', light: 'water-outline', medium: 'water', heavy: 'rainy' } as const;
const symptoms = ['Cramps', 'Bloating', 'Headache', 'Back pain', 'Fatigue', 'Mood swings', 'Tender breasts', 'Cravings'];
const energyEmoji = ['😴', '🙁', '😐', '🙂', '🌟'];
const energyLabels = ['Drained', 'Low', 'Okay', 'Good', 'Amazing'];
const energyColors = ['#60a5fa', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'];

const phaseInsight: Record<string, { text: string; icon: string; color: string }> = {
  menstrual: { text: 'Your hormones are at their lowest. Be gentle with yourself today.', icon: 'heart', color: '#f472b6' },
  follicular: { text: 'Estrogen is rising — you may feel more energetic and social.', icon: 'trending-up', color: '#c084fc' },
  ovulation: { text: 'Peak estrogen! Great day for creative work and connection.', icon: 'sunny', color: '#2dd4bf' },
  luteal: { text: 'Progesterone is high. You may crave comfort and alone time.', icon: 'moon', color: '#fb923c' },
};

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

  const insight = phaseInsight[currentPhase];

  const flowColors: Record<string, string> = {
    none: colors.mutedForeground,
    light: '#c084fc',
    medium: '#f472b6',
    heavy: '#fb7185',
  };

  const toggleSymptom = (s: string) => {
    hapticSelection();
    setSelectedSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSave = () => {
    hapticNotification();
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
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Daily Journal</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <View style={[styles.xpBadge, { backgroundColor: colors.gold + '15', borderColor: colors.gold + '40' }]}>
            <Ionicons name="star" size={13} color={colors.gold} />
            <Text style={[styles.xpText, { color: colors.gold }]}>+20 XP</Text>
          </View>
        </View>

        {/* Phase Insight */}
        <View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: insight.color, borderLeftWidth: 4 }]}>
          <View style={[styles.insightIcon, { backgroundColor: insight.color + '15' }]}>
            <Ionicons name={insight.icon as any} size={16} color={insight.color} />
          </View>
          <Text style={[styles.insightText, { color: colors.text }]}>{insight.text}</Text>
        </View>

        {/* Flow Intensity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>FLOW INTENSITY</Text>
          <View style={styles.flowRow}>
            {flowOptions.map(f => {
              const fc = flowColors[f];
              const isSel = flow === f;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => {
                    hapticSelection();
                    setFlow(f);
                  }}
                  style={[
                    styles.flowBtn,
                    {
                      backgroundColor: isSel ? fc + '15' : colors.card,
                      borderColor: isSel ? fc : colors.border,
                      borderWidth: isSel ? 1.5 : 1,
                    },
                  ]}
                >
                  <Ionicons name={flowIcons[f]} size={18} color={isSel ? fc : colors.mutedForeground} />
                  <Text style={[styles.flowLabel, { color: isSel ? fc : colors.textSecondary }]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
                      backgroundColor: sel ? colors.primary + '12' : colors.card,
                      borderColor: sel ? colors.primary : colors.border,
                      borderWidth: sel ? 1.5 : 1,
                    },
                  ]}
                >
                  {sel && <Ionicons name="checkmark-circle" size={13} color={colors.primary} />}
                  <Text style={[styles.chipText, { color: sel ? colors.primary : colors.textSecondary }]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Energy Level */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ENERGY LEVEL</Text>
          <View style={styles.energyRow}>
            {energyLabels.map((label, i) => {
              const ec = energyColors[i];
              const isSel = energy === i + 1;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    hapticSelection();
                    setEnergy(i + 1);
                  }}
                  style={[
                    styles.energyBtn,
                    {
                      backgroundColor: isSel ? ec + '15' : colors.card,
                      borderColor: isSel ? ec : colors.border,
                      borderWidth: isSel ? 1.5 : 1,
                    },
                  ]}
                >
                  <Text style={styles.energyEmoji}>{energyEmoji[i]}</Text>
                  <Text style={[styles.energyNum, { color: isSel ? ec : colors.mutedForeground }]}>
                    {i + 1}
                  </Text>
                  <Text style={[styles.energyLabel, { color: isSel ? ec : colors.mutedForeground }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>NOTES</Text>
          <GlassCard style={{ padding: 14 }}>
            <TextInput
              style={[styles.notes, { color: colors.text }]}
              placeholder="How are you feeling? What's on your mind?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
            />
          </GlassCard>
        </View>

        {/* Save Button */}
        <LinearGradient
          colors={saved ? ['#0f766e', '#0f766e'] : ['#7c3aed', '#be185d']}
          style={styles.saveBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity onPress={handleSave} style={styles.saveBtnInner}>
            <Ionicons name={saved ? 'checkmark-circle' : 'save-outline'} size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{saved ? 'Saved! +20 XP ✨' : 'Save Journal Entry'}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Past Entries */}
        {logs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>RECENT ENTRIES</Text>
            {logs.slice(0, 3).map(log => (
              <GlassCard key={log.id} style={styles.logCard}>
                <View style={styles.logCardHeader}>
                  <View style={[styles.logDateBadge, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30', borderWidth: 1 }]}>
                    <Text style={[styles.logDate, { color: colors.primary }]}>{log.date}</Text>
                  </View>
                  <Text style={[styles.logEnergy, { color: energyColors[log.energy - 1] }]}>
                    {energyEmoji[log.energy - 1]} {energyLabels[log.energy - 1]}
                  </Text>
                </View>
                <View style={styles.logMeta}>
                  <View style={[styles.logMetaItem, { backgroundColor: flowColors[log.flow] + '15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }]}>
                    <Text style={[styles.logDetail, { color: flowColors[log.flow] }]}>Flow: {log.flow}</Text>
                  </View>
                </View>
                {log.symptoms.length > 0 && (
                  <Text style={[styles.logDetail, { color: colors.mutedForeground }]}>
                    {log.symptoms.join(' · ')}
                  </Text>
                )}
              </GlassCard>
            ))}
          </View>
        )}

        <View style={{ height: Platform.OS === 'web' ? 34 : 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontFamily: 'Nunito_700Bold', fontSize: 28 },
  date: { fontFamily: 'Nunito_400Regular', fontSize: 14, marginTop: 2 },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  xpText: { fontFamily: 'Nunito_700Bold', fontSize: 12 },
  insightCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: { fontFamily: 'Nunito_500Medium', fontSize: 13, lineHeight: 20, flex: 1 },
  section: { gap: 10 },
  sectionTitle: { fontFamily: 'Nunito_700Bold', fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase' },
  flowRow: { flexDirection: 'row', gap: 8 },
  flowBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  flowLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 12 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontFamily: 'Nunito_500Medium', fontSize: 13 },
  energyRow: { flexDirection: 'row', gap: 6 },
  energyBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 3,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  energyEmoji: { fontSize: 18 },
  energyNum: { fontFamily: 'Nunito_700Bold', fontSize: 15 },
  energyLabel: { fontFamily: 'Nunito_400Regular', fontSize: 9, textAlign: 'center' },
  notes: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 22,
    minHeight: 80,
  },
  saveBtn: {
    borderRadius: 16,
    overflow: 'hidden',
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
  saveBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#fff' },
  logCard: { gap: 8 },
  logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logDateBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logDate: { fontFamily: 'Nunito_600SemiBold', fontSize: 13 },
  logEnergy: { fontFamily: 'Nunito_600SemiBold', fontSize: 13 },
  logMeta: { flexDirection: 'row', gap: 8 },
  logMetaItem: {},
  logDetail: { fontFamily: 'Nunito_400Regular', fontSize: 13 },
});
