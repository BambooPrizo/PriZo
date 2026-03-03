import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PriceResult } from '../types';
import ConfidenceIndicator from './ConfidenceIndicator';

interface PriceCardProps extends PriceResult {
  onPress: () => void;
  isLowest?: boolean;
}

const PriceCard: React.FC<PriceCardProps> = ({
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
  // Calcul du temps écoulé
  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const updated = new Date(dateStr);
    const diffMs = now.getTime() - updated.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "À l'instant";
    if (diffMin === 1) return 'Il y a 1 min';
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours === 1) return 'Il y a 1h';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return 'Il y a plus de 24h';
  };

  // Badge de confiance
  const getConfidenceBadge = () => {
    if (confidence_score > 0.8) {
      return { label: 'Fiable', color: '#22C55E', bgColor: '#22C55E20' };
    } else if (confidence_score >= 0.5) {
      return { label: 'Indicatif', color: '#F97316', bgColor: '#F9731620' };
    }
    return { label: 'Estimation', color: '#6B7280', bgColor: '#6B728020' };
  };

  const badge = getConfidenceBadge();

  // Label du type de véhicule (adapté aux VTC Abidjan)
  const getVehicleLabel = () => {
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
  };

  return (
    <View style={styles.card}>
      {/* Badge meilleur prix */}
      {isLowest && (
        <View style={styles.lowestBadge}>
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
          {price_min.toLocaleString()} — {price_max.toLocaleString()}
        </Text>
        <Text style={styles.currency}>{currency}</Text>
      </View>

      {/* Infos supplémentaires */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color="#94A3B8" />
          <Text style={styles.infoText}>{estimated_duration_min} min</Text>
        </View>
        <Text style={styles.timestamp}>{getTimeAgo(last_updated)}</Text>
      </View>

      {/* Indicateur de confiance */}
      <ConfidenceIndicator score={confidence_score} showLabel={false} />

      {/* Bouton Réserver */}
      <TouchableOpacity style={styles.bookButton} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.bookButtonText}>Réserver</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lowestBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  lowestBadgeText: {
    color: '#FFFFFF',
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
    color: '#F1F5F9',
    fontSize: 20,
    fontWeight: '700',
  },
  vehicleType: {
    color: '#94A3B8',
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
    color: '#F97316',
    fontSize: 28,
    fontWeight: '800',
  },
  currency: {
    color: '#F97316',
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
    color: '#94A3B8',
    fontSize: 14,
    marginLeft: 6,
  },
  timestamp: {
    color: '#64748B',
    fontSize: 12,
  },
  bookButton: {
    backgroundColor: '#F97316',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default PriceCard;
