// ============================================
// SERVEUR EXPRESS - PriZo Backend
// ============================================

const express = require('express');
const cors = require('cors');

const { initDB } = require('./database');
const authRoutes = require('./routes/auth');
const pricesRoutes = require('./routes/prices');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // En dev, accepter toutes les origines
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/prices', pricesRoutes);

// Route de santé
app.get('/v1/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    name: 'PriZo API',
    version: '1.0.0',
    endpoints: {
      health: '/v1/health',
      auth: '/v1/auth/*',
      prices: '/v1/prices/*',
    }
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Route non trouvée' }
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({
    error: { code: 'SERVER_ERROR', message: 'Erreur interne du serveur' }
  });
});

// Initialiser la DB puis démarrer le serveur
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║     🚀 PriZo API - Serveur démarré               ║
║                                                   ║
║     URL: http://localhost:${PORT}                   ║
║     API: http://localhost:${PORT}/v1                ║
║                                                   ║
║     📱 Utilisateur test:                          ║
║        Tél: +2250700000000                        ║
║        MDP: 123456                                ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
    `);
  });
}).catch(err => {
  console.error('Erreur initialisation DB:', err);
  process.exit(1);
});
