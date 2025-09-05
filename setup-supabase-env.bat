@echo off
echo ========================================
echo Configuration des variables Supabase
echo ========================================

echo.
echo Creation du fichier .env...

echo # Configuration Supabase pour CDP Missions > .env
echo VITE_SUPABASE_URL=https://zkjhbstofbthnitunzcf.supabase.co >> .env
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpramhic3RvZmJ0aG5pdHVuemNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTA0ODcsImV4cCI6MjA3MjY2NjQ4N30.OoFTGdwjXvA1hwcMsh_8WIQmNerBulCd7wCxRFTe21w >> .env
echo. >> .env
echo # Configuration API >> .env
echo VITE_API_URL=https://zkjhbstofbthnitunzcf.supabase.co >> .env
echo. >> .env
echo # Configuration de l'application >> .env
echo VITE_APP_NAME=CDP Missions >> .env
echo VITE_APP_VERSION=1.0.0 >> .env

echo.
echo ✅ Fichier .env cree avec succes !
echo.
echo Variables configurees :
echo - VITE_SUPABASE_URL: https://zkjhbstofbthnitunzcf.supabase.co
echo - VITE_SUPABASE_ANON_KEY: [configuree]
echo - VITE_API_URL: https://zkjhbstofbthnitunzcf.supabase.co
echo.
echo Pour tester la configuration :
echo 1. Redemarrer l'application : npm run dev
echo 2. Ouvrir la console du navigateur (F12)
echo 3. Verifier les messages de connexion Supabase
echo.
pause
