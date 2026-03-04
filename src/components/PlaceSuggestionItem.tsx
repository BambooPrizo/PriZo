// ============================================
// COMPOSANT SUGGESTION DE LIEU
// ============================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING } from '../constants';
import { PlaceAutocompleteResult } from '../utils/geocoding';
import { getPlaceIcon } from '../utils/geocoding';

// ============================================
// INTERFACES
// ============================================

interface PlaceSuggestionItemProps {
  suggestion: PlaceAutocompleteResult;
  onPress: (suggestion: PlaceAutocompleteResult) => void;
  isHighlighted?: boolean;
}

// ============================================
// COMPOSANT
// ============================================

export const PlaceSuggestionItem: React.FC<PlaceSuggestionItemProps> = ({
  suggestion,
  onPress,
  isHighlighted = false,
}) => {
  const icon = getPlaceIcon(suggestion.types);
  const isLocal = suggestion.placeId.startsWith('local_');

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isHighlighted && styles.highlighted,
      ]}
      onPress={() => onPress(suggestion)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      
      <View style={styles.textContainer}>
        <View style={styles.mainTextRow}>
          <Text style={styles.mainText} numberOfLines={1}>
            {suggestion.mainText}
          </Text>
          {isLocal && (
            <View style={styles.localBadge}>
              <Text style={styles.localBadgeText}>Local</Text>
            </View>
          )}
        </View>
        
        {suggestion.secondaryText ? (
          <Text style={styles.secondaryText} numberOfLines={1}>
            {suggestion.secondaryText}
          </Text>
        ) : null}
      </View>
      
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  highlighted: {
    backgroundColor: COLORS.primaryLight || 'rgba(249, 115, 22, 0.1)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  icon: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  mainTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  mainText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  localBadge: {
    backgroundColor: COLORS.success || '#22C55E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  localBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  secondaryText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  arrowContainer: {
    width: 24,
    alignItems: 'center',
  },
  arrow: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});

export default PlaceSuggestionItem;
