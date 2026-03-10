import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import TripSearchForm from '../components/TripSearchForm';
import PeakHourBanner from '../components/PeakHourBanner';
import { AppStackParamList } from '../navigation/AppNavigator';
import { FREQUENT_ROUTES } from '../data/vtcData';
import { PlaceDetails } from '../utils/geocoding';

type HomeScreenNavigationProp = NativeStackNavigationProp<AppStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // Handler pour comparer les prix
  const handleCompare = useCallback((departure: PlaceDetails, destination: PlaceDetails) => {
    navigation.navigate('SearchResults', {
      from_lat: departure.lat,
      from_lng: departure.lng,
      to_lat: destination.lat,
      to_lng: destination.lng,
      from_label: departure.name,
      to_label: destination.name,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Titre principal */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Bienvenue sur PriZo</Text>
          <Text style={styles.heroSubtitle}>
            Comparez les meilleurs tarifs VTC à Abidjan{'\n'}en un clic.
          </Text>
        </View>

        {/* Banner heure de pointe */}
        <PeakHourBanner />

        {/* Formulaire de recherche */}
        <TripSearchForm onCompare={handleCompare} />

        {/* Trajets fréquents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Trajets fréquents</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipsContainer}>
              {FREQUENT_ROUTES.map((route, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.chip}
                >
                  <Text style={styles.chipText}>{route.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  // Hero Section
  heroSection: {
    marginBottom: 20,
  },
  heroTitle: {
    color: '#1E293B',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#64748B',
    fontSize: 15,
    lineHeight: 22,
  },
  // Sections
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
    color: '#1E293B',
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
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDBA74',
    marginRight: 8,
  },
  chipText: {
    color: '#EA580C',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen;
