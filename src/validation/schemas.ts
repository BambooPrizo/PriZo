// ============================================
// SCHÉMAS DE VALIDATION ZOD
// ============================================

import { z } from 'zod';
import { ABIDJAN_BOUNDS, PRICE_LIMITS, PHONE_PATTERNS } from '../constants';

// 📞 Validation téléphone ivoirien
export const phoneSchema = z.string()
  .transform(val => val.replace(/[\s\-\.\(\)]/g, ''))
  .refine(val => {
    const digits = val.replace('+225', '').replace('225', '');
    return digits.length === 10;
  }, { message: 'Le numéro doit contenir 10 chiffres' })
  .refine(val => {
    const digits = val.replace('+225', '').replace('225', '');
    const prefix = digits.substring(0, 2);
    return PHONE_PATTERNS.validPrefixes.includes(prefix);
  }, { message: 'Préfixe opérateur non reconnu (MTN, Orange, Moov)' });

// 🔐 Validation mot de passe
export const passwordSchema = z.string()
  .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
  .max(50, 'Le mot de passe est trop long')
  .regex(/^[^\s]+$/, 'Le mot de passe ne doit pas contenir d\'espaces');

// 👤 Validation nom
export const nameSchema = z.string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(50, 'Le nom est trop long')
  .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom contient des caractères non autorisés');

// 🌍 Validation coordonnées GPS Abidjan
export const latitudeSchema = z.number()
  .min(ABIDJAN_BOUNDS.lat.min, 'Position hors de la zone couverte')
  .max(ABIDJAN_BOUNDS.lat.max, 'Position hors de la zone couverte');

export const longitudeSchema = z.number()
  .min(ABIDJAN_BOUNDS.lng.min, 'Position hors de la zone couverte')
  .max(ABIDJAN_BOUNDS.lng.max, 'Position hors de la zone couverte');

export const coordinatesSchema = z.object({
  lat: latitudeSchema,
  lng: longitudeSchema,
});

// 💰 Validation prix
export const priceSchema = z.number()
  .min(PRICE_LIMITS.min, `Le prix minimum est de ${PRICE_LIMITS.min} XOF`)
  .max(PRICE_LIMITS.max, `Le prix maximum est de ${PRICE_LIMITS.max.toLocaleString()} XOF`);

// 🚗 Validation type de véhicule
export const vehicleTypeSchema = z.enum([
  'moto', 'eco', 'standard', 'confort', 'premium', 'berline', 'luxe'
]);

// 📝 Schéma de connexion
export const loginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

// 📝 Schéma d'inscription
export const registerSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
  name: nameSchema,
});

// 📝 Schéma de contribution de prix
export const contributionSchema = z.object({
  provider: z.string().min(1, 'Veuillez sélectionner un fournisseur'),
  vehicle_type: vehicleTypeSchema,
  price_observed: priceSchema,
  currency: z.literal('XOF'),
  from_lat: latitudeSchema,
  from_lng: longitudeSchema,
  to_lat: latitudeSchema,
  to_lng: longitudeSchema,
  observed_at: z.string().datetime(),
});

// 📝 Schéma de recherche de prix
export const searchSchema = z.object({
  from_lat: latitudeSchema,
  from_lng: longitudeSchema,
  to_lat: latitudeSchema,
  to_lng: longitudeSchema,
  from_label: z.string().min(1, 'Veuillez entrer un point de départ'),
  to_label: z.string().min(1, 'Veuillez entrer une destination'),
});

// 📝 Schéma d'alerte prix
export const alertSchema = z.object({
  provider: z.string().nullable(),
  threshold_price: priceSchema,
  from_lat: latitudeSchema,
  from_lng: longitudeSchema,
  to_lat: latitudeSchema,
  to_lng: longitudeSchema,
  from_label: z.string().min(1),
  to_label: z.string().min(1),
});

// Types TypeScript dérivés des schémas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContributionInput = z.infer<typeof contributionSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type AlertInput = z.infer<typeof alertSchema>;

// Fonction utilitaire pour valider et retourner les erreurs formatées
export const validateWithSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, errors };
};
