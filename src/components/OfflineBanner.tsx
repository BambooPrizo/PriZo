// ============================================
// COMPOSANT - Bandeau mode hors ligne
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, MESSAGES } from '../constants';

interface OfflineBannerProps {
  visible: boolean;
  cacheAge?: number | null;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ visible, cacheAge }) => {
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : -60,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();
  }, [visible, translateY]);

  if (!visible) return null;

  const message = cacheAge 
    ? MESSAGES.offline.hint(cacheAge)
    : MESSAGES.errors.network;

  return (
    <Animated.View 
      style={[styles.container, { transform: [{ translateY }] }]}
      accessibilityLabel={`Mode hors ligne. ${message}`}
      accessibilityRole="alert"
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline-outline" size={18} color={COLORS.warning} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{MESSAGES.offline.banner}</Text>
          <Text style={styles.subtitle}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: COLORS.warningLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warning,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.warning,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
  },
});

export default OfflineBanner;
