#!/usr/bin/env node

console.log('🔍 Diagnostic de Déploiement - CDP Missions');
console.log('==========================================');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vérifications
const checks = [];

// 1. Vérifier package.json
console.log('\n📦 Vérification package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  checks.push({
    name: 'package.json valide',
    status: '✅',
    details: `Version: ${packageJson.version}`
  });
  
  if (packageJson.scripts.build) {
    checks.push({
      name: 'Script build présent',
      status: '✅',
      details: packageJson.scripts.build
    });
  } else {
    checks.push({
      name: 'Script build présent',
      status: '❌',
      details: 'Script build manquant'
    });
  }
} catch (error) {
  checks.push({
    name: 'package.json valide',
    status: '❌',
    details: error.message
  });
}

// 2. Vérifier le dossier dist
console.log('\n📁 Vérification dossier dist...');
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  const distFiles = fs.readdirSync(distPath);
  checks.push({
    name: 'Dossier dist présent',
    status: '✅',
    details: `${distFiles.length} fichiers trouvés`
  });
  
  if (distFiles.includes('index.html')) {
    checks.push({
      name: 'index.html présent',
      status: '✅',
      details: 'Fichier principal trouvé'
    });
  } else {
    checks.push({
      name: 'index.html présent',
      status: '❌',
      details: 'Fichier index.html manquant'
    });
  }
  
  if (distFiles.includes('assets')) {
    checks.push({
      name: 'Dossier assets présent',
      status: '✅',
      details: 'Assets trouvés'
    });
  } else {
    checks.push({
      name: 'Dossier assets présent',
      status: '❌',
      details: 'Dossier assets manquant'
    });
  }
} else {
  checks.push({
    name: 'Dossier dist présent',
    status: '❌',
    details: 'Dossier dist manquant - exécutez npm run build'
  });
}

// 3. Vérifier les variables d'environnement
console.log('\n🔧 Vérification variables d\'environnement...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
  
  checks.push({
    name: 'Fichier .env présent',
    status: '✅',
    details: 'Fichier de configuration trouvé'
  });
  
  checks.push({
    name: 'VITE_SUPABASE_URL',
    status: hasSupabaseUrl ? '✅' : '❌',
    details: hasSupabaseUrl ? 'Variable configurée' : 'Variable manquante'
  });
  
  checks.push({
    name: 'VITE_SUPABASE_ANON_KEY',
    status: hasSupabaseKey ? '✅' : '❌',
    details: hasSupabaseKey ? 'Variable configurée' : 'Variable manquante'
  });
} else {
  checks.push({
    name: 'Fichier .env présent',
    status: '❌',
    details: 'Fichier .env manquant'
  });
}

// 4. Vérifier vite.config.ts
console.log('\n⚙️ Vérification configuration Vite...');
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  const hasBuildConfig = viteConfig.includes('outDir');
  
  checks.push({
    name: 'vite.config.ts présent',
    status: '✅',
    details: 'Configuration Vite trouvée'
  });
  
  checks.push({
    name: 'Configuration build',
    status: hasBuildConfig ? '✅' : '❌',
    details: hasBuildConfig ? 'Configuration build présente' : 'Configuration build manquante'
  });
} else {
  checks.push({
    name: 'vite.config.ts présent',
    status: '❌',
    details: 'Fichier vite.config.ts manquant'
  });
}

// 5. Vérifier les dépendances
console.log('\n📚 Vérification dépendances...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  checks.push({
    name: 'Dépendances installées',
    status: '✅',
    details: 'node_modules présent'
  });
} else {
  checks.push({
    name: 'Dépendances installées',
    status: '❌',
    details: 'node_modules manquant - exécutez npm install'
  });
}

// Affichage des résultats
console.log('\n📊 Résultats du diagnostic :');
console.log('============================');

checks.forEach(check => {
  console.log(`${check.status} ${check.name}: ${check.details}`);
});

// Résumé
const successCount = checks.filter(c => c.status === '✅').length;
const totalCount = checks.length;

console.log(`\n📈 Résumé: ${successCount}/${totalCount} vérifications réussies`);

if (successCount === totalCount) {
  console.log('\n🎉 Tous les tests sont passés ! L\'application est prête pour le déploiement.');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Vérifier la configuration Vercel (Framework: Vite, Root: pro-mc)');
  console.log('2. Configurer les variables d\'environnement dans Vercel');
  console.log('3. Déployer sur Vercel');
} else {
  console.log('\n⚠️ Certains problèmes ont été détectés. Veuillez les corriger avant le déploiement.');
  console.log('\n🔧 Actions recommandées :');
  
  const failedChecks = checks.filter(c => c.status === '❌');
  failedChecks.forEach(check => {
    console.log(`- Corriger: ${check.name}`);
  });
}

console.log('\n📖 Pour plus d\'informations, consultez TROUBLESHOOTING_DEPLOYMENT.md');
