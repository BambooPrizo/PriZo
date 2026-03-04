// ============================================
// TESTS - HOOK useLocation
// ============================================

import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';
import { useLocation } from '../useLocation';
import { reverseGeocode, isWithinAbidjan } from '../../utils/geocoding';

// ============================================
// MOCKS
// ============================================

jest.mock('expo-location');
jest.mock('../../utils/geocoding');
jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
  Linking: { openSettings: jest.fn() },
  Platform: { OS: 'android' },
}));

const mockGetForegroundPermissionsAsync = Location.getForegroundPermissionsAsync as jest.Mock;
const mockRequestForegroundPermissionsAsync = Location.requestForegroundPermissionsAsync as jest.Mock;
const mockGetCurrentPositionAsync = Location.getCurrentPositionAsync as jest.Mock;
const mockHasServicesEnabledAsync = Location.hasServicesEnabledAsync as jest.Mock;
const mockWatchPositionAsync = Location.watchPositionAsync as jest.Mock;
const mockReverseGeocode = reverseGeocode as jest.Mock;
const mockIsWithinAbidjan = isWithinAbidjan as jest.Mock;

// Coordonnées de test (Plateau, Abidjan)
const MOCK_COORDS = {
  latitude: 5.316667,
  longitude: -4.033333,
  accuracy: 10,
  altitude: null,
  altitudeAccuracy: null,
  heading: null,
  speed: null,
};

const MOCK_LOCATION = {
  coords: MOCK_COORDS,
  timestamp: Date.now(),
};

const MOCK_ADDRESS = {
  name: 'Plateau',
  address: 'Boulevard de la République, Plateau, Abidjan',
  city: 'Abidjan',
  district: 'Plateau',
  formattedAddress: 'Boulevard de la République, Plateau, Abidjan',
};

// ============================================
// RESET AVANT CHAQUE TEST
// ============================================

beforeEach(() => {
  jest.clearAllMocks();
  mockIsWithinAbidjan.mockReturnValue(true);
  mockReverseGeocode.mockResolvedValue(MOCK_ADDRESS);
  mockHasServicesEnabledAsync.mockResolvedValue(true);
});

// ============================================
// TESTS PERMISSIONS
// ============================================

describe('useLocation - Permissions', () => {
  it('devrait initialiser avec un état vide', () => {
    const { result } = renderHook(() => useLocation());
    
    expect(result.current.coords).toBeNull();
    expect(result.current.address).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.permissionStatus).toBeNull();
  });

  it('devrait demander la permission si non accordée', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.UNDETERMINED,
    });
    mockRequestForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    });
    mockGetCurrentPositionAsync.mockResolvedValue(MOCK_LOCATION);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it('devrait utiliser la permission existante si déjà accordée', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    });
    mockGetCurrentPositionAsync.mockResolvedValue(MOCK_LOCATION);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(mockRequestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('devrait afficher une erreur si permission refusée', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.UNDETERMINED,
    });
    mockRequestForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(result.current.error).toContain('refusé');
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('devrait proposer d\'ouvrir les paramètres si permission refusée', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.UNDETERMINED,
    });
    mockRequestForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Permission requise',
      expect.any(String),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Non merci' }),
        expect.objectContaining({ text: 'Ouvrir' }),
      ])
    );
  });
});

// ============================================
// TESTS POSITION
// ============================================

describe('useLocation - getCurrentPosition', () => {
  beforeEach(() => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    });
  });

  it('devrait obtenir la position avec succès', async () => {
    mockGetCurrentPositionAsync.mockResolvedValue(MOCK_LOCATION);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      const coords = await result.current.getCurrentPosition();
      expect(coords).not.toBeNull();
    });

    expect(result.current.coords?.latitude).toBe(MOCK_COORDS.latitude);
    expect(result.current.coords?.longitude).toBe(MOCK_COORDS.longitude);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('devrait effectuer le reverse geocoding par défaut', async () => {
    mockGetCurrentPositionAsync.mockResolvedValue(MOCK_LOCATION);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(mockReverseGeocode).toHaveBeenCalledWith(
      MOCK_COORDS.latitude,
      MOCK_COORDS.longitude
    );
    expect(result.current.address).toEqual(MOCK_ADDRESS);
  });

  it('devrait ne pas effectuer le reverse geocoding si désactivé', async () => {
    mockGetCurrentPositionAsync.mockResolvedValue(MOCK_LOCATION);

    const { result } = renderHook(() => useLocation({ reverseGeocode: false }));

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(mockReverseGeocode).not.toHaveBeenCalled();
    expect(result.current.address).toBeNull();
  });

  it('devrait afficher une erreur si GPS désactivé', async () => {
    mockHasServicesEnabledAsync.mockResolvedValue(false);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(result.current.error).toContain('GPS');
    expect(Alert.alert).toHaveBeenCalledWith(
      'GPS désactivé',
      expect.any(String),
      expect.any(Array)
    );
  });

  it('devrait signaler si la position est hors Abidjan', async () => {
    mockGetCurrentPositionAsync.mockResolvedValue(MOCK_LOCATION);
    mockIsWithinAbidjan.mockReturnValue(false);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(result.current.error).toContain('hors d\'Abidjan');
    expect(result.current.coords).not.toBeNull(); // Les coords sont quand même retournées
  });
});

// ============================================
// TESTS TIMEOUT
// ============================================

describe('useLocation - Timeout', () => {
  beforeEach(() => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    });
  });

  it('devrait gérer une erreur de timeout', async () => {
    const timeoutError = new Error('Location timeout');
    (timeoutError as any).code = 'E_LOCATION_TIMEOUT';
    mockGetCurrentPositionAsync.mockRejectedValue(timeoutError);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(result.current.error).toContain('trop de temps');
    expect(result.current.loading).toBe(false);
  });

  it('devrait gérer une erreur de service désactivé', async () => {
    const serviceError = new Error('Location services disabled');
    (serviceError as any).code = 'E_LOCATION_SERVICES_DISABLED';
    mockGetCurrentPositionAsync.mockRejectedValue(serviceError);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(result.current.error).toContain('position');
    expect(result.current.loading).toBe(false);
  });

  it('devrait gérer une erreur inconnue', async () => {
    mockGetCurrentPositionAsync.mockRejectedValue(new Error('Unknown error'));

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.loading).toBe(false);
  });
});

// ============================================
// TESTS REVERSE GEOCODING FALLBACK
// ============================================

describe('useLocation - Reverse Geocoding Fallback', () => {
  beforeEach(() => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    });
    mockGetCurrentPositionAsync.mockResolvedValue(MOCK_LOCATION);
  });

  it('devrait fonctionner même si le reverse geocoding échoue', async () => {
    mockReverseGeocode.mockRejectedValue(new Error('Geocoding failed'));

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      const coords = await result.current.getCurrentPosition();
      // Le hook ne devrait pas crasher, mais retourner les coords sans adresse
      expect(coords).toBeDefined();
    });

    // Les coordonnées devraient être présentes
    expect(result.current.coords).not.toBeNull();
  });

  it('devrait retourner null pour l\'adresse si le reverse geocoding retourne null', async () => {
    mockReverseGeocode.mockResolvedValue(null);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(result.current.coords).not.toBeNull();
    expect(result.current.address).toBeNull();
  });
});

// ============================================
// TESTS WATCH POSITION
// ============================================

describe('useLocation - Watch Position', () => {
  const mockRemove = jest.fn();

  beforeEach(() => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    });
    mockWatchPositionAsync.mockResolvedValue({ remove: mockRemove });
  });

  it('devrait démarrer la surveillance de position', async () => {
    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.startWatching();
    });

    expect(mockWatchPositionAsync).toHaveBeenCalled();
  });

  it('devrait arrêter la surveillance de position', async () => {
    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.startWatching();
    });

    act(() => {
      result.current.stopWatching();
    });

    expect(mockRemove).toHaveBeenCalled();
  });

  it('devrait démarrer automatiquement si watchPosition=true', async () => {
    renderHook(() => useLocation({ watchPosition: true }));

    await waitFor(() => {
      expect(mockWatchPositionAsync).toHaveBeenCalled();
    });
  });
});

// ============================================
// TESTS isInAbidjan
// ============================================

describe('useLocation - isInAbidjan', () => {
  beforeEach(() => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
    });
    mockGetCurrentPositionAsync.mockResolvedValue(MOCK_LOCATION);
  });

  it('devrait retourner null si pas de coordonnées', () => {
    const { result } = renderHook(() => useLocation());
    expect(result.current.isInAbidjan).toBeNull();
  });

  it('devrait retourner true si dans Abidjan', async () => {
    mockIsWithinAbidjan.mockReturnValue(true);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(result.current.isInAbidjan).toBe(true);
  });

  it('devrait retourner false si hors Abidjan', async () => {
    mockIsWithinAbidjan.mockReturnValue(false);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(result.current.isInAbidjan).toBe(false);
  });
});
