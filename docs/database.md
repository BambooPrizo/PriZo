# Modèle de Données — VTC Comparateur CI

## Vue d'ensemble

| Base | Usage | Justification |
|---|---|---|
| PostgreSQL | Données principales (users, prix, contributions) | Relationnel, fiable, requêtes complexes |
| Redis | Cache des prix, sessions, rate limiting | Ultra-rapide, TTL natif |
| MongoDB | Historique et snapshots de prix | Documents flexibles, agrégations temporelles |

---

## PostgreSQL — Schéma complet

### Table `users`
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         VARCHAR(20) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  plan          VARCHAR(20) DEFAULT 'free',  -- free | premium
  points        INTEGER DEFAULT 0,           -- gamification crowdsourcing
  fcm_token     VARCHAR(255),                -- push notifications Firebase
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Table `price_entries`
Stocke chaque observation de prix (manuelle ou crowdsourcée).
```sql
CREATE TABLE price_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider        VARCHAR(50) NOT NULL,       -- 'yango' | 'heetch' | 'uber'
  vehicle_type    VARCHAR(30) NOT NULL,       -- 'moto' | 'standard' | 'premium'
  price_min       INTEGER NOT NULL,           -- en XOF
  price_max       INTEGER NOT NULL,           -- en XOF
  from_lat        DECIMAL(10,7) NOT NULL,
  from_lng        DECIMAL(10,7) NOT NULL,
  to_lat          DECIMAL(10,7) NOT NULL,
  to_lng          DECIMAL(10,7) NOT NULL,
  zone_from       VARCHAR(100),               -- ex: 'Cocody' (dénormalisé pour perf)
  zone_to         VARCHAR(100),               -- ex: 'Plateau'
  source          VARCHAR(20) NOT NULL,       -- 'manual' | 'crowdsourced' | 'api'
  contributed_by  UUID REFERENCES users(id),  -- NULL si collecte manuelle
  confidence      DECIMAL(3,2) DEFAULT 0.50, -- 0.00 à 1.00
  is_archived     BOOLEAN DEFAULT false,      -- soft delete
  observed_at     TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_zone        ON price_entries(zone_from, zone_to);
CREATE INDEX idx_price_provider    ON price_entries(provider);
CREATE INDEX idx_price_observed    ON price_entries(observed_at DESC);
CREATE INDEX idx_price_confidence  ON price_entries(confidence DESC);
```

---

### Table `contributions`
Trace les contributions pour la gamification et la modération.
```sql
CREATE TABLE contributions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  price_entry_id  UUID NOT NULL REFERENCES price_entries(id),
  points_awarded  INTEGER DEFAULT 10,
  status          VARCHAR(20) DEFAULT 'pending', -- pending | validated | rejected
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contributions_user   ON contributions(user_id);
CREATE INDEX idx_contributions_status ON contributions(status);
```

---

### Table `alerts`
Alertes prix configurées par les utilisateurs.
```sql
CREATE TABLE alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  provider        VARCHAR(50),                -- NULL = tous les providers
  from_lat        DECIMAL(10,7) NOT NULL,
  from_lng        DECIMAL(10,7) NOT NULL,
  to_lat          DECIMAL(10,7) NOT NULL,
  to_lng          DECIMAL(10,7) NOT NULL,
  threshold_price INTEGER NOT NULL,           -- en XOF
  currency        VARCHAR(5) DEFAULT 'XOF',
  is_active       BOOLEAN DEFAULT true,
  triggered_count INTEGER DEFAULT 0,
  last_triggered  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_user     ON alerts(user_id);
CREATE INDEX idx_alerts_active   ON alerts(is_active) WHERE is_active = true;
```

---

### Table `ride_redirections`
Trace les clics de redirection vers les apps VTC (pour l'affiliation).
```sql
CREATE TABLE ride_redirections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),  -- NULL si non connecté
  provider        VARCHAR(50) NOT NULL,
  price_entry_id  UUID REFERENCES price_entries(id),
  from_zone       VARCHAR(100),
  to_zone         VARCHAR(100),
  redirected_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_redirections_provider ON ride_redirections(provider);
CREATE INDEX idx_redirections_date     ON ride_redirections(redirected_at DESC);
```

---

## Relations entre les tables
```
users
  ├── contributions  (1 user → N contributions)
  ├── alerts         (1 user → N alertes)
  └── ride_redirections (1 user → N redirections)

price_entries
  ├── contributions  (1 price_entry → N contributions)
  └── ride_redirections (1 price_entry → N redirections)
```

---

## Redis — Structure des clés
```
# Prix en cache par trajet (expire après 10 min)
prices:{zone_from}:{zone_to}
  → JSON complet de la réponse /v1/prices
  TTL: 600 secondes

# Session utilisateur
session:{user_id}
  → Données JWT décodées
  TTL: 86400 secondes (24h)

# Rate limiting par IP
ratelimit:{ip}
  → Compteur d'appels
  TTL: 60 secondes

# Jobs Bull Queue
bull:contributions  → File de traitement des contributions
bull:alerts         → File d'évaluation des alertes prix
bull:notifications  → File d'envoi des push notifications
```

---

## MongoDB — Collection `price_snapshots`

Utilisée pour l'historique et les graphiques d'évolution des prix.
```javascript
{
  _id: ObjectId,
  provider: "yango",            // string
  vehicle_type: "standard",     // string
  zone_from: "Cocody",          // string
  zone_to: "Plateau",           // string
  date: ISODate("2024-01-15"),  // date du snapshot
  snapshots: [
    {
      time: "08:00",
      price_min: 800,
      price_max: 1100,
      samples: 5               // nombre de contributions à ce créneau
    },
    {
      time: "08:30",
      price_min: 950,
      price_max: 1300,
      samples: 3
    }
  ],
  daily_avg: 950,
  daily_min: 750,
  daily_max: 1300,
  total_samples: 42
}

// Index recommandés
db.price_snapshots.createIndex({ zone_from: 1, zone_to: 1, date: -1 })
db.price_snapshots.createIndex({ provider: 1, date: -1 })
```

---

## Règles métier importantes

### Calcul du `confidence_score`
```
score = f(âge_donnée, nb_contributions_concordantes, source)

source = 'api'          → base 0.95
source = 'manual'       → base 0.60
source = 'crowdsourced' → base 0.40

+ bonus si nb_contributions > 5   → +0.20
+ bonus si nb_contributions > 10  → +0.30
- malus si âge > 30 min           → -0.10
- malus si âge > 60 min           → -0.20
- malus si âge > 120 min          → -0.40

score final = min(1.0, max(0.0, calcul))
```

### Soft delete
Ne jamais supprimer de `price_entries`. Utiliser `is_archived = true`. Les données historiques ont de la valeur pour les futures fonctionnalités IA.

### Politique de rétention
- `price_entries` actives : indéfiniment
- `ride_redirections` : 12 mois glissants
- `price_snapshots` MongoDB : 24 mois
- `contributions` rejetées : 3 mois puis suppression