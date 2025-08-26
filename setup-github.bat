@echo off
echo ========================================
echo   Configuration GitHub - CDP Missions
echo ========================================
echo.

echo Instructions pour enregistrer sur GitHub :
echo.
echo 1. Allez sur https://github.com
echo 2. Connectez-vous a votre compte
echo 3. Cliquez sur "New" (bouton +)
echo 4. Nom du repository : cdp-missions
echo 5. Description : Application de gestion des missions CDP avec PostgreSQL
echo 6. Choisissez Public ou Private
echo 7. NE PAS cocher "Add a README file"
echo 8. Cliquez sur "Create repository"
echo.

set /p username="Votre nom d'utilisateur GitHub : "
set /p repo="Nom du repository (ou appuyez sur Entree pour 'cdp-missions') : "

if "%repo%"=="" set repo=cdp-missions

echo.
echo Configuration du remote GitHub...
git remote add origin https://github.com/%username%/%repo%.git

echo.
echo Poussee vers GitHub...
git push -u origin main

echo.
echo ✅ Repository enregistre sur GitHub avec succes !
echo.
echo Votre repository est disponible sur :
echo https://github.com/%username%/%repo%
echo.
pause
