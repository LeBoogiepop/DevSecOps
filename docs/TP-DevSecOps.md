# TP DevSecOps - Partie 1 : Description du Système

## Objectif

Documenter précisément le système existant pour faciliter la compréhension et l'identification des risques.

---

## Architecture Applicative

### Vue d'ensemble

L'application est composée de **3 microservices indépendants** communiquant via HTTP/REST :

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ HTTP/REST
       │
┌──────▼──────────────────┐
│    API Gateway          │  Port: 8080
│  - Routage              │
│  - Authentification     │
│  - Rate Limiting        │
└──────┬──────────┬───────┘
       │          │
       │          │
┌──────▼───┐  ┌──▼──────────┐
│   User   │  │   Order     │
│  Service │  │   Service   │
│  :3001   │  │   :3002     │
└──────────┘  └─────────────┘
```

### Microservices

#### 1. API Gateway (Port 8080)
- **Rôle** : Point d'entrée unique pour tous les clients
- **Technologies** : Node.js, Express
- **Responsabilités** :
  - Routage des requêtes vers les microservices appropriés
  - Authentification JWT
  - Rate limiting (100 req/min par IP)
  - Logging centralisé
  - Health checks

#### 2. User Service (Port 3001)
- **Rôle** : Gestion des utilisateurs et authentification
- **Technologies** : Node.js, Express, MongoDB
- **Endpoints principaux** :
  - `POST /api/users/register` - Inscription
  - `POST /api/users/login` - Connexion
  - `GET /api/users/:id` - Récupération profil
- **Base de données** : MongoDB (port 27017)

#### 3. Order Service (Port 3002)
- **Rôle** : Gestion des commandes
- **Technologies** : Node.js, Express, PostgreSQL
- **Endpoints principaux** :
  - `GET /api/orders` - Liste des commandes
  - `POST /api/orders` - Création commande
  - `GET /api/orders/:id` - Détails commande
  - `PUT /api/orders/:id/status` - Mise à jour statut
- **Base de données** : PostgreSQL (port 5432)

---

## Points d'entrée exposés

| Service | Route | Port | Authentification | Description |
|---------|-------|------|------------------|-------------|
| API Gateway | `/health` | 8080 | Non | Health check |
| API Gateway | `/api/users/register` | 8080 | Non | Inscription utilisateur |
| API Gateway | `/api/users/login` | 8080 | Non | Connexion utilisateur |
| API Gateway | `/api/users/:id` | 8080 | JWT requis | Récupération profil |
| API Gateway | `/api/orders` | 8080 | JWT requis | Liste/Création commandes |
| API Gateway | `/api/orders/:id` | 8080 | JWT requis | Détails commande |
| User Service | `/api/users/*` | 3001 | Direct (bypass gateway) | Accès direct (dev) |
| Order Service | `/api/orders/*` | 3002 | Direct (bypass gateway) | Accès direct (dev) |

### Communication REST

- **Format** : JSON
- **Méthodes HTTP** : GET, POST, PUT
- **Authentification** : JWT (JSON Web Token) dans le header `Authorization: Bearer <token>`

---

## Dépendances critiques

### Bases de données

#### MongoDB (User Service)
- **Image Docker** : `mongo:7.0`
- **Port** : 27017
- **Volume** : `user-db-data`
- **Utilisation** : Stockage des utilisateurs, authentification
- **Collections principales** :
  - `users` : Informations utilisateurs (email, password hashé, nom)

#### PostgreSQL (Order Service)
- **Image Docker** : `postgres:15-alpine`
- **Port** : 5432
- **Volume** : `order-db-data`
- **Utilisation** : Stockage des commandes
- **Tables principales** :
  - `orders` : Commandes (id, user_id, items, total_amount, status, created_at, updated_at)

### Bibliothèques tierces critiques

#### API Gateway
- **express** (v4.18.2) - Framework web
- **axios** (v1.5.0) - Communication HTTP avec les microservices
- **jsonwebtoken** (v9.0.2) - Vérification des tokens JWT
- **express-rate-limit** (v6.10.0) - Rate limiting
- **cors** (v2.8.5) - Gestion CORS

#### User Service
- **express** (v4.18.2) - Framework web
- **mongoose** (v7.5.0) - ODM MongoDB
- **bcrypt** (v5.1.1) - Hashage des mots de passe
- **jsonwebtoken** (v9.0.2) - Génération de tokens JWT
- **cors** (v2.8.5) - Gestion CORS

#### Order Service
- **express** (v4.18.2) - Framework web
- **pg** (v8.11.3) - Client PostgreSQL
- **jsonwebtoken** (v9.0.2) - Vérification des tokens JWT
- **axios** (v1.5.0) - Communication avec User Service
- **cors** (v2.8.5) - Gestion CORS

### Images Docker de base

- **Node.js** : `node:18-alpine` (tous les services)
- **MongoDB** : `mongo:7.0`
- **PostgreSQL** : `postgres:15-alpine`

---

## Flux de données

### Données sensibles transitant dans le système

#### 1. Informations d'authentification
- **Flux** : Client → API Gateway → User Service
- **Données** :
  - Email (en clair)
  - Mot de passe (hashé avec bcrypt, salt rounds: 10)
  - Tokens JWT (signés avec secret, expiration: 24h)
- **Protection** :
  - HTTPS recommandé en production
  - Hashage bcrypt pour les mots de passe
  - JWT signé avec secret partagé
  - Rate limiting sur l'API Gateway

#### 2. Données utilisateur (PII - Personally Identifiable Information)
- **Flux** : User Service → API Gateway → Client
- **Données** :
  - Nom, prénom
  - Email
  - ID utilisateur
- **Protection** :
  - Authentification JWT requise
  - Validation des entrées
  - Exclusion du mot de passe dans les réponses

#### 3. Données de commande
- **Flux** : Client → API Gateway → Order Service → User Service (vérification)
- **Données** :
  - Items de commande (JSON)
  - Montant total (décimal)
  - Statut de commande
  - Informations de livraison (si applicable)
- **Protection** :
  - Authentification JWT requise
  - Vérification de l'utilisateur via User Service
  - Validation des montants

### Communication inter-services

```
┌──────────────┐
│ User Service │
└──────┬───────┘
       │
       │ HTTP GET /api/users/:id
       │ (vérification utilisateur)
       │
┌──────▼──────────────┐
│  Order Service      │
│  (création commande)│
└─────────────────────┘
```

**Scénario** : Lors de la création d'une commande, Order Service vérifie que l'utilisateur existe en appelant User Service.

### Schéma de données

#### User Service (MongoDB)
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashé, required),
  name: String (required),
  createdAt: Date
}
```

#### Order Service (PostgreSQL)
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Checkpoint de validation

Cette documentation permet de :
- ✅ Lancer le projet même sans le connaître
- ✅ Comprendre de quoi il parle, à qui, quels sont les flux de données
- ✅ Identifier les dépendances essentielles
- ✅ Comprendre l'architecture et les communications entre services

---

**Date de création** : [Date]
**Version** : 1.0 - Partie 1 uniquement
