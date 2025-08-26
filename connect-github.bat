@echo off
echo ========================================
echo   Connexion GitHub - CDP Missions
echo ========================================
echo.

echo Instructions :
echo 1. Allez sur https://github.com
echo 2. Connectez-vous et creez un repository nomme 'cdp-missions'
echo 3. NE PAS cocher "Add a README file"
echo 4. Copiez l'URL du repository
echo.

set /p username="Votre nom d'utilisateur GitHub : "

echo.
echo Configuration du remote GitHub...
git remote add origin https://github.com/%username%/cdp-missions.git

echo.
echo Poussee vers GitHub...
git push -u origin main

echo.
echo ✅ Repository connecte a GitHub !
echo.
echo Votre repository : https://github.com/%username%/cdp-missions
echo.
pause
