import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const hapticImpact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style);
  }
};

export const hapticSelection = () => {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync();
  }
};

export const hapticNotification = (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(type);
  }
};
