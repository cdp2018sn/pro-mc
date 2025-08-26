@echo off
echo ========================================
echo   Configuration Finale GitHub
echo ========================================
echo.

echo IMPORTANT : 
echo 1. Assurez-vous d'avoir cree le repository 'cdp-missions' sur GitHub
echo 2. Utilisez votre nom d'utilisateur GitHub exact
echo.

set /p username="Votre nom d'utilisateur GitHub exact : "

echo.
echo Suppression de l'ancien remote...
git remote remove origin

echo.
echo Configuration du nouveau remote...
git remote add origin https://github.com/%username%/cdp-missions.git

echo.
echo Verification de la configuration...
git remote -v

echo.
echo Poussee vers GitHub...
git push -u origin main

echo.
echo ✅ Repository connecte a GitHub avec succes !
echo.
echo Votre repository : https://github.com/%username%/cdp-missions
echo.
pause
