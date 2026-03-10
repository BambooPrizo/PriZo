// ============================================
// MODAL D'INFORMATION - Wôrô
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants';

interface PriceInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const PriceInfoModal: React.FC<PriceInfoModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="information-circle" size={32} color={COLORS.primary} />
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  accessibilityLabel="Fermer"
                  accessibilityRole="button"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Contenu */}
              <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.title}>D'où viennent ces prix ?</Text>
                
                <Text style={styles.paragraph}>
                  Les prix affichés sont collectés manuellement par l'équipe Wôrô 
                  et partagés par la communauté d'utilisateurs.
                </Text>
                
                <Text style={styles.paragraph}>
                  Ils sont mis à jour régulièrement mais peuvent différer du prix 
                  réel au moment de votre course.
                </Text>
                
                <View style={styles.warningBox}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.warningText}>
                    Consultez toujours le prix final dans l'application VTC avant de confirmer.
                  </Text>
                </View>

                {/* Section fiabilité */}
                <Text style={styles.sectionTitle}>Indicateurs de fiabilité</Text>
                
                <View style={styles.reliabilityExplainer}>
                  <View style={styles.reliabilityItem}>
                    <View style={styles.reliabilityBadge}>
                      <Text style={styles.reliabilityIcon}>🟢</Text>
                      <Text style={[styles.reliabilityLabel, { color: '#22C55E' }]}>FIABLE</Text>
                    </View>
                    <Text style={styles.reliabilityDesc}>
                      Plusieurs contributions récentes confirment ce prix
                    </Text>
                  </View>
                  
                  <View style={styles.reliabilityItem}>
                    <View style={styles.reliabilityBadge}>
                      <Text style={styles.reliabilityIcon}>🟡</Text>
                      <Text style={[styles.reliabilityLabel, { color: '#F59E0B' }]}>INDICATIF</Text>
                    </View>
                    <Text style={styles.reliabilityDesc}>
                      Prix approximatif, quelques contributions disponibles
                    </Text>
                  </View>
                  
                  <View style={styles.reliabilityItem}>
                    <View style={styles.reliabilityBadge}>
                      <Text style={styles.reliabilityIcon}>⚪</Text>
                      <Text style={[styles.reliabilityLabel, { color: '#64748B' }]}>ESTIMATION</Text>
                    </View>
                    <Text style={styles.reliabilityDesc}>
                      Peu de données, estimation basée sur la distance
                    </Text>
                  </View>
                </View>

                {/* CTA */}
                <View style={styles.ctaSection}>
                  <Text style={styles.ctaText}>
                    Aidez la communauté à améliorer ces estimations en partageant 
                    le prix de vos courses !
                  </Text>
                </View>
              </ScrollView>

              {/* Bouton OK */}
              <TouchableOpacity
                style={styles.okButton}
                onPress={onClose}
                accessibilityLabel="Compris"
                accessibilityRole="button"
              >
                <Text style={styles.okButtonText}>Compris</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9731620',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  paragraph: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  warningBox: {
    backgroundColor: '#F59E0B20',
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  warningIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  warningText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  reliabilityExplainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  reliabilityItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: SPACING.md,
  },
  reliabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  reliabilityIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  reliabilityLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  reliabilityDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  ctaSection: {
    backgroundColor: '#22C55E15',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  ctaText: {
    color: '#22C55E',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  okButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PriceInfoModal;
