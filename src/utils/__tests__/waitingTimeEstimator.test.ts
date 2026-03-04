// ============================================
// TESTS - ESTIMATEUR DE TEMPS D'ATTENTE
// ============================================

import {
  estimateWaitingTime,
  detectTimeSlot,
  detectZoneDensity,
} from '../waitingTimeEstimator';
import {
  formatFreshness,
  formatPrice,
  formatPriceRange,
} from '../priceCardHelpers';

describe('detectTimeSlot', () => {
  it('devrait retourner PEAK_MORNING entre 6h30 et 9h30 UTC', () => {
    // 8h00 UTC
    const date = new Date('2024-03-15T08:00:00Z');
    expect(detectTimeSlot(date)).toBe('PEAK_MORNING');
  });

  it('devrait retourner PEAK_EVENING entre 16h30 et 20h00 UTC', () => {
    // 18h00 UTC
    const date = new Date('2024-03-15T18:00:00Z');
    expect(detectTimeSlot(date)).toBe('PEAK_EVENING');
  });

  it('devrait retourner NIGHT entre 22h00 et 5h30 UTC', () => {
    // 23h00 UTC
    const date = new Date('2024-03-15T23:00:00Z');
    expect(detectTimeSlot(date)).toBe('NIGHT');
  });

  it('devrait retourner NORMAL pour les autres heures', () => {
    // 14h00 UTC
    const date = new Date('2024-03-15T14:00:00Z');
    expect(detectTimeSlot(date)).toBe('NORMAL');
  });
});

describe('detectZoneDensity', () => {
  it('devrait retourner HIGH pour Cocody', () => {
    // Cocody centre : environ lat 5.35, lng -3.98
    const result = detectZoneDensity(5.35, -3.98);
    expect(result).toBe('HIGH');
  });

  it('devrait retourner MEDIUM pour Marcory', () => {
    // Marcory : environ lat 5.30, lng -3.98
    const result = detectZoneDensity(5.30, -3.98);
    expect(result).toBe('MEDIUM');
  });

  it('devrait retourner LOW pour Yopougon', () => {
    // Yopougon : lat 5.36, lng -4.09 (hors HIGH et MEDIUM, mais dans Abidjan)
    const result = detectZoneDensity(5.36, -4.09);
    expect(result).toBe('LOW');
  });

  it('devrait retourner MEDIUM (fallback) pour coordonnées hors Abidjan', () => {
    // Coordonnées bien hors Abidjan
    const result = detectZoneDensity(6.5, -5.0);
    expect(result).toBe('MEDIUM');
  });
});

describe('estimateWaitingTime', () => {
  it('Cocody (HIGH) à 8h → PEAK_MORNING, Yango → 4 à 8 min', () => {
    const date = new Date('2024-03-15T08:00:00Z');
    const result = estimateWaitingTime('Yango', 5.35, -3.98, date);
    expect(result.min).toBe(4);
    expect(result.max).toBe(8);
    expect(result.slot).toBe('PEAK_MORNING');
    expect(result.zone).toBe('HIGH');
    expect(result.isPeak).toBe(true);
  });

  it('Yopougon (LOW) à 18h → PEAK_EVENING, Heetch → 15 à 25 min', () => {
    const date = new Date('2024-03-15T18:00:00Z');
    const result = estimateWaitingTime('Heetch', 5.36, -4.09, date);
    expect(result.min).toBe(15);
    expect(result.max).toBe(25);
    expect(result.slot).toBe('PEAK_EVENING');
    expect(result.zone).toBe('LOW');
    expect(result.isPeak).toBe(true);
  });

  it('Plateau (HIGH) à 23h → NIGHT, InDrive → 12 à 20 min', () => {
    const date = new Date('2024-03-15T23:00:00Z');
    const result = estimateWaitingTime('InDrive', 5.35, -3.98, date);
    expect(result.min).toBe(12);
    expect(result.max).toBe(20);
    expect(result.slot).toBe('NIGHT');
    expect(result.zone).toBe('HIGH');
    expect(result.isNight).toBe(true);
  });

  it('Marcory (MEDIUM) à 14h → NORMAL, Yango → 4 à 8 min', () => {
    const date = new Date('2024-03-15T14:00:00Z');
    const result = estimateWaitingTime('Yango', 5.30, -3.98, date);
    expect(result.min).toBe(4);
    expect(result.max).toBe(8);
    expect(result.slot).toBe('NORMAL');
    expect(result.zone).toBe('MEDIUM');
  });

  it('Coordonnées hors Abidjan → fallback MEDIUM + NORMAL', () => {
    const date = new Date('2024-03-15T14:00:00Z');
    const result = estimateWaitingTime('Yango', 6.5, -5.0, date);
    expect(result.zone).toBe('MEDIUM');
    expect(result.slot).toBe('NORMAL');
  });

  it('Provider inconnu → DEFAULT avec majoration 20%', () => {
    const date = new Date('2024-03-15T14:00:00Z');
    // Provider MEDIUM + NORMAL pour Heetch = { min: 5, max: 10 }
    // Avec 20% de majoration et arrondi supérieur :
    // min = ceil(5 * 1.2) = ceil(6) = 6
    // max = ceil(10 * 1.2) = ceil(12) = 12
    const result = estimateWaitingTime('UnknownProvider', 5.30, -3.98, date);
    expect(result.min).toBe(6);
    expect(result.max).toBe(12);
  });

  it('min est toujours < max dans tous les cas', () => {
    const providers = ['Yango', 'Heetch', 'InDrive', 'Unknown'];
    const zones = [
      { lat: 5.35, lng: -3.98 },  // HIGH
      { lat: 5.30, lng: -3.98 },  // MEDIUM
      { lat: 5.36, lng: -4.09 },  // LOW
    ];
    const times = [
      new Date('2024-03-15T08:00:00Z'),  // PEAK_MORNING
      new Date('2024-03-15T18:00:00Z'),  // PEAK_EVENING
      new Date('2024-03-15T23:00:00Z'),  // NIGHT
      new Date('2024-03-15T14:00:00Z'),  // NORMAL
    ];

    providers.forEach(provider => {
      zones.forEach(zone => {
        times.forEach(time => {
          const result = estimateWaitingTime(provider, zone.lat, zone.lng, time);
          expect(result.min).toBeLessThan(result.max);
        });
      });
    });
  });

  it('label est toujours une string non vide', () => {
    const result = estimateWaitingTime('Yango', 5.35, -3.98);
    expect(typeof result.label).toBe('string');
    expect(result.label.length).toBeGreaterThan(0);
  });
});

describe('formatFreshness', () => {
  it('devrait retourner "À l\'instant" pour < 10 min', () => {
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const result = formatFreshness(fiveMinAgo);
    expect(result.label).toBe('À l\'instant');
    expect(result.isOld).toBe(false);
    expect(result.color).toBe('#64748B');
    expect(result.icon).toBe('🕐');
  });

  it('devrait retourner "Il y a X min" pour 10-30 min', () => {
    const now = new Date();
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();
    const result = formatFreshness(twentyMinAgo);
    expect(result.label).toMatch(/Il y a \d+ min/);
    expect(result.isOld).toBe(false);
    expect(result.color).toBe('#64748B');
  });

  it('devrait retourner "Peut avoir changé" pour 30-120 min', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const result = formatFreshness(oneHourAgo);
    expect(result.label).toMatch(/Peut avoir changé/);
    expect(result.isOld).toBe(true);
    expect(result.color).toBe('#F97316');
    expect(result.icon).toBe('⚠️');
  });

  it('devrait retourner "Données anciennes" pour > 2h', () => {
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
    const result = formatFreshness(threeHoursAgo);
    expect(result.label).toBe('Données anciennes');
    expect(result.isOld).toBe(true);
    expect(result.color).toBe('#EF4444');
    expect(result.icon).toBe('🔴');
  });
});

describe('formatPrice', () => {
  it('devrait formater 950 → "950"', () => {
    expect(formatPrice(950)).toBe('950');
  });

  it('devrait formater 1200 → "1 200"', () => {
    expect(formatPrice(1200)).toBe('1 200');
  });

  it('devrait formater 50000 → "50 000"', () => {
    expect(formatPrice(50000)).toBe('50 000');
  });

  it('devrait formater 1000000 → "1 000 000"', () => {
    expect(formatPrice(1000000)).toBe('1 000 000');
  });
});

describe('formatPriceRange', () => {
  it('devrait formater une fourchette de prix', () => {
    expect(formatPriceRange(1200, 1800)).toBe('1 200 à 1 800 XOF');
  });

  it('devrait gérer les petits montants', () => {
    expect(formatPriceRange(500, 800)).toBe('500 à 800 XOF');
  });

  it('devrait gérer les grands montants', () => {
    expect(formatPriceRange(25000, 35000)).toBe('25 000 à 35 000 XOF');
  });
});
