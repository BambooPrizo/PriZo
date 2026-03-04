// ============================================
// ÉTAT VIDE AMÉLIORÉ - Wôrô
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './ui/Button';
import { COLORS, SPACING } from '../constants';

interface EmptyStateProps {
  type: 'no-results' | 'single-result' | 'stale-data';
  onContribute?: () => void;
  onModifyRoute?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onContribute,
  onModifyRoute,
}) => {
  if (type === 'no-results') {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="car-outline" size={48} color="#64748B" />
          <View style={styles.questionMark}>
            <Text style={styles.questionMarkText}>?</Text>
          </View>
        </View>
        
        <Text style={styles.title}>Aucun prix disponible</Text>
        
        <Text style={styles.subtitle}>
          Soyez le premier à contribuer pour ce trajet{'\n'}
          et aidez toute la communauté d'Abidjan 🙌
        </Text>
        
        {onContribute && (
          <View style={styles.buttonContainer}>
            <Button
              label="Contribuer un prix"
              onPress={onContribute}
              variant="primary"
              fullWidth
            />
          </View>
        )}
        
        {onModifyRoute && (
          <View style={styles.secondaryButtonContainer}>
            <Button
              label="Modifier le trajet"
              onPress={onModifyRoute}
              variant="secondary"
              fullWidth
            />
          </View>
        )}
      </View>
    );
  }

  if (type === 'single-result') {
    return (
      <View style={styles.singleResultBanner}>
        <Text style={styles.singleResultIcon}>💡</Text>
        <Text style={styles.singleResultText}>
          Contribuez pour aider la communauté à trouver plus d'options sur ce trajet
        </Text>
      </View>
    );
  }

  if (type === 'stale-data') {
    return (
      <View style={styles.staleBanner}>
        <Text style={styles.staleIcon}>⚠️</Text>
        <Text style={styles.staleText}>
          Données non récentes · Les prix peuvent avoir beaucoup changé
        </Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  questionMark: {
    position: 'absolute',
    top: -8,
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMarkText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  secondaryButtonContainer: {
    width: '100%',
  },

  // Single result banner
  singleResultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F615',
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  singleResultIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  singleResultText: {
    color: '#3B82F6',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // Stale data banner
  staleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444420',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  staleIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  staleText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});

export default EmptyState;
