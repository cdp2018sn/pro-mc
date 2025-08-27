@echo off
echo ========================================
echo   Diagnostic GitHub - CDP Missions
echo ========================================
echo.

echo 1. Verification de la configuration Git...
git config --list | findstr user

echo.
echo 2. Verification du remote...
git remote -v

echo.
echo 3. Test de connexion a GitHub...
git ls-remote origin

echo.
echo 4. Verification de l'URL du repository...
echo URL actuelle : https://github.com/AbdoulayeGB/cdp-missions.git

echo.
echo 5. Test de l'existence du repository...
curl -I https://github.com/AbdoulayeGB/cdp-missions

echo.
echo ========================================
echo   DIAGNOSTIC TERMINE
echo ========================================
echo.
echo Si vous voyez "404 Not Found", le repository n'existe pas
echo Si vous voyez "200 OK", le repository existe
echo.
pause
