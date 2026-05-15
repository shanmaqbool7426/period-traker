import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { hapticImpact } from '@/utils/haptics';
import { useColors } from '@/hooks/useColors';

const moods = [
  { id: 'radiant', label: 'Radiant', icon: '✨', color: '#fbbf24' },
  { id: 'calm', label: 'Calm', icon: '🌸', color: '#f472b6' },
  { id: 'energized', label: 'Energized', icon: '⚡', color: '#a78bfa' },
  { id: 'tender', label: 'Tender', icon: '🌷', color: '#fb7185' },
  { id: 'melancholy', label: 'Melancholy', icon: '🌧️', color: '#60a5fa' },
  { id: 'anxious', label: 'Anxious', icon: '🌀', color: '#34d399' },
  { id: 'tired', label: 'Tired', icon: '🌙', color: '#818cf8' },
  { id: 'irritable', label: 'Irritable', icon: '🌪️', color: '#f97316' },
];

interface MoodSelectorProps {
  selected: string;
  onSelect: (mood: string) => void;
}

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  const colors = useColors();

  const handleSelect = (mood: string) => {
    hapticImpact();
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
                backgroundColor: isSelected ? m.color + '30' : colors.glassBg,
                borderColor: isSelected ? m.color : colors.glassBorder,
                shadowColor: isSelected ? m.color : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isSelected ? 0.4 : 0,
                shadowRadius: 6,
              },
            ]}
          >
            <Text style={styles.icon}>{m.icon}</Text>
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? m.color : colors.textSecondary,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  icon: { fontSize: 16 },
  label: { fontSize: 13 },
});
