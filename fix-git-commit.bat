@echo off
echo ========================================
echo   Resolution du probleme de commit Git
echo ========================================
echo.

echo 1. Configuration de l'editeur Git...
git config --global core.editor "notepad"

echo 2. Ajout des fichiers...
git add .

echo 3. Creation du commit avec message direct...
git commit -m "docs: mise a jour des fichiers Git - Amelioration du .gitignore, README et guide Git pour CDP Missions"

echo.
echo ✅ Commit realise avec succes !
echo.
echo Pour verifier :
echo - git log --oneline
echo - git status
echo.
pause
