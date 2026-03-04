// ============================================
// COMPOSANT CARTE PREVIEW DU TRAJET
// ============================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { PlaceDetails } from '../utils/geocoding';
import { calculateHaversineDistance, formatDistance } from '../utils/geocoding';
import { COLORS, SPACING } from '../constants';

// ============================================
// INTERFACES
// ============================================

interface MapPreviewProps {
  departure: PlaceDetails;
  destination: PlaceDetails;
  height?: number;
}

interface MapFullScreenModalProps {
  visible: boolean;
  onClose: () => void;
  departure: PlaceDetails;
  destination: PlaceDetails;
  region: Region;
  distance: number;
}

// ============================================
// CONSTANTES
// ============================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_HEIGHT = 160;
const PADDING_RATIO = 0.3; // 30% de padding autour des marqueurs

// ============================================
// COMPOSANT MODAL PLEIN ÉCRAN
// ============================================

const MapFullScreenModal: React.FC<MapFullScreenModalProps> = ({
  visible,
  onClose,
  departure,
  destination,
  region,
  distance,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Bouton fermer */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.closeIcon}>✕</Text>
          <Text style={styles.closeText}>Fermer</Text>
        </TouchableOpacity>

        {/* Carte interactive */}
        <MapView
          style={styles.fullScreenMap}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton
          showsCompass
          showsScale
        >
          {/* Marqueur départ */}
          <Marker
            coordinate={{
              latitude: departure.lat,
              longitude: departure.lng,
            }}
            title={departure.name}
            description="Point de départ"
            pinColor="#22C55E"
          />

          {/* Marqueur arrivée */}
          <Marker
            coordinate={{
              latitude: destination.lat,
              longitude: destination.lng,
            }}
            title={destination.name}
            description="Destination"
            pinColor="#EF4444"
          />

          {/* Ligne entre les deux points */}
          <Polyline
            coordinates={[
              { latitude: departure.lat, longitude: departure.lng },
              { latitude: destination.lat, longitude: destination.lng },
            ]}
            strokeColor={COLORS.primary}
            strokeWidth={3}
            lineDashPattern={[1]}
          />
        </MapView>

        {/* Bandeau inférieur */}
        <View style={styles.bottomBanner}>
          <View style={styles.routeInfo}>
            <Text style={styles.routeText} numberOfLines={1}>
              <Text style={styles.routeLabel}>🟢 </Text>
              {departure.name}
            </Text>
            <Text style={styles.routeArrow}>→</Text>
            <Text style={styles.routeText} numberOfLines={1}>
              <Text style={styles.routeLabel}>🔴 </Text>
              {destination.name}
            </Text>
          </View>
          <Text style={styles.distanceText}>
            📏 ~{formatDistance(distance)} à vol d'oiseau
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// ============================================
// COMPOSANT PRINCIPAL MAPPREVIEW
// ============================================

const MapPreview: React.FC<MapPreviewProps> = ({
  departure,
  destination,
  height = DEFAULT_HEIGHT,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Calculer la distance
  const distance = useMemo(() => {
    return calculateHaversineDistance(
      departure.lat,
      departure.lng,
      destination.lat,
      destination.lng
    );
  }, [departure, destination]);

  // Calculer la région pour englober les deux marqueurs
  const region = useMemo((): Region => {
    const minLat = Math.min(departure.lat, destination.lat);
    const maxLat = Math.max(departure.lat, destination.lat);
    const minLng = Math.min(departure.lng, destination.lng);
    const maxLng = Math.max(departure.lng, destination.lng);

    const latDelta = (maxLat - minLat) * (1 + PADDING_RATIO * 2) || 0.02;
    const lngDelta = (maxLng - minLng) * (1 + PADDING_RATIO * 2) || 0.02;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  }, [departure, destination]);

  const handleOpenFullScreen = useCallback(() => {
    setIsFullScreen(true);
  }, []);

  const handleCloseFullScreen = useCallback(() => {
    setIsFullScreen(false);
  }, []);

  return (
    <View style={[styles.container, { height }]}>
      {/* Carte miniature (non interactive) */}
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        pointerEvents="none"
      >
        {/* Marqueur départ - vert */}
        <Marker
          coordinate={{
            latitude: departure.lat,
            longitude: departure.lng,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.markerGreen}>
            <View style={styles.markerInner} />
          </View>
        </Marker>

        {/* Marqueur arrivée - rouge */}
        <Marker
          coordinate={{
            latitude: destination.lat,
            longitude: destination.lng,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.markerRed}>
            <View style={styles.markerInner} />
          </View>
        </Marker>

        {/* Ligne de trajet */}
        <Polyline
          coordinates={[
            { latitude: departure.lat, longitude: departure.lng },
            { latitude: destination.lat, longitude: destination.lng },
          ]}
          strokeColor={COLORS.primary}
          strokeWidth={3}
          lineDashPattern={[5, 5]}
        />
      </MapView>

      {/* Overlay avec bouton agrandir */}
      <TouchableOpacity
        style={styles.expandButton}
        onPress={handleOpenFullScreen}
        activeOpacity={0.8}
        accessibilityLabel="Agrandir la carte"
        accessibilityHint="Ouvre la carte en plein écran"
      >
        <Text style={styles.expandIcon}>⛶</Text>
        <Text style={styles.expandText}>Agrandir</Text>
      </TouchableOpacity>

      {/* Distance en bas à gauche */}
      <View style={styles.distanceBadge}>
        <Text style={styles.distanceBadgeText}>
          📏 {formatDistance(distance)}
        </Text>
      </View>

      {/* Modal plein écran */}
      <MapFullScreenModal
        visible={isFullScreen}
        onClose={handleCloseFullScreen}
        departure={departure}
        destination={destination}
        region={region}
        distance={distance}
      />
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  map: {
    flex: 1,
    borderRadius: 12,
  },
  fullScreenMap: {
    flex: 1,
  },

  // Marqueurs personnalisés
  markerGreen: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerRed: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },

  // Bouton agrandir
  expandButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  expandIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  expandText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Badge distance
  distanceBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  distanceBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  closeIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  closeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Bandeau inférieur
  bottomBanner: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  routeLabel: {
    fontSize: 12,
  },
  routeArrow: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginHorizontal: 8,
  },
  distanceText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
});

export default MapPreview;
