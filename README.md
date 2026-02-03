# Pipeline DevSecOps - Application Microservices

## 🚀 Démarrage Rapide

### Prérequis
- Docker & Docker Compose
- Git

### Lancer le projet

```bash
# Cloner le repository
git clone https://github.com/LeBoogiepop/DevSecOps.git
cd DevSecOps

# Créer le fichier .env (copier depuis env.example)
cp env.example .env

# Démarrer tous les services
docker-compose up -d

# Attendre 30 secondes que les services démarrent
sleep 30

# Vérifier que tout fonctionne
docker-compose ps
curl http://localhost:8080/health
```

### Accès aux services
- **API Gateway**: http://localhost:8080
- **User Service**: http://localhost:3001
- **Order Service**: http://localhost:3002

## 📋 Vue d'ensemble

Cette application est composée de **3 microservices** :
1. **API Gateway** (Port 8080) - Point d'entrée unique, routage et authentification
2. **User Service** (Port 3001) - Gestion des utilisateurs et authentification
3. **Order Service** (Port 3002) - Gestion des commandes

### Architecture
```
Client → API Gateway → User Service
                    → Order Service
```

## 📚 Documentation

Voir [docs/TP-DevSecOps.md](docs/TP-DevSecOps.md) pour la **Partie 1 : Description du Système** :
- Architecture applicative détaillée
- Points d'entrée exposés
- Dépendances critiques
- Flux de données

## 🧪 Test rapide de l'API

```bash
# 1. Créer un utilisateur
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# 2. Se connecter (récupérer le token)
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Créer une commande (remplacer TOKEN par le token reçu)
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"items":[{"name":"Product 1","price":10}],"totalAmount":10}'
```

## 📝 Structure du Projet

```
.
├── docs/
│   └── TP-DevSecOps.md          # Documentation Partie 1
├── services/
│   ├── api-gateway/             # Service API Gateway
│   ├── user-service/            # Service utilisateurs
│   └── order-service/           # Service commandes
├── scripts/
│   └── health-check.sh          # Script de vérification
├── docker-compose.yml            # Configuration Docker
└── README.md                     # Ce fichier
```

## 🛑 Arrêter les services

```bash
docker-compose down
```

## 🔗 Liens

- **Repository GitHub**: https://github.com/LeBoogiepop/DevSecOps

## 👥 Auteurs

Étudiant INGE3 - Cours DevSecOps

## 📄 Licence

Ce projet est réalisé dans le cadre du cours DevSecOps.
