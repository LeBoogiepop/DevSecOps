# Pipeline DevSecOps - Application Microservices

## Démarrage Rapide

### Prérequis
- Docker & Docker Compose
- Git

### Lancer le projet

```bash
# Cloner le repository
git clone https://github.com/LeBoogiepop/DevSecOps.git
cd DevSecOps

# Démarrer tous les services
docker-compose up -d --build

# Attendre que les services démarrent (environ 30 secondes)
# Vérifier le statut
docker-compose ps

# Vérifier que l'API Gateway fonctionne
curl http://localhost:8080/health
```

### Accès aux services

- **API Gateway**: http://localhost:8080
- **User Service**: http://localhost:3001
- **Order Service**: http://localhost:3002
- **Interface Web**: http://localhost:8080 (optionnelle)

## Vue d'ensemble

Cette application est composée de **3 microservices** :

1. **API Gateway** (Port 8080) - Point d'entrée unique, routage et authentification
2. **User Service** (Port 3001) - Gestion des utilisateurs et authentification
3. **Order Service** (Port 3002) - Gestion des commandes

### Architecture

```
Client → API Gateway → User Service → Order Service
```

## Documentation

**Voir [docs/TP-DevSecOps.md](docs/TP-DevSecOps.md) pour la Partie 1 : Description du Système**

Cette documentation contient une architecture applicative détaillée, des points d'entrée exposés (routes API, ports, authentification), les dépendances critiques (bases de données, bibliothèques tierces, images Docker) et les flux de données (données sensibles, communication inter-services)

## Arrêter les services

```bash
docker-compose down
```

## Liens

- **Repository GitHub**: https://github.com/LeBoogiepop/DevSecOps
