import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Clipboard,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { hapticImpact, hapticSelection, hapticNotification } from '@/utils/haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/contexts/AppContext';

type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

const phaseColors: Record<Phase, string> = {
  menstrual: '#f472b6',
  follicular: '#c084fc',
  ovulation: '#2dd4bf',
  luteal: '#fb923c',
};

const phaseLabels: Record<Phase, string> = {
  menstrual: 'Menstrual Phase',
  follicular: 'Follicular Phase',
  ovulation: 'Ovulation Phase',
  luteal: 'Luteal Phase',
};

const phaseGuide: Record<Phase, {
  energy: number;
  mood: string;
  support: string;
  avoid: string;
  surprise: string;
  context: string;
}> = {
  menstrual: {
    energy: 2,
    mood: 'Reflective & Tender',
    context: 'Hormone levels are at their lowest. She may feel more tired and introspective than usual.',
    support: 'Offer warmth and zero expectations. A heating pad, cozy blanket, and her favorite comfort food go a long way. Be patient and present — your calm energy helps.',
    avoid: 'Avoid making big plans, having difficult conversations, or expecting high energy. Don\'t minimize what she\'s feeling — even if she seems "fine".',
    surprise: 'Order her favorite takeout, draw her a warm bath, queue up a show she loves, or simply sit close and hold her hand.',
  },
  follicular: {
    energy: 4,
    mood: 'Bright & Curious',
    context: 'Estrogen is rising. She\'s naturally more optimistic, energetic, and open to new experiences.',
    support: 'Engage with her ideas and enthusiasm. This is a great time to make plans together — she\'s feeling social and creative. Say yes to things.',
    avoid: 'Don\'t dismiss her excitement or new ideas. She\'s in growth mode and your encouragement fuels her.',
    surprise: 'Plan a fun outing: a new restaurant, hike, or creative activity you haven\'t tried together. Novelty excites her right now.',
  },
  ovulation: {
    energy: 5,
    mood: 'Radiant & Connected',
    context: 'Peak estrogen and testosterone. She feels her most confident, magnetic, and expressive.',
    support: 'Tell her she looks amazing. She craves genuine connection and quality time right now. Be present, not distracted.',
    avoid: 'Don\'t cancel plans or be dismissive — she\'s invested in you and the relationship during this phase. Show up fully.',
    surprise: 'Something meaningful: a candlelit dinner, a heartfelt letter, tickets to something she loves, or a spontaneous weekend getaway.',
  },
  luteal: {
    energy: 3,
    mood: 'Thoughtful & Sensitive',
    context: 'Progesterone peaks then drops. She may feel more emotionally sensitive, craving comfort and familiar routine.',
    support: 'Small gestures mean everything right now. Tidy the space, make her tea, hold space without trying to fix things. Just listening helps enormously.',
    avoid: 'Avoid criticism, picking arguments, or pushing for big decisions. Her emotional sensitivity is heightened — stay gentle and calm.',
    surprise: 'Dark chocolate, her favorite comfort movie, a gentle back rub, fresh flowers, or a quiet evening in with no agenda.',
  },
};

function EnergyDots({ level }: { level: number }) {
  return (
    <View style={styles.energyDots}>
      {[1, 2, 3, 4, 5].map(i => (
        <View
          key={i}
          style={[
            styles.energyDot,
            { backgroundColor: i <= level ? '#fbbf24' : '#e5d8f5' },
          ]}
        />
      ))}
    </View>
  );
}

export default function PartnerSyncModal() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, partner, currentPhase, cycleDay, linkPartner, unlinkPartner } = useApp();

  const [enteredCode, setEnteredCode] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [step, setStep] = useState<'connect' | 'name' | 'linked'>(partner.linked ? 'linked' : 'connect');
  const [copied, setCopied] = useState(false);
  const [codeError, setCodeError] = useState('');

  const phase = currentPhase as Phase;
  const guide = phaseGuide[phase];
  const phaseColor = phaseColors[phase];
  const bottomPad = Platform.OS === 'web' ? 24 : insets.bottom;

  const handleCopy = () => {
    hapticImpact();
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(partner.syncCode).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = () => {
    if (enteredCode.replace('-', '').length < 5) {
      setCodeError('Please enter a valid 6-character code.');
      return;
    }
    setCodeError('');
    hapticImpact();
    setStep('name');
  };

  const handleFinishLink = () => {
    if (!partnerName.trim()) return;
    hapticNotification();
    linkPartner(partnerName.trim(), enteredCode);
    setStep('linked');
  };

  const handleUnlink = () => {
    hapticSelection();
    unlinkPartner();
    setStep('connect');
    setEnteredCode('');
    setPartnerName('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: '#f472b6' + '18' }]}>
              <Ionicons name="heart" size={20} color="#f472b6" />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Partner Sync</Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                {step === 'linked' ? `Connected with ${partner.partnerName}` : 'Connect with your partner'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.muted }]}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── NOT LINKED STATE ── */}
        {step === 'connect' && (
          <>
            {/* Explainer */}
            <View style={[styles.explainerCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: '#f472b6', borderLeftWidth: 4 }]}>
              <Text style={[styles.explainerTitle, { color: colors.text }]}>
                How Partner Sync works
              </Text>
              <View style={styles.explainerRow}>
                <View style={[styles.explainerStep, { backgroundColor: '#f472b6' + '12' }]}>
                  <Text style={[styles.explainerNum, { color: '#f472b6' }]}>1</Text>
                </View>
                <Text style={[styles.explainerText, { color: colors.textSecondary }]}>
                  Share your sync code with your partner
                </Text>
              </View>
              <View style={styles.explainerRow}>
                <View style={[styles.explainerStep, { backgroundColor: '#c084fc' + '12' }]}>
                  <Text style={[styles.explainerNum, { color: '#c084fc' }]}>2</Text>
                </View>
                <Text style={[styles.explainerText, { color: colors.textSecondary }]}>
                  They enter it in their app to connect
                </Text>
              </View>
              <View style={styles.explainerRow}>
                <View style={[styles.explainerStep, { backgroundColor: '#2dd4bf' + '12' }]}>
                  <Text style={[styles.explainerNum, { color: '#2dd4bf' }]}>3</Text>
                </View>
                <Text style={[styles.explainerText, { color: colors.textSecondary }]}>
                  They get daily tips based on your phase
                </Text>
              </View>
            </View>

            {/* Sync Code */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>YOUR SYNC CODE</Text>
              <View style={[styles.codeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.codeText, { color: colors.primary }]}>{partner.syncCode}</Text>
                <TouchableOpacity
                  onPress={handleCopy}
                  style={[styles.copyBtn, { backgroundColor: copied ? '#0f766e' + '15' : colors.muted }]}
                >
                  <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={15} color={copied ? '#0f766e' : colors.textSecondary} />
                  <Text style={[styles.copyBtnText, { color: copied ? '#0f766e' : colors.textSecondary }]}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or enter a partner's code</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Enter Code */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PARTNER'S SYNC CODE</Text>
              <TextInput
                style={[styles.codeInput, { backgroundColor: colors.card, borderColor: codeError ? '#be123c' : colors.border, color: colors.text }]}
                placeholder="e.g. ABC-DEF"
                placeholderTextColor={colors.mutedForeground}
                value={enteredCode}
                onChangeText={t => { setEnteredCode(t.toUpperCase()); setCodeError(''); }}
                autoCapitalize="characters"
                maxLength={7}
              />
              {!!codeError && (
                <Text style={styles.errorText}>{codeError}</Text>
              )}
              <TouchableOpacity
                onPress={handleConnect}
                style={[styles.connectBtn, { backgroundColor: colors.primary, opacity: enteredCode.length >= 3 ? 1 : 0.5 }]}
              >
                <Ionicons name="link" size={16} color="#fff" />
                <Text style={styles.connectBtnText}>Connect with Partner</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── NAME STEP ── */}
        {step === 'name' && (
          <View style={styles.nameStep}>
            <View style={[styles.nameBadge, { backgroundColor: '#f472b6' + '12', borderColor: '#f472b6' + '30' }]}>
              <Ionicons name="checkmark-circle" size={28} color="#f472b6" />
              <Text style={[styles.nameBadgeText, { color: '#f472b6' }]}>Code matched!</Text>
            </View>
            <Text style={[styles.namePrompt, { color: colors.text }]}>What's your partner's name?</Text>
            <Text style={[styles.nameHint, { color: colors.textSecondary }]}>
              This helps personalize their daily suggestions.
            </Text>
            <TextInput
              style={[styles.nameInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Partner's name"
              placeholderTextColor={colors.mutedForeground}
              value={partnerName}
              onChangeText={setPartnerName}
              autoFocus
            />
            <LinearGradient
              colors={['#f472b6', '#c084fc']}
              style={styles.finishBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity style={styles.finishBtnInner} onPress={handleFinishLink}>
                <Ionicons name="heart" size={18} color="#fff" />
                <Text style={styles.finishBtnText}>Finish Connecting</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* ── LINKED STATE ── */}
        {step === 'linked' && (
          <>
            {/* Phase Banner */}
            <View style={[styles.phaseBanner, { backgroundColor: phaseColor + '10', borderColor: phaseColor + '35', borderWidth: 1, borderLeftColor: phaseColor, borderLeftWidth: 4 }]}>
              <View style={styles.phaseBannerLeft}>
                <Text style={[styles.phaseName, { color: phaseColor }]}>{phaseLabels[phase]}</Text>
                <Text style={[styles.phaseBannerSub, { color: colors.textSecondary }]}>
                  Cycle day {cycleDay} · {profile.name}'s current phase
                </Text>
              </View>
              <View style={[styles.phaseCircle, { backgroundColor: phaseColor + '20', borderColor: phaseColor }]}>
                <Text style={[styles.phaseDayNum, { color: phaseColor }]}>{cycleDay}</Text>
              </View>
            </View>

            {/* Energy & Mood */}
            <View style={[styles.statRow, { gap: 10 }]}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderTopColor: '#fbbf24', borderTopWidth: 3 }]}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>ENERGY</Text>
                <EnergyDots level={guide.energy} />
                <Text style={[styles.statValue, { color: '#fbbf24' }]}>{guide.energy}/5</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderTopColor: phaseColor, borderTopWidth: 3, flex: 2 }]}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>MOOD</Text>
                <Text style={[styles.statMood, { color: colors.text }]}>{guide.mood}</Text>
              </View>
            </View>

            {/* Context */}
            <View style={[styles.contextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.contextHeader}>
                <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.contextLabel, { color: colors.textSecondary }]}>WHAT'S HAPPENING</Text>
              </View>
              <Text style={[styles.contextText, { color: colors.text }]}>{guide.context}</Text>
            </View>

            {/* Guide Cards */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>TODAY'S PARTNER GUIDE</Text>

            {[
              { icon: 'heart-circle', label: 'How to Support', text: guide.support, color: '#f472b6', iconBg: '#f472b6' + '15' },
              { icon: 'gift', label: 'Surprise Her', text: guide.surprise, color: '#fbbf24', iconBg: '#fbbf24' + '15' },
              { icon: 'shield-half', label: 'Be Mindful Of', text: guide.avoid, color: '#60a5fa', iconBg: '#60a5fa' + '15' },
            ].map((card) => (
              <View key={card.label} style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: card.color, borderLeftWidth: 4 }]}>
                <View style={styles.guideCardHeader}>
                  <View style={[styles.guideCardIcon, { backgroundColor: card.iconBg }]}>
                    <Ionicons name={card.icon as any} size={18} color={card.color} />
                  </View>
                  <Text style={[styles.guideCardLabel, { color: card.color }]}>{card.label}</Text>
                </View>
                <Text style={[styles.guideCardText, { color: colors.text }]}>{card.text}</Text>
              </View>
            ))}

            {/* Partner Info */}
            <View style={[styles.partnerInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.partnerInfoRow}>
                <View style={[styles.partnerAvatar, { backgroundColor: '#f472b6' + '15' }]}>
                  <Ionicons name="heart" size={20} color="#f472b6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.partnerInfoName, { color: colors.text }]}>Connected with {partner.partnerName}</Text>
                  <Text style={[styles.partnerInfoSub, { color: colors.textSecondary }]}>Sync code: {partner.syncCode}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleUnlink} style={[styles.unlinkBtn, { backgroundColor: '#be123c' + '10', borderColor: '#be123c' + '30' }]}>
                <Ionicons name="unlink-outline" size={13} color="#be123c" />
                <Text style={[styles.unlinkBtnText, { color: '#be123c' }]}>Disconnect Partner</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    gap: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: 'Nunito_700Bold', fontSize: 20 },
  headerSub: { fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 1 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 20, paddingTop: 22, gap: 16 },
  explainerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  explainerTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, marginBottom: 2 },
  explainerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  explainerStep: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainerNum: { fontFamily: 'Nunito_700Bold', fontSize: 14 },
  explainerText: { fontFamily: 'Nunito_400Regular', fontSize: 14, flex: 1, lineHeight: 20 },
  section: { gap: 10 },
  sectionLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  codeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  codeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 32,
    letterSpacing: 5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  copyBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 13 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontFamily: 'Nunito_400Regular', fontSize: 12 },
  codeInput: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    letterSpacing: 4,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: '#be123c',
    marginTop: -4,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
  },
  connectBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#fff' },
  nameStep: { gap: 16 },
  nameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignSelf: 'flex-start',
  },
  nameBadgeText: { fontFamily: 'Nunito_700Bold', fontSize: 15 },
  namePrompt: { fontFamily: 'Nunito_700Bold', fontSize: 22, marginTop: 8 },
  nameHint: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, marginTop: -6 },
  nameInput: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontFamily: 'Nunito_500Medium',
    fontSize: 17,
  },
  finishBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f472b6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  finishBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  finishBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#fff' },
  phaseBanner: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phaseBannerLeft: { flex: 1, gap: 5 },
  phaseName: { fontFamily: 'Nunito_700Bold', fontSize: 20 },
  phaseBannerSub: { fontFamily: 'Nunito_400Regular', fontSize: 13 },
  phaseCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
  phaseDayNum: { fontFamily: 'Nunito_700Bold', fontSize: 20 },
  statRow: { flexDirection: 'row' },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  statLabel: { fontFamily: 'Nunito_700Bold', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
  statValue: { fontFamily: 'Nunito_700Bold', fontSize: 16 },
  statMood: { fontFamily: 'Nunito_600SemiBold', fontSize: 15 },
  energyDots: { flexDirection: 'row', gap: 4 },
  energyDot: { width: 10, height: 10, borderRadius: 5 },
  contextCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  contextHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contextLabel: { fontFamily: 'Nunito_700Bold', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
  contextText: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 22 },
  guideCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  guideCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  guideCardIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideCardLabel: { fontFamily: 'Nunito_700Bold', fontSize: 14 },
  guideCardText: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 22 },
  partnerInfoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  partnerInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  partnerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerInfoName: { fontFamily: 'Nunito_700Bold', fontSize: 15 },
  partnerInfoSub: { fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  unlinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
  },
  unlinkBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 13 },
});
