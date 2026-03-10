import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const SkeletonCard: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      {/* Header avec provider */}
      <Animated.View style={[styles.providerSkeleton, { opacity }]} />

      {/* Prix */}
      <Animated.View style={[styles.priceSkeleton, { opacity }]} />

      {/* Durée et confiance */}
      <View style={styles.row}>
        <Animated.View style={[styles.durationSkeleton, { opacity }]} />
        <Animated.View style={[styles.confidenceSkeleton, { opacity }]} />
      </View>

      {/* Horodatage */}
      <Animated.View style={[styles.timestampSkeleton, { opacity }]} />

      {/* Bouton */}
      <Animated.View style={[styles.buttonSkeleton, { opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  providerSkeleton: {
    backgroundColor: '#E2E8F0',
    height: 24,
    width: 120,
    borderRadius: 6,
    marginBottom: 12,
  },
  priceSkeleton: {
    backgroundColor: '#E2E8F0',
    height: 36,
    width: 180,
    borderRadius: 6,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  durationSkeleton: {
    backgroundColor: '#E2E8F0',
    height: 20,
    width: 100,
    borderRadius: 6,
  },
  confidenceSkeleton: {
    backgroundColor: '#E2E8F0',
    height: 20,
    width: 80,
    borderRadius: 10,
  },
  timestampSkeleton: {
    backgroundColor: '#E2E8F0',
    height: 16,
    width: 150,
    borderRadius: 6,
    marginBottom: 16,
  },
  buttonSkeleton: {
    backgroundColor: '#E2E8F0',
    height: 48,
    borderRadius: 10,
  },
});

export default SkeletonCard;
