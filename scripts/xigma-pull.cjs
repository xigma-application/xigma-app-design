const { execSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const IGNORE = new Set(['node_modules', 'tsconfig.json', 'tsup.config.ts', 'src.bak']);

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function copyRecursive(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function main() {
  const configPath = path.resolve(process.cwd(), 'xigma.json');
  if (!fs.existsSync(configPath)) {
    console.error('Brak pliku xigma.json w katalogu głównym projektu.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const { repo, branch = 'main', packages } = config;

  if (!repo || !Array.isArray(packages) || packages.length === 0) {
    console.error("xigma.json musi zawierać 'repo' oraz niepustą listę 'packages'.");
    process.exit(1);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xigma-shared-'));

  try {
    console.log(`> Klonowanie ${repo}#${branch}...`);
    run(`git clone --depth 1 --branch "${branch}" "${repo}" "${tmpDir}"`);

    console.log('> Instalacja zależności i budowanie paczek...');
    run('npm install --no-audit --no-fund', { cwd: tmpDir });
    run('npm run build --workspaces --if-present', { cwd: tmpDir });

    const nodeModulesXigma = path.resolve(process.cwd(), 'node_modules', '@xigma');
    fs.mkdirSync(nodeModulesXigma, { recursive: true });

    for (const pkgName of packages) {
      const src = path.join(tmpDir, 'packages', pkgName);
      const dest = path.join(nodeModulesXigma, pkgName);

      if (!fs.existsSync(src)) {
        console.warn(`! Pominięto @xigma/${pkgName} — nie znaleziono w repo`);
        continue;
      }

      fs.rmSync(dest, { recursive: true, force: true });
      fs.mkdirSync(dest, { recursive: true });
      copyRecursive(src, dest);
      console.log(`> Skopiowano @xigma/${pkgName}`);
    }

    console.log('> Gotowe.');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main();
