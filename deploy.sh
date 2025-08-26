#!/bin/bash

echo "🚀 Déploiement de CDP Missions - Guide Automatisé"
echo "=================================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Étapes de déploiement :${NC}"
echo "1. Configuration Supabase (Backend)"
echo "2. Configuration Vercel (Frontend)"
echo "3. Déploiement automatique"
echo ""

# Vérifier si les variables d'environnement sont configurées
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé${NC}"
    echo -e "${BLUE}📝 Création du fichier .env...${NC}"
    
    cat > .env << EOF
# Configuration Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon

# API Configuration
VITE_API_URL=https://votre-projet.supabase.co
EOF
    
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT : Mettez à jour les valeurs dans .env avec vos vraies clés Supabase${NC}"
fi

# Installation des dépendances
echo -e "${BLUE}📦 Installation des dépendances...${NC}"
npm install

# Build de l'application
echo -e "${BLUE}🔨 Build de l'application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build réussi${NC}"
else
    echo -e "${RED}❌ Erreur lors du build${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Configuration locale terminée !${NC}"
echo ""
echo -e "${BLUE}📋 Prochaines étapes manuelles :${NC}"
echo ""
echo -e "${YELLOW}1. Configuration Supabase :${NC}"
echo "   - Aller sur https://supabase.com"
echo "   - Créer un nouveau projet"
echo "   - Exécuter le script SQL : pro-mc/server/scripts/supabase-setup.sql"
echo "   - Récupérer les clés API"
echo "   - Mettre à jour le fichier .env"
echo ""
echo -e "${YELLOW}2. Configuration Vercel :${NC}"
echo "   - Aller sur https://vercel.com"
echo "   - Connecter le repository GitHub"
echo "   - Configurer les variables d'environnement"
echo "   - Déployer"
echo ""
echo -e "${GREEN}📖 Guide complet : pro-mc/DEPLOYMENT_GUIDE.md${NC}"
echo ""
echo -e "${BLUE}🔗 URLs attendues :${NC}"
echo "   Frontend : https://votre-projet.vercel.app"
echo "   Backend : https://votre-projet.supabase.co"
echo ""
echo -e "${GREEN}✅ Script terminé !${NC}"
