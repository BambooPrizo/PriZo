// ============================================
// COMPOSANT BOUTON DE LOCALISATION
// ============================================

import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { COLORS, SPACING } from '../constants';
import { GeocodingResult } from '../utils/geocoding';

// ============================================
// INTERFACES
// ============================================

interface CurrentLocationButtonProps {
  onLocationFound: (location: {
    coords: { latitude: number; longitude: number };
    address: GeocodingResult | null;
  }) => void;
  onError?: (error: string) => void;
  style?: object;
  compact?: boolean;
}

// ============================================
// COMPOSANT
// ============================================

export const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({
  onLocationFound,
  onError,
  style,
  compact = false,
}) => {
  const { loading, error, getCurrentPosition } = useLocation();

  const handlePress = useCallback(async () => {
    const coords = await getCurrentPosition();
    
    if (coords) {
      onLocationFound({
        coords: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        address: null, // L'adresse sera obtenue via le hook
      });
    } else if (error && onError) {
      onError(error);
    }
  }, [getCurrentPosition, error, onLocationFound, onError]);

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactButton, style]}
        onPress={handlePress}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Text style={styles.compactIcon}>📍</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : (
        <>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.text}>Ma position actuelle</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  icon: {
    fontSize: 18,
  },
  text: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  compactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  compactIcon: {
    fontSize: 20,
  },
});

export default CurrentLocationButton;
