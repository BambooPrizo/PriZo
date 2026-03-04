// Données VTC Abidjan 2026 - Dataset de test

// Providers VTC disponibles à Abidjan
export const VTC_PROVIDERS = [
  {
    id: 'yango',
    name: 'Yango',
    company: 'Yandex (RU/Intl)',
    vehicleTypes: ['eco', 'confort', 'moto'],
    baseFare: '500-600 XOF/km',
    availability: ['Abidjan', 'Bouaké'],
    status: 'active',
    deeplink: 'yango://',
    popularity: 'high',
    color: '#FF4444',
  },
  {
    id: 'heetch',
    name: 'Heetch',
    company: 'Heetch (FR)',
    vehicleTypes: ['standard', 'moto'],
    baseFare: '600 XOF/km',
    availability: ['Abidjan'],
    status: 'active',
    deeplink: 'heetch://',
    popularity: 'high',
    color: '#8B5CF6',
  },
  {
    id: 'indrive',
    name: 'InDrive',
    company: 'InDrive (USA)',
    vehicleTypes: ['standard'],
    baseFare: 'Négociation libre',
    availability: ['Abidjan'],
    status: 'active',
    deeplink: 'indrive://',
    popularity: 'high',
    color: '#22C55E',
  },
  {
    id: 'warren',
    name: 'Warren Taxi',
    company: 'Warren (CI)',
    vehicleTypes: ['standard'],
    baseFare: 'Fixe par zone',
    availability: ['Abidjan'],
    status: 'active',
    deeplink: 'warrentaxi://',
    popularity: 'medium',
    color: '#F59E0B',
  },
  {
    id: 'taxijet',
    name: 'TaxiJet',
    company: 'TaxiJet (CI)',
    vehicleTypes: ['berline', 'luxe'],
    baseFare: '1000 XOF/km',
    availability: ['Abidjan'],
    status: 'active',
    deeplink: 'taxijet://',
    popularity: 'medium',
    color: '#3B82F6',
  },
];

// Zones d'Abidjan avec coordonnées
export const ZONES_ABIDJAN = {
  cocody: { name: 'Cocody', address: 'Cocody, Abidjan', lat: 5.3484, lng: -3.9913 },
  plateau: { name: 'Plateau', address: 'Plateau, Abidjan', lat: 5.3197, lng: -4.0167 },
  yopougon: { name: 'Yopougon', address: 'Yopougon, Abidjan', lat: 5.3483, lng: -4.0736 },
  marcory: { name: 'Marcory', address: 'Marcory, Abidjan', lat: 5.3021, lng: -3.9856 },
  abobo: { name: 'Abobo', address: 'Abobo, Abidjan', lat: 5.4167, lng: -4.0167 },
  adjame: { name: 'Adjamé', address: 'Adjamé, Abidjan', lat: 5.3500, lng: -4.0333 },
  treichville: { name: 'Treichville', address: 'Treichville, Abidjan', lat: 5.2923, lng: -4.0024 },
  koumassi: { name: 'Koumassi', address: 'Koumassi, Abidjan', lat: 5.2967, lng: -3.9567 },
  portBouet: { name: 'Port-Bouët', address: 'Port-Bouët, Abidjan', lat: 5.2567, lng: -3.9267 },
  bingerville: { name: 'Bingerville', address: 'Bingerville, Abidjan', lat: 5.3567, lng: -3.8833 },
  angre: { name: 'Angré', address: 'Angré, Cocody, Abidjan', lat: 5.3750, lng: -3.9700 },
  riviera: { name: 'Riviera', address: 'Riviera, Cocody, Abidjan', lat: 5.3650, lng: -3.9600 },
  aeroport: { name: 'Aéroport FHB', address: 'Aéroport Félix Houphouët-Boigny, Port-Bouët', lat: 5.2577, lng: -3.9290 },
};

// Dataset des trajets types avec tarifs réels
export const TRAJETS_TYPES = [
  {
    id: 'tr_001',
    zone_from: 'Cocody',
    zone_to: 'Plateau',
    from_lat: 5.3484,
    from_lng: -3.9913,
    to_lat: 5.3197,
    to_lng: -4.0167,
    distance_km: 6.8,
    duration_normal_min: 18,
    duration_peak_min: 45,
    tarifs: [
      { provider: 'Yango', vehicle_type: 'eco', price_min: 1200, price_max: 1500, price_peak_min: 2200, price_peak_max: 2800, currency: 'XOF', surge_multiplier_peak: 1.8, confidence_score: 0.95 },
      { provider: 'InDrive', vehicle_type: 'standard', price_min: 1000, price_max: 1200, price_peak_min: 1500, price_peak_max: 1800, currency: 'XOF', surge_multiplier_peak: 1.4, confidence_score: 0.80 },
      { provider: 'Warren Taxi', vehicle_type: 'standard', price_min: 2000, price_max: 2000, price_peak_min: 2500, price_peak_max: 2500, currency: 'XOF', surge_multiplier_peak: 1.25, confidence_score: 1.0 },
    ],
  },
  {
    id: 'tr_002',
    zone_from: 'Yopougon',
    zone_to: 'Plateau',
    from_lat: 5.3483,
    from_lng: -4.0736,
    to_lat: 5.3197,
    to_lng: -4.0167,
    distance_km: 11.5,
    duration_normal_min: 25,
    duration_peak_min: 75,
    tarifs: [
      { provider: 'Yango', vehicle_type: 'eco', price_min: 2500, price_max: 3000, price_peak_min: 4500, price_peak_max: 5500, currency: 'XOF', surge_multiplier_peak: 1.9, confidence_score: 0.92 },
      { provider: 'Heetch', vehicle_type: 'standard', price_min: 2800, price_max: 3500, price_peak_min: 4000, price_peak_max: 4800, currency: 'XOF', surge_multiplier_peak: 1.5, confidence_score: 0.88 },
      { provider: 'InDrive', vehicle_type: 'standard', price_min: 2200, price_max: 2800, price_peak_min: 3500, price_peak_max: 4200, currency: 'XOF', surge_multiplier_peak: 1.5, confidence_score: 0.75 },
    ],
  },
  {
    id: 'tr_003',
    zone_from: 'Marcory',
    zone_to: 'Cocody',
    from_lat: 5.3021,
    from_lng: -3.9856,
    to_lat: 5.3484,
    to_lng: -3.9913,
    distance_km: 8.2,
    duration_normal_min: 20,
    duration_peak_min: 50,
    tarifs: [
      { provider: 'Yango', vehicle_type: 'eco', price_min: 1500, price_max: 2000, price_peak_min: 3000, price_peak_max: 4000, currency: 'XOF', surge_multiplier_peak: 2.1, confidence_score: 0.89 },
      { provider: 'Heetch', vehicle_type: 'standard', price_min: 1800, price_max: 2200, price_peak_min: 2800, price_peak_max: 3500, currency: 'XOF', surge_multiplier_peak: 1.6, confidence_score: 0.85 },
    ],
  },
  {
    id: 'tr_004',
    zone_from: 'Abobo',
    zone_to: 'Adjamé',
    from_lat: 5.4167,
    from_lng: -4.0167,
    to_lat: 5.3500,
    to_lng: -4.0333,
    distance_km: 7.5,
    duration_normal_min: 15,
    duration_peak_min: 40,
    tarifs: [
      { provider: 'Yango', vehicle_type: 'eco', price_min: 1200, price_max: 1600, price_peak_min: 2000, price_peak_max: 2600, currency: 'XOF', surge_multiplier_peak: 1.7, confidence_score: 0.94 },
      { provider: 'InDrive', vehicle_type: 'standard', price_min: 900, price_max: 1300, price_peak_min: 1400, price_peak_max: 1900, currency: 'XOF', surge_multiplier_peak: 1.5, confidence_score: 0.82 },
    ],
  },
  {
    id: 'tr_005',
    zone_from: 'Angré',
    zone_to: 'Plateau',
    from_lat: 5.3750,
    from_lng: -3.9700,
    to_lat: 5.3197,
    to_lng: -4.0167,
    distance_km: 9.0,
    duration_normal_min: 22,
    duration_peak_min: 55,
    tarifs: [
      { provider: 'Yango', vehicle_type: 'eco', price_min: 2800, price_max: 3500, price_peak_min: 4500, price_peak_max: 5800, currency: 'XOF', surge_multiplier_peak: 1.65, confidence_score: 0.89 },
      { provider: 'Heetch', vehicle_type: 'standard', price_min: 2600, price_max: 3200, price_peak_min: 4000, price_peak_max: 5000, currency: 'XOF', surge_multiplier_peak: 1.55, confidence_score: 0.85 },
    ],
  },
  {
    id: 'tr_006',
    zone_from: 'Riviera',
    zone_to: 'Treichville',
    from_lat: 5.3650,
    from_lng: -3.9600,
    to_lat: 5.2923,
    to_lng: -4.0024,
    distance_km: 10.5,
    duration_normal_min: 25,
    duration_peak_min: 60,
    tarifs: [
      { provider: 'Yango', vehicle_type: 'eco', price_min: 2200, price_max: 2800, price_peak_min: 3800, price_peak_max: 4800, currency: 'XOF', surge_multiplier_peak: 1.75, confidence_score: 0.87 },
      { provider: 'Heetch', vehicle_type: 'standard', price_min: 2500, price_max: 3000, price_peak_min: 4000, price_peak_max: 4800, currency: 'XOF', surge_multiplier_peak: 1.6, confidence_score: 0.83 },
      { provider: 'Warren Taxi', vehicle_type: 'standard', price_min: 3500, price_max: 3500, price_peak_min: 4000, price_peak_max: 4000, currency: 'XOF', surge_multiplier_peak: 1.15, confidence_score: 1.0 },
    ],
  },
  {
    id: 'tr_007',
    zone_from: 'Cocody',
    zone_to: 'Aéroport FHB',
    from_lat: 5.3484,
    from_lng: -3.9913,
    to_lat: 5.2577,
    to_lng: -3.9290,
    distance_km: 18.5,
    duration_normal_min: 30,
    duration_peak_min: 60,
    tarifs: [
      { provider: 'TaxiJet', vehicle_type: 'premium', price_min: 8000, price_max: 10000, price_peak_min: 10000, price_peak_max: 12000, currency: 'XOF', surge_multiplier_peak: 1.2, confidence_score: 0.98 },
      { provider: 'Warren Taxi', vehicle_type: 'standard', price_min: 5000, price_max: 5000, price_peak_min: 6000, price_peak_max: 6000, currency: 'XOF', surge_multiplier_peak: 1.2, confidence_score: 1.0 },
      { provider: 'Yango', vehicle_type: 'confort', price_min: 6500, price_max: 8500, price_peak_min: 9000, price_peak_max: 12000, currency: 'XOF', surge_multiplier_peak: 1.4, confidence_score: 0.90 },
    ],
  },
  {
    id: 'tr_008',
    zone_from: 'Koumassi',
    zone_to: 'Plateau',
    from_lat: 5.2967,
    from_lng: -3.9567,
    to_lat: 5.3197,
    to_lng: -4.0167,
    distance_km: 7.8,
    duration_normal_min: 18,
    duration_peak_min: 45,
    tarifs: [
      { provider: 'Yango', vehicle_type: 'eco', price_min: 1400, price_max: 1900, price_peak_min: 2600, price_peak_max: 3400, currency: 'XOF', surge_multiplier_peak: 1.85, confidence_score: 0.91 },
      { provider: 'Heetch', vehicle_type: 'standard', price_min: 1600, price_max: 2100, price_peak_min: 2400, price_peak_max: 3200, currency: 'XOF', surge_multiplier_peak: 1.5, confidence_score: 0.86 },
    ],
  },
  {
    id: 'tr_009',
    zone_from: 'Bingerville',
    zone_to: 'Cocody',
    from_lat: 5.3567,
    from_lng: -3.8833,
    to_lat: 5.3484,
    to_lng: -3.9913,
    distance_km: 12.0,
    duration_normal_min: 25,
    duration_peak_min: 50,
    tarifs: [
      { provider: 'Yango', vehicle_type: 'eco', price_min: 2500, price_max: 3200, price_peak_min: 4000, price_peak_max: 5200, currency: 'XOF', surge_multiplier_peak: 1.6, confidence_score: 0.84 },
      { provider: 'InDrive', vehicle_type: 'standard', price_min: 2000, price_max: 2600, price_peak_min: 3200, price_peak_max: 4000, currency: 'XOF', surge_multiplier_peak: 1.55, confidence_score: 0.72 },
    ],
  },
  {
    id: 'tr_010',
    zone_from: 'Port-Bouët',
    zone_to: 'Plateau',
    from_lat: 5.2567,
    from_lng: -3.9267,
    to_lat: 5.3197,
    to_lng: -4.0167,
    distance_km: 14.0,
    duration_normal_min: 30,
    duration_peak_min: 65,
    tarifs: [
      { provider: 'Yango', vehicle_type: 'eco', price_min: 3000, price_max: 3800, price_peak_min: 5000, price_peak_max: 6500, currency: 'XOF', surge_multiplier_peak: 1.7, confidence_score: 0.88 },
      { provider: 'TaxiJet', vehicle_type: 'berline', price_min: 5000, price_max: 6000, price_peak_min: 6500, price_peak_max: 8000, currency: 'XOF', surge_multiplier_peak: 1.35, confidence_score: 0.95 },
    ],
  },
  {
    id: 'tr_011',
    zone_from: 'Adjamé',
    zone_to: 'Cocody',
    from_lat: 5.3500,
    from_lng: -4.0333,
    to_lat: 5.3484,
    to_lng: -3.9913,
    distance_km: 5.5,
    duration_normal_min: 15,
    duration_peak_min: 35,
    tarifs: [
      { provider: 'Yango', vehicle_type: 'eco', price_min: 1000, price_max: 1400, price_peak_min: 1800, price_peak_max: 2500, currency: 'XOF', surge_multiplier_peak: 1.8, confidence_score: 0.93 },
      { provider: 'Heetch', vehicle_type: 'standard', price_min: 1200, price_max: 1600, price_peak_min: 1900, price_peak_max: 2600, currency: 'XOF', surge_multiplier_peak: 1.6, confidence_score: 0.89 },
      { provider: 'InDrive', vehicle_type: 'standard', price_min: 800, price_max: 1100, price_peak_min: 1200, price_peak_max: 1700, currency: 'XOF', surge_multiplier_peak: 1.5, confidence_score: 0.78 },
    ],
  },
  {
    id: 'tr_012',
    zone_from: 'Treichville',
    zone_to: 'Aéroport FHB',
    from_lat: 5.2923,
    from_lng: -4.0024,
    to_lat: 5.2577,
    to_lng: -3.9290,
    distance_km: 9.5,
    duration_normal_min: 20,
    duration_peak_min: 40,
    tarifs: [
      { provider: 'TaxiJet', vehicle_type: 'premium', price_min: 6000, price_max: 7500, price_peak_min: 7500, price_peak_max: 9500, currency: 'XOF', surge_multiplier_peak: 1.25, confidence_score: 0.97 },
      { provider: 'Warren Taxi', vehicle_type: 'standard', price_min: 4000, price_max: 4000, price_peak_min: 5000, price_peak_max: 5000, currency: 'XOF', surge_multiplier_peak: 1.25, confidence_score: 1.0 },
      { provider: 'Yango', vehicle_type: 'confort', price_min: 4500, price_max: 6000, price_peak_min: 6500, price_peak_max: 8500, currency: 'XOF', surge_multiplier_peak: 1.4, confidence_score: 0.86 },
    ],
  },
];

// Trajets fréquents pour l'écran d'accueil
export const FREQUENT_ROUTES = [
  {
    label: 'Cocody → Plateau',
    from: ZONES_ABIDJAN.cocody,
    to: ZONES_ABIDJAN.plateau,
    trajetId: 'tr_001',
  },
  {
    label: 'Yopougon → Plateau',
    from: ZONES_ABIDJAN.yopougon,
    to: ZONES_ABIDJAN.plateau,
    trajetId: 'tr_002',
  },
  {
    label: 'Abobo → Adjamé',
    from: ZONES_ABIDJAN.abobo,
    to: ZONES_ABIDJAN.adjame,
    trajetId: 'tr_004',
  },
  {
    label: 'Cocody → Aéroport',
    from: ZONES_ABIDJAN.cocody,
    to: ZONES_ABIDJAN.aeroport,
    trajetId: 'tr_007',
  },
  {
    label: 'Angré → Plateau',
    from: ZONES_ABIDJAN.angre,
    to: ZONES_ABIDJAN.plateau,
    trajetId: 'tr_005',
  },
  {
    label: 'Riviera → Treichville',
    from: ZONES_ABIDJAN.riviera,
    to: ZONES_ABIDJAN.treichville,
    trajetId: 'tr_006',
  },
  {
    label: 'Marcory → Cocody',
    from: ZONES_ABIDJAN.marcory,
    to: ZONES_ABIDJAN.cocody,
    trajetId: 'tr_003',
  },
  {
    label: 'Adjamé → Cocody',
    from: ZONES_ABIDJAN.adjame,
    to: ZONES_ABIDJAN.cocody,
    trajetId: 'tr_011',
  },
];

// Contributions récentes simulées
export const RECENT_CONTRIBUTIONS = [
  { provider: 'Yango', price: 1350, zone_from: 'Cocody', zone_to: 'Plateau', time: '3 min', vehicle_type: 'eco' },
  { provider: 'InDrive', price: 1100, zone_from: 'Abobo', zone_to: 'Adjamé', time: '8 min', vehicle_type: 'standard' },
  { provider: 'Heetch', price: 3200, zone_from: 'Yopougon', zone_to: 'Plateau', time: '12 min', vehicle_type: 'standard' },
  { provider: 'Warren Taxi', price: 5000, zone_from: 'Cocody', zone_to: 'Aéroport FHB', time: '18 min', vehicle_type: 'standard' },
  { provider: 'TaxiJet', price: 9000, zone_from: 'Plateau', zone_to: 'Aéroport FHB', time: '25 min', vehicle_type: 'premium' },
];

// Fonction pour vérifier si c'est une heure de pointe
export const isPeakHour = (): boolean => {
  const hour = new Date().getHours();
  return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
};

// Fonction pour obtenir les prix d'un trajet
export const getPricesForRoute = (fromZone: string, toZone: string) => {
  const trajet = TRAJETS_TYPES.find(
    (t) =>
      t.zone_from.toLowerCase() === fromZone.toLowerCase() &&
      t.zone_to.toLowerCase() === toZone.toLowerCase()
  );

  if (!trajet) {
    // Retourne des données par défaut si trajet non trouvé
    return null;
  }

  const isPeak = isPeakHour();
  const provider = VTC_PROVIDERS.find((p) => p.name === trajet.tarifs[0]?.provider);

  return {
    trajet,
    isPeak,
    results: trajet.tarifs.map((tarif) => ({
      provider: tarif.provider,
      vehicle_type: tarif.vehicle_type as 'moto' | 'standard' | 'premium',
      price_min: isPeak ? tarif.price_peak_min : tarif.price_min,
      price_max: isPeak ? tarif.price_peak_max : tarif.price_max,
      currency: tarif.currency,
      deeplink: VTC_PROVIDERS.find((p) => p.name === tarif.provider)?.deeplink || '',
      price_source: 'crowdsourced' as const,
      last_updated: new Date().toISOString(),
      confidence_score: tarif.confidence_score,
      surge_active: isPeak,
      surge_multiplier: isPeak ? tarif.surge_multiplier_peak : 1,
    })),
    meta: {
      distance_km: trajet.distance_km,
      duration_min: isPeak ? trajet.duration_peak_min : trajet.duration_normal_min,
      is_peak_hour: isPeak,
      traffic: isPeak ? 'heavy' : 'normal',
    },
  };
};

// Fonction pour trouver le trajet le plus proche par coordonnées
export const findClosestRoute = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) => {
  let closestTrajet = TRAJETS_TYPES[0];
  let minDistance = Infinity;

  for (const trajet of TRAJETS_TYPES) {
    const distance =
      Math.abs(trajet.from_lat - fromLat) +
      Math.abs(trajet.from_lng - fromLng) +
      Math.abs(trajet.to_lat - toLat) +
      Math.abs(trajet.to_lng - toLng);

    if (distance < minDistance) {
      minDistance = distance;
      closestTrajet = trajet;
    }
  }

  return closestTrajet;
};

export default {
  VTC_PROVIDERS,
  ZONES_ABIDJAN,
  TRAJETS_TYPES,
  FREQUENT_ROUTES,
  RECENT_CONTRIBUTIONS,
  isPeakHour,
  getPricesForRoute,
  findClosestRoute,
};
