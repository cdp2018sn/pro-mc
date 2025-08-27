@echo off
echo ========================================
echo   Creation automatique du repository GitHub
echo ========================================
echo.

echo Installation de GitHub CLI...
winget install GitHub.cli

echo.
echo Connexion a GitHub...
gh auth login

echo.
echo Creation du repository...
gh repo create cdp-missions --public --description "Application de gestion des missions CDP avec PostgreSQL" --source=. --remote=origin --push

echo.
echo ✅ Repository cree et code pousse avec succes !
echo.
echo Votre repository : https://github.com/AbdoulayeGB/cdp-missions
echo.
pause
