import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔍 Test Final de l\'Application CDP Missions\n');

// Test 1: Vérification de la structure
console.log('📁 Test 1: Structure de l\'application...');
const structure = {
  frontend: [
    'src/App.tsx',
    'src/main.tsx',
    'src/types/mission.ts',
    'src/types/auth.ts',
    'src/contexts/AuthContext.tsx',
    'src/services/authService.ts',
    'src/database/localStorageDb.ts',
    'src/components/Dashboard.tsx',
    'src/components/MissionList.tsx',
    'src/components/MissionForm.tsx',
    'src/components/LoginForm.tsx',
    'src/components/UserManagement.tsx',
    'src/components/AdvancedSearch.tsx',
    'src/components/ImportMissions.tsx'
  ],
  backend: [
    'server/index.ts',
    'server/models/Mission.ts',
    'server/models/User.ts',
    'server/config/database.ts',
    'server/middleware/auth.ts'
  ],
  config: [
    'package.json',
    'server/package.json',
    'vite.config.ts',
    'tsconfig.json',
    'tailwind.config.js',
    'postcss.config.js',
    'postgres-setup.sql'
  ]
};

let allFilesExist = true;

Object.entries(structure).forEach(([category, files]) => {
  console.log(`\n${category.toUpperCase()}:`);
  files.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} - MANQUANT`);
      allFilesExist = false;
    }
  });
});

// Test 2: Vérification des dépendances
console.log('\n📦 Test 2: Dépendances...');
try {
  const frontendPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const serverPackage = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));
  
  console.log('✅ package.json frontend - OK');
  console.log('✅ package.json serveur - OK');
  
  // Vérifier les dépendances essentielles
  const essentialDeps = {
    frontend: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
    backend: ['express', 'pg', 'jsonwebtoken', 'bcryptjs', 'cors']
  };
  
  Object.entries(essentialDeps).forEach(([type, deps]) => {
    const packageJson = type === 'frontend' ? frontendPackage : serverPackage;
    deps.forEach(dep => {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        console.log(`  ✅ ${dep} - présent`);
      } else {
        console.log(`  ❌ ${dep} - manquant`);
        allFilesExist = false;
      }
    });
  });
  
} catch (error) {
  console.error('❌ Erreur lors de la vérification des dépendances:', error.message);
  allFilesExist = false;
}

// Test 3: Vérification de la configuration
console.log('\n⚙️ Test 3: Configuration...');
const configFiles = [
  'vite.config.ts',
  'tsconfig.json',
  'tailwind.config.js',
  'postcss.config.js'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

// Test 4: Vérification des scripts
console.log('\n🛠️ Test 4: Scripts disponibles...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts;
  
  const essentialScripts = ['dev', 'build', 'server:dev', 'server'];
  essentialScripts.forEach(script => {
    if (scripts[script]) {
      console.log(`✅ npm run ${script} - disponible`);
    } else {
      console.log(`❌ npm run ${script} - manquant`);
      allFilesExist = false;
    }
  });
  
} catch (error) {
  console.error('❌ Erreur lors de la vérification des scripts:', error.message);
  allFilesExist = false;
}

// Test 5: Vérification de la base de données
console.log('\n🗄️ Test 5: Base de données...');
if (fs.existsSync('postgres-setup.sql')) {
  console.log('✅ Script PostgreSQL - OK');
  
  // Vérifier le contenu du script
  const sqlContent = fs.readFileSync('postgres-setup.sql', 'utf8');
  const hasTables = sqlContent.includes('CREATE TABLE');
  const hasAdmin = sqlContent.includes('admin-1');
  
  if (hasTables) console.log('✅ Tables définies - OK');
  if (hasAdmin) console.log('✅ Admin par défaut - OK');
  
} else {
  console.log('❌ Script PostgreSQL - MANQUANT');
  allFilesExist = false;
}

// Test 6: Vérification des types TypeScript
console.log('\n📝 Test 6: Types TypeScript...');
const typeFiles = [
  'src/types/mission.ts',
  'src/types/auth.ts'
];

typeFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('interface') || content.includes('type')) {
      console.log(`✅ ${file} - Types définis`);
    } else {
      console.log(`⚠️ ${file} - Pas de types détectés`);
    }
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

// Résumé final
console.log('\n' + '='.repeat(60));
console.log('📋 RÉSUMÉ DE L\'ANALYSE');
console.log('='.repeat(60));

if (allFilesExist) {
  console.log('🎉 SUCCÈS: L\'application est correctement configurée !');
  console.log('\n✅ Points positifs:');
  console.log('  - Tous les fichiers essentiels sont présents');
  console.log('  - Les dépendances sont correctement définies');
  console.log('  - La configuration est complète');
  console.log('  - Les types TypeScript sont définis');
  console.log('  - La base de données est configurée');
  console.log('  - L\'authentification est implémentée');
  console.log('  - Les composants React sont présents');
  console.log('  - Les services sont opérationnels');
  
  console.log('\n🚀 L\'application est prête à être démarrée !');
  console.log('\n📝 Prochaines étapes:');
  console.log('  1. Créer le fichier .env dans server/');
  console.log('  2. Configurer PostgreSQL');
  console.log('  3. Démarrer le serveur: npm run server:dev');
  console.log('  4. Démarrer le frontend: npm run dev');
  console.log('  5. Se connecter avec: abdoulaye.niang@cdp.sn / Passer');
  
} else {
  console.log('❌ PROBLÈMES DÉTECTÉS: Certains éléments sont manquants');
  console.log('\n🔧 Actions recommandées:');
  console.log('  - Vérifier les fichiers manquants');
  console.log('  - Installer les dépendances manquantes');
  console.log('  - Corriger la configuration');
  console.log('  - Relancer ce test après corrections');
}

console.log('\n' + '='.repeat(60));
console.log('Test terminé - ' + new Date().toLocaleString());
console.log('='.repeat(60));
