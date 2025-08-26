#!/bin/bash

echo "🔧 Configuration de la Synchronisation CDP Missions"
echo "================================================"

echo ""
echo "1. Création du fichier .env..."

cat > pro-mc/.env << EOF
# Configuration Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-supabase
VITE_API_URL=https://votre-projet.supabase.co
VITE_APP_NAME=CDP Missions
VITE_APP_VERSION=1.0.0
EOF

echo "✅ Fichier .env créé"
echo ""
echo "2. Installation des dépendances..."
cd pro-mc
npm install

echo ""
echo "3. Test de build..."
npm run build

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Modifiez le fichier .env avec vos vraies clés Supabase"
echo "2. Testez l'application : npm run dev"
echo "3. Vérifiez la synchronisation dans 'Gestion des Utilisateurs'"
echo ""
read -p "Appuyez sur Entrée pour continuer..."
