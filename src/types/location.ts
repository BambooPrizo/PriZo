// ============================================
// TYPES POUR LA GÉOLOCALISATION
// ============================================

/**
 * Résultat d'une recherche de lieu
 */
export interface PlaceResult {
  placeId: string;
  name: string;                  // nom court ex: "Carrefour Anono"
  address: string;               // adresse complète
  lat: number;
  lng: number;
  types: string[];               // ['restaurant', 'point_of_interest'...]
}

/**
 * État de sélection des lieux départ/arrivée
 */
export interface LocationState {
  departure: PlaceResult | null;
  destination: PlaceResult | null;
}

/**
 * Coordonnées GPS simples
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Résultat de géolocalisation depuis le device
 */
export interface DeviceLocation {
  coords: Coordinates;
  timestamp: number;
  accuracy: number | null;
}

/**
 * État du hook useCurrentLocation
 */
export interface CurrentLocationState {
  currentLocation: PlaceResult | null;
  isLocating: boolean;
  error: string | null;
}

/**
 * Props pour le composant MapPreview
 */
export interface MapPreviewProps {
  departure: PlaceResult;
  destination: PlaceResult;
  height?: number;
}

/**
 * Icônes par type de lieu Google Places
 */
export const PLACE_TYPE_ICONS: Record<string, string> = {
  // Restauration
  restaurant: '🍽️',
  cafe: '🍽️',
  food: '🍽️',
  bakery: '🍽️',
  
  // Santé
  hospital: '🏥',
  pharmacy: '🏥',
  doctor: '🏥',
  
  // Éducation
  school: '🎓',
  university: '🎓',
  
  // Shopping
  shopping_mall: '🛍️',
  store: '🛍️',
  supermarket: '🛍️',
  
  // Transport
  airport: '✈️',
  bus_station: '🚌',
  transit_station: '🚌',
  train_station: '🚂',
  
  // Hébergement
  lodging: '🏨',
  hotel: '🏨',
  
  // Religion
  church: '🛐',
  mosque: '🛐',
  
  // Finance
  bank: '🏦',
  atm: '🏦',
  
  // Stations
  gas_station: '⛽',
  
  // Loisirs
  park: '🌳',
  gym: '🏋️',
  
  // Défaut
  default: '📍',
};

/**
 * Retourne l'icône appropriée pour un type de lieu
 */
export function getPlaceTypeIcon(types: string[]): string {
  for (const type of types) {
    const icon = PLACE_TYPE_ICONS[type];
    if (icon) return icon;
  }
  return PLACE_TYPE_ICONS.default;
}

/**
 * Limites géographiques d'Abidjan
 */
export const ABIDJAN_BOUNDS = {
  north: 5.48,
  south: 5.15,
  east: -3.80,
  west: -4.15,
};

/**
 * Centre d'Abidjan
 */
export const ABIDJAN_CENTER = {
  lat: 5.3599,
  lng: -4.0083,
};

/**
 * Rayon de recherche autour d'Abidjan (en mètres)
 */
export const SEARCH_RADIUS = 30000;
