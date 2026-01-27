const fs = require('fs');
const path = require('path');

/**
 * Pre-Deployment Check Script
 * Verifies that the project is ready for deployment to Vercel
 */

const checks = [];
let allPassed = true;

function check(name, condition, errorMessage) {
  if (condition) {
    checks.push({ name, passed: true });
    console.log(`✅ ${name}`);
  } else {
    checks.push({ name, passed: false, error: errorMessage });
    console.log(`❌ ${name}`);
    console.log(`   ${errorMessage}`);
    allPassed = false;
  }
}

console.log('🔍 Pre-Deployment Check\n');

// Check 1: Frontend build files
console.log('📦 Checking Frontend...');
const frontendDistExists = fs.existsSync(
  path.join(__dirname, '../../../frontend/dist'),
);
check(
  'Frontend build exists',
  frontendDistExists,
  'Run: cd frontend && npm run build',
);

// Check 2: Backend files
console.log('\n📦 Checking Backend...');
const backendIndexExists = fs.existsSync(
  path.join(__dirname, '../../../backend/src/index.js'),
);
check('Backend entry point exists', backendIndexExists, 'Missing backend/src/index.js');

const backendVercelConfigExists = fs.existsSync(
  path.join(__dirname, '../../../backend/vercel.json'),
);
check(
  'Backend Vercel config exists',
  backendVercelConfigExists,
  'Missing backend/vercel.json',
);

// Check 3: Environment variable templates
console.log('\n🔧 Checking Environment Files...');
const frontendEnvExample = fs.existsSync(
  path.join(__dirname, '../../../frontend/.env.example'),
);
check(
  'Frontend .env.example exists',
  frontendEnvExample,
  'Missing frontend/.env.example',
);

const backendEnvExample = fs.existsSync(
  path.join(__dirname, '../../../backend/.env.example'),
);
check(
  'Backend .env.example exists',
  backendEnvExample,
  'Missing backend/.env.example',
);

// Check 4: Package.json dependencies
console.log('\n📚 Checking Dependencies...');
const backendPackageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../../backend/package.json'), 'utf-8'),
);
const hasDependencies = Object.keys(backendPackageJson.dependencies || {}).length > 0;
check('Backend has dependencies', hasDependencies, 'No dependencies in backend/package.json');

const frontendPackageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../../frontend/package.json'), 'utf-8'),
);
const hasFrontendDeps = Object.keys(frontendPackageJson.dependencies || {}).length > 0;
check('Frontend has dependencies', hasFrontendDeps, 'No dependencies in frontend/package.json');

// Check 5: Build scripts
console.log('\n⚙️  Checking Build Scripts...');
const hasFrontendBuild = frontendPackageJson.scripts && frontendPackageJson.scripts.build;
check(
  'Frontend has build script',
  hasFrontendBuild,
  'Missing "build" script in frontend/package.json',
);

// Check 6: Node version
console.log('\n🔢 Checking Node Version...');
const hasNodeEngines = backendPackageJson.engines && backendPackageJson.engines.node;
check(
  'Backend specifies Node version',
  hasNodeEngines,
  'Add "engines": { "node": ">=20.19.0" } to backend/package.json',
);

// Check 7: Critical files
console.log('\n📄 Checking Critical Files...');
const hasReadme = fs.existsSync(path.join(__dirname, '../../../README.md'));
check('README.md exists', hasReadme, 'Missing README.md');

const hasGitignore = fs.existsSync(path.join(__dirname, '../../../.gitignore'));
check('.gitignore exists', hasGitignore, 'Missing .gitignore - ensure .env files are ignored');

// Summary
console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log('✅ All checks passed! Ready for deployment.\n');
  console.log('Next steps:');
  console.log('1. Deploy backend: cd backend && vercel --prod');
  console.log('2. Note the backend URL');
  console.log('3. Update frontend/.env.production with backend URL');
  console.log('4. Deploy frontend: cd frontend && vercel --prod');
  console.log('\nDon\'t forget to set environment variables in Vercel Dashboard!');
} else {
  console.log('❌ Some checks failed. Please fix the issues above before deploying.\n');
  process.exit(1);
}

// Additional warnings
console.log('\n⚠️  Remember to:');
console.log('- Set up MongoDB Atlas for production database');
console.log('- Add all environment variables in Vercel Dashboard');
console.log('- Update CORS settings with production URLs');
console.log('- Test the deployment thoroughly');
console.log('- Set up custom domain (optional)');
