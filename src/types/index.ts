// Types TypeScript pour l'application PriZo

export interface User {
  id: string;
  phone: string;
  name: string;
  plan: 'free' | 'premium';
  points: number;
}

// Types de véhicules disponibles sur le marché VTC d'Abidjan
export type VehicleType = 'moto' | 'standard' | 'confort' | 'premium';

export interface PriceResult {
  provider: string;
  vehicle_type: VehicleType;
  price_min: number;
  price_max: number;
  currency: string;
  deeplink: string;
  price_source: 'manual' | 'crowdsourced' | 'api';
  last_updated: string;         // ISO timestamp
  confidence_score: number;     // 0 à 1, usage interne uniquement
}

// Types pour l'estimation du temps d'attente
export type TimeSlot = 'PEAK_MORNING' | 'PEAK_EVENING' | 'NIGHT' | 'NORMAL';
export type ZoneDensity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface WaitingTimeEstimate {
  min: number;
  max: number;
  slot: TimeSlot;
  zone: ZoneDensity;
  label: string;               // ex: "2 à 5 min"
  isNight: boolean;
  isPeak: boolean;
}

// Props pour le composant PriceCard
export interface PriceCardProps {
  result: PriceResult;
  isLowest: boolean;           // true = meilleur prix
  lowestPrice: number;         // prix min du moins cher (pour calcul économie)
  fromLat: number;             // coordonnées départ pour temps d'attente
  fromLng: number;
  onPress: () => void;         // redirection deeplink
  index?: number;              // pour animation échelonnée
}

// Résultat du formatage de fraîcheur
export interface FreshnessResult {
  label: string;
  color: string;
  icon: string;
  isOld: boolean;
}

export interface PricesMeta {
  best_price_provider: string;
  query_time_ms: number;
  disclaimer: string;
}

export interface PricesResponse {
  results: PriceResult[];
  meta: PricesMeta;
}

export interface Contribution {
  provider: string;
  vehicle_type: VehicleType;
  price_observed: number;
  currency: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  observed_at: string;
}

export interface Alert {
  id: string;
  provider: string | null;
  threshold_price: number;
  is_active: boolean;
  triggered_count: number;
  last_triggered: string | null;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
}

export interface RouteParams {
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  from_label: string;
  to_label: string;
}

export interface HistoryEntry {
  date: string;
  provider: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  sample_count: number;
}

export interface HistoryResponse {
  history: HistoryEntry[];
}

export interface ContributionResponse {
  id: string;
  points_earned: number;
  status: 'pending' | 'validated' | 'rejected';
}

export interface ContributionsResponse {
  contributions: Array<Contribution & { id: string; status: string; points_awarded: number }>;
  total_points: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RecentContribution {
  provider: string;
  price: number;
  zone_from: string;
  zone_to: string;
  created_at: string;
}
