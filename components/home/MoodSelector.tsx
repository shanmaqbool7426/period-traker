import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

const moods = [
  { id: 'radiant', label: 'Radiant', icon: '✨' },
  { id: 'calm', label: 'Calm', icon: '🌸' },
  { id: 'energized', label: 'Energized', icon: '⚡' },
  { id: 'tender', label: 'Tender', icon: '🌷' },
  { id: 'melancholy', label: 'Melancholy', icon: '🌧️' },
  { id: 'anxious', label: 'Anxious', icon: '🌀' },
  { id: 'tired', label: 'Tired', icon: '🌙' },
  { id: 'irritable', label: 'Irritable', icon: '🌪️' },
];

interface MoodSelectorProps {
  selected: string;
  onSelect: (mood: string) => void;
}

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  const colors = useColors();

  const handleSelect = (mood: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(mood);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {moods.map((m) => {
        const isSelected = selected === m.id;
        return (
          <TouchableOpacity
            key={m.id}
            onPress={() => handleSelect(m.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? colors.primary + '30' : colors.glassBg,
                borderColor: isSelected ? colors.primary : colors.glassBorder,
              },
            ]}
          >
            <Text style={styles.icon}>{m.icon}</Text>
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? colors.primary : colors.textSecondary,
                  fontFamily: isSelected ? 'Nunito_700Bold' : 'Nunito_400Regular',
                },
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 2,
    gap: 10,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  icon: { fontSize: 16 },
  label: { fontSize: 13 },
});
