import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { AppStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<AppStackParamList>;

// Trajets fréquents prédéfinis
const FREQUENT_ROUTES = [
  {
    label: 'Cocody → Plateau',
    from: { lat: 5.3364, lng: -3.9746, label: 'Cocody' },
    to: { lat: 5.3217, lng: -4.0195, label: 'Plateau' },
  },
  {
    label: 'Yopougon → Abobo',
    from: { lat: 5.3189, lng: -4.0685, label: 'Yopougon' },
    to: { lat: 5.4167, lng: -4.0167, label: 'Abobo' },
  },
  {
    label: 'Marcory → Treichville',
    from: { lat: 5.3025, lng: -3.9857, label: 'Marcory' },
    to: { lat: 5.2923, lng: -4.0024, label: 'Treichville' },
  },
  {
    label: 'Riviera → Zone 4',
    from: { lat: 5.3562, lng: -3.9608, label: 'Riviera' },
    to: { lat: 5.3167, lng: -4.0000, label: 'Zone 4' },
  },
];

// Dernières contributions simulées
const RECENT_CONTRIBUTIONS = [
  { provider: 'Yango', price: 1200, zone: 'Cocody → Plateau', time: '5 min' },
  { provider: 'Heetch', price: 950, zone: 'Yopougon → Abobo', time: '12 min' },
  { provider: 'Uber', price: 1500, zone: 'Marcory → Zone 4', time: '20 min' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [fromLabel, setFromLabel] = useState('');
  const [toLabel, setToLabel] = useState('');
  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');

  const handleSelectRoute = (route: (typeof FREQUENT_ROUTES)[0]) => {
    setFromLabel(route.from.label);
    setToLabel(route.to.label);
    setFromCoords({ lat: route.from.lat, lng: route.from.lng });
    setToCoords({ lat: route.to.lat, lng: route.to.lng });
  };

  const handleCompare = () => {
    setError('');

    if (!fromLabel.trim() || !toLabel.trim()) {
      setError('Veuillez remplir les deux champs');
      return;
    }

    // Simuler des coordonnées si non définies
    const finalFromCoords = fromCoords || { lat: 5.3364, lng: -3.9746 };
    const finalToCoords = toCoords || { lat: 5.3217, lng: -4.0195 };

    navigation.navigate('SearchResults', {
      from_lat: finalFromCoords.lat,
      from_lng: finalFromCoords.lng,
      to_lat: finalToCoords.lat,
      to_lng: finalToCoords.lng,
      from_label: fromLabel,
      to_label: toLabel,
    });
  };

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

        {/* Formulaire de recherche */}
        <View style={styles.searchCard}>
          <View style={styles.inputWrapper}>
            <View style={styles.pinIndicator}>
              <View style={[styles.pin, styles.pinGreen]} />
              <View style={styles.pinLine} />
            </View>
            <View style={styles.inputField}>
              <Input
                label="Départ"
                placeholder="D'où partez-vous ?"
                value={fromLabel}
                onChangeText={setFromLabel}
                icon="location"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.pinIndicator}>
              <View style={[styles.pin, styles.pinRed]} />
            </View>
            <View style={styles.inputField}>
              <Input
                label="Arrivée"
                placeholder="Où allez-vous ?"
                value={toLabel}
                onChangeText={setToLabel}
                icon="flag"
              />
            </View>
          </View>

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
                <Text style={styles.contributionZone}>{contribution.zone}</Text>
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
