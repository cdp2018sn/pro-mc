#!/bin/bash

echo "========================================"
echo "   Configuration PostgreSQL pour CDP"
echo "========================================"
echo

echo "[1/5] Vérification de PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL n'est pas installé."
    echo
    echo "Pour installer PostgreSQL :"
    echo "Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "macOS: brew install postgresql"
    echo
    exit 1
else
    echo "✅ PostgreSQL est installé."
fi

echo
echo "[2/5] Test de connexion à PostgreSQL..."
if ! sudo -u postgres psql -c "SELECT version();" &> /dev/null; then
    echo "❌ Impossible de se connecter à PostgreSQL."
    echo
    echo "Vérifiez que PostgreSQL est démarré :"
    echo "sudo systemctl start postgresql"
    echo
    exit 1
else
    echo "✅ Connexion PostgreSQL réussie."
fi

echo
echo "[3/5] Création de la base de données..."
if sudo -u postgres psql -c "CREATE DATABASE cdp_missions;" &> /dev/null; then
    echo "✅ Base de données 'cdp_missions' créée."
else
    echo "ℹ️ La base de données existe déjà ou erreur de création."
fi

echo
echo "[4/5] Installation des dépendances du serveur..."
cd server
if npm install; then
    echo "✅ Dépendances installées."
else
    echo "❌ Erreur lors de l'installation des dépendances."
    exit 1
fi

echo
echo "[5/5] Migration de la base de données..."
if npm run db:migrate; then
    echo "✅ Migration terminée."
else
    echo "❌ Erreur lors de la migration."
    exit 1
fi

echo
echo "========================================"
echo "   Configuration terminée !"
echo "========================================"
echo
echo "Pour démarrer l'application :"
echo "1. cd server && npm run dev"
echo "2. Dans un autre terminal : npm run dev"
echo
