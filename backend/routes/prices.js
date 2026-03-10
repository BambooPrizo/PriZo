// ============================================
// ROUTES PRICES - PriZo Backend
// ============================================

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../database');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Prix de base par commune (données initiales réalistes pour Abidjan)
const BASE_PRICES = {
  yango: { basePrice: 1000, pricePerKm: 350 },
  heetch: { basePrice: 800, pricePerKm: 400 },
  indrive: { basePrice: 500, pricePerKm: 300 },
  uber: { basePrice: 1200, pricePerKm: 380 },
  taxijet: { basePrice: 1500, pricePerKm: 420 },
};

// Distances approximatives entre communes (en km)
const COMMUNE_DISTANCES = {
  'cocody-plateau': 5,
  'cocody-yopougon': 15,
  'cocody-marcory': 7,
  'cocody-treichville': 8,
  'cocody-adjame': 6,
  'cocody-abobo': 12,
  'cocody-bingerville': 10,
  'plateau-yopougon': 12,
  'plateau-marcory': 3,
  'plateau-treichville': 2,
  'plateau-adjame': 4,
  'plateau-abobo': 10,
  'yopougon-adjame': 8,
  'yopougon-abobo': 10,
  'yopougon-marcory': 14,
  'yopougon-treichville': 13,
  'marcory-treichville': 2,
  'marcory-koumassi': 4,
  'treichville-koumassi': 5,
  'adjame-abobo': 6,
  'abobo-anyama': 8,
  'default': 8,
};

function getDistance(origin, destination) {
  const key1 = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
  const key2 = `${destination.toLowerCase()}-${origin.toLowerCase()}`;
  return COMMUNE_DISTANCES[key1] || COMMUNE_DISTANCES[key2] || COMMUNE_DISTANCES['default'];
}

function calculatePrice(provider, distance) {
  const config = BASE_PRICES[provider] || BASE_PRICES.yango;
  const basePrice = config.basePrice + (config.pricePerKm * distance);
  // Arrondir au 500 XOF le plus proche
  return Math.round(basePrice / 500) * 500;
}

// GET /prices/compare - Comparer les prix
router.get('/compare', optionalAuth, (req, res) => {
  try {
    const { origin, destination } = req.query;
    const db = getDB();
    
    if (!origin || !destination) {
      return res.status(400).json({
        error: { code: 'MISSING_PARAMS', message: 'Origine et destination requises' }
      });
    }
    
    const distance = getDistance(origin, destination);
    
    // Récupérer les contributions récentes pour cette route
    const contributions = db.prepare(`
      SELECT provider, AVG(price) as avg_price, COUNT(*) as count
      FROM price_contributions
      WHERE origin_commune = ? AND destination_commune = ?
        AND created_at > datetime('now', '-7 days')
      GROUP BY provider
    `).all(origin.toLowerCase(), destination.toLowerCase());
    
    // Créer un map des prix contribués
    const contributedPrices = {};
    contributions.forEach(c => {
      if (c.count >= 2) { // Au moins 2 contributions pour être fiable
        contributedPrices[c.provider] = Math.round(c.avg_price / 500) * 500;
      }
    });
    
    // Générer les prix pour chaque provider
    const providers = ['yango', 'heetch', 'indrive', 'uber', 'taxijet'];
    const prices = providers.map(provider => {
      // Utiliser le prix contribué s'il existe, sinon calculer
      const price = contributedPrices[provider] || calculatePrice(provider, distance);
      const isContributed = !!contributedPrices[provider];
      
      // Ajouter une variation réaliste (+/- 10%)
      const variation = isContributed ? 0 : (Math.random() - 0.5) * 0.2;
      const finalPrice = Math.round((price * (1 + variation)) / 500) * 500;
      
      return {
        provider,
        price: finalPrice,
        isContributed,
        confidence: isContributed ? 'high' : 'estimated',
      };
    });
    
    // Trier par prix
    prices.sort((a, b) => a.price - b.price);
    
    // Enregistrer la recherche si user connecté
    if (req.user) {
      const cheapest = prices[0];
      db.prepare(`
        INSERT INTO search_history (id, user_id, origin_commune, destination_commune, cheapest_provider, cheapest_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), req.user.id, origin.toLowerCase(), destination.toLowerCase(), cheapest.provider, cheapest.price);
    }
    
    res.json({
      origin,
      destination,
      distance,
      prices,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Erreur compare:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
});

// POST /prices/contribute - Contribuer un prix
router.post('/contribute', authMiddleware, (req, res) => {
  try {
    const { provider, origin, destination, price } = req.body;
    const db = getDB();
    
    if (!provider || !origin || !destination || !price) {
      return res.status(400).json({
        error: { code: 'MISSING_FIELDS', message: 'Tous les champs sont requis' }
      });
    }
    
    if (price < 500 || price > 50000) {
      return res.status(400).json({
        error: { code: 'INVALID_PRICE', message: 'Prix doit être entre 500 et 50000 XOF' }
      });
    }
    
    const id = uuidv4();
    
    // Insérer la contribution
    db.prepare(`
      INSERT INTO price_contributions (id, user_id, provider, origin_commune, destination_commune, price)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, provider.toLowerCase(), origin.toLowerCase(), destination.toLowerCase(), price);
    
    // Mettre à jour les stats de l'utilisateur
    db.prepare(`
      UPDATE users 
      SET points = points + 10, contributions_count = contributions_count + 1, updated_at = datetime('now')
      WHERE id = ?
    `).run(req.user.id);
    
    // Récupérer l'utilisateur mis à jour
    const user = db.prepare('SELECT points, contributions_count FROM users WHERE id = ?').get(req.user.id);
    
    res.status(201).json({
      id,
      pointsEarned: 10,
      totalPoints: user.points,
      totalContributions: user.contributions_count,
      message: 'Merci pour votre contribution !',
    });
    
  } catch (error) {
    console.error('Erreur contribute:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
});

// GET /prices/history - Historique de recherche
router.get('/history', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const history = db.prepare(`
      SELECT * FROM search_history 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(req.user.id);
    
    res.json(history.map(h => ({
      id: h.id,
      origin: h.origin_commune,
      destination: h.destination_commune,
      cheapestProvider: h.cheapest_provider,
      cheapestPrice: h.cheapest_price,
      createdAt: h.created_at,
    })));
    
  } catch (error) {
    console.error('Erreur history:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
});

// GET /prices/contributions - Mes contributions
router.get('/contributions', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const contributions = db.prepare(`
      SELECT * FROM price_contributions 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(req.user.id);
    
    res.json(contributions.map(c => ({
      id: c.id,
      provider: c.provider,
      origin: c.origin_commune,
      destination: c.destination_commune,
      price: c.price,
      isVerified: c.is_verified === 1,
      createdAt: c.created_at,
    })));
    
  } catch (error) {
    console.error('Erreur contributions:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
});

module.exports = router;
