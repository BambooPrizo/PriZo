// ============================================
// COMPOSANT PRICECARD - REFONTE TOTALE
// ============================================

import React, { memo, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Linking,
} from 'react-native';
import { PriceCardProps } from '../types';
import { estimateWaitingTime } from '../utils/waitingTimeEstimator';
import {
  formatPrice,
  formatPriceRange,
  formatFreshness,
  calculateSavings,
  getVehicleIcon,
  capitalize,
} from '../utils/priceCardHelpers';
import { COLORS } from '../constants';

// URLs des stores pour installation des apps
const STORE_URLS: Record<string, { ios: string; android: string }> = {
  yango: {
    ios: 'https://apps.apple.com/app/yango/id1437857226',
    android: 'https://play.google.com/store/apps/details?id=com.yandex.yango',
  },
  heetch: {
    ios: 'https://apps.apple.com/app/heetch/id1000685177',
    android: 'https://play.google.com/store/apps/details?id=com.heetch',
  },
  indrive: {
    ios: 'https://apps.apple.com/app/indrive/id1050302965',
    android: 'https://play.google.com/store/apps/details?id=sinet.startup.inDriver',
  },
};

// Couleurs des providers (placeholder - à remplacer par vraies images)
const PROVIDER_COLORS: Record<string, string> = {
  yango: '#FF4444',
  heetch: '#8B5CF6',
  indrive: '#22C55E',
};

const PriceCard: React.FC<PriceCardProps> = memo(({
  result,
  isLowest,
  lowestPrice,
  fromLat,
  fromLng,
  onPress,
  index = 0,
}) => {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(10)).current;
  const badgeScaleAnim = useRef(new Animated.Value(1)).current;

  // Extraire les données du résultat
  const {
    provider,
    vehicle_type,
    price_min,
    price_max,
    last_updated,
    deeplink,
  } = result;

  // Calculs mémorisés
  const waitingTime = useMemo(
    () => estimateWaitingTime(provider, fromLat, fromLng),
    [provider, fromLat, fromLng]
  );

  const freshness = useMemo(
    () => formatFreshness(last_updated),
    [last_updated]
  );

  const savings = useMemo(
    () => isLowest ? calculateSavings(price_max, lowestPrice) : null,
    [isLowest, price_max, lowestPrice]
  );

  const vehicleIcon = useMemo(
    () => getVehicleIcon(vehicle_type),
    [vehicle_type]
  );

  const providerColor = PROVIDER_COLORS[provider.toLowerCase()] || COLORS.primary;

  // Animation d'entrée échelonnée
  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim, index]);

  // Animation du badge meilleur prix
  useEffect(() => {
    if (isLowest) {
      Animated.sequence([
        Animated.timing(badgeScaleAnim, {
          toValue: 1.08,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(badgeScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLowest, badgeScaleAnim]);

  // Handler du bouton réserver
  const handlePress = async () => {
    try {
      const supported = await Linking.canOpenURL(deeplink);
      if (supported) {
        await Linking.openURL(deeplink);
      } else {
        showInstallAlert();
      }
    } catch {
      showInstallAlert();
    }
    onPress();
  };

  const showInstallAlert = () => {
    const storeUrl = STORE_URLS[provider.toLowerCase()];
    Alert.alert(
      'Application non installée',
      `L'application ${provider} n'est pas installée. Voulez-vous l'installer ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Installer',
          onPress: () => {
            const url = storeUrl?.android || storeUrl?.ios;
            if (url) {
              Linking.openURL(url);
            }
          },
        },
      ]
    );
  };

  // Label d'accessibilité complet
  const accessibilityLabel = `${provider}, ${vehicleIcon} ${capitalize(vehicle_type)}, ${formatPriceRange(price_min, price_max)}, chauffeur dans ${waitingTime.label}${isLowest ? '. Meilleur prix disponible.' : ''}`;

  return (
    <Animated.View
      style={[
        isLowest ? styles.cardLowest : styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {/* ─────────────────────────────────────────────────── */}
      {/* BLOC 1 — EN-TÊTE PROVIDER */}
      {/* ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Logo placeholder (carré coloré avec initiale) */}
          <View style={[styles.logoContainer, { backgroundColor: providerColor }]}>
            <Text style={styles.logoText}>
              {provider.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{provider}</Text>
            <Text style={styles.vehicleType}>
              {vehicleIcon} {capitalize(vehicle_type)}
            </Text>
          </View>
        </View>

        {/* Badge meilleur prix */}
        {isLowest && (
          <Animated.View
            style={[
              styles.lowestBadge,
              { transform: [{ scale: badgeScaleAnim }] },
            ]}
            accessibilityElementsHidden
          >
            <Text style={styles.lowestBadgeText}>🏆 MEILLEUR PRIX</Text>
          </Animated.View>
        )}
      </View>

      {/* ─────────────────────────────────────────────────── */}
      {/* BLOC 2 — PRIX */}
      {/* ─────────────────────────────────────────────────── */}
      <View style={styles.priceSection}>
        <Text style={[styles.priceText, isLowest && styles.priceTextLowest]}>
          {formatPrice(price_min)} à {formatPrice(price_max)} XOF
        </Text>
        {isLowest && savings && savings > 0 && (
          <Text style={styles.savingsText}>
            Vous économisez {formatPrice(savings)} XOF vs le plus cher
          </Text>
        )}
      </View>

      {/* ─────────────────────────────────────────────────── */}
      {/* BLOC 3 — TEMPS D'ATTENTE */}
      {/* ─────────────────────────────────────────────────── */}
      <View style={styles.waitingSection}>
        <Text style={styles.waitingText}>
          🚗 Chauffeur dans {waitingTime.label}
        </Text>
      </View>

      {/* ─────────────────────────────────────────────────── */}
      {/* BLOC 4 — FRAÎCHEUR DU PRIX */}
      {/* ─────────────────────────────────────────────────── */}
      <View style={styles.freshnessSection}>
        <Text style={[styles.freshnessText, { color: freshness.color }]}>
          {freshness.icon} {freshness.label}
        </Text>
        {freshness.isOld && (
          <Text style={styles.verifyText}>
            Vérifiez le prix final dans l'app {provider}
          </Text>
        )}
      </View>

      {/* ─────────────────────────────────────────────────── */}
      {/* BLOC 5 — BOUTON RÉSERVER */}
      {/* ─────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.bookButton, isLowest && styles.bookButtonLowest]}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Réserver sur ${provider}`}
        accessibilityHint={`Ouvre l'application ${provider} pour réserver ce trajet`}
      >
        <Text style={styles.bookButtonText}>
          Réserver sur {provider} →
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée pour éviter les re-rendus inutiles
  return (
    prevProps.result.provider === nextProps.result.provider &&
    prevProps.result.price_min === nextProps.result.price_min &&
    prevProps.result.price_max === nextProps.result.price_max &&
    prevProps.result.last_updated === nextProps.result.last_updated &&
    prevProps.isLowest === nextProps.isLowest &&
    prevProps.lowestPrice === nextProps.lowestPrice &&
    prevProps.fromLat === nextProps.fromLat &&
    prevProps.fromLng === nextProps.fromLng
  );
});

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Carte standard
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  // Carte meilleur prix
  cardLowest: {
    backgroundColor: '#1A2E1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  // BLOC 1 - Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  providerInfo: {
    marginLeft: 10,
  },

  providerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  vehicleType: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },

  lowestBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  lowestBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // BLOC 2 - Prix
  priceSection: {
    marginTop: 14,
  },

  priceText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },

  priceTextLowest: {
    color: '#22C55E',
  },

  savingsText: {
    color: '#86EFAC',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // BLOC 3 - Temps d'attente
  waitingSection: {
    marginTop: 12,
  },

  waitingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // BLOC 4 - Fraîcheur
  freshnessSection: {
    marginTop: 4,
  },

  freshnessText: {
    fontSize: 12,
  },

  verifyText: {
    color: '#F97316',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },

  // BLOC 5 - Bouton
  bookButton: {
    backgroundColor: '#F97316',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },

  bookButtonLowest: {
    backgroundColor: '#22C55E',
  },

  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default PriceCard;
