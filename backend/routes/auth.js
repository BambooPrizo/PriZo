// ============================================
// ROUTES AUTH - PriZo Backend
// ============================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../database');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /auth/login - Connexion
router.post('/login', (req, res) => {
  try {
    const { phone, password } = req.body;
    const db = getDB();
    
    if (!phone || !password) {
      return res.status(400).json({
        error: { code: 'MISSING_FIELDS', message: 'Téléphone et mot de passe requis' }
      });
    }
    
    // Chercher l'utilisateur
    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    
    if (!user) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Numéro ou mot de passe incorrect' }
      });
    }
    
    // Vérifier le mot de passe
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Numéro ou mot de passe incorrect' }
      });
    }
    
    // Générer le token
    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        points: user.points,
        contributionsCount: user.contributions_count,
      }
    });
    
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
});

// POST /auth/register - Inscription
router.post('/register', (req, res) => {
  try {
    const { phone, password, name } = req.body;
    const db = getDB();
    
    if (!phone || !password || !name) {
      return res.status(400).json({
        error: { code: 'MISSING_FIELDS', message: 'Tous les champs sont requis' }
      });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existingUser) {
      return res.status(409).json({
        error: { code: 'USER_EXISTS', message: 'Ce numéro est déjà utilisé' }
      });
    }
    
    // Créer l'utilisateur
    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.prepare(
      `INSERT INTO users (id, phone, password, name) VALUES (?, ?, ?, ?)`
    ).run(id, phone, hashedPassword, name);
    
    // Générer le token
    const token = jwt.sign(
      { id, phone },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id,
        phone,
        name,
        points: 0,
        contributionsCount: 0,
      }
    });
    
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
});

// GET /auth/me - Profil utilisateur
router.get('/me', authMiddleware, (req, res) => {
  try {
    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: { code: 'USER_NOT_FOUND', message: 'Utilisateur non trouvé' }
      });
    }
    
    res.json({
      id: user.id,
      phone: user.phone,
      name: user.name,
      points: user.points,
      contributionsCount: user.contributions_count,
      createdAt: user.created_at,
    });
    
  } catch (error) {
    console.error('Erreur me:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur' }
    });
  }
});

module.exports = router;
