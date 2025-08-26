@echo off
echo ========================================
echo   Gestion Git - CDP Missions
echo ========================================
echo.

:menu
echo Choisissez une action :
echo.
echo 1. Voir le statut des fichiers
echo 2. Ajouter tous les fichiers
echo 3. Créer un commit
echo 4. Voir l'historique des commits
echo 5. Pousser vers le repository distant
echo 6. Tirer depuis le repository distant
echo 7. Voir les branches
echo 8. Créer une nouvelle branche
echo 9. Changer de branche
echo 10. Quitter
echo.

set /p choice="Votre choix (1-10) : "

if "%choice%"=="1" goto status
if "%choice%"=="2" goto add
if "%choice%"=="3" goto commit
if "%choice%"=="4" goto log
if "%choice%"=="5" goto push
if "%choice%"=="6" goto pull
if "%choice%"=="7" goto branches
if "%choice%"=="8" goto newbranch
if "%choice%"=="9" goto checkout
if "%choice%"=="10" goto end

echo Choix invalide. Veuillez réessayer.
echo.
goto menu

:status
echo.
echo === Statut des fichiers ===
git status
echo.
pause
goto menu

:add
echo.
echo === Ajout de tous les fichiers ===
git add .
echo ✅ Fichiers ajoutés
echo.
pause
goto menu

:commit
echo.
echo === Création d'un commit ===
set /p message="Message du commit : "
git commit -m "%message%"
echo ✅ Commit créé
echo.
pause
goto menu

:log
echo.
echo === Historique des commits ===
git log --oneline -10
echo.
pause
goto menu

:push
echo.
echo === Push vers le repository distant ===
git push
echo ✅ Push terminé
echo.
pause
goto menu

:pull
echo.
echo === Pull depuis le repository distant ===
git pull
echo ✅ Pull terminé
echo.
pause
goto menu

:branches
echo.
echo === Branches disponibles ===
git branch -a
echo.
pause
goto menu

:newbranch
echo.
echo === Création d'une nouvelle branche ===
set /p branchname="Nom de la nouvelle branche : "
git checkout -b %branchname%
echo ✅ Nouvelle branche créée et activée
echo.
pause
goto menu

:checkout
echo.
echo === Changement de branche ===
set /p branchname="Nom de la branche : "
git checkout %branchname%
echo ✅ Changement de branche effectué
echo.
pause
goto menu

:end
echo.
echo Au revoir !
exit /b 0
