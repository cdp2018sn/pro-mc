#!/bin/bash

echo "========================================"
echo "Configuration des variables Supabase"
echo "========================================"

echo ""
echo "Création du fichier .env..."

cat > .env << EOF
# Configuration Supabase pour CDP Missions
VITE_SUPABASE_URL=https://zkjhbstofbthnitunzcf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpramhic3RvZmJ0aG5pdHVuemNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTA0ODcsImV4cCI6MjA3MjY2NjQ4N30.OoFTGdwjXvA1hwcMsh_8WIQmNerBulCd7wCxRFTe21w

# Configuration API
VITE_API_URL=https://zkjhbstofbthnitunzcf.supabase.co

# Configuration de l'application
VITE_APP_NAME=CDP Missions
VITE_APP_VERSION=1.0.0
EOF

echo ""
echo "✅ Fichier .env créé avec succès !"
echo ""
echo "Variables configurées :"
echo "- VITE_SUPABASE_URL: https://zkjhbstofbthnitunzcf.supabase.co"
echo "- VITE_SUPABASE_ANON_KEY: [configurée]"
echo "- VITE_API_URL: https://zkjhbstofbthnitunzcf.supabase.co"
echo ""
echo "Pour tester la configuration :"
echo "1. Redémarrer l'application : npm run dev"
echo "2. Ouvrir la console du navigateur (F12)"
echo "3. Vérifier les messages de connexion Supabase"
echo ""
