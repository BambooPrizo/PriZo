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
import { Ionicons } from '@expo/vector-icons';

// Données d'historique simulées
const MOCK_HISTORY = [
  {
    id: '1',
    date: 'Aujourd\'hui',
    searches: [
      {
        from: 'Cocody',
        to: 'Plateau',
        time: '14:32',
        bestPrice: 950,
        provider: 'Yango',
      },
      {
        from: 'Riviera',
        to: 'Zone 4',
        time: '09:15',
        bestPrice: 1200,
        provider: 'Heetch',
      },
    ],
  },
  {
    id: '2',
    date: 'Hier',
    searches: [
      {
        from: 'Yopougon',
        to: 'Abobo',
        time: '18:45',
        bestPrice: 800,
        provider: 'Yango',
      },
    ],
  },
  {
    id: '3',
    date: '28 Feb 2026',
    searches: [
      {
        from: 'Marcory',
        to: 'Treichville',
        time: '12:00',
        bestPrice: 600,
        provider: 'Uber',
      },
      {
        from: 'Plateau',
        to: 'Cocody',
        time: '08:30',
        bestPrice: 1100,
        provider: 'Heetch',
      },
    ],
  },
];

const HistoryScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d'>('7d');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique</Text>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === '7d' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('7d')}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === '7d' && styles.periodTextActive,
              ]}
            >
              7 jours
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === '30d' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('30d')}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === '30d' && styles.periodTextActive,
              ]}
            >
              30 jours
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistiques rapides */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="search-outline" size={24} color="#F97316" />
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Recherches</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-down-outline" size={24} color="#22C55E" />
          <Text style={styles.statValue}>~850 XOF</Text>
          <Text style={styles.statLabel}>Prix moyen</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star-outline" size={24} color="#FCD34D" />
          <Text style={styles.statValue}>Yango</Text>
          <Text style={styles.statLabel}>Favoris</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {MOCK_HISTORY.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionDate}>{section.date}</Text>
            {section.searches.map((search, index) => (
              <TouchableOpacity key={index} style={styles.historyCard}>
                <View style={styles.historyRoute}>
                  <View style={styles.routeIndicator}>
                    <View style={[styles.dot, styles.dotGreen]} />
                    <View style={styles.line} />
                    <View style={[styles.dot, styles.dotRed]} />
                  </View>
                  <View style={styles.routeLabels}>
                    <Text style={styles.routeFrom}>{search.from}</Text>
                    <Text style={styles.routeTo}>{search.to}</Text>
                  </View>
                </View>
                <View style={styles.historyDetails}>
                  <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={14} color="#64748B" />
                    <Text style={styles.timeText}>{search.time}</Text>
                  </View>
                  <View style={styles.priceInfo}>
                    <Text style={styles.priceText}>
                      {search.bestPrice.toLocaleString()} XOF
                    </Text>
                    <Text style={styles.providerText}>{search.provider}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Upgrade CTA */}
        <View style={styles.upgradeCta}>
          <Ionicons name="lock-closed-outline" size={24} color="#94A3B8" />
          <Text style={styles.upgradeText}>
            Passez Premium pour accéder à 30 jours d'historique
          </Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Découvrir</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    color: '#F1F5F9',
    fontSize: 24,
    fontWeight: '700',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#F97316',
  },
  periodText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionDate: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  historyRoute: {
    flexDirection: 'row',
    flex: 1,
  },
  routeIndicator: {
    alignItems: 'center',
    marginRight: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGreen: {
    backgroundColor: '#22C55E',
  },
  dotRed: {
    backgroundColor: '#EF4444',
  },
  line: {
    width: 2,
    height: 16,
    backgroundColor: '#334155',
    marginVertical: 2,
  },
  routeLabels: {
    justifyContent: 'space-between',
  },
  routeFrom: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '500',
  },
  routeTo: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '500',
  },
  historyDetails: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    color: '#64748B',
    fontSize: 12,
    marginLeft: 4,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  priceText: {
    color: '#F97316',
    fontSize: 15,
    fontWeight: '700',
  },
  providerText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  upgradeCta: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  upgradeText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HistoryScreen;
