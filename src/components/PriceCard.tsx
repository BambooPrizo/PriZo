// ============================================
// COMPOSANT PRICECARD - DESIGN PRIZO V2
// ============================================

import React, { memo, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Alert,
  Linking,
} from 'react-native';
import { PriceCardProps } from '../types';
import { estimateWaitingTime } from '../utils/waitingTimeEstimator';
import {
  formatPrice,
  formatFreshness,
  capitalize,
} from '../utils/priceCardHelpers';

// URLs des stores et packages Android pour les apps VTC
const APP_CONFIG: Record<string, { 
  ios: string; 
  android: string; 
  androidPackage: string;
  deeplinks: string[];
}> = {
  yango: {
    ios: 'https://apps.apple.com/app/yango/id1437857226',
    android: 'https://play.google.com/store/apps/details?id=com.yandex.yango',
    androidPackage: 'com.yandex.yango',
    deeplinks: ['ru.yandex.taxi://', 'yandextaxi://', 'yango://'],
  },
  heetch: {
    ios: 'https://apps.apple.com/app/heetch/id1000685177',
    android: 'https://play.google.com/store/apps/details?id=com.heetch',
    androidPackage: 'com.heetch',
    deeplinks: ['heetch://'],
  },
  indrive: {
    ios: 'https://apps.apple.com/app/indrive/id1050302965',
    android: 'https://play.google.com/store/apps/details?id=sinet.startup.inDriver',
    androidPackage: 'sinet.startup.inDriver',
    deeplinks: ['indriver://', 'indrive://'],
  },
  bolt: {
    ios: 'https://apps.apple.com/app/bolt-request-a-ride/id675033630',
    android: 'https://play.google.com/store/apps/details?id=ee.mtakso.client',
    androidPackage: 'ee.mtakso.client',
    deeplinks: ['bolt://'],
  },
  uber: {
    ios: 'https://apps.apple.com/app/uber/id368677368',
    android: 'https://play.google.com/store/apps/details?id=com.ubercab',
    androidPackage: 'com.ubercab',
    deeplinks: ['uber://'],
  },
  warren: {
    ios: '',
    android: 'https://play.google.com/store/apps/details?id=com.warren.taxi',
    androidPackage: 'com.warren.taxi',
    deeplinks: ['warrentaxi://'],
  },
  taxijet: {
    ios: '',
    android: 'https://play.google.com/store/apps/details?id=com.taxijet',
    androidPackage: 'com.taxijet',
    deeplinks: ['taxijet://'],
  },
};

// Types de véhicules formatés
const VEHICLE_TYPE_LABELS: Record<string, string> = {
  standard: 'Standard',
  berline: 'Berline',
  economy: 'Économique',
  comfort: 'Confort',
  premium: 'Premium',
  van: 'Van',
  moto: 'Moto',
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
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const badgeScaleAnim = useRef(new Animated.Value(0.8)).current;

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

  // Durée estimée basée sur le temps d'attente
  const estimatedDuration = useMemo(() => {
    // Estimation basée sur le temps d'attente + temps de trajet moyen
    const baseMinutes = waitingTime.min || 5;
    return `${baseMinutes + 7} min`;
  }, [waitingTime]);

  // Label du type de véhicule
  const vehicleLabel = VEHICLE_TYPE_LABELS[vehicle_type.toLowerCase()] || capitalize(vehicle_type);

  // Déterminer le badge de fiabilité
  const reliabilityBadge = useMemo(() => {
    if (freshness.isOld) {
      return { label: 'Indicatif', color: '#22C55E' };
    }
    return { label: 'Fiable', color: '#22C55E' };
  }, [freshness.isOld]);

  // Animation d'entrée échelonnée
  useEffect(() => {
    const delay = index * 100;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        damping: 15,
        stiffness: 100,
      }),
    ]).start();

    if (isLowest) {
      Animated.spring(badgeScaleAnim, {
        toValue: 1,
        delay: delay + 200,
        useNativeDriver: true,
        damping: 10,
        stiffness: 150,
      }).start();
    }
  }, [fadeAnim, translateYAnim, badgeScaleAnim, index, isLowest]);

  // Handler du bouton réserver - essaie plusieurs deeplinks
  const handlePress = async () => {
    const appConfig = APP_CONFIG[provider.toLowerCase()];
    
    if (!appConfig) {
      // Fallback: essayer le deeplink fourni
      try {
        await Linking.openURL(deeplink);
        onPress();
        return;
      } catch {
        showInstallAlert();
        onPress();
        return;
      }
    }

    // Sur Android, construire l'intent URI pour ouvrir l'app
    if (Platform.OS === 'android') {
      const intentUri = `intent://#Intent;package=${appConfig.androidPackage};end`;
      
      // Essayer d'abord les deeplinks connus
      for (const dl of appConfig.deeplinks) {
        try {
          const supported = await Linking.canOpenURL(dl);
          if (supported) {
            await Linking.openURL(dl);
            onPress();
            return;
          }
        } catch {
          // Continuer avec le prochain deeplink
        }
      }
      
      // Essayer l'intent Android
      try {
        await Linking.openURL(intentUri);
        onPress();
        return;
      } catch {
        showInstallAlert();
        onPress();
        return;
      }
    }
    
    // Sur iOS, essayer les deeplinks
    for (const dl of appConfig.deeplinks) {
      try {
        const supported = await Linking.canOpenURL(dl);
        if (supported) {
          await Linking.openURL(dl);
          onPress();
          return;
        }
      } catch {
        // Continuer
      }
    }
    
    showInstallAlert();
    onPress();
  };

  const showInstallAlert = () => {
    const appConfig = APP_CONFIG[provider.toLowerCase()];
    const storeUrl = Platform.OS === 'android' 
      ? appConfig?.android 
      : appConfig?.ios;
    
    if (!storeUrl) {
      Alert.alert(
        'Application non disponible',
        `L'application ${provider} n'est pas disponible sur votre plateforme.`
      );
      return;
    }
    
    Alert.alert(
      'Ouvrir l\'application',
      `Voulez-vous ouvrir ${provider} dans le store ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Ouvrir le store',
          onPress: () => Linking.openURL(storeUrl),
        },
      ]
    );
  };

  // Label d'accessibilité complet
  const accessibilityLabel = `${provider}, ${vehicleLabel}, ${formatPrice(price_min)} à ${formatPrice(price_max)} francs CFA, durée estimée ${estimatedDuration}${isLowest ? '. Meilleur prix disponible.' : ''}`;

  return (
    <View style={[styles.cardWrapper, isLowest && styles.cardWrapperWithBadge]}>
      {/* Badge Meilleur prix - flottant au-dessus */}
      {isLowest && (
        <Animated.View
          style={[
            styles.bestPriceBadge,
            { transform: [{ scale: badgeScaleAnim }] },
          ]}
        >
          <Text style={styles.bestPriceStar}>★</Text>
          <Text style={styles.bestPriceBadgeText}>Meilleur prix</Text>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {/* Contenu principal de la carte */}
        <View style={styles.cardContent}>
        {/* En-tête: Nom + Type + Badge fiabilité */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.providerName}>{capitalize(provider)}</Text>
            <Text style={styles.vehicleType}>{vehicleLabel}</Text>
          </View>
          <View style={styles.reliabilityBadge}>
            <View style={styles.reliabilityDot} />
            <Text style={styles.reliabilityText}>{reliabilityBadge.label}</Text>
          </View>
        </View>

        {/* Section Prix */}
        <View style={styles.priceSection}>
          <Text style={styles.priceMin}>{formatPrice(price_min)}</Text>
          <Text style={styles.priceSeparator}> – </Text>
          <Text style={styles.priceMax}>{formatPrice(price_max)}</Text>
          <Text style={styles.priceCurrency}> XOF</Text>
        </View>

        {/* Durée estimée */}
        <View style={styles.durationSection}>
          <Text style={styles.durationIcon}>⏱</Text>
          <Text style={styles.durationText}>
            Durée estimée : <Text style={styles.durationValue}>{estimatedDuration}</Text>
          </Text>
        </View>

        {/* Bouton Réserver */}
        <TouchableOpacity
          style={[
            styles.bookButton,
            isLowest ? styles.bookButtonFilled : styles.bookButtonOutline,
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Réserver sur ${provider}`}
        >
          <Text style={[
            styles.bookButtonText,
            isLowest ? styles.bookButtonTextFilled : styles.bookButtonTextOutline,
          ]}>
            Réserver  ›
          </Text>
        </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}, (prevProps, nextProps) => {
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
  // Wrapper pour permettre au badge de flotter
  cardWrapper: {
    marginBottom: 16,
  },

  cardWrapperWithBadge: {
    marginTop: 14,
  },

  // Badge Meilleur prix - pilule verte flottante
  bestPriceBadge: {
    position: 'absolute',
    top: -14,
    left: 16,
    zIndex: 10,
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  bestPriceStar: {
    color: '#FCD34D',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
  },

  bestPriceBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Carte principale
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Contenu de la carte
  cardContent: {
    padding: 20,
  },

  // En-tête
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerLeft: {
    flex: 1,
  },

  providerName: {
    color: '#1E293B',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  vehicleType: {
    color: '#8B9CB3',
    fontSize: 14,
    marginTop: 2,
  },

  // Badge de fiabilité
  reliabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  reliabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },

  reliabilityText: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '600',
  },

  // Section Prix
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 20,
  },

  priceMin: {
    color: '#F97316',
    fontSize: 32,
    fontWeight: '800',
  },

  priceSeparator: {
    color: '#8B9CB3',
    fontSize: 20,
    fontWeight: '400',
  },

  priceMax: {
    color: '#8B9CB3',
    fontSize: 20,
    fontWeight: '600',
  },

  priceCurrency: {
    color: '#8B9CB3',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 2,
  },

  // Section Durée
  durationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  durationIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  durationText: {
    color: '#8B9CB3',
    fontSize: 14,
  },

  durationValue: {
    color: '#1E293B',
    fontWeight: '600',
  },

  // Bouton Réserver
  bookButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  bookButtonFilled: {
    backgroundColor: '#F97316',
  },

  bookButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#F97316',
  },

  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },

  bookButtonTextFilled: {
    color: '#FFFFFF',
  },

  bookButtonTextOutline: {
    color: '#F97316',
  },
});

export default PriceCard;
