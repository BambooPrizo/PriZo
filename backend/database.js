// ============================================
// BASE DE DONNÉES SQLite (sql.js) - PriZo Backend
// ============================================

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'prizo.db');

let db = null;

// Sauvegarder la base de données
function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// Initialiser la base de données
async function initDB() {
  const SQL = await initSqlJs();
  
  // Charger la base existante ou créer une nouvelle
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('✅ Base de données chargée');
  } else {
    db = new SQL.Database();
    console.log('✅ Nouvelle base de données créée');
  }
  
  // Créer les tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      contributions_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS price_contributions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      origin_commune TEXT NOT NULL,
      destination_commune TEXT NOT NULL,
      price INTEGER NOT NULL,
      is_verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS search_history (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      origin_commune TEXT NOT NULL,
      destination_commune TEXT NOT NULL,
      cheapest_provider TEXT,
      cheapest_price INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  
  // Créer les index
  db.run(`CREATE INDEX IF NOT EXISTS idx_contributions_route ON price_contributions(origin_commune, destination_commune);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_contributions_user ON price_contributions(user_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_history_user ON search_history(user_id);`);
  
  // Créer un utilisateur de test si la base est vide
  const result = db.exec('SELECT COUNT(*) as count FROM users');
  const count = result.length > 0 ? result[0].values[0][0] : 0;
  
  if (count === 0) {
    const testPassword = bcrypt.hashSync('123456', 10);
    const id = uuidv4();
    
    db.run(
      `INSERT INTO users (id, phone, password, name, points, contributions_count) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, '+2250700000000', testPassword, 'Utilisateur Test', 0, 0]
    );
    
    console.log('✅ Utilisateur test créé: +2250700000000 / 123456');
  }
  
  saveDB();
  
  // Sauvegarder toutes les 30 secondes
  setInterval(saveDB, 30000);
  
  return db;
}

// Wrapper pour les requêtes préparées
const dbWrapper = {
  prepare: (sql) => ({
    get: (...params) => {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      stmt.free();
      return null;
    },
    all: (...params) => {
      const results = [];
      const stmt = db.prepare(sql);
      stmt.bind(params);
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    },
    run: (...params) => {
      db.run(sql, params);
      saveDB();
      return { changes: db.getRowsModified() };
    }
  }),
  exec: (sql) => db.exec(sql),
};

module.exports = { initDB, getDB: () => dbWrapper, saveDB };
