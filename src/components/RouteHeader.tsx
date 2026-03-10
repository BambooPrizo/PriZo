// ============================================
// HEADER ITINÉRAIRE - Design PriZo V2
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  onModify,
  onBack,
}) => {
  return (
    <View style={styles.container}>
      {/* Titre et bouton Éditer */}
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          {onBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              accessibilityLabel="Retour"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={20} color="#F97316" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>ITINÉRAIRE ACTUEL</Text>
        </View>
        
        {onModify && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={onModify}
            accessibilityLabel="Éditer le trajet"
          >
            <Ionicons name="pencil" size={14} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Éditer</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Points de départ et arrivée */}
      <View style={styles.routeContainer}>
        {/* Départ */}
        <View style={styles.locationRow}>
          <View style={styles.departureDot} />
          <Text style={styles.locationText} numberOfLines={1}>
            {fromLabel}
          </Text>
        </View>

        {/* Ligne de connexion */}
        <View style={styles.connectionLine} />

        {/* Arrivée */}
        <View style={styles.locationRow}>
          <View style={styles.arrivalDot}>
            <Ionicons name="location" size={14} color="#EF4444" />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {toLabel}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  // Titre et bouton
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    marginRight: 4,
  },

  title: {
    color: '#F97316',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  editButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Route
  routeContainer: {
    paddingLeft: 4,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  departureDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F97316',
    marginRight: 12,
  },

  connectionLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginLeft: 4,
    marginVertical: 4,
  },

  arrivalDot: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginLeft: -4,
  },

  locationText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
});

export default RouteHeader;
