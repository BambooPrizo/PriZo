// ============================================
// HEADER TRAJET AMÉLIORÉ - Wôrô
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatTimeAgo } from '../utils';
import { formatDistance, formatDuration } from '../utils/geocoding';
import { isPeakHour } from '../data/vtcData';
import { COLORS, SPACING } from '../constants';

interface RouteHeaderProps {
  fromLabel: string;
  toLabel: string;
  fromAddress?: string;
  toAddress?: string;
  distanceKm?: number;
  durationMin?: number;
  durationPeakMin?: number;
  lastUpdated?: string;
  onModify?: () => void;
  onBack?: () => void;
}

const RouteHeader: React.FC<RouteHeaderProps> = ({
  fromLabel,
  toLabel,
  fromAddress,
  toAddress,
  distanceKm = 6.8,
  durationMin = 18,
  durationPeakMin = 35,
  lastUpdated,
  onModify,
  onBack,
}) => {
  const isPeak = isPeakHour();
  const displayDuration = isPeak 
    ? `${durationMin}-${durationPeakMin}` 
    : `${durationMin}-${Math.round(durationMin * 1.3)}`;

  // Temps depuis la dernière mise à jour
  const updateTimeAgo = lastUpdated 
    ? formatTimeAgo(lastUpdated) 
    : 'À l\'instant';

  return (
    <View style={styles.container}>
      {/* Ligne principale avec retour et modifier */}
      <View style={styles.topRow}>
        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            accessibilityLabel="Retour"
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
        
        <View style={styles.flex1} />
        
        {onModify && (
          <TouchableOpacity
            style={styles.modifyButton}
            onPress={onModify}
            accessibilityLabel="Modifier le trajet"
            accessibilityRole="button"
          >
            <Text style={styles.modifyText}>Modifier</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Visualisation du trajet */}
      <View style={styles.routeVisual}>
        {/* Point de départ */}
        <View style={styles.routeRow}>
          <View style={styles.indicatorColumn}>
            <View style={styles.departurePin} />
            <View style={styles.dottedLine} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Départ</Text>
            <Text style={styles.locationName} numberOfLines={1}>
              {fromLabel}
            </Text>
            {fromAddress && fromAddress !== fromLabel && (
              <Text style={styles.locationAddress} numberOfLines={1}>
                {fromAddress}
              </Text>
            )}
          </View>
        </View>

        {/* Point d'arrivée */}
        <View style={styles.routeRow}>
          <View style={styles.indicatorColumn}>
            <View style={styles.arrivalPin} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Arrivée</Text>
            <Text style={styles.locationName} numberOfLines={1}>
              {toLabel}
            </Text>
            {toAddress && toAddress !== toLabel && (
              <Text style={styles.locationAddress} numberOfLines={1}>
                {toAddress}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Métriques en ligne */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricIcon}>📏</Text>
          <Text style={styles.metricValue}>{distanceKm.toFixed(1)} km</Text>
        </View>
        
        <Text style={styles.metricDot}>•</Text>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricIcon}>⏱</Text>
          <Text style={styles.metricValue}>{displayDuration} min</Text>
        </View>
        
        <Text style={styles.metricDot}>•</Text>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricIcon}>🕐</Text>
          <Text style={styles.metricValue}>{updateTimeAgo}</Text>
        </View>
      </View>

      {/* Bandeau heure de pointe */}
      {isPeak && (
        <View style={styles.peakBanner}>
          <Text style={styles.peakIcon}>⚠️</Text>
          <Text style={styles.peakText}>Heure de pointe · Prix majorés</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    paddingTop: SPACING.sm,
    paddingBottom: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  flex1: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modifyButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    backgroundColor: '#33415520',
    borderWidth: 1,
    borderColor: '#475569',
  },
  modifyText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  routeVisual: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  indicatorColumn: {
    width: 24,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  departurePin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#22C55E40',
  },
  dottedLine: {
    width: 2,
    height: 40,
    marginVertical: 4,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 1,
  },
  arrivalPin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    borderWidth: 3,
    borderColor: '#EF444440',
  },
  locationInfo: {
    flex: 1,
    paddingBottom: SPACING.xs,
  },
  locationLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  locationAddress: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: '#0F172A40',
    marginHorizontal: SPACING.lg,
    borderRadius: 10,
    marginTop: SPACING.xs,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  metricDot: {
    color: '#475569',
    fontSize: 12,
    marginHorizontal: SPACING.sm,
  },
  peakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs + 2,
    backgroundColor: '#F9731620',
    marginTop: SPACING.md,
  },
  peakIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  peakText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default RouteHeader;
