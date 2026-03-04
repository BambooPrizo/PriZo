// ============================================
// HOOK DE GÉOLOCALISATION TEMPS RÉEL
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';
import { ABIDJAN_BOUNDS } from '../constants';
import { reverseGeocode, GeocodingResult, isWithinAbidjan } from '../utils/geocoding';

// ============================================
// INTERFACES
// ============================================

export interface LocationState {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  } | null;
  address: GeocodingResult | null;
  loading: boolean;
  error: string | null;
  permissionStatus: Location.PermissionStatus | null;
}

export interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  watchPosition?: boolean;
  reverseGeocode?: boolean;
}

// ============================================
// MESSAGES D'ERREUR
// ============================================

const ERROR_MESSAGES = {
  PERMISSION_DENIED: 'L\'accès à la localisation a été refusé. Veuillez autoriser PriZo à accéder à votre position dans les paramètres.',
  POSITION_UNAVAILABLE: 'Impossible d\'obtenir votre position. Vérifiez que le GPS est activé.',
  TIMEOUT: 'La recherche de position a pris trop de temps. Réessayez.',
  OUT_OF_ABIDJAN: 'Votre position semble être hors d\'Abidjan. PriZo fonctionne uniquement à Abidjan.',
  UNKNOWN: 'Une erreur est survenue lors de la localisation.',
};

// ============================================
// HOOK useLocation
// ============================================

export const useLocation = (options: UseLocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    watchPosition = false,
    reverseGeocode: shouldReverse = true,
  } = options;

  const [state, setState] = useState<LocationState>({
    coords: null,
    address: null,
    loading: false,
    error: null,
    permissionStatus: null,
  });

  const watchSubscription = useRef<Location.LocationSubscription | null>(null);

  // ============================================
  // DEMANDER LES PERMISSIONS
  // ============================================

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus === Location.PermissionStatus.GRANTED) {
        setState(prev => ({ ...prev, permissionStatus: existingStatus }));
        return true;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      setState(prev => ({ ...prev, permissionStatus: status }));

      if (status !== Location.PermissionStatus.GRANTED) {
        setState(prev => ({
          ...prev,
          error: ERROR_MESSAGES.PERMISSION_DENIED,
        }));
        
        // Proposer d'ouvrir les paramètres (uniquement sur mobile)
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Permission requise',
            'PriZo a besoin d\'accéder à votre position pour vous localiser. Voulez-vous ouvrir les paramètres ?',
            [
              { text: 'Non merci', style: 'cancel' },
              { text: 'Ouvrir', onPress: () => Linking.openSettings() },
            ]
          );
        }
        
        return false;
      }

      return true;
    } catch (error) {
      console.error('[useLocation] Erreur permission:', error);
      setState(prev => ({ ...prev, error: ERROR_MESSAGES.UNKNOWN }));
      return false;
    }
  }, []);

  // ============================================
  // OBTENIR LA POSITION ACTUELLE
  // ============================================

  const getCurrentPosition = useCallback(async (): Promise<LocationState['coords']> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setState(prev => ({ ...prev, loading: false }));
        return null;
      }

      // Vérifier si le service de localisation est activé (pas sur web)
      if (Platform.OS !== 'web') {
        const serviceEnabled = await Location.hasServicesEnabledAsync();
        if (!serviceEnabled) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: ERROR_MESSAGES.POSITION_UNAVAILABLE,
          }));
          
          Alert.alert(
            'GPS désactivé',
            'Veuillez activer le GPS pour utiliser la localisation.',
            [{ text: 'OK' }]
          );
          
          return null;
        }
      }

      // Options de localisation
      const locationOptions: Location.LocationOptions = {
        accuracy: enableHighAccuracy 
          ? Location.Accuracy.High 
          : Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      };

      const location = await Location.getCurrentPositionAsync(locationOptions);

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
      };

      // Vérifier si la position est dans Abidjan
      if (!isWithinAbidjan(coords.latitude, coords.longitude)) {
        setState(prev => ({
          ...prev,
          coords,
          loading: false,
          error: ERROR_MESSAGES.OUT_OF_ABIDJAN,
        }));
        return coords;
      }

      // Reverse geocoding si demandé
      let address: GeocodingResult | null = null;
      if (shouldReverse) {
        address = await reverseGeocode(coords.latitude, coords.longitude);
      }

      setState({
        coords,
        address,
        loading: false,
        error: null,
        permissionStatus: Location.PermissionStatus.GRANTED,
      });

      return coords;
    } catch (error: any) {
      console.error('[useLocation] Erreur position:', error);
      
      let errorMessage = ERROR_MESSAGES.UNKNOWN;
      if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
        errorMessage = ERROR_MESSAGES.POSITION_UNAVAILABLE;
      } else if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage = ERROR_MESSAGES.TIMEOUT;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      return null;
    }
  }, [enableHighAccuracy, shouldReverse, requestPermission]);

  // ============================================
  // SURVEILLER LA POSITION (TEMPS RÉEL)
  // ============================================

  const startWatching = useCallback(async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      // Arrêter la surveillance existante
      if (watchSubscription.current) {
        watchSubscription.current.remove();
      }

      setState(prev => ({ ...prev, loading: true }));

      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: enableHighAccuracy 
            ? Location.Accuracy.High 
            : Location.Accuracy.Balanced,
          timeInterval: 5000, // Mise à jour toutes les 5 secondes
          distanceInterval: 10, // Ou tous les 10 mètres
        },
        async (location) => {
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            altitudeAccuracy: location.coords.altitudeAccuracy,
            heading: location.coords.heading,
            speed: location.coords.speed,
          };

          // Reverse geocoding si demandé
          let address: GeocodingResult | null = null;
          if (shouldReverse) {
            address = await reverseGeocode(coords.latitude, coords.longitude);
          }

          setState(prev => ({
            ...prev,
            coords,
            address,
            loading: false,
            error: isWithinAbidjan(coords.latitude, coords.longitude) 
              ? null 
              : ERROR_MESSAGES.OUT_OF_ABIDJAN,
          }));
        }
      );
    } catch (error) {
      console.error('[useLocation] Erreur watch:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: ERROR_MESSAGES.UNKNOWN,
      }));
    }
  }, [enableHighAccuracy, shouldReverse, requestPermission]);

  const stopWatching = useCallback(() => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
  }, []);

  // ============================================
  // EFFET AUTO-WATCH
  // ============================================

  useEffect(() => {
    if (watchPosition) {
      startWatching();
    }
    
    return () => {
      stopWatching();
    };
  }, [watchPosition, startWatching, stopWatching]);

  // ============================================
  // RETOURNER L'API
  // ============================================

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    stopWatching,
    requestPermission,
    isInAbidjan: state.coords 
      ? isWithinAbidjan(state.coords.latitude, state.coords.longitude)
      : null,
  };
};

export default useLocation;
