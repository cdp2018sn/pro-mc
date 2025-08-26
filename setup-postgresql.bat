@echo off
echo ========================================
echo   Installation PostgreSQL - CDP Missions
echo ========================================
echo.

echo 1. Vérification de PostgreSQL...
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL n'est pas installé ou pas dans le PATH
    echo.
    echo 📥 Veuillez installer PostgreSQL :
    echo   1. Allez sur : https://www.postgresql.org/download/windows/
    echo   2. Téléchargez et installez PostgreSQL
    echo   3. Notez le mot de passe de l'utilisateur 'postgres'
    echo   4. Relancez ce script après l'installation
    echo.
    pause
    exit /b 1
)

echo ✅ PostgreSQL est installé
echo.

echo 2. Création de la base de données...
psql -U postgres -c "CREATE DATABASE cdp_missions;" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Base de données 'cdp_missions' créée
) else (
    echo ℹ️ Base de données existe déjà ou erreur de connexion
)
echo.

echo 3. Configuration du fichier .env...
if not exist "server\.env" (
    copy "server\env.example" "server\.env"
    echo ✅ Fichier .env créé
) else (
    echo ℹ️ Fichier .env existe déjà
)
echo.

echo 4. Installation des dépendances...
cd server
npm install
cd ..
echo.

echo 5. Initialisation de la base de données...
cd server
echo.
echo 🔄 Création des tables...
npm run db:migrate
echo.
echo 🔄 Insertion des données initiales...
npm run db:seed
cd ..
echo.

echo ========================================
echo ✅ Installation terminée !
echo ========================================
echo.
echo 🚀 Pour démarrer l'application :
echo    npm start
echo.
echo 📊 Pour vérifier la base de données :
echo    psql -U postgres -d cdp_missions -c "\dt"
echo.
pause
