import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfidenceIndicatorProps {
  score: number;
  showLabel?: boolean;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  score,
  showLabel = true,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const getConfig = () => {
    if (score > 0.8) {
      return {
        color: '#22C55E',
        label: 'Données fiables',
        width: `${score * 100}%`,
      };
    } else if (score >= 0.5) {
      return {
        color: '#F97316',
        label: 'Prix indicatif',
        width: `${score * 100}%`,
      };
    } else {
      return {
        color: '#6B7280',
        label: 'Estimation approximative',
        width: `${score * 100}%`,
      };
    }
  };

  const config = getConfig();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showLabel && (
          <Text style={[styles.label, { color: config.color }]}>
            {config.label}
          </Text>
        )}
        <TouchableOpacity
          onPress={() => setTooltipVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="information-circle-outline" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: config.width as any, backgroundColor: config.color },
          ]}
        />
      </View>

      <Modal
        visible={tooltipVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltipVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTooltipVisible(false)}
        >
          <View style={styles.tooltipContainer}>
            <Text style={styles.tooltipText}>
              Prix basé sur les contributions de la communauté.{'\n'}
              Peut varier en temps réel.
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setTooltipVisible(false)}
            >
              <Text style={styles.closeButtonText}>Compris</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tooltipContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tooltipText: {
    color: '#F1F5F9',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#F97316',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ConfidenceIndicator;
