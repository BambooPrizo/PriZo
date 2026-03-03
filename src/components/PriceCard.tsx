import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PriceResult } from '../types';
import ConfidenceIndicator from './ConfidenceIndicator';
import { formatTimeAgo, formatPriceRange, getConfidenceBadge } from '../utils';
import { COLORS, TOUCH_TARGET } from '../constants';

interface PriceCardProps extends PriceResult {
  onPress: () => void;
  isLowest?: boolean;
}

const PriceCard: React.FC<PriceCardProps> = memo(({
  provider,
  vehicle_type,
  price_min,
  price_max,
  currency,
  estimated_duration_min,
  confidence_score,
  last_updated,
  onPress,
  isLowest = false,
}) => {
  const badge = getConfidenceBadge(confidence_score);

  // Label du type de véhicule (adapté aux VTC Abidjan)
  const getVehicleLabel = useCallback(() => {
    switch (vehicle_type) {
      case 'moto':
        return '🏍️ Moto';
      case 'eco':
        return '💰 Éco';
      case 'confort':
        return '🛋️ Confort';
      case 'premium':
        return '⭐ Premium';
      case 'berline':
        return '🚘 Berline';
      case 'luxe':
        return '✨ Luxe';
      default:
        return '🚗 Standard';
    }
  }, [vehicle_type]);

  // Accessibilité : description complète de la carte
  const accessibilityLabel = `${provider}, ${getVehicleLabel()}, ${formatPriceRange(price_min, price_max)}, durée estimée ${estimated_duration_min} minutes, ${badge.label}${isLowest ? ', meilleur prix' : ''}`;

  return (
    <View 
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Badge meilleur prix */}
      {isLowest && (
        <View style={styles.lowestBadge} accessibilityElementsHidden>
          <Text style={styles.lowestBadgeText}>Meilleur prix 🏆</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.provider}>{provider}</Text>
          <Text style={styles.vehicleType}>{getVehicleLabel()}</Text>
        </View>
        <View style={[styles.confidenceBadge, { backgroundColor: badge.bgColor }]}>
          <Text style={[styles.confidenceBadgeText, { color: badge.color }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      {/* Prix */}
      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          {price_min.toLocaleString('fr-CI')} — {price_max.toLocaleString('fr-CI')}
        </Text>
        <Text style={styles.currency}>{currency}</Text>
      </View>

      {/* Infos supplémentaires */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{estimated_duration_min} min</Text>
        </View>
        <Text style={styles.timestamp}>{formatTimeAgo(last_updated)}</Text>
      </View>

      {/* Indicateur de confiance */}
      <ConfidenceIndicator score={confidence_score} showLabel={false} />

      {/* Bouton Réserver */}
      <TouchableOpacity 
        style={styles.bookButton} 
        onPress={onPress} 
        activeOpacity={0.8}
        accessibilityLabel={`Réserver avec ${provider}`}
        accessibilityRole="button"
        accessibilityHint="Ouvre l'application du fournisseur"
      >
        <Text style={styles.bookButtonText}>Réserver</Text>
        <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée pour éviter les re-rendus inutiles
  return (
    prevProps.provider === nextProps.provider &&
    prevProps.price_min === nextProps.price_min &&
    prevProps.price_max === nextProps.price_max &&
    prevProps.confidence_score === nextProps.confidence_score &&
    prevProps.isLowest === nextProps.isLowest
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lowestBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  lowestBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  provider: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  vehicleType: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '800',
  },
  currency: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: 6,
  },
  timestamp: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    minHeight: TOUCH_TARGET.minSize, // Accessibilité : zone cliquable minimum 44px
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default PriceCard;
