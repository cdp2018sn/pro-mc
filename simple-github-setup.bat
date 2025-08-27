@echo off
echo ========================================
echo   Configuration GitHub Simple
echo ========================================
echo.

echo IMPORTANT : Assurez-vous d'avoir cree le repository sur GitHub !
echo.

set /p username="Votre nom d'utilisateur GitHub : "

echo.
echo Configuration du remote...
git remote remove origin
git remote add origin https://github.com/%username%/cdp-missions.git

echo.
echo Poussee vers GitHub...
git push -u origin main

echo.
echo ✅ Termine !
echo.
pause
