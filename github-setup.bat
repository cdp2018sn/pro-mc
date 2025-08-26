@echo off
echo ========================================
echo   Configuration GitHub - CDP Missions
echo ========================================
echo.

echo IMPORTANT : Utilisez votre nom d'utilisateur GitHub, PAS votre email !
echo.

set /p username="Votre nom d'utilisateur GitHub (ex: john-doe) : "

echo.
echo Configuration du remote GitHub...
git remote add origin https://github.com/%username%/cdp-missions.git

echo.
echo Test de connexion...
git remote -v

echo.
echo Poussee vers GitHub...
git push -u origin main

echo.
echo ✅ Repository connecte a GitHub !
echo.
echo Votre repository : https://github.com/%username%/cdp-missions
echo.
pause
