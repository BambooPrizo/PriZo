// ============================================
// UTILITAIRES DE GÉOCODAGE
// ============================================

import { ABIDJAN_BOUNDS } from '../constants';
import { ALL_PLACES, findNearestPlace } from '../constants/abidjanPlaces';

// ============================================
// CONFIGURATION API
// ============================================

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Centre d'Abidjan pour le biais de recherche
const ABIDJAN_CENTER = {
  lat: 5.3599,
  lng: -4.0083,
};

const SEARCH_RADIUS_METERS = 30000; // 30km

// ============================================
// INTERFACES
// ============================================

export interface GeocodingResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
  types?: string[];
}

export interface PlaceAutocompleteResult {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
  types: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  types: string[];
}

// ============================================
// CALCUL DE DISTANCE HAVERSINE
// ============================================

export const calculateHaversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// ============================================
// ESTIMATION DURÉE DE TRAJET
// ============================================

export const estimateTravelDuration = (
  distanceKm: number,
  isPeakHour: boolean = false
): { normal: number; peak: number } => {
  // Vitesse moyenne à Abidjan (km/h)
  const normalSpeed = 25; // Hors heure de pointe
  const peakSpeed = 12; // Heure de pointe
  
  const normalMinutes = Math.round((distanceKm / normalSpeed) * 60);
  const peakMinutes = Math.round((distanceKm / peakSpeed) * 60);
  
  return {
    normal: Math.max(normalMinutes, 5),
    peak: Math.max(peakMinutes, 10),
  };
};

// ============================================
// REVERSE GEOCODING (Coordonnées → Adresse)
// ============================================

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<GeocodingResult | null> => {
  // D'abord, chercher dans les landmarks locaux si proche
  const nearestLocal = findNearestPlace(lat, lng);
  if (nearestLocal) {
    const distanceToLocal = calculateHaversineDistance(
      lat, lng, nearestLocal.lat, nearestLocal.lng
    );
    
    // Si moins de 200m d'un landmark connu, utiliser ce landmark
    if (distanceToLocal < 0.2) {
      return {
        name: nearestLocal.name,
        address: nearestLocal.address,
        lat: nearestLocal.lat,
        lng: nearestLocal.lng,
      };
    }
  }
  
  // Sinon, utiliser Google Geocoding API
  if (!GOOGLE_MAPS_API_KEY) {
    // Fallback: retourner les coordonnées brutes avec le quartier le plus proche
    if (nearestLocal) {
      return {
        name: `Près de ${nearestLocal.name}`,
        address: nearestLocal.address,
        lat,
        lng,
      };
    }
    return {
      name: 'Position actuelle',
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat,
      lng,
    };
  }
  
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=fr&result_type=street_address|route|neighborhood|locality`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      
      // Extraire le nom court et l'adresse
      const addressComponents = result.address_components;
      let streetName = '';
      let neighborhood = '';
      let locality = '';
      
      for (const component of addressComponents) {
        if (component.types.includes('route')) {
          streetName = component.long_name;
        }
        if (component.types.includes('neighborhood') || component.types.includes('sublocality')) {
          neighborhood = component.long_name;
        }
        if (component.types.includes('locality')) {
          locality = component.long_name;
        }
      }
      
      const name = streetName || neighborhood || 'Position actuelle';
      const address = [streetName, neighborhood, locality]
        .filter(Boolean)
        .join(', ') || result.formatted_address;
      
      return {
        name,
        address,
        lat,
        lng,
        placeId: result.place_id,
        types: result.types,
      };
    }
    
    // Fallback si pas de résultat Google
    if (nearestLocal) {
      return {
        name: `Près de ${nearestLocal.name}`,
        address: nearestLocal.address,
        lat,
        lng,
      };
    }
    
    return {
      name: 'Position actuelle',
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat,
      lng,
    };
  } catch (error) {
    console.error('[Geocoding] Erreur reverse geocoding:', error);
    
    // Fallback en cas d'erreur
    if (nearestLocal) {
      return {
        name: `Près de ${nearestLocal.name}`,
        address: nearestLocal.address,
        lat,
        lng,
      };
    }
    
    return {
      name: 'Position actuelle',
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat,
      lng,
    };
  }
};

// ============================================
// AUTOCOMPLETE PLACES (Recherche d'adresse)
// ============================================

export const searchPlacesAutocomplete = async (
  query: string
): Promise<PlaceAutocompleteResult[]> => {
  if (!query || query.length < 2) return [];
  
  // Si pas de clé API, utiliser uniquement la base locale
  if (!GOOGLE_PLACES_API_KEY) {
    return searchLocalPlacesAsAutocomplete(query);
  }
  
  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&language=fr&components=country:ci&location=${ABIDJAN_CENTER.lat},${ABIDJAN_CENTER.lng}&radius=${SEARCH_RADIUS_METERS}&strictbounds=true`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.predictions) {
      return data.predictions.map((prediction: any) => ({
        placeId: prediction.place_id,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text || '',
        description: prediction.description,
        types: prediction.types || [],
      }));
    }
    
    // Fallback vers la base locale
    return searchLocalPlacesAsAutocomplete(query);
  } catch (error) {
    console.error('[Geocoding] Erreur autocomplete:', error);
    return searchLocalPlacesAsAutocomplete(query);
  }
};

// Convertir les places locales en format autocomplete
const searchLocalPlacesAsAutocomplete = (query: string): PlaceAutocompleteResult[] => {
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const results = ALL_PLACES.filter(place => {
    const normalizedName = place.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedAddress = place.address.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedKeywords = (place.keywords || []).join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    return (
      normalizedName.includes(normalizedQuery) ||
      normalizedAddress.includes(normalizedQuery) ||
      normalizedKeywords.includes(normalizedQuery)
    );
  });
  
  return results.slice(0, 10).map(place => ({
    placeId: `local_${place.id}`,
    mainText: place.name,
    secondaryText: place.address,
    description: `${place.name}, ${place.address}`,
    types: [place.category],
  }));
};

// ============================================
// OBTENIR LES DÉTAILS D'UN LIEU
// ============================================

export const getPlaceDetails = async (
  placeId: string
): Promise<PlaceDetails | null> => {
  // Vérifier si c'est un lieu local
  if (placeId.startsWith('local_')) {
    const localId = placeId.replace('local_', '');
    const localPlace = ALL_PLACES.find(p => p.id === localId);
    
    if (localPlace) {
      return {
        placeId,
        name: localPlace.name,
        address: localPlace.address,
        lat: localPlace.lat,
        lng: localPlace.lng,
        types: [localPlace.category],
      };
    }
    return null;
  }
  
  // Utiliser Google Places Details API
  if (!GOOGLE_PLACES_API_KEY) {
    return null;
  }
  
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}&language=fr&fields=name,formatted_address,geometry,types`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.result) {
      const result = data.result;
      return {
        placeId,
        name: result.name,
        address: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        types: result.types || [],
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Geocoding] Erreur place details:', error);
    return null;
  }
};

// ============================================
// VALIDATION COORDONNÉES ABIDJAN
// ============================================

export const isWithinAbidjan = (lat: number, lng: number): boolean => {
  return (
    lat >= ABIDJAN_BOUNDS.lat.min &&
    lat <= ABIDJAN_BOUNDS.lat.max &&
    lng >= ABIDJAN_BOUNDS.lng.min &&
    lng <= ABIDJAN_BOUNDS.lng.max
  );
};

// ============================================
// FORMATER L'AFFICHAGE DE DISTANCE
// ============================================

export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
};

// ============================================
// FORMATER L'AFFICHAGE DE DURÉE
// ============================================

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
};

// ============================================
// ICÔNE SELON LE TYPE DE LIEU
// ============================================

export const getPlaceIcon = (types: string[]): string => {
  if (types.includes('airport')) return '✈️';
  if (types.includes('hospital') || types.includes('health')) return '🏥';
  if (types.includes('university') || types.includes('school')) return '🏫';
  if (types.includes('church') || types.includes('mosque') || types.includes('place_of_worship')) return '⛪';
  if (types.includes('shopping_mall') || types.includes('store')) return '🏪';
  if (types.includes('restaurant') || types.includes('food')) return '🍽️';
  if (types.includes('hotel') || types.includes('lodging')) return '🏨';
  if (types.includes('administration') || types.includes('local_government_office')) return '🏛️';
  if (types.includes('transit_station') || types.includes('bus_station')) return '🚉';
  if (types.includes('residential')) return '🏠';
  if (types.includes('transport')) return '🚦';
  return '📍';
};
