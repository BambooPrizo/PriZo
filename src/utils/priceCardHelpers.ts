// ============================================
// HELPERS POUR LE COMPOSANT PRICECARD
// ============================================

import { FreshnessResult, VehicleType } from '../types';

/**
 * Formate un prix avec séparateur de milliers (espace)
 * 1200 → "1 200"
 * 950 → "950"
 * 50000 → "50 000"
 */
export function formatPrice(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Formate une fourchette de prix
 * → "1 200 à 1 800 XOF"
 */
export function formatPriceRange(min: number, max: number): string {
  return `${formatPrice(min)} à ${formatPrice(max)} XOF`;
}

/**
 * Calcule l'âge d'une donnée en minutes
 */
function getAgeInMinutes(lastUpdated: string): number {
  const updatedDate = new Date(lastUpdated);
  const now = new Date();
  const diffMs = now.getTime() - updatedDate.getTime();
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * Formate la fraîcheur d'un prix selon son âge
 * < 10 min → "À l'instant"
 * 10-30 min → "Il y a X min"
 * 30-120 min → "Il y a Xh · Peut avoir changé"
 * > 2h → "Données anciennes"
 */
export function formatFreshness(lastUpdated: string): FreshnessResult {
  const ageMinutes = getAgeInMinutes(lastUpdated);

  if (ageMinutes < 10) {
    return {
      label: 'À l\'instant',
      color: '#64748B',
      icon: '🕐',
      isOld: false,
    };
  }

  if (ageMinutes < 30) {
    return {
      label: `Il y a ${ageMinutes} min`,
      color: '#64748B',
      icon: '🕐',
      isOld: false,
    };
  }

  if (ageMinutes < 120) {
    const hours = Math.round(ageMinutes / 60 * 10) / 10;
    const hoursLabel = hours < 1 ? `${ageMinutes} min` : `${hours}h`;
    return {
      label: `Il y a ${hoursLabel} · Peut avoir changé`,
      color: '#F97316',
      icon: '⚠️',
      isOld: true,
    };
  }

  return {
    label: 'Données anciennes',
    color: '#EF4444',
    icon: '🔴',
    isOld: true,
  };
}

/**
 * Calcule l'économie par rapport au prix le plus cher
 * Si c'est déjà le moins cher → null
 */
export function calculateSavings(currentPrice: number, lowestPrice: number): number | null {
  if (currentPrice === lowestPrice) {
    return null;
  }
  return currentPrice - lowestPrice;
}

/**
 * Retourne l'icône du type de véhicule
 */
export function getVehicleIcon(vehicleType: VehicleType | string): string {
  switch (vehicleType) {
    case 'moto':
      return '🛵';
    case 'standard':
      return '🚗';
    case 'confort':
      return '🚙';
    case 'premium':
      return '⭐';
    default:
      return '🚗';
  }
}

/**
 * Capitalise la première lettre d'une chaîne
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
