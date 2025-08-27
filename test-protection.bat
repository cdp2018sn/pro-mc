@echo off
echo ========================================
echo   Test de Protection des Routes Admin
echo ========================================
echo.

echo Instructions de test :
echo.
echo 1. Ouvrez votre navigateur
echo 2. Allez sur http://localhost:3000
echo 3. Testez les scenarios suivants :
echo.

echo === SCENARIO 1 : ADMINISTRATEUR ===
echo - Connectez-vous avec :
echo   Email: abdoulaye.niang@cdp.sn
echo   Mot de passe: Passer
echo - Verifiez que vous voyez "Debug" et "Gestion utilisateurs" dans le menu
echo - Testez l'acces a /debug et /users
echo.

echo === SCENARIO 2 : UTILISATEUR NORMAL ===
echo - Creez un utilisateur normal via "Gestion utilisateurs"
echo - Deconnectez-vous et reconnectez-vous avec le nouvel utilisateur
echo - Verifiez que vous NE voyez PAS "Debug" et "Gestion utilisateurs"
echo - Testez l'acces direct a http://localhost:3000/debug
echo - Vous devriez voir "Acces refuse"
echo.

echo === SCENARIO 3 : ACCES DIRECT ===
echo - Connectez-vous en tant qu'utilisateur normal
echo - Tapez directement dans l'URL : http://localhost:3000/debug
echo - Verifiez que la page "Acces refuse" s'affiche
echo.

echo === VERIFICATIONS ===
echo - [ ] Menu correct selon le role
echo - [ ] Protection des routes active
echo - [ ] Page d'erreur professionnelle
echo - [ ] Bouton de retour fonctionnel
echo.

pause
