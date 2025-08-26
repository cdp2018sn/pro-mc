@echo off
chcp 65001 >nul
echo 🚀 Déploiement de CDP Missions - Guide Automatisé
echo ==================================================

REM Vérifier si les variables d'environnement sont configurées
if not exist ".env" (
    echo ⚠️  Fichier .env non trouvé
    echo 📝 Création du fichier .env...
    
    (
        echo # Configuration Supabase
        echo VITE_SUPABASE_URL=https://votre-projet.supabase.co
        echo VITE_SUPABASE_ANON_KEY=votre-clé-anon
        echo.
        echo # API Configuration
        echo VITE_API_URL=https://votre-projet.supabase.co
    ) > .env
    
    echo ✅ Fichier .env créé
    echo ⚠️  IMPORTANT : Mettez à jour les valeurs dans .env avec vos vraies clés Supabase
)

REM Installation des dépendances
echo 📦 Installation des dépendances...
call npm install

REM Build de l'application
echo 🔨 Build de l'application...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Build réussi
) else (
    echo ❌ Erreur lors du build
    pause
    exit /b 1
)

echo.
echo 🎉 Configuration locale terminée !
echo.
echo 📋 Prochaines étapes manuelles :
echo.
echo 1. Configuration Supabase :
echo    - Aller sur https://supabase.com
echo    - Créer un nouveau projet
echo    - Exécuter le script SQL : pro-mc/server/scripts/supabase-setup.sql
echo    - Récupérer les clés API
echo    - Mettre à jour le fichier .env
echo.
echo 2. Configuration Vercel :
echo    - Aller sur https://vercel.com
echo    - Connecter le repository GitHub
echo    - Configurer les variables d'environnement
echo    - Déployer
echo.
echo 📖 Guide complet : pro-mc/DEPLOYMENT_GUIDE.md
echo.
echo 🔗 URLs attendues :
echo    Frontend : https://votre-projet.vercel.app
echo    Backend : https://votre-projet.supabase.co
echo.
echo ✅ Script terminé !
pause
