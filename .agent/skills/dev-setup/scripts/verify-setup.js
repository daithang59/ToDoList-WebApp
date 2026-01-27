const http = require('http');

/**
 * Verify Setup Script
 * Checks that all services are running correctly
 */

const checks = [
  {
    name: 'Frontend',
    url: 'http://localhost:5173',
    expectedStatus: 200,
  },
  {
    name: 'Backend Health',
    url: 'http://localhost:5000/api/health',
    expectedStatus: 200,
  },
  {
    name: 'Backend API',
    url: 'http://localhost:5000/api',
    expectedStatus: 200,
  },
];

function checkService(check) {
  return new Promise((resolve) => {
    const url = new URL(check.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      const success = res.statusCode === check.expectedStatus;
      resolve({
        ...check,
        success,
        status: res.statusCode,
      });
    });

    req.on('error', (error) => {
      resolve({
        ...check,
        success: false,
        error: error.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        ...check,
        success: false,
        error: 'Timeout',
      });
    });

    req.end();
  });
}

async function verifySetup() {
  console.log('🔍 Verifying Development Setup...\n');

  const results = await Promise.all(checks.map(checkService));

  let allPassed = true;

  results.forEach((result) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    if (!result.success) {
      allPassed = false;
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      } else {
        console.log(
          `   Expected status ${result.expectedStatus}, got ${result.status}`,
        );
      }
    }
  });

  console.log('\n' + '='.repeat(50));

  if (allPassed) {
    console.log('✅ All services are running correctly!');
    console.log('\nYou can now:');
    console.log('- Open the app at http://localhost:5173');
    console.log('- View API docs at http://localhost:5000/api-docs');
    console.log('- Check logs with: npm run logs');
  } else {
    console.log('❌ Some services are not running correctly.');
    console.log('\nTroubleshooting:');
    console.log('1. Check if Docker containers are running: docker ps');
    console.log('2. View logs: npm run logs');
    console.log('3. Restart services: npm run restart');
    console.log(
      '4. If issues persist, run: npm run clean && npm run install:all && npm run dev',
    );
    process.exit(1);
  }
}

verifySetup();
