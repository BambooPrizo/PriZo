// ============================================
// CONSTANTES GLOBALES - PriZo MVP
// ============================================

// 🎨 COULEURS
export const COLORS = {
  // Couleurs principales
  primary: '#F97316',
  primaryLight: '#FB923C',
  primaryDark: '#EA580C',
  
  // Arrière-plans (thème blanc)
  background: '#FFFFFF',
  backgroundLight: '#F8FAFC',
  backgroundCard: '#FFFFFF',
  surface: '#F1F5F9',
  
  // Textes
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  
  // États
  success: '#22C55E',
  successLight: '#22C55E20',
  warning: '#F59E0B',
  warningLight: '#F59E0B20',
  error: '#EF4444',
  errorLight: '#EF444420',
  info: '#3B82F6',
  infoLight: '#3B82F620',
  
  // Providers VTC
  yango: '#FF4444',
  heetch: '#8B5CF6',
  indrive: '#22C55E',
  warren: '#F59E0B',
  taxijet: '#3B82F6',
  
  // Autres
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  border: '#E2E8F0',
} as const;

// 📏 ESPACEMENTS
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// 🔤 TYPOGRAPHIE
export const TYPOGRAPHY = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// 📐 RAYONS
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// 🎯 ZONES CLIQUABLES MINIMUM (44x44 pour accessibilité)
export const TOUCH_TARGET = {
  minSize: 44,
} as const;

// 🕐 TIMING
export const TIMING = {
  debounce: 300,
  apiTimeout: 10000,
  cacheExpiry: 600000, // 10 minutes
  retryDelay: 1000,
  maxRetries: 2,
  tokenRefreshBuffer: 300000, // 5 minutes avant expiration
  sessionTimeout: 2592000000, // 30 jours
} as const;

// 🌍 LIMITES GÉOGRAPHIQUES ABIDJAN
export const ABIDJAN_BOUNDS = {
  lat: { min: 5.1, max: 5.5 },
  lng: { min: -4.3, max: -3.7 },
} as const;

// 💰 LIMITES DE PRIX (XOF)
export const PRICE_LIMITS = {
  min: 100,
  max: 50000,
} as const;

// 📞 PATTERNS TÉLÉPHONE CÔTE D'IVOIRE
export const PHONE_PATTERNS = {
  // MTN CI: 05, 06, 07, 46, 56, 57, 66, 67, 76
  // Orange CI: 01, 07, 08, 09, 47, 48, 49, 57, 58, 59, 77, 78, 79
  // Moov CI: 01, 02, 40, 41, 42, 51, 52, 53, 70, 71, 72
  prefix: '+225',
  regex: /^(\+225)?[0-9]{10}$/,
  validPrefixes: ['01', '02', '05', '06', '07', '08', '09', '40', '41', '42', '45', '46', '47', '48', '49', '51', '52', '53', '55', '56', '57', '58', '59', '66', '67', '70', '71', '72', '76', '77', '78', '79'],
} as const;

// 🚗 PROVIDERS VTC
export const VTC_PROVIDER_IDS = {
  yango: 'yango',
  heetch: 'heetch',
  indrive: 'indrive',
  warren: 'warren',
  taxijet: 'taxijet',
} as const;

// ⏰ HEURES DE POINTE ABIDJAN
export const PEAK_HOURS = {
  morning: { start: 7, end: 9 },
  evening: { start: 17, end: 20 },
} as const;

// 🎉 JOURS FÉRIÉS CÔTE D'IVOIRE 2026
export const HOLIDAYS_CI_2026 = [
  '2026-01-01', // Jour de l'An
  '2026-04-06', // Lundi de Pâques
  '2026-05-01', // Fête du Travail
  '2026-05-14', // Ascension
  '2026-05-25', // Lundi de Pentecôte
  '2026-08-07', // Fête de l'Indépendance
  '2026-08-15', // Assomption
  '2026-11-01', // Toussaint
  '2026-11-15', // Journée Nationale de la Paix
  '2026-12-25', // Noël
  // Fêtes musulmanes (dates approximatives)
  '2026-03-30', // Eid al-Fitr (fin Ramadan)
  '2026-06-06', // Eid al-Adha (Tabaski)
  '2026-06-27', // Mawlid (Naissance du Prophète)
] as const;

// 📊 ANALYTICS EVENTS
export const ANALYTICS_EVENTS = {
  PRICE_SEARCHED: 'price_searched',
  VTC_REDIRECTED: 'vtc_redirected',
  PRICE_CONTRIBUTED: 'price_contributed',
  ALERT_CREATED: 'alert_created',
  LOGIN_SUCCESS: 'login_success',
  SIGNUP_SUCCESS: 'signup_success',
  SEARCH_COMPLETED: 'search_completed',
  OFFLINE_MODE_ENTERED: 'offline_mode_entered',
} as const;

// 🏆 GAMIFICATION - RANGS CONTRIBUTEURS
export const CONTRIBUTOR_RANKS = [
  { name: 'Débutant', minPoints: 0, icon: '🌱' },
  { name: 'Explorateur', minPoints: 50, icon: '🚶' },
  { name: 'Contributeur', minPoints: 150, icon: '⭐' },
  { name: 'Expert', minPoints: 500, icon: '🏅' },
  { name: 'Champion', minPoints: 1000, icon: '🏆' },
  { name: 'Légende', minPoints: 2500, icon: '👑' },
] as const;

// 💎 POINTS GAMIFICATION
export const POINTS = {
  contribution: 10,
  contributionVerified: 15,
  dailyLogin: 5,
  firstContribution: 25,
  referral: 50,
} as const;

// 📱 MESSAGES UX (Français ivoirien)
export const MESSAGES = {
  // Loading
  loading: {
    prices: 'Recherche des meilleurs prix...',
    generic: 'Un instant...',
    contribution: 'Envoi de votre contribution...',
  },
  // Empty states
  empty: {
    prices: 'Aucun prix trouvé pour ce trajet.\nSoyez le premier à contribuer !',
    history: 'Aucun trajet récent.\nFaites votre première recherche !',
    alerts: 'Aucune alerte configurée.\nCréez-en une pour être notifié des bons prix !',
    contributions: 'Vous n\'avez pas encore contribué.\nPartagez vos prix de course !',
  },
  // Errors
  errors: {
    network: 'Connexion perdue. On utilise les derniers prix connus.',
    server: 'Nos serveurs font une pause. Réessayez dans un instant.',
    validation: 'Vérifiez les informations saisies.',
    zoneNotCovered: 'Zone non couverte pour l\'instant.',
    priceOutOfRange: 'Le prix doit être entre 100 et 50 000 XOF.',
    invalidRoute: 'Ce trajet semble invalide.',
    sessionExpired: 'Votre session a expiré. Reconnectez-vous.',
  },
  // Success
  success: {
    contribution: 'Merci ! Votre contribution a été enregistrée. +10 points !',
    alertCreated: 'Alerte créée ! On vous prévient dès que le prix baisse.',
    login: 'Content de vous revoir !',
  },
  // Offline
  offline: {
    banner: 'Données hors ligne',
    hint: (minutes: number) => `Dernière mise à jour il y a ${minutes} min`,
  },
  // Peak hours
  peakHours: {
    active: '🚦 Heure de pointe — prix plus élevés',
    inactive: '✨ Heure creuse — tarifs normaux',
  },
} as const;

// 🔗 DEEP LINKS
export const DEEP_LINKS = {
  scheme: 'prizo',
  results: 'prizo://results',
  contribute: 'prizo://contribute',
  alerts: 'prizo://alerts',
} as const;

// 📦 STORAGE KEYS
export const STORAGE_KEYS = {
  authToken: 'auth_token',
  refreshToken: 'refresh_token',
  cachedPrices: 'cached_prices',
  recentSearches: 'recent_searches',
  favoriteRoutes: 'favorite_routes',
  userPreferences: 'user_preferences',
  lastCacheUpdate: 'last_cache_update',
  offlineData: 'offline_data',
} as const;

// 🔢 LIMITES
export const LIMITS = {
  recentSearches: 10,
  favoriteRoutes: 5,
  historyItems: 50,
  maxContributionsPerDay: 20,
} as const;
