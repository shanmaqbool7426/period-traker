import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export default function InsightsModal() {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.close}>
        <Ionicons name="close" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text }]}>Insights</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  close: { alignSelf: 'flex-end', padding: 8 },
  title: { fontFamily: 'Nunito_700Bold', fontSize: 24 },
});
