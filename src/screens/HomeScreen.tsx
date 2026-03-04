import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';
import { LocationSearchInput } from '../components/LocationSearchInput';
import PeakHourBanner from '../components/PeakHourBanner';
import { AppStackParamList } from '../navigation/AppNavigator';
import { FREQUENT_ROUTES, RECENT_CONTRIBUTIONS, isPeakHour, VTC_PROVIDERS } from '../data/vtcData';
import { PlaceDetails } from '../utils/geocoding';
import { calculateHaversineDistance, formatDistance, estimateTravelDuration, formatDuration } from '../utils/geocoding';
import { useLocation } from '../hooks/useLocation';

type HomeScreenNavigationProp = NativeStackNavigationProp<AppStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const isPeak = isPeakHour();

  const [fromPlace, setFromPlace] = useState<PlaceDetails | null>(null);
  const [toPlace, setToPlace] = useState<PlaceDetails | null>(null);
  const [error, setError] = useState('');

  // Animation pour le bouton swap
  const swapRotation = useRef(new Animated.Value(0)).current;
  const [isSwapped, setIsSwapped] = useState(false);

  // Hook de localisation pour auto-géolocaliser au démarrage
  const { coords, address, loading: isLocating, getCurrentPosition } = useLocation({
    reverseGeocode: true,
  });

  // Auto-géolocaliser au montage
  useEffect(() => {
    const autoLocate = async () => {
      if (!fromPlace) {
        await getCurrentPosition();
      }
    };
    autoLocate();
  }, []);

  // Mettre à jour le départ quand la position est trouvée
  useEffect(() => {
    if (coords && address && !fromPlace) {
      setFromPlace({
        placeId: 'current_location',
        name: address.name || 'Ma position actuelle',
        address: address.address || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
        lat: coords.latitude,
        lng: coords.longitude,
        types: ['current_location'],
      });
    }
  }, [coords, address, fromPlace]);

  // Fonction pour échanger départ et arrivée
  const handleSwap = useCallback(() => {
    // Animation de rotation
    Animated.timing(swapRotation, {
      toValue: isSwapped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsSwapped(!isSwapped);

    // Échanger les valeurs
    const tempFrom = fromPlace;
    setFromPlace(toPlace);
    setToPlace(tempFrom);
  }, [fromPlace, toPlace, isSwapped, swapRotation]);

  // Interpolation pour la rotation
  const rotateInterpolation = swapRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Calcul de distance et durée estimée
  const routeInfo = fromPlace && toPlace 
    ? (() => {
        const distance = calculateHaversineDistance(
          fromPlace.lat, fromPlace.lng,
          toPlace.lat, toPlace.lng
        );
        const duration = estimateTravelDuration(distance, isPeak);
        return { distance, duration };
      })()
    : null;

  const handleSelectRoute = useCallback((route: (typeof FREQUENT_ROUTES)[0]) => {
    setFromPlace({
      placeId: `route_from_${route.label}`,
      name: route.from.name,
      address: route.from.address,
      lat: route.from.lat,
      lng: route.from.lng,
      types: ['frequent_route'],
    });
    setToPlace({
      placeId: `route_to_${route.label}`,
      name: route.to.name,
      address: route.to.address,
      lat: route.to.lat,
      lng: route.to.lng,
      types: ['frequent_route'],
    });
    setError('');
  }, []);

  const handleCompare = useCallback(() => {
    setError('');

    if (!fromPlace || !toPlace) {
      setError('Veuillez sélectionner les points de départ et d\'arrivée');
      return;
    }

    navigation.navigate('SearchResults', {
      from_lat: fromPlace.lat,
      from_lng: fromPlace.lng,
      to_lat: toPlace.lat,
      to_lng: toPlace.lng,
      from_label: fromPlace.name,
      to_label: toPlace.name,
    });
  }, [fromPlace, toPlace, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Ionicons name="car-sport" size={28} color="#F97316" />
            </View>
            <Text style={styles.appName}>PriZo</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#F1F5F9" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Comparez les VTC à Abidjan</Text>

        {/* Banner heure de pointe */}
        <PeakHourBanner />

        {/* Formulaire de recherche GPS */}
        <View style={styles.searchCard}>
          <View style={styles.inputsContainer}>
            {/* Input Départ */}
            <View style={styles.inputWrapper}>
              <View style={styles.pinIndicator}>
                <View style={[styles.pin, styles.pinGreen]} />
                <View style={styles.pinLine} />
              </View>
              <View style={styles.inputField}>
                <LocationSearchInput
                  label={isLocating ? "📍 Localisation..." : "📍 Départ"}
                  placeholder={isLocating ? "Recherche de votre position..." : "D'où partez-vous ?"}
                  value={fromPlace}
                  onPlaceSelected={setFromPlace}
                  showCurrentLocation={true}
                  icon="🟢"
                  testID="from-location-input"
                />
              </View>
            </View>

            {/* Bouton Swap */}
            <TouchableOpacity
              style={styles.swapButton}
              onPress={handleSwap}
              activeOpacity={0.7}
              accessibilityLabel="Inverser départ et arrivée"
              accessibilityHint="Échange les points de départ et d'arrivée"
            >
              <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
                <Ionicons name="swap-vertical" size={22} color="#F97316" />
              </Animated.View>
            </TouchableOpacity>

            {/* Input Arrivée */}
            <View style={styles.inputWrapper}>
              <View style={styles.pinIndicator}>
                <View style={[styles.pin, styles.pinRed]} />
              </View>
              <View style={styles.inputField}>
                <LocationSearchInput
                  label="🏁 Arrivée"
                  placeholder="Où allez-vous ?"
                  value={toPlace}
                  onPlaceSelected={setToPlace}
                  showCurrentLocation={false}
                  icon="🔴"
                  testID="to-location-input"
                />
              </View>
            </View>
          </View>

          {/* Info distance/durée estimée */}
          {routeInfo && (
            <View style={styles.routeInfoContainer}>
              <View style={styles.routeInfoItem}>
                <Text style={styles.routeInfoIcon}>📏</Text>
                <Text style={styles.routeInfoText}>
                  {formatDistance(routeInfo.distance)}
                </Text>
              </View>
              <View style={styles.routeInfoDivider} />
              <View style={styles.routeInfoItem}>
                <Text style={styles.routeInfoIcon}>⏱️</Text>
                <Text style={styles.routeInfoText}>
                  {isPeak 
                    ? `${formatDuration(routeInfo.duration.peak)} (pointe)`
                    : formatDuration(routeInfo.duration.normal)
                  }
                </Text>
              </View>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            label="Comparer les prix"
            onPress={handleCompare}
            variant="primary"
            fullWidth
            disabled={!fromPlace || !toPlace}
          />
        </View>

        {/* Trajets fréquents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Trajets fréquents</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipsContainer}>
              {FREQUENT_ROUTES.map((route, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.chip}
                  onPress={() => handleSelectRoute(route)}
                >
                  <Text style={styles.chipText}>{route.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Dernières contributions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👥 Dernières contributions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {RECENT_CONTRIBUTIONS.map((contribution, index) => (
            <View key={index} style={styles.contributionCard}>
              <View style={styles.contributionLeft}>
                <Text style={styles.contributionProvider}>{contribution.provider}</Text>
                <Text style={styles.contributionZone}>{contribution.zone_from} → {contribution.zone_to}</Text>
              </View>
              <View style={styles.contributionRight}>
                <Text style={styles.contributionPrice}>
                  {contribution.price.toLocaleString()} XOF
                </Text>
                <Text style={styles.contributionTime}>Il y a {contribution.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appName: {
    color: '#F97316',
    fontSize: 28,
    fontWeight: '800',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 24,
  },
  searchCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  inputsContainer: {
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  swapButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F97316',
    zIndex: 10,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pinIndicator: {
    alignItems: 'center',
    paddingTop: 32,
    marginRight: 12,
  },
  pin: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pinGreen: {
    backgroundColor: '#22C55E',
  },
  pinRed: {
    backgroundColor: '#EF4444',
  },
  pinLine: {
    width: 2,
    height: 50,
    backgroundColor: '#334155',
    marginTop: 4,
  },
  inputField: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginLeft: 6,
  },
  routeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeInfoIcon: {
    fontSize: 16,
  },
  routeInfoText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '600',
  },
  routeInfoDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#334155',
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F1F5F9',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  seeAll: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
  },
  chipText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '500',
  },
  contributionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  contributionLeft: {},
  contributionProvider: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contributionZone: {
    color: '#64748B',
    fontSize: 13,
  },
  contributionRight: {
    alignItems: 'flex-end',
  },
  contributionPrice: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  contributionTime: {
    color: '#64748B',
    fontSize: 12,
  },
});

export default HomeScreen;
