import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/contexts/AppContext';
import { MoonIcon } from '@/components/ui/MoonIcon';

interface Message {
  id: string;
  role: 'user' | 'luna';
  text: string;
  timestamp: Date;
}

const phaseAdvice: Record<string, Record<string, string>> = {
  menstrual: {
    food: 'Focus on iron-rich foods like leafy greens, lentils, and dark chocolate. Warm soups and herbal teas will comfort you.',
    workout: 'Gentle yoga, stretching, or a slow walk. Honor your body\'s need to rest.',
    sleep: 'Aim for 9 hours. A heating pad and chamomile tea before bed can ease discomfort.',
    mood: 'Your emotions are heightened right now — this is wisdom, not weakness. Journal your feelings.',
    default: 'During your menstrual phase, your body is doing incredible work. Rest, nourish yourself with warm foods, and be gentle. This is a sacred time of renewal.',
  },
  follicular: {
    food: 'Your body loves lighter, fresh foods now — salads, fermented foods, and plenty of protein to support rising energy.',
    workout: 'Perfect time for HIIT, strength training, or trying a new fitness class. Your energy is climbing!',
    sleep: '7-8 hours is ideal. Your natural energy is rising, so morning workouts feel amazing now.',
    mood: 'You\'re naturally more optimistic and social. Great time to connect with friends and start new projects.',
    default: 'You\'re in your follicular phase — estrogen is rising and so is your energy! This is a powerful time for new beginnings, creative projects, and social connection.',
  },
  ovulation: {
    food: 'Support your peak with antioxidant-rich foods, fiber, and plenty of water. Leafy greens and seeds are especially beneficial.',
    workout: 'Your peak performance window! Challenging workouts, dancing, team sports — your body can handle it all.',
    sleep: '7 hours is often enough. Your natural energy peaks make mornings feel electric.',
    mood: 'You\'re magnetic and expressive right now. Have important conversations, give presentations, and shine.',
    default: 'You\'re ovulating — your most radiant, energetic, magnetic phase! Estrogen and testosterone peak together, making you feel confident and connected. This is your moment to shine.',
  },
  luteal: {
    food: 'Your body craves comfort foods — honor that with complex carbs, magnesium-rich foods like dark chocolate, nuts, and seeds.',
    workout: 'Moderate cardio, pilates, and swimming feel great. Avoid intense HIIT as your body prefers gentler movement.',
    sleep: 'You need 8-9 hours now. A consistent bedtime routine and limiting screen time helps enormously.',
    mood: 'Your intuition is sharpest now. Use this introspective energy for deep work, self-care, and setting boundaries.',
    default: 'You\'re in your luteal phase — a time of deepening intuition and introspection. Progesterone rises to support potential pregnancy. Honor your need for comfort, warmth, and extra self-care.',
  },
};

const quickPrompts = [
  { text: 'What should I eat?', icon: 'restaurant-outline' },
  { text: 'Best workout today?', icon: 'fitness-outline' },
  { text: 'How to improve sleep?', icon: 'moon-outline' },
  { text: 'Support my mood', icon: 'heart-outline' },
];

function getResponse(input: string, phase: string): string {
  const lower = input.toLowerCase();
  const advice = phaseAdvice[phase] || phaseAdvice.follicular;

  if (lower.includes('eat') || lower.includes('food') || lower.includes('diet') || lower.includes('nutrition')) {
    return `${advice.food}\n\nRemember, listening to your body\'s cravings during this phase is wisdom, not weakness.`;
  }
  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('gym') || lower.includes('fitness')) {
    return `${advice.workout}\n\nYour cycle is your secret training guide. Working with it, not against it, yields the best results.`;
  }
  if (lower.includes('sleep') || lower.includes('tired') || lower.includes('rest') || lower.includes('fatigue')) {
    return `${advice.sleep}\n\nSleep quality shifts with your cycle. Track it in your journal to find your patterns.`;
  }
  if (lower.includes('mood') || lower.includes('feel') || lower.includes('emotional') || lower.includes('sad') || lower.includes('anxious') || lower.includes('irritable')) {
    return `${advice.mood}\n\nYour feelings are valid and deeply connected to your hormones. You\'re not "too emotional" — you\'re cyclical, and that\'s beautiful.`;
  }
  if (lower.includes('cramp') || lower.includes('pain') || lower.includes('discomfort')) {
    return 'For cramps: heat therapy, gentle movement, magnesium supplements, and anti-inflammatory foods like ginger and turmeric can help. If pain is severe, please consult your doctor. 💗';
  }
  if (lower.includes('stress') || lower.includes('overwhelm')) {
    return 'Breathwork is your fastest relief: try 4-7-8 breathing (inhale 4 counts, hold 7, exhale 8). Combine with a warm bath, journaling, or a gentle walk in nature. You\'ve got this. 🌸';
  }

  return `${advice.default}\n\nI\'m here to support your wellness journey. Ask me about food, workouts, sleep, or how to support your emotional wellbeing during this phase.`;
}

export default function CoachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentPhase } = useApp();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'luna',
      text: `Hi there! I\'m Luna, your AI wellness companion. I\'m here to support you through every phase of your cycle with personalized advice.\n\nYou\'re currently in your ${currentPhase} phase. Ask me anything about nutrition, fitness, sleep, or emotional wellbeing!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(text, currentPhase);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'luna',
          text: response,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.avatarWrap}>
            <MoonIcon size={32} phase={currentPhase} animate={false} />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: colors.primary, marginLeft: 40 }
              : { backgroundColor: colors.glassBg, borderColor: colors.glassBorder, borderWidth: 1, marginRight: 40 },
          ]}
        >
          <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.text }]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.primary + '08', colors.background]}
      style={{ flex: 1 }}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background + 'ee' }]}>
        <MoonIcon size={36} phase={currentPhase} animate />
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Luna Coach</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>AI Wellness Companion</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.msgRow}>
                <View style={styles.avatarWrap}>
                  <MoonIcon size={32} phase={currentPhase} animate={false} />
                </View>
                <View style={[styles.bubble, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder, borderWidth: 1 }]}>
                  <Text style={[styles.bubbleText, { color: colors.textSecondary }]}>Luna is thinking...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick Prompts */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRow}
          style={{ flexGrow: 0 }}
        >
          {quickPrompts.map(p => (
            <TouchableOpacity
              key={p.text}
              onPress={() => sendMessage(p.text)}
              style={[styles.quickChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
            >
              <Ionicons name={p.icon as any} size={14} color={colors.primary} />
              <Text style={[styles.quickText, { color: colors.primary }]}>{p.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputBar, { borderTopColor: colors.border, paddingBottom: bottomPad + 8, backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder, color: colors.text }]}
            placeholder="Ask Luna anything..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
            multiline={false}
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
            disabled={!input.trim()}
          >
            <Ionicons name="arrow-up" size={18} color={input.trim() ? '#fff' : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontFamily: 'Nunito_700Bold', fontSize: 18 },
  headerSub: { fontFamily: 'Nunito_400Regular', fontSize: 12 },
  messageList: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { flexDirection: 'row-reverse' },
  avatarWrap: { marginBottom: 4 },
  bubble: { maxWidth: '80%', borderRadius: 20, padding: 14 },
  bubbleText: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 21 },
  quickRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickText: { fontFamily: 'Nunito_500Medium', fontSize: 12 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
