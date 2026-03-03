import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';
import { fetchAlerts, toggleAlert } from '../store/alertsSlice';
import Button from '../components/ui/Button';

const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { alerts } = useAppSelector((state) => state.alerts);

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleToggleAlert = (id: string, currentState: boolean) => {
    dispatch(toggleAlert({ id, is_active: !currentState }));
  };

  // Données simulées pour la démo
  const mockUser = user || {
    id: 'usr_demo',
    name: 'Kouamé Konan',
    phone: '+225 07 12 34 56 78',
    plan: 'free' as const,
    points: 150,
  };

  const mockAlerts = alerts.length > 0 ? alerts : [
    {
      id: '1',
      provider: 'Yango',
      threshold_price: 1000,
      is_active: true,
      triggered_count: 3,
      last_triggered: new Date().toISOString(),
    },
    {
      id: '2',
      provider: null,
      threshold_price: 1500,
      is_active: false,
      triggered_count: 0,
      last_triggered: null,
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header profil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(mockUser.name)}</Text>
            </View>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>
                {mockUser.plan === 'premium' ? '⭐ Premium' : 'Gratuit'}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{mockUser.name}</Text>
          <Text style={styles.userPhone}>{mockUser.phone}</Text>
        </View>

        {/* Statistiques */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Contributions</Text>
          </View>
          <View style={[styles.statItem, styles.statItemCenter]}>
            <Text style={styles.statValue}>{mockUser.points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>#42</Text>
            <Text style={styles.statLabel}>Rang</Text>
          </View>
        </View>

        {/* Alertes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔔 Mes alertes</Text>
            <TouchableOpacity>
              <Text style={styles.addButton}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {mockAlerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertInfo}>
                <Text style={styles.alertProvider}>
                  {alert.provider || 'Tous les VTC'}
                </Text>
                <Text style={styles.alertThreshold}>
                  Seuil : {alert.threshold_price.toLocaleString()} XOF
                </Text>
                {alert.triggered_count > 0 && (
                  <Text style={styles.alertTriggered}>
                    Déclenchée {alert.triggered_count} fois
                  </Text>
                )}
              </View>
              <Switch
                value={alert.is_active}
                onValueChange={() => handleToggleAlert(alert.id, alert.is_active)}
                trackColor={{ false: '#334155', true: '#F9731650' }}
                thumbColor={alert.is_active ? '#F97316' : '#64748B'}
              />
            </View>
          ))}
        </View>

        {/* Passer Premium */}
        {mockUser.plan === 'free' && (
          <View style={styles.premiumCard}>
            <View style={styles.premiumHeader}>
              <Ionicons name="star" size={28} color="#FCD34D" />
              <Text style={styles.premiumTitle}>Passer Premium</Text>
            </View>
            <View style={styles.premiumBenefits}>
              <View style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                <Text style={styles.benefitText}>Alertes illimitées</Text>
              </View>
              <View style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                <Text style={styles.benefitText}>Historique 30 jours</Text>
              </View>
              <View style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                <Text style={styles.benefitText}>Priorité sur les nouvelles fonctionnalités</Text>
              </View>
            </View>
            <Button
              label="Découvrir Premium"
              onPress={() => {}}
              variant="primary"
              fullWidth
            />
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={22} color="#94A3B8" />
            <Text style={styles.menuText}>Centre d'aide</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={22} color="#94A3B8" />
            <Text style={styles.menuText}>Conditions d'utilisation</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-outline" size={22} color="#94A3B8" />
            <Text style={styles.menuText}>Politique de confidentialité</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>PriZo v1.0.0</Text>
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
    paddingTop: 24,
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  planBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  planBadgeText: {
    color: '#F1F5F9',
    fontSize: 11,
    fontWeight: '600',
  },
  userName: {
    color: '#F1F5F9',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  userPhone: {
    color: '#64748B',
    fontSize: 15,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    color: '#F97316',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 13,
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
  },
  addButton: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  alertInfo: {
    flex: 1,
  },
  alertProvider: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertThreshold: {
    color: '#94A3B8',
    fontSize: 13,
  },
  alertTriggered: {
    color: '#22C55E',
    fontSize: 12,
    marginTop: 4,
  },
  premiumCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FCD34D30',
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumTitle: {
    color: '#FCD34D',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },
  premiumBenefits: {
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    color: '#F1F5F9',
    fontSize: 14,
    marginLeft: 10,
  },
  menuSection: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  menuText: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 15,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF444420',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#EF444440',
    marginBottom: 16,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  version: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ProfileScreen;
