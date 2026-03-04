// ============================================
// JEST SETUP - MOCKS GLOBAUX
// ============================================

import '@testing-library/jest-native/extend-expect';

// Mock expo-location
jest.mock('expo-location', () => ({
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props) => {
    return <View testID="mock-map-view" {...props} />;
  };
  MockMapView.Marker = (props) => <View testID="mock-marker" {...props} />;
  MockMapView.Polyline = (props) => <View testID="mock-polyline" {...props} />;
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMapView.Marker,
    Polyline: MockMapView.Polyline,
    PROVIDER_GOOGLE: 'google',
    PROVIDER_DEFAULT: 'default',
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  }),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Silence console warnings during tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Animated') || args[0].includes('useNativeDriver'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

// Global test timeout
jest.setTimeout(10000);
