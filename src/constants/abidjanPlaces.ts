// ============================================
// BASE DE DONNÉES LANDMARKS ABIDJAN
// ============================================

export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  icon: string;
  keywords?: string[];
}

export type PlaceCategory = 
  | 'mall'
  | 'hospital'
  | 'university'
  | 'administration'
  | 'residential'
  | 'transport'
  | 'hotel'
  | 'religious'
  | 'restaurant'
  | 'landmark';

export const PLACE_ICONS: Record<PlaceCategory, string> = {
  mall: '🏪',
  hospital: '🏥',
  university: '🏫',
  administration: '🏛️',
  residential: '🏠',
  transport: '🚉',
  hotel: '🏨',
  religious: '⛪',
  restaurant: '🍽️',
  landmark: '📍',
};

// ============================================
// CENTRES COMMERCIAUX
// ============================================
export const MALLS: Place[] = [
  {
    id: 'playcenter',
    name: 'Playcenter',
    address: 'Boulevard VGE, Treichville, Abidjan',
    lat: 5.2942,
    lng: -3.9999,
    category: 'mall',
    icon: '🏪',
    keywords: ['centre commercial', 'shopping', 'treichville'],
  },
  {
    id: 'cap_sud',
    name: 'Cap Sud',
    address: 'Boulevard VGE, Marcory, Abidjan',
    lat: 5.2979,
    lng: -3.9876,
    category: 'mall',
    icon: '🏪',
    keywords: ['centre commercial', 'marcory', 'shopping'],
  },
  {
    id: 'cosmos_yopougon',
    name: 'Cosmos Yopougon',
    address: 'Yopougon Maroc, Abidjan',
    lat: 5.3499,
    lng: -4.0821,
    category: 'mall',
    icon: '🏪',
    keywords: ['centre commercial', 'yopougon', 'cosmos'],
  },
  {
    id: 'geant_casino',
    name: 'Géant Casino Marcory',
    address: 'Zone 4, Marcory, Abidjan',
    lat: 5.2965,
    lng: -3.9871,
    category: 'mall',
    icon: '🏪',
    keywords: ['supermarché', 'casino', 'marcory'],
  },
  {
    id: 'playce_marcory',
    name: 'PlaYce Marcory',
    address: 'Zone 4, Marcory, Abidjan',
    lat: 5.2971,
    lng: -3.9867,
    category: 'mall',
    icon: '🏪',
    keywords: ['centre commercial', 'playce', 'marcory'],
  },
  {
    id: 'sococe_yopougon',
    name: 'Sococé Yopougon',
    address: 'Yopougon Sicogi, Abidjan',
    lat: 5.3401,
    lng: -4.0699,
    category: 'mall',
    icon: '🏪',
    keywords: ['supermarché', 'sococe', 'yopougon'],
  },
  {
    id: 'palace_cocody',
    name: 'Palace Cocody',
    address: 'Riviera Palmeraie, Cocody, Abidjan',
    lat: 5.3601,
    lng: -3.9823,
    category: 'mall',
    icon: '🏪',
    keywords: ['centre commercial', 'palace', 'cocody'],
  },
];

// ============================================
// HÔPITAUX ET CLINIQUES
// ============================================
export const HOSPITALS: Place[] = [
  {
    id: 'chu_cocody',
    name: 'CHU de Cocody',
    address: 'Boulevard de l\'Université, Cocody, Abidjan',
    lat: 5.3706,
    lng: -3.9697,
    category: 'hospital',
    icon: '🏥',
    keywords: ['hôpital', 'urgences', 'chu', 'cocody'],
  },
  {
    id: 'chu_treichville',
    name: 'CHU de Treichville',
    address: 'Avenue Crosson Duplessis, Treichville, Abidjan',
    lat: 5.2888,
    lng: -4.0087,
    category: 'hospital',
    icon: '🏥',
    keywords: ['hôpital', 'urgences', 'chu', 'treichville'],
  },
  {
    id: 'pisam',
    name: 'PISAM',
    address: 'Cocody Riviera Golf, Abidjan',
    lat: 5.3604,
    lng: -3.9756,
    category: 'hospital',
    icon: '🏥',
    keywords: ['clinique', 'pisam', 'sainte anne marie', 'cocody'],
  },
  {
    id: 'clinique_avicenne',
    name: 'Clinique Avicenne',
    address: 'Cocody Deux Plateaux, Abidjan',
    lat: 5.3612,
    lng: -3.9741,
    category: 'hospital',
    icon: '🏥',
    keywords: ['clinique', 'avicenne', 'cocody'],
  },
  {
    id: 'hopital_militaire',
    name: 'Hôpital Militaire',
    address: 'Plateau, Abidjan',
    lat: 5.3197,
    lng: -4.0167,
    category: 'hospital',
    icon: '🏥',
    keywords: ['hôpital', 'militaire', 'plateau', 'hia'],
  },
];

// ============================================
// UNIVERSITÉS ET ÉCOLES
// ============================================
export const UNIVERSITIES: Place[] = [
  {
    id: 'ufhb',
    name: 'Université Félix Houphouët-Boigny',
    address: 'Cocody, Abidjan',
    lat: 5.3464,
    lng: -3.9889,
    category: 'university',
    icon: '🏫',
    keywords: ['université', 'ufhb', 'cocody', 'fac'],
  },
  {
    id: 'inp_hb',
    name: 'Institut National Polytechnique',
    address: 'Cocody, Abidjan',
    lat: 5.3701,
    lng: -3.9701,
    category: 'university',
    icon: '🏫',
    keywords: ['inp', 'polytechnique', 'cocody'],
  },
  {
    id: 'lycee_classique',
    name: 'Lycée Classique d\'Abidjan',
    address: 'Cocody, Abidjan',
    lat: 5.3589,
    lng: -3.9912,
    category: 'university',
    icon: '🏫',
    keywords: ['lycée', 'classique', 'cocody'],
  },
];

// ============================================
// ADMINISTRATIONS ET INSTITUTIONS
// ============================================
export const ADMINISTRATIONS: Place[] = [
  {
    id: 'primature',
    name: 'Primature',
    address: 'Boulevard Angoulvant, Plateau, Abidjan',
    lat: 5.3197,
    lng: -4.0167,
    category: 'administration',
    icon: '🏛️',
    keywords: ['primature', 'premier ministre', 'plateau'],
  },
  {
    id: 'mairie_plateau',
    name: 'Mairie du Plateau',
    address: 'Boulevard de la République, Plateau, Abidjan',
    lat: 5.3229,
    lng: -4.0198,
    category: 'administration',
    icon: '🏛️',
    keywords: ['mairie', 'plateau', 'administration'],
  },
  {
    id: 'dgi',
    name: 'Direction Générale des Impôts',
    address: 'Plateau, Abidjan',
    lat: 5.3211,
    lng: -4.0176,
    category: 'administration',
    icon: '🏛️',
    keywords: ['impôts', 'dgi', 'plateau'],
  },
  {
    id: 'cnps_plateau',
    name: 'CNPS Plateau',
    address: 'Avenue Lamblin, Plateau, Abidjan',
    lat: 5.3204,
    lng: -4.0162,
    category: 'administration',
    icon: '🏛️',
    keywords: ['cnps', 'sécurité sociale', 'plateau'],
  },
];

// ============================================
// ZONES RÉSIDENTIELLES PRÉCISES
// ============================================
export const RESIDENTIAL: Place[] = [
  {
    id: 'riviera_golf',
    name: 'Riviera Golf',
    address: 'Riviera Golf, Cocody, Abidjan',
    lat: 5.3843,
    lng: -3.9456,
    category: 'residential',
    icon: '🏠',
    keywords: ['riviera', 'golf', 'cocody'],
  },
  {
    id: 'riviera_2',
    name: 'Riviera 2',
    address: 'Riviera 2, Cocody, Abidjan',
    lat: 5.3801,
    lng: -3.9512,
    category: 'residential',
    icon: '🏠',
    keywords: ['riviera', '2', 'cocody'],
  },
  {
    id: 'riviera_3',
    name: 'Riviera 3',
    address: 'Riviera 3, Cocody, Abidjan',
    lat: 5.3756,
    lng: -3.9498,
    category: 'residential',
    icon: '🏠',
    keywords: ['riviera', '3', 'cocody'],
  },
  {
    id: 'deux_plateaux_vallon',
    name: 'Deux Plateaux Vallon',
    address: 'Cocody Deux Plateaux Vallon, Abidjan',
    lat: 5.3812,
    lng: -3.9634,
    category: 'residential',
    icon: '🏠',
    keywords: ['deux plateaux', 'vallon', 'cocody'],
  },
  {
    id: 'angre_8eme',
    name: 'Angré 8ème tranche',
    address: 'Angré 8ème tranche, Cocody, Abidjan',
    lat: 5.4012,
    lng: -3.9523,
    category: 'residential',
    icon: '🏠',
    keywords: ['angré', '8ème', 'cocody'],
  },
  {
    id: 'angre_chateau',
    name: 'Angré Château',
    address: 'Angré Château, Cocody, Abidjan',
    lat: 5.3967,
    lng: -3.9545,
    category: 'residential',
    icon: '🏠',
    keywords: ['angré', 'château', 'cocody'],
  },
  {
    id: 'cocody_ambassades',
    name: 'Cocody Ambassades',
    address: 'Cocody Ambassades, Abidjan',
    lat: 5.3623,
    lng: -3.9698,
    category: 'residential',
    icon: '🏠',
    keywords: ['ambassades', 'cocody'],
  },
  {
    id: 'abatta',
    name: 'Abatta',
    address: 'Abatta, Cocody, Abidjan',
    lat: 5.4234,
    lng: -3.9012,
    category: 'residential',
    icon: '🏠',
    keywords: ['abatta', 'cocody'],
  },
  {
    id: 'bietry_village',
    name: 'Biétry Village',
    address: 'Biétry, Marcory, Abidjan',
    lat: 5.2923,
    lng: -3.9756,
    category: 'residential',
    icon: '🏠',
    keywords: ['biétry', 'marcory'],
  },
  {
    id: 'zone_4_bord_mer',
    name: 'Zone 4 Bord de Mer',
    address: 'Zone 4, Marcory, Abidjan',
    lat: 5.2867,
    lng: -4.0034,
    category: 'residential',
    icon: '🏠',
    keywords: ['zone 4', 'bord de mer', 'marcory'],
  },
  {
    id: 'koumassi_remblai',
    name: 'Koumassi Remblai',
    address: 'Koumassi Remblai, Abidjan',
    lat: 5.2934,
    lng: -3.9823,
    category: 'residential',
    icon: '🏠',
    keywords: ['koumassi', 'remblai'],
  },
  {
    id: 'vridi_canal',
    name: 'Vridi Canal',
    address: 'Vridi, Port-Bouët, Abidjan',
    lat: 5.2534,
    lng: -3.9456,
    category: 'residential',
    icon: '🏠',
    keywords: ['vridi', 'canal', 'port-bouët'],
  },
  {
    id: 'port_bouet_village',
    name: 'Port-Bouët Village',
    address: 'Port-Bouët, Abidjan',
    lat: 5.2456,
    lng: -3.9234,
    category: 'residential',
    icon: '🏠',
    keywords: ['port-bouët', 'village'],
  },
  {
    id: 'adjame_liberte',
    name: 'Adjamé Liberté',
    address: 'Adjamé Liberté, Abidjan',
    lat: 5.3534,
    lng: -4.0234,
    category: 'residential',
    icon: '🏠',
    keywords: ['adjamé', 'liberté'],
  },
  {
    id: 'williamsville',
    name: 'Williamsville',
    address: 'Williamsville, Adjamé, Abidjan',
    lat: 5.3467,
    lng: -4.0123,
    category: 'residential',
    icon: '🏠',
    keywords: ['williamsville', 'adjamé'],
  },
  {
    id: 'abobo_baoule',
    name: 'Abobo Baoulé',
    address: 'Abobo Baoulé, Abidjan',
    lat: 5.4123,
    lng: -4.0234,
    category: 'residential',
    icon: '🏠',
    keywords: ['abobo', 'baoulé'],
  },
];

// ============================================
// TRANSPORTS ET CARREFOURS
// ============================================
export const TRANSPORTS: Place[] = [
  {
    id: 'aeroport_fhb',
    name: 'Aéroport FHB International',
    address: 'Port-Bouët, Abidjan',
    lat: 5.2612,
    lng: -3.9263,
    category: 'transport',
    icon: '✈️',
    keywords: ['aéroport', 'fhb', 'port-bouët', 'aérogare'],
  },
  {
    id: 'gare_treichville',
    name: 'Gare de Treichville',
    address: 'Avenue 21, Treichville, Abidjan',
    lat: 5.2934,
    lng: -4.0034,
    category: 'transport',
    icon: '🚉',
    keywords: ['gare', 'treichville', 'sitarail', 'train'],
  },
  {
    id: 'terminal_marcory',
    name: 'Terminal de Marcory',
    address: 'Boulevard VGE, Marcory, Abidjan',
    lat: 5.2978,
    lng: -3.9889,
    category: 'transport',
    icon: '🚉',
    keywords: ['terminal', 'gare routière', 'marcory'],
  },
  {
    id: 'carrefour_anono',
    name: 'Carrefour Anono',
    address: 'Riviera, Cocody, Abidjan',
    lat: 5.3867,
    lng: -3.9456,
    category: 'transport',
    icon: '🚦',
    keywords: ['carrefour', 'anono', 'riviera', 'cocody'],
  },
  {
    id: 'carrefour_palmeraie',
    name: 'Carrefour Palmeraie',
    address: 'Riviera Palmeraie, Cocody, Abidjan',
    lat: 5.3834,
    lng: -3.9623,
    category: 'transport',
    icon: '🚦',
    keywords: ['carrefour', 'palmeraie', 'riviera', 'cocody'],
  },
  {
    id: 'carrefour_vie',
    name: 'Carrefour de la Vie',
    address: 'Angré, Cocody, Abidjan',
    lat: 5.4023,
    lng: -3.9534,
    category: 'transport',
    icon: '🚦',
    keywords: ['carrefour', 'vie', 'angré', 'cocody'],
  },
  {
    id: 'echangeur_marcory',
    name: 'Échangeur de Marcory',
    address: 'Boulevard VGE, Marcory, Abidjan',
    lat: 5.2989,
    lng: -3.9901,
    category: 'transport',
    icon: '🚦',
    keywords: ['échangeur', 'marcory', 'autoroute'],
  },
  {
    id: 'carrefour_lauriers',
    name: 'Carrefour Lauriers',
    address: 'Deux Plateaux, Cocody, Abidjan',
    lat: 5.3756,
    lng: -3.9612,
    category: 'transport',
    icon: '🚦',
    keywords: ['carrefour', 'lauriers', 'deux plateaux', 'cocody'],
  },
];

// ============================================
// HÔTELS ET LIEUX TOURISTIQUES
// ============================================
export const HOTELS: Place[] = [
  {
    id: 'hotel_ivoire',
    name: 'Hôtel Ivoire Sofitel',
    address: 'Boulevard Hassan II, Cocody, Abidjan',
    lat: 5.3534,
    lng: -3.9712,
    category: 'hotel',
    icon: '🏨',
    keywords: ['hôtel', 'ivoire', 'sofitel', 'cocody'],
  },
  {
    id: 'pullman_plateau',
    name: 'Hôtel Pullman Plateau',
    address: 'Avenue du Général de Gaulle, Plateau, Abidjan',
    lat: 5.3234,
    lng: -4.0156,
    category: 'hotel',
    icon: '🏨',
    keywords: ['hôtel', 'pullman', 'plateau'],
  },
];

// ============================================
// LIEUX RELIGIEUX
// ============================================
export const RELIGIOUS: Place[] = [
  {
    id: 'basilique_plateau',
    name: 'Basilique Saint Paul',
    address: 'Boulevard Angoulvant, Plateau, Abidjan',
    lat: 5.3178,
    lng: -4.0189,
    category: 'religious',
    icon: '⛪',
    keywords: ['basilique', 'saint paul', 'plateau', 'église'],
  },
  {
    id: 'cathedrale_plateau',
    name: 'Cathédrale Saint Paul',
    address: 'Plateau, Abidjan',
    lat: 5.3189,
    lng: -4.0198,
    category: 'religious',
    icon: '⛪',
    keywords: ['cathédrale', 'saint paul', 'plateau', 'église'],
  },
  {
    id: 'mosquee_riviera',
    name: 'Mosquée de la Riviera',
    address: 'Riviera, Cocody, Abidjan',
    lat: 5.3756,
    lng: -3.9534,
    category: 'religious',
    icon: '🕌',
    keywords: ['mosquée', 'riviera', 'cocody'],
  },
];

// ============================================
// TOUTES LES PLACES COMBINÉES
// ============================================
export const ALL_PLACES: Place[] = [
  ...MALLS,
  ...HOSPITALS,
  ...UNIVERSITIES,
  ...ADMINISTRATIONS,
  ...RESIDENTIAL,
  ...TRANSPORTS,
  ...HOTELS,
  ...RELIGIOUS,
];

// ============================================
// TRAJETS FRÉQUENTS GÉOLOCALISÉS
// ============================================
export interface FrequentRoute {
  id: string;
  label: string;
  from: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  to: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  icon: string;
  estimatedKm: number;
  estimatedMinutes: number;
}

export const FREQUENT_ROUTES_GPS: FrequentRoute[] = [
  {
    id: 'angre_plateau',
    label: 'Angré → Plateau',
    from: {
      name: 'Angré Château',
      address: 'Angré Château, Cocody, Abidjan',
      lat: 5.3967,
      lng: -3.9545,
    },
    to: {
      name: 'Mairie du Plateau',
      address: 'Boulevard de la République, Plateau, Abidjan',
      lat: 5.3229,
      lng: -4.0198,
    },
    icon: '🏛️',
    estimatedKm: 9.2,
    estimatedMinutes: 22,
  },
  {
    id: 'cocody_aeroport',
    label: 'Cocody → Aéroport',
    from: {
      name: 'CHU de Cocody',
      address: 'Boulevard de l\'Université, Cocody, Abidjan',
      lat: 5.3706,
      lng: -3.9697,
    },
    to: {
      name: 'Aéroport FHB',
      address: 'Port-Bouët, Abidjan',
      lat: 5.2612,
      lng: -3.9263,
    },
    icon: '✈️',
    estimatedKm: 14.5,
    estimatedMinutes: 28,
  },
  {
    id: 'yopougon_plateau',
    label: 'Yopougon → Plateau',
    from: {
      name: 'Cosmos Yopougon',
      address: 'Yopougon Maroc, Abidjan',
      lat: 5.3499,
      lng: -4.0821,
    },
    to: {
      name: 'Primature',
      address: 'Boulevard Angoulvant, Plateau, Abidjan',
      lat: 5.3197,
      lng: -4.0167,
    },
    icon: '🏛️',
    estimatedKm: 11.8,
    estimatedMinutes: 35,
  },
  {
    id: 'marcory_cocody',
    label: 'Marcory → Cocody',
    from: {
      name: 'PlaYce Marcory',
      address: 'Zone 4, Marcory, Abidjan',
      lat: 5.2971,
      lng: -3.9867,
    },
    to: {
      name: 'Riviera Golf',
      address: 'Riviera Golf, Cocody, Abidjan',
      lat: 5.3843,
      lng: -3.9456,
    },
    icon: '🏠',
    estimatedKm: 10.2,
    estimatedMinutes: 24,
  },
  {
    id: 'riviera_plateau',
    label: 'Riviera → Plateau',
    from: {
      name: 'Carrefour Anono',
      address: 'Riviera, Cocody, Abidjan',
      lat: 5.3867,
      lng: -3.9456,
    },
    to: {
      name: 'Mairie du Plateau',
      address: 'Boulevard de la République, Plateau, Abidjan',
      lat: 5.3229,
      lng: -4.0198,
    },
    icon: '🏛️',
    estimatedKm: 8.5,
    estimatedMinutes: 20,
  },
  {
    id: 'deux_plateaux_zone4',
    label: 'Deux Plateaux → Zone 4',
    from: {
      name: 'Carrefour Lauriers',
      address: 'Deux Plateaux, Cocody, Abidjan',
      lat: 5.3756,
      lng: -3.9612,
    },
    to: {
      name: 'Zone 4 Bord de Mer',
      address: 'Zone 4, Marcory, Abidjan',
      lat: 5.2867,
      lng: -4.0034,
    },
    icon: '🏖️',
    estimatedKm: 11.0,
    estimatedMinutes: 26,
  },
  {
    id: 'abobo_adjame',
    label: 'Abobo → Adjamé',
    from: {
      name: 'Abobo Baoulé',
      address: 'Abobo Baoulé, Abidjan',
      lat: 5.4123,
      lng: -4.0234,
    },
    to: {
      name: 'Adjamé Liberté',
      address: 'Adjamé Liberté, Abidjan',
      lat: 5.3534,
      lng: -4.0234,
    },
    icon: '🏪',
    estimatedKm: 6.5,
    estimatedMinutes: 18,
  },
  {
    id: 'aeroport_treichville',
    label: 'Aéroport → Treichville',
    from: {
      name: 'Aéroport FHB',
      address: 'Port-Bouët, Abidjan',
      lat: 5.2612,
      lng: -3.9263,
    },
    to: {
      name: 'Gare de Treichville',
      address: 'Avenue 21, Treichville, Abidjan',
      lat: 5.2934,
      lng: -4.0034,
    },
    icon: '🚉',
    estimatedKm: 9.5,
    estimatedMinutes: 22,
  },
];

// ============================================
// FONCTIONS DE RECHERCHE LOCALE
// ============================================

// Rechercher dans les places locales
export const searchLocalPlaces = (query: string, limit: number = 10): Place[] => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const results = ALL_PLACES.filter(place => {
    const normalizedName = place.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedAddress = place.address.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedKeywords = (place.keywords || []).join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    return (
      normalizedName.includes(normalizedQuery) ||
      normalizedAddress.includes(normalizedQuery) ||
      normalizedKeywords.includes(normalizedQuery)
    );
  });
  
  // Trier par pertinence (nom qui commence par la requête en premier)
  results.sort((a, b) => {
    const aStartsWith = a.name.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
    const bStartsWith = b.name.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
    return aStartsWith - bStartsWith;
  });
  
  return results.slice(0, limit);
};

// Trouver le lieu le plus proche
export const findNearestPlace = (lat: number, lng: number): Place | null => {
  if (ALL_PLACES.length === 0) return null;
  
  let nearest = ALL_PLACES[0];
  let minDistance = Infinity;
  
  for (const place of ALL_PLACES) {
    const distance = Math.sqrt(
      Math.pow(place.lat - lat, 2) + Math.pow(place.lng - lng, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = place;
    }
  }
  
  return nearest;
};

// Obtenir les suggestions de places par catégorie
export const getPlacesByCategory = (category: PlaceCategory): Place[] => {
  return ALL_PLACES.filter(place => place.category === category);
};
