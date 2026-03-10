import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import PriceCard from '../components/PriceCard';
import RouteHeader from '../components/RouteHeader';
import MapPreview from '../components/MapPreview';
import ResultsFooter from '../components/ResultsFooter';
import PriceInfoModal from '../components/PriceInfoModal';
import EmptyState from '../components/EmptyState';
import SkeletonCard from '../components/ui/SkeletonCard';
import Button from '../components/ui/Button';
import OfflineBanner from '../components/OfflineBanner';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPrices, setFilter, VehicleFilter } from '../store/pricesSlice';
import { AppStackParamList } from '../navigation/AppNavigator';
import { PriceResult } from '../types';
import { getPricesForRoute, VTC_PROVIDERS, isPeakHour, TRAJETS_TYPES } from '../data/vtcData';
import { useNetworkStatus } from '../hooks';
import { COLORS, MESSAGES, SPACING } from '../constants';
import { calculateHaversineDistance, formatDistance } from '../utils/geocoding';
import { PlaceDetails } from '../utils/geocoding';

type Props = NativeStackScreenProps<AppStackParamList, 'SearchResults'>;

const FILTERS: { key: VehicleFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'eco', label: '💰 Éco' },
  { key: 'standard', label: '🚗 Standard' },
  { key: 'confort', label: '🛋️ Confort' },
  { key: 'premium', label: '⭐ Premium' },
];

const SearchResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { from_lat, from_lng, to_lat, to_lng, from_label, to_label } = route.params;
  const dispatch = useAppDispatch();
  const { results, isLoading, error, activeFilter } = useAppSelector((state) => state.prices);
  const { isOffline } = useNetworkStatus();

  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'duration'>('price');
  const [isOfflineData, setIsOfflineData] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [lastUpdated] = useState(new Date().toISOString());

  // Calcul de la distance du trajet
  const distanceKm = useMemo(() => {
    return calculateHaversineDistance(from_lat, from_lng, to_lat, to_lng);
  }, [from_lat, from_lng, to_lat, to_lng]);

  // Récupérer les infos du trajet depuis la base
  const trajetInfo = useMemo(() => {
    const trajet = TRAJETS_TYPES.find(t => 
      t.zone_from.toLowerCase() === from_label.split(' ')[0]?.toLowerCase() ||
      t.zone_to.toLowerCase() === to_label.split(' ')[0]?.toLowerCase()
    );
    return trajet || {
      distance_km: distanceKm,
      duration_normal_min: Math.round(distanceKm * 2.5),
      duration_peak_min: Math.round(distanceKm * 5),
    };
  }, [from_label, to_label, distanceKm]);

  // Créer les objets PlaceDetails pour MapPreview
  const departure: PlaceDetails = useMemo(() => ({
    placeId: `departure_${from_lat}_${from_lng}`,
    name: from_label,
    address: from_label,
    lat: from_lat,
    lng: from_lng,
    types: ['origin'],
  }), [from_lat, from_lng, from_label]);

  const destination: PlaceDetails = useMemo(() => ({
    placeId: `destination_${to_lat}_${to_lng}`,
    name: to_label,
    address: to_label,
    lat: to_lat,
    lng: to_lng,
    types: ['destination'],
  }), [to_lat, to_lng, to_label]);

  const loadPrices = useCallback(() => {
    dispatch(
      fetchPrices({
        from_lat,
        from_lng,
        to_lat,
        to_lng,
        from_label,
        to_label,
      })
    );
  }, [dispatch, from_lat, from_lng, to_lat, to_lng, from_label, to_label]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPrices();
    setRefreshing(false);
  }, [loadPrices]);

  const handleFilterChange = useCallback((filter: VehicleFilter) => {
    dispatch(setFilter(filter));
  }, [dispatch]);

  const handleDeeplink = useCallback(async (deeplink: string) => {
    try {
      const supported = await Linking.canOpenURL(deeplink);
      if (supported) {
        await Linking.openURL(deeplink);
      } else {
        // Fallback vers le store si l'app n'est pas installée
        console.log("L'application n'est pas installée");
      }
    } catch (err) {
      console.error('Erreur ouverture deeplink:', err);
    }
  }, []);

  // Filtrer et trier les résultats
  const getFilteredResults = (): PriceResult[] => {
    let filtered = [...results];

    // Filtrer par type de véhicule
    if (activeFilter !== 'all') {
      filtered = filtered.filter((r) => r.vehicle_type === activeFilter);
    }

    // Trier
    filtered.sort((a, b) => {
      if (sortBy === 'price') {
        return a.price_min - b.price_min;
      }
      // Tri par prix min par défaut
      return a.price_min - b.price_min;
    });

    return filtered;
  };

  const filteredResults = getFilteredResults();

  // Génération dynamique des prix basée sur les vraies données VTC d'Abidjan
  const realResults: PriceResult[] = useMemo(() => {
    const routeData = getPricesForRoute(from_label, to_label);
    
    if (!routeData) {
      // Données par défaut si le trajet n'est pas trouvé dans la base
      return VTC_PROVIDERS.slice(0, 4).map((provider, index) => ({
        provider: provider.name,
        vehicle_type: 'standard' as const,
        price_min: 1000 + index * 200,
        price_max: 1500 + index * 200,
        currency: 'XOF',
        deeplink: provider.deeplink,
        price_source: 'crowdsourced' as const,
        last_updated: new Date().toISOString(),
        confidence_score: 0.7,
      }));
    }

    // Utilise les résultats formatés de la fonction getPricesForRoute
    return routeData.results.map((r) => ({
      provider: r.provider,
      vehicle_type: r.vehicle_type,
      price_min: r.price_min,
      price_max: r.price_max,
      currency: r.currency,
      deeplink: r.deeplink,
      price_source: r.price_source,
      last_updated: r.last_updated,
      confidence_score: r.confidence_score,
    })) as PriceResult[];
  }, [from_label, to_label]);

  const displayResults = results.length > 0 ? filteredResults : realResults.filter(r => activeFilter === 'all' || r.vehicle_type === activeFilter);

  // Calculer le meilleur prix basé sur les résultats affichés
  const lowestPriceResult = displayResults.length > 0 
    ? displayResults.reduce((min, r) => r.price_min < min.price_min ? r : min, displayResults[0])
    : null;
  const lowestPrice = lowestPriceResult?.price_min ?? 0;

  // Trouver le prix max pour calculer les économies
  const maxPrice = displayResults.length > 0 
    ? Math.max(...displayResults.map(r => r.price_max))
    : 0;

  // Vérifier si toutes les données sont anciennes
  const hasStaleData = displayResults.some(r => {
    if (!r.last_updated) return false;
    const diff = Date.now() - new Date(r.last_updated).getTime();
    return diff > 2 * 60 * 60 * 1000; // > 2h
  });

  // Rendu des items pour FlatList avec useCallback pour performance
  const renderPriceCard = useCallback(({ item, index }: { item: PriceResult; index: number }) => {
    const isLowest = lowestPriceResult?.provider === item.provider && 
                     lowestPriceResult?.vehicle_type === item.vehicle_type;
    
    return (
      <PriceCard
        key={`${item.provider}-${item.vehicle_type}-${index}`}
        result={item}
        isLowest={isLowest}
        lowestPrice={lowestPrice}
        fromLat={from_lat}
        fromLng={from_lng}
        onPress={() => handleDeeplink(item.deeplink)}
        index={index}
      />
    );
  }, [lowestPriceResult, lowestPrice, from_lat, from_lng, handleDeeplink]);

  // getItemLayout pour optimisation FlatList
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: 200, // hauteur approximative d'une PriceCard
    offset: 200 * index,
    index,
  }), []);

  // Key extractor
  const keyExtractor = useCallback((item: PriceResult, index: number) => 
    `${item.provider}-${item.vehicle_type}-${index}`, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Modal d'information */}
      <PriceInfoModal 
        visible={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
      />
      
      {/* Bandeau hors ligne */}
      <OfflineBanner visible={isOffline || isOfflineData} />

      {/* Header trajet amélioré */}
      <RouteHeader
        fromLabel={from_label}
        toLabel={to_label}
        distanceKm={trajetInfo.distance_km || distanceKm}
        durationMin={trajetInfo.duration_normal_min}
        durationPeakMin={trajetInfo.duration_peak_min}
        lastUpdated={lastUpdated}
        onBack={() => navigation.goBack()}
        onModify={() => navigation.navigate('MainTabs')}
      />

      {/* Carte prévisualisation du trajet */}
      <MapPreview
        departure={departure}
        destination={destination}
        height={140}
      />

      {/* Titre section tarifs */}
      <Text style={styles.sectionTitle}>Tarifs disponibles</Text>

      {/* Bandeau données anciennes */}
      {hasStaleData && <EmptyState type="stale-data" />}

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item.key}
          renderItem={({ item: filter }) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                activeFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => handleFilterChange(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          )}
        />
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
            onPress={() => setSortBy('price')}
            accessibilityLabel="Trier par prix"
          >
            <Ionicons
              name="cash-outline"
              size={16}
              color={sortBy === 'price' ? '#F97316' : '#64748B'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'duration' && styles.sortButtonActive]}
            onPress={() => setSortBy('duration')}
            accessibilityLabel="Trier par durée"
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={sortBy === 'duration' ? '#F97316' : '#64748B'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenu */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F97316"
            colors={['#F97316']}
          />
        }
      >
        {isLoading && !refreshing ? (
          // État de chargement
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : displayResults.length === 0 ? (
          // État vide
          <EmptyState
            type="no-results"
            onContribute={() => navigation.navigate('Contribute', route.params)}
            onModifyRoute={() => navigation.navigate('MainTabs')}
          />
        ) : (
          // Liste des résultats
          <>
            {/* Trier pour que le meilleur prix soit en premier */}
            {[...displayResults]
              .sort((a, b) => {
                // Meilleur prix toujours en premier
                const aIsLowest = lowestPriceResult?.provider === a.provider && 
                                  lowestPriceResult?.vehicle_type === a.vehicle_type;
                const bIsLowest = lowestPriceResult?.provider === b.provider && 
                                  lowestPriceResult?.vehicle_type === b.vehicle_type;
                if (aIsLowest) return -1;
                if (bIsLowest) return 1;
                // Puis tri normal par prix
                return a.price_min - b.price_min;
              })
              .map((result, index) => {
                const isLowest = lowestPriceResult?.provider === result.provider && 
                                 lowestPriceResult?.vehicle_type === result.vehicle_type;
                return (
                  <PriceCard
                    key={`${result.provider}-${result.vehicle_type}-${index}`}
                    result={result}
                    isLowest={isLowest}
                    lowestPrice={lowestPrice}
                    fromLat={from_lat}
                    fromLng={from_lng}
                    onPress={() => handleDeeplink(result.deeplink)}
                    index={index}
                  />
                );
              })}
            
            {/* Banner single result */}
            {displayResults.length === 1 && (
              <EmptyState type="single-result" />
            )}
          </>
        )}
      </ScrollView>

      {/* Footer fixe */}
      <ResultsFooter onInfoPress={() => setShowInfoModal(true)} />

      {/* Bouton flottant */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Contribute', route.params)}
        activeOpacity={0.8}
        accessibilityLabel="Contribuer un prix"
        accessibilityRole="button"
        accessibilityHint="Ouvre le formulaire pour ajouter un nouveau prix"
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Contribuer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F97316',
  },
  filterText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#F97316',
  },
  sortContainer: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  sortButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sortButtonActive: {
    backgroundColor: '#FFF7ED',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  fab: {
    position: 'absolute',
    bottom: 56,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SearchResultsScreen;
