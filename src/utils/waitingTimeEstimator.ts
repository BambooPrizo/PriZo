// ============================================
// ESTIMATEUR DE TEMPS D'ATTENTE VTC ABIDJAN
// ============================================

import { WaitingTimeEstimate, TimeSlot, ZoneDensity } from '../types';
import {
  TIME_SLOTS,
  ZONE_BOUNDARIES,
  PROVIDER_MATRICES,
  HEETCH_MATRIX,
  DEFAULT_MULTIPLIER,
} from '../constants/waitingTimeRules';

/**
 * Détecte le créneau horaire actuel (UTC+0 Abidjan)
 */
export function detectTimeSlot(date: Date = new Date()): TimeSlot {
  // Abidjan est en UTC+0 (pas de décalage horaire)
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;

  // PEAK_MORNING : 6h30 → 9h30
  if (hours >= TIME_SLOTS.PEAK_MORNING.start && hours < TIME_SLOTS.PEAK_MORNING.end) {
    return 'PEAK_MORNING';
  }

  // PEAK_EVENING : 16h30 → 20h00
  if (hours >= TIME_SLOTS.PEAK_EVENING.start && hours < TIME_SLOTS.PEAK_EVENING.end) {
    return 'PEAK_EVENING';
  }

  // NIGHT : 22h00 → 5h30 (chevauchement minuit)
  if (hours >= TIME_SLOTS.NIGHT.start || hours < TIME_SLOTS.NIGHT.end) {
    return 'NIGHT';
  }

  return 'NORMAL';
}

/**
 * Détecte la densité de zone via coordonnées GPS
 */
export function detectZoneDensity(lat: number, lng: number): ZoneDensity {
  const { HIGH, MEDIUM, ABIDJAN } = ZONE_BOUNDARIES;

  // Vérifier si hors Abidjan → fallback MEDIUM
  if (
    lat < ABIDJAN.latMin ||
    lat > ABIDJAN.latMax ||
    lng < ABIDJAN.lngMin ||
    lng > ABIDJAN.lngMax
  ) {
    return 'MEDIUM';
  }

  // HIGH : Plateau, Cocody, Deux Plateaux, Riviera, Angré
  if (
    lat >= HIGH.latMin &&
    lat <= HIGH.latMax &&
    lng >= HIGH.lngMin &&
    lng <= HIGH.lngMax
  ) {
    return 'HIGH';
  }

  // MEDIUM : Marcory, Treichville, Koumassi, Zone 4, Bingerville
  if (
    lat >= MEDIUM.latMin &&
    lat <= MEDIUM.latMax &&
    lng >= MEDIUM.lngMin &&
    lng <= MEDIUM.lngMax
  ) {
    return 'MEDIUM';
  }

  // LOW : Yopougon, Abobo, Adjamé, Port-Bouët, Williamsville
  return 'LOW';
}

/**
 * Formate le label du temps d'attente
 */
function formatWaitingLabel(min: number, max: number, slot: TimeSlot): string {
  const baseLabel = `${min} à ${max} min`;

  switch (slot) {
    case 'PEAK_MORNING':
    case 'PEAK_EVENING':
      return `${baseLabel} · heure de pointe`;
    case 'NIGHT':
      return `${baseLabel} · nuit`;
    default:
      return baseLabel;
  }
}

/**
 * Fonction principale : estime le temps d'attente d'un chauffeur
 */
export function estimateWaitingTime(
  provider: string,
  fromLat: number,
  fromLng: number,
  date: Date = new Date()
): WaitingTimeEstimate {
  // Étape 1 : Détecter le créneau horaire
  const slot = detectTimeSlot(date);

  // Étape 2 : Détecter la densité de zone
  const zone = detectZoneDensity(fromLat, fromLng);

  // Étape 3 : Obtenir la matrice du provider
  const matrix = PROVIDER_MATRICES[provider];

  let min: number;
  let max: number;

  if (matrix) {
    // Provider reconnu
    const range = matrix[zone][slot];
    min = range.min;
    max = range.max;
  } else {
    // Provider non reconnu : Heetch + 20%, arrondi supérieur
    const heetchRange = HEETCH_MATRIX[zone][slot];
    min = Math.ceil(heetchRange.min * DEFAULT_MULTIPLIER);
    max = Math.ceil(heetchRange.max * DEFAULT_MULTIPLIER);
  }

  // Déterminer les flags
  const isNight = slot === 'NIGHT';
  const isPeak = slot === 'PEAK_MORNING' || slot === 'PEAK_EVENING';

  // Formater le label
  const label = formatWaitingLabel(min, max, slot);

  return {
    min,
    max,
    slot,
    zone,
    label,
    isNight,
    isPeak,
  };
}

export default estimateWaitingTime;
