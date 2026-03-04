// ============================================
// RÈGLES DE TEMPS D'ATTENTE PAR PROVIDER
// ============================================

import { TimeSlot, ZoneDensity } from '../types';

// Structure des temps d'attente { min, max } en minutes
export interface WaitingTimeRange {
  min: number;
  max: number;
}

// Matrice de temps d'attente par zone et créneau
export type WaitingTimeMatrix = {
  [zone in ZoneDensity]: {
    [slot in TimeSlot]: WaitingTimeRange;
  };
};

// ============================================
// CRÉNEAUX HORAIRES (UTC+0 Abidjan)
// ============================================
export const TIME_SLOTS = {
  PEAK_MORNING: { start: 6.5, end: 9.5 },    // 6h30 → 9h30
  PEAK_EVENING: { start: 16.5, end: 20 },    // 16h30 → 20h00
  NIGHT: { start: 22, end: 5.5 },            // 22h00 → 5h30
  // NORMAL = tout le reste
} as const;

// ============================================
// ZONES GÉOGRAPHIQUES ABIDJAN
// ============================================
export const ZONE_BOUNDARIES = {
  // HIGH : Plateau, Cocody, Deux Plateaux, Riviera, Angré
  HIGH: {
    latMin: 5.30,
    latMax: 5.42,
    lngMin: -4.05,
    lngMax: -3.93,
  },
  // MEDIUM : Marcory, Treichville, Koumassi, Zone 4, Bingerville
  MEDIUM: {
    latMin: 5.25,
    latMax: 5.35,
    lngMin: -4.02,
    lngMax: -3.95,
  },
  // LOW : Yopougon, Abobo, Adjamé, Port-Bouët, Williamsville
  // = Tout le reste dans les limites d'Abidjan
  ABIDJAN: {
    latMin: 5.15,
    latMax: 5.48,
    lngMin: -4.15,
    lngMax: -3.80,
  },
} as const;

// ============================================
// MATRICES PAR PROVIDER
// ============================================

export const YANGO_MATRIX: WaitingTimeMatrix = {
  HIGH: {
    NORMAL: { min: 2, max: 5 },
    PEAK_MORNING: { min: 4, max: 8 },
    PEAK_EVENING: { min: 4, max: 8 },
    NIGHT: { min: 8, max: 15 },
  },
  MEDIUM: {
    NORMAL: { min: 4, max: 8 },
    PEAK_MORNING: { min: 7, max: 12 },
    PEAK_EVENING: { min: 7, max: 12 },
    NIGHT: { min: 12, max: 20 },
  },
  LOW: {
    NORMAL: { min: 8, max: 15 },
    PEAK_MORNING: { min: 12, max: 22 },
    PEAK_EVENING: { min: 12, max: 22 },
    NIGHT: { min: 20, max: 35 },
  },
};

export const HEETCH_MATRIX: WaitingTimeMatrix = {
  HIGH: {
    NORMAL: { min: 3, max: 6 },
    PEAK_MORNING: { min: 5, max: 10 },
    PEAK_EVENING: { min: 5, max: 10 },
    NIGHT: { min: 10, max: 18 },
  },
  MEDIUM: {
    NORMAL: { min: 5, max: 10 },
    PEAK_MORNING: { min: 8, max: 15 },
    PEAK_EVENING: { min: 8, max: 15 },
    NIGHT: { min: 15, max: 25 },
  },
  LOW: {
    NORMAL: { min: 10, max: 18 },
    PEAK_MORNING: { min: 15, max: 25 },
    PEAK_EVENING: { min: 15, max: 25 },
    NIGHT: { min: 25, max: 40 },
  },
};

export const INDRIVE_MATRIX: WaitingTimeMatrix = {
  HIGH: {
    NORMAL: { min: 3, max: 7 },
    PEAK_MORNING: { min: 6, max: 12 },
    PEAK_EVENING: { min: 6, max: 12 },
    NIGHT: { min: 12, max: 20 },
  },
  MEDIUM: {
    NORMAL: { min: 6, max: 12 },
    PEAK_MORNING: { min: 10, max: 18 },
    PEAK_EVENING: { min: 10, max: 18 },
    NIGHT: { min: 18, max: 30 },
  },
  LOW: {
    NORMAL: { min: 12, max: 20 },
    PEAK_MORNING: { min: 18, max: 28 },
    PEAK_EVENING: { min: 18, max: 28 },
    NIGHT: { min: 28, max: 45 },
  },
};

// Provider non reconnu : Heetch + 20%
export const DEFAULT_MULTIPLIER = 1.2;

// Map des providers vers leurs matrices
export const PROVIDER_MATRICES: Record<string, WaitingTimeMatrix> = {
  YANGO: YANGO_MATRIX,
  Yango: YANGO_MATRIX,
  yango: YANGO_MATRIX,
  HEETCH: HEETCH_MATRIX,
  Heetch: HEETCH_MATRIX,
  heetch: HEETCH_MATRIX,
  INDRIVE: INDRIVE_MATRIX,
  InDrive: INDRIVE_MATRIX,
  indrive: INDRIVE_MATRIX,
};
