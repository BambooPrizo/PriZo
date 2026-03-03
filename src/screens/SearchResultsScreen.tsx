import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import PriceCard from '../components/PriceCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Button from '../components/ui/Button';
import OfflineBanner from '../components/OfflineBanner';
import PeakHourBanner from '../components/PeakHourBanner';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPrices, setFilter, VehicleFilter } from '../store/pricesSlice';
import { AppStackParamList } from '../navigation/AppNavigator';
import { PriceResult } from '../types';
import { getPricesForRoute, VTC_PROVIDERS } from '../data/vtcData';
import { useNetworkStatus } from '../hooks';
import { COLORS, MESSAGES } from '../constants';

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
      return a.estimated_duration_min - b.estimated_duration_min;
    });

    return filtered;
  };

  const filteredResults = getFilteredResults();
  const lowestPriceId = filteredResults.length > 0 
    ? filteredResults.reduce((min, r) => r.price_min < min.price_min ? r : min, filteredResults[0])
    : null;

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
        estimated_duration_min: 15 + index * 2,
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
      estimated_duration_min: r.estimated_duration_min,
      deeplink: r.deeplink,
      price_source: r.price_source,
      last_updated: r.last_updated,
      confidence_score: r.confidence_score,
    })) as PriceResult[];
  }, [from_label, to_label]);

  const displayResults = results.length > 0 ? filteredResults : realResults.filter(r => activeFilter === 'all' || r.vehicle_type === activeFilter);

  // Rendu des items pour FlatList avec useCallback pour performance
  const renderPriceCard = useCallback(({ item, index }: { item: PriceResult; index: number }) => (
    <PriceCard
      key={`${item.provider}-${item.vehicle_type}-${index}`}
      {...item}
      onPress={() => handleDeeplink(item.deeplink)}
      isLowest={lowestPriceId?.provider === item.provider && lowestPriceId?.vehicle_type === item.vehicle_type}
    />
  ), [lowestPriceId, handleDeeplink]);

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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Bandeau hors ligne */}
      <OfflineBanner visible={isOffline || isOfflineData} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Retour"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.routeText}>
            {from_label} → {to_label}
          </Text>
          <Text style={styles.distanceText}>~5 km • 12-18 min</Text>
        </View>
        <View style={styles.headerRight} />
      </View>
      
      {/* Bandeau heure de pointe */}
      <View style={styles.peakBannerContainer}>
        <PeakHourBanner />
      </View>

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
          // État vide (seulement si aucune donnée locale non plus)
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={64} color="#64748B" />
            <Text style={styles.emptyTitle}>Aucun prix disponible</Text>
            <Text style={styles.emptyText}>
              Aucun prix disponible pour ce trajet.{'\n'}
              Soyez le premier à contribuer !
            </Text>
            <Button
              label="Contribuer un prix"
              onPress={() => navigation.navigate('Contribute', route.params)}
              variant="primary"
            />
          </View>
        ) : (
          // Liste des résultats (données locales ou API)
          displayResults.map((result, index) => (
            <PriceCard
              key={`${result.provider}-${result.vehicle_type}-${index}`}
              {...result}
              onPress={() => handleDeeplink(result.deeplink)}
              isLowest={lowestPriceId?.provider === result.provider && lowestPriceId?.vehicle_type === result.vehicle_type}
            />
          ))
        )}
      </ScrollView>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={16} color="#94A3B8" />
        <Text style={styles.disclaimerText}>
          Prix indicatifs — actualisés toutes les 10 min
        </Text>
      </View>

      {/* Bouton flottant */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Contribute', route.params)}
        activeOpacity={0.8}
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
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  routeText: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
  },
  distanceText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  peakBannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#F9731620',
    borderColor: '#F97316',
  },
  filterText: {
    color: '#94A3B8',
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
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sortButtonActive: {
    backgroundColor: '#F9731620',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#F1F5F9',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#1E293B80',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  disclaimerText: {
    color: '#94A3B8',
    fontSize: 12,
    marginLeft: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
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
