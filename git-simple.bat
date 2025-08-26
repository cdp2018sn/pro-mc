@echo off
echo ========================================
echo   Git Simple - CDP Missions
echo ========================================
echo.

echo Ajout de tous les fichiers...
git add .

echo.
echo Creation du commit...
git commit -m "docs: mise a jour des fichiers Git - Amelioration du .gitignore, README et guide Git pour CDP Missions"

echo.
echo ✅ Git mis a jour avec succes !
echo.
echo Commandes utiles :
echo - git status : voir l'etat
echo - git log --oneline : voir l'historique
echo - git push : pousser vers le distant
echo.
pause
