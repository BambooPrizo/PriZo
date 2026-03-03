// ============================================
// FONCTIONS UTILITAIRES - PriZo MVP
// ============================================

import { ABIDJAN_BOUNDS, PHONE_PATTERNS, PEAK_HOURS, HOLIDAYS_CI_2026, PRICE_LIMITS, CONTRIBUTOR_RANKS } from '../constants';

// 💰 FORMATAGE PRIX XOF
export const formatPrice = (price: number): string => {
  return price.toLocaleString('fr-CI') + ' XOF';
};

export const formatPriceRange = (min: number, max: number): string => {
  if (min === max) return formatPrice(min);
  return `${min.toLocaleString('fr-CI')} - ${max.toLocaleString('fr-CI')} XOF`;
};

// 📞 VALIDATION TÉLÉPHONE IVOIRIEN
export const validatePhoneCI = (phone: string): { valid: boolean; formatted: string; error?: string } => {
  // Nettoyer le numéro
  let cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
  
  // Ajouter le préfixe si absent
  if (!cleaned.startsWith('+225') && !cleaned.startsWith('225')) {
    cleaned = '+225' + cleaned;
  } else if (cleaned.startsWith('225')) {
    cleaned = '+' + cleaned;
  }
  
  // Vérifier le format
  const digitsOnly = cleaned.replace('+225', '');
  
  if (digitsOnly.length !== 10) {
    return { valid: false, formatted: cleaned, error: 'Le numéro doit contenir 10 chiffres' };
  }
  
  // Vérifier le préfixe opérateur
  const prefix = digitsOnly.substring(0, 2);
  if (!PHONE_PATTERNS.validPrefixes.includes(prefix)) {
    return { valid: false, formatted: cleaned, error: 'Préfixe opérateur non reconnu' };
  }
  
  // Formater joliment
  const formatted = `+225 ${digitsOnly.substring(0, 2)} ${digitsOnly.substring(2, 4)} ${digitsOnly.substring(4, 6)} ${digitsOnly.substring(6, 8)} ${digitsOnly.substring(8, 10)}`;
  
  return { valid: true, formatted };
};

// 📞 MASQUAGE TÉLÉPHONE POUR LOGS
export const maskPhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-]/g, '');
  if (cleaned.length < 8) return '***';
  return cleaned.substring(0, 6) + ' *** **';
};

// 🌍 VALIDATION COORDONNÉES GPS ABIDJAN
export const isInAbidjan = (lat: number, lng: number): boolean => {
  return (
    lat >= ABIDJAN_BOUNDS.lat.min &&
    lat <= ABIDJAN_BOUNDS.lat.max &&
    lng >= ABIDJAN_BOUNDS.lng.min &&
    lng <= ABIDJAN_BOUNDS.lng.max
  );
};

// 💰 VALIDATION PRIX
export const isValidPrice = (price: number): boolean => {
  return price >= PRICE_LIMITS.min && price <= PRICE_LIMITS.max;
};

// ⏰ DÉTECTION HEURE DE POINTE
export const isPeakHour = (date: Date = new Date()): boolean => {
  const hour = date.getHours();
  const isMorningPeak = hour >= PEAK_HOURS.morning.start && hour < PEAK_HOURS.morning.end;
  const isEveningPeak = hour >= PEAK_HOURS.evening.start && hour < PEAK_HOURS.evening.end;
  return isMorningPeak || isEveningPeak;
};

// 🎉 VÉRIFICATION JOUR FÉRIÉ
export const isHoliday = (date: Date = new Date()): boolean => {
  const dateStr = date.toISOString().split('T')[0];
  return HOLIDAYS_CI_2026.includes(dateStr as any);
};

// 🚦 MESSAGE HEURE DE POINTE
export const getPeakHourMessage = (): string | null => {
  if (isPeakHour()) {
    return '🚦 Heure de pointe — prix plus élevés';
  }
  return null;
};

// ⏱️ FORMATAGE "IL Y A X"
export const formatTimeAgo = (dateStr: string | Date): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin === 1) return 'Il y a 1 min';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return 'Il y a 1h';
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  
  return date.toLocaleDateString('fr-CI');
};

// 📊 CALCUL SCORE DE CONFIANCE
export const calculateConfidenceScore = (
  contributionsCount: number,
  averageAge: number, // en minutes
  variance: number // écart-type des prix
): number => {
  // Plus de contributions = meilleure confiance
  const countScore = Math.min(contributionsCount / 10, 1) * 0.4;
  
  // Données récentes = meilleure confiance
  const freshnessScore = Math.max(0, 1 - averageAge / 60) * 0.35;
  
  // Faible variance = meilleure confiance
  const varianceScore = Math.max(0, 1 - variance / 500) * 0.25;
  
  return Math.round((countScore + freshnessScore + varianceScore) * 100) / 100;
};

// 🏆 OBTENIR LE RANG CONTRIBUTEUR
export const getContributorRank = (points: number): { name: string; icon: string; nextRank?: { name: string; pointsNeeded: number } } => {
  let currentRank = CONTRIBUTOR_RANKS[0];
  
  for (const rank of CONTRIBUTOR_RANKS) {
    if (points >= rank.minPoints) {
      currentRank = rank;
    } else {
      return {
        name: currentRank.name,
        icon: currentRank.icon,
        nextRank: {
          name: rank.name,
          pointsNeeded: rank.minPoints - points,
        },
      };
    }
  }
  
  return { name: currentRank.name, icon: currentRank.icon };
};

// 🎨 BADGE CONFIANCE
export const getConfidenceBadge = (score: number): { label: string; color: string; bgColor: string } => {
  if (score >= 0.8) {
    return { label: 'Fiable', color: '#22C55E', bgColor: '#22C55E20' };
  } else if (score >= 0.5) {
    return { label: 'Indicatif', color: '#F97316', bgColor: '#F9731620' };
  }
  return { label: 'Estimation', color: '#6B7280', bgColor: '#6B728020' };
};

// 🛡️ SANITIZER TEXTE
export const sanitizeText = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
    .replace(/[<>\"'&]/g, '') // Supprimer les caractères dangereux
    .trim()
    .substring(0, 500); // Limiter la longueur
};

// 🔢 GÉNÉRER ID UNIQUE
export const generateUniqueId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 📍 CALCULER DISTANCE (Haversine)
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Arrondi à 1 décimale
};

// ⏱️ DEBOUNCE
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// 🔄 THROTTLE
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// 🔄 RETRY AVEC BACKOFF
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

// 📊 LOG SÉCURISÉ (masque les données sensibles)
export const secureLog = (message: string, data?: any): void => {
  if (__DEV__) {
    const sanitizedData = data ? JSON.parse(JSON.stringify(data, (key, value) => {
      if (['password', 'token', 'accessToken', 'refreshToken', 'jwt'].includes(key)) {
        return '[REDACTED]';
      }
      if (key === 'phone' && typeof value === 'string') {
        return maskPhone(value);
      }
      return value;
    })) : undefined;
    
    console.log(`[PriZo] ${message}`, sanitizedData || '');
  }
};

// 🔗 PARSER DEEP LINK
export const parseDeepLink = (url: string): { screen: string; params: Record<string, string> } | null => {
  try {
    const urlObj = new URL(url);
    const screen = urlObj.pathname.replace(/^\//, '');
    const params: Record<string, string> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return { screen, params };
  } catch {
    return null;
  }
};
