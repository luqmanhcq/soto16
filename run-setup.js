const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = 'c:\\wwwroot\\soto16';

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

try {
  // Step 1: Remove node_modules
  log('Removing node_modules...');
  const nm = path.join(root, 'node_modules');
  if (fs.existsSync(nm)) {
    fs.rmSync(nm, { recursive: true, force: true });
    log('node_modules removed');
  } else {
    log('node_modules not found');
  }

  // Step 2: Remove package-lock.json
  log('Removing package-lock.json...');
  const pl = path.join(root, 'package-lock.json');
  if (fs.existsSync(pl)) {
    fs.unlinkSync(pl);
    log('package-lock.json removed');
  }

  // Step 3: Remove pages dir
  log('Removing pages dir...');
  const pg = path.join(root, 'pages');
  if (fs.existsSync(pg)) {
    fs.rmSync(pg, { recursive: true, force: true });
    log('pages removed');
  }

  // Step 4: npm install
  log('Running npm install...');
  execSync('npm install', { cwd: root, stdio: 'pipe', timeout: 300000 });
  log('npm install completed');

  // Step 5: Check version
  const nextPkg = require(path.join(root, 'node_modules', 'next', 'package.json'));
  log('Next.js version: ' + nextPkg.version);

  log('ALL DONE');
} catch (e) {
  log('ERROR: ' + (e.stderr ? e.stderr.toString() : e.message));
  process.exit(1);
}
