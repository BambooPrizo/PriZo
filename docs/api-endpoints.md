# API Endpoints — VTC Comparateur CI

## Conventions générales
```
Base URL      : https://api.vtccompare.ci/v1
Auth          : Bearer Token (JWT) — Header: Authorization: Bearer <token>
Content-Type  : application/json
Versioning    : /v1/, /v2/ dans l'URL
```

## Format d'erreur standard
```json
{
  "error": {
    "code": "PRICE_NOT_FOUND",
    "message": "Aucun tarif disponible pour ce trajet",
    "details": {}
  }
}
```

## Codes HTTP utilisés

| Code | Signification |
|---|---|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource introuvable |
| 429 | Trop de requêtes |
| 500 | Erreur serveur |

---

## 🔐 Authentification

### `POST /v1/auth/register`
Créer un compte utilisateur.

**Body :**
```json
{
  "phone": "+22501234567",
  "password": "motdepasse123",
  "name": "Kouamé Konan"
}
```

**Réponse 201 :**
```json
{
  "user": {
    "id": "usr_abc123",
    "phone": "+22501234567",
    "name": "Kouamé Konan"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### `POST /v1/auth/login`
Connexion utilisateur.

**Body :**
```json
{
  "phone": "+22501234567",
  "password": "motdepasse123"
}
```

**Réponse 200 :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 86400
}
```

---

### `POST /v1/auth/refresh`
Renouveler le token JWT.

**Headers :** `Authorization: Bearer <token>`

**Réponse 200 :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 86400
}
```

---

## 💰 Prix et Comparaison

### `GET /v1/prices`
**Point central du produit.** Retourne les tarifs comparés pour un trajet.

**Query params :**

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| from_lat | float | ✅ | Latitude du départ |
| from_lng | float | ✅ | Longitude du départ |
| to_lat | float | ✅ | Latitude de l'arrivée |
| to_lng | float | ✅ | Longitude de l'arrivée |
| vehicle_type | string | ❌ | `moto` \| `standard` \| `premium` |

**Exemple :**
```
GET /v1/prices?from_lat=5.3600&from_lng=-4.0083&to_lat=5.3450&to_lng=-3.9995
```

**Réponse 200 :**
```json
{
  "results": [
    {
      "provider": "Yango",
      "vehicle_type": "standard",
      "price_min": 800,
      "price_max": 1200,
      "currency": "XOF",
      "estimated_duration_min": 12,
      "deeplink": "yango://ride?from=...&to=...",
      "price_source": "crowdsourced",
      "last_updated": "2024-01-15T14:32:00Z",
      "confidence_score": 0.82
    },
    {
      "provider": "Heetch",
      "vehicle_type": "standard",
      "price_min": 950,
      "price_max": 1100,
      "currency": "XOF",
      "estimated_duration_min": 14,
      "deeplink": "heetch://ride?from=...&to=...",
      "price_source": "manual",
      "last_updated": "2024-01-15T13:00:00Z",
      "confidence_score": 0.65
    }
  ],
  "meta": {
    "best_price_provider": "Yango",
    "query_time_ms": 87,
    "disclaimer": "Prix indicatifs. Peuvent varier en temps réel."
  }
}
```

> **Note :** Le `confidence_score` (0 à 1) indique la fiabilité du prix. L'UI doit l'afficher pour gérer honnêtement l'attente utilisateur.

---

### `GET /v1/prices/history`
Historique des prix pour un trajet.

**Query params :**

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| from_lat | float | ✅ | |
| from_lng | float | ✅ | |
| to_lat | float | ✅ | |
| to_lng | float | ✅ | |
| provider | string | ❌ | Filtrer par fournisseur |
| days | integer | ❌ | Défaut: 7, max: 30 |

**Réponse 200 :**
```json
{
  "history": [
    {
      "date": "2024-01-14",
      "provider": "Yango",
      "avg_price": 950,
      "min_price": 800,
      "max_price": 1300,
      "sample_count": 12
    }
  ]
}
```

---

## 👥 Contributions (Crowdsourcing)

### `POST /v1/contributions`
Soumettre un prix observé. **🔒 Requiert auth.**

**Body :**
```json
{
  "provider": "Yango",
  "vehicle_type": "standard",
  "price_observed": 1050,
  "currency": "XOF",
  "from_lat": 5.3600,
  "from_lng": -4.0083,
  "to_lat": 5.3450,
  "to_lng": -3.9995,
  "observed_at": "2024-01-15T14:30:00Z"
}
```

**Réponse 201 :**
```json
{
  "contribution_id": "ctr_xyz789",
  "status": "accepted",
  "points_earned": 10,
  "message": "Merci ! Votre contribution aide la communauté."
}
```

---

### `GET /v1/contributions/me`
Historique des contributions de l'utilisateur. **🔒 Requiert auth.**

**Réponse 200 :**
```json
{
  "total_contributions": 47,
  "total_points": 470,
  "rank": "Contributeur Actif",
  "contributions": [
    {
      "id": "ctr_xyz789",
      "provider": "Yango",
      "price_observed": 1050,
      "status": "validated",
      "created_at": "2024-01-15T14:30:00Z"
    }
  ]
}
```

---

## 🔔 Alertes Prix

### `POST /v1/alerts`
Créer une alerte prix. **🔒 Requiert auth.**

**Body :**
```json
{
  "provider": "Yango",
  "from_lat": 5.3600,
  "from_lng": -4.0083,
  "to_lat": 5.3450,
  "to_lng": -3.9995,
  "threshold_price": 900,
  "currency": "XOF"
}
```

**Réponse 201 :**
```json
{
  "alert_id": "alt_123",
  "status": "active"
}
```

---

### `GET /v1/alerts`
Lister les alertes actives. **🔒 Requiert auth.**

**Réponse 200 :**
```json
{
  "alerts": [
    {
      "id": "alt_123",
      "provider": "Yango",
      "threshold_price": 900,
      "is_active": true,
      "triggered_count": 3,
      "last_triggered": "2024-01-14T08:15:00Z"
    }
  ]
}
```

---

### `DELETE /v1/alerts/:id`
Supprimer une alerte. **🔒 Requiert auth.**

**Réponse 200 :**
```json
{ "message": "Alerte supprimée avec succès." }
```

---

## 👤 Utilisateur

### `GET /v1/users/me`
Profil de l'utilisateur connecté. **🔒 Requiert auth.**

**Réponse 200 :**
```json
{
  "id": "usr_abc123",
  "phone": "+22501234567",
  "name": "Kouamé Konan",
  "plan": "free",
  "points": 470,
  "rank": "Contributeur Actif",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### `PATCH /v1/users/me`
Modifier le profil. **🔒 Requiert auth.**

**Body (tous les champs optionnels) :**
```json
{
  "name": "Nouveau Nom",
  "fcm_token": "firebase_device_token"
}
```

---

### `DELETE /v1/users/me`
Supprimer le compte (RGPD). **🔒 Requiert auth.**

**Réponse 200 :**
```json
{ "message": "Compte supprimé. Vos données ont été effacées." }
```

---

## Récapitulatif
```
AUTH
  POST   /v1/auth/register
  POST   /v1/auth/login
  POST   /v1/auth/refresh

PRICES
  GET    /v1/prices
  GET    /v1/prices/history

CONTRIBUTIONS
  POST   /v1/contributions
  GET    /v1/contributions/me

ALERTS
  POST   /v1/alerts
  GET    /v1/alerts
  DELETE /v1/alerts/:id

USERS
  GET    /v1/users/me
  PATCH  /v1/users/me
  DELETE /v1/users/me
```