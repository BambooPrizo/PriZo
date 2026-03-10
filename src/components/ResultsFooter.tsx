// ============================================
// FOOTER FIXE RESULTS - Wôrô
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants';

interface ResultsFooterProps {
  onInfoPress: () => void;
}

const ResultsFooter: React.FC<ResultsFooterProps> = ({ onInfoPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Prix indicatifs · Varient en temps réel</Text>
      <TouchableOpacity
        style={styles.infoButton}
        onPress={onInfoPress}
        accessibilityLabel="Plus d'informations sur les prix"
        accessibilityRole="button"
        accessibilityHint="Ouvre une fenêtre explicative sur l'origine des prix"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="information-circle" size={20} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: SPACING.lg,
  },
  text: {
    color: '#94A3B8',
    fontSize: 12,
    marginRight: SPACING.sm,
  },
  infoButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ResultsFooter;
