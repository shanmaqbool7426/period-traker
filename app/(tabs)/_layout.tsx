import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

function TabIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && { backgroundColor: color + '18' }]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const tabBarHeight = Platform.OS === 'web' ? 72 : 60 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: Platform.OS === 'web' ? 16 : insets.bottom,
          paddingTop: 8,
          shadowColor: '#7c3aed',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'journal' : 'journal-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 44,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
