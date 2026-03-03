// ============================================
// COMPOSANT - Bandeau heure de pointe
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, MESSAGES } from '../constants';
import { isPeakHour, isHoliday } from '../utils';

interface PeakHourBannerProps {
  visible?: boolean;
}

const PeakHourBanner: React.FC<PeakHourBannerProps> = ({ visible = true }) => {
  const isPeak = isPeakHour();
  const holiday = isHoliday();

  // Afficher si heure de pointe ou jour férié
  if (!visible || (!isPeak && !holiday)) return null;

  const message = holiday 
    ? '🎉 Jour férié — tarifs majorés possibles'
    : MESSAGES.peakHours.active;

  const bgColor = isPeak ? COLORS.warningLight : COLORS.infoLight;
  const textColor = isPeak ? COLORS.warning : COLORS.info;
  const icon = isPeak ? 'time-outline' : 'calendar-outline';

  return (
    <View 
      style={[styles.container, { backgroundColor: bgColor }]}
      accessibilityLabel={message}
      accessibilityRole="alert"
    >
      <Ionicons name={icon} size={16} color={textColor} />
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    borderRadius: 8,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default PeakHourBanner;
