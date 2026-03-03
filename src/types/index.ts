// Types TypeScript pour l'application PriZo

export interface User {
  id: string;
  phone: string;
  name: string;
  plan: 'free' | 'premium';
  points: number;
}

export interface PriceResult {
  provider: string;
  vehicle_type: 'moto' | 'standard' | 'premium';
  price_min: number;
  price_max: number;
  currency: string;
  estimated_duration_min: number;
  deeplink: string;
  price_source: 'manual' | 'crowdsourced' | 'api';
  last_updated: string;
  confidence_score: number;
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
  vehicle_type: 'moto' | 'standard' | 'premium';
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
