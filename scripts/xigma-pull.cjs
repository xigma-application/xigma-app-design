const { execFileSync, execSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// pliki/katalogi z paczki, których nie kopiujemy do node_modules/@xigma/*
const IGNORE = new Set(['node_modules', 'tsconfig.json', 'tsup.config.ts', 'src.bak', '.turbo']);

const PROJECT_ROOT = process.cwd();
const NODE_MODULES_XIGMA = path.resolve(PROJECT_ROOT, 'node_modules', '@xigma');
const SHA_MARKER = path.join(NODE_MODULES_XIGMA, '.xigma-pull-sha');

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function tryGit(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
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

// git@github.com:org/repo.git -> https://github.com/org/repo.git
function toHttpsUrl(repo) {
  const sshMatch = repo.match(/^git@([^:]+):(.+)$/);
  if (sshMatch) return `https://${sshMatch[1]}/${sshMatch[2]}`;
  return repo;
}

function readConfig() {
  const configPath = path.resolve(PROJECT_ROOT, 'xigma.json');
  if (!fs.existsSync(configPath)) {
    console.error('Brak pliku xigma.json w katalogu głównym projektu.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const { repo, branch = 'main', packages } = config;

  if (!repo) {
    console.error("xigma.json musi zawierać 'repo'.");
    process.exit(1);
  }

  // packages: tablica = jawna lista; brak / "*" = wszystkie paczki z repo
  const explicitPackages = Array.isArray(packages) && packages.length > 0 ? packages : null;

  return { repo, branch, explicitPackages, repoHttps: config.repoHttps || toHttpsUrl(repo) };
}

// zwraca [url, url?] w kolejności prób: najpierw z xigma.json, potem HTTPS jako fallback
function candidateUrls({ repo, repoHttps }) {
  return repo === repoHttps ? [repo] : [repo, repoHttps];
}

function resolveRemoteSha(urls, branch) {
  for (const url of urls) {
    const out = tryGit(['ls-remote', url, branch]);
    if (out) return { sha: out.split(/\s+/)[0], url };
  }
  return null;
}

function expectedPackagesPresent(names) {
  return names.every((name) => fs.existsSync(path.join(NODE_MODULES_XIGMA, name, 'package.json')));
}

function readShaMarker() {
  try {
    return fs.readFileSync(SHA_MARKER, 'utf8').trim();
  } catch {
    return null;
  }
}

function discoverPackages(repoDir) {
  const packagesDir = path.join(repoDir, 'packages');
  return fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(packagesDir, entry.name, 'package.json')))
    .map((entry) => entry.name)
    .sort();
}

function copyPackages(repoDir, names, { hardFailOnMissing }) {
  fs.mkdirSync(NODE_MODULES_XIGMA, { recursive: true });

  for (const pkgName of names) {
    const src = path.join(repoDir, 'packages', pkgName);
    const dest = path.join(NODE_MODULES_XIGMA, pkgName);

    if (!fs.existsSync(src)) {
      if (hardFailOnMissing) {
        console.error(`! @xigma/${pkgName} z xigma.json nie istnieje w repo — przerywam.`);
        process.exit(1);
      }
      console.warn(`! Pominięto @xigma/${pkgName} — nie znaleziono w repo`);
      continue;
    }

    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(dest, { recursive: true });
    copyRecursive(src, dest);
    console.log(`> Skopiowano @xigma/${pkgName}`);
  }
}

function main() {
  if (process.env.XIGMA_SKIP_PULL === '1') {
    console.log('> XIGMA_SKIP_PULL=1 — pomijam pobieranie paczek @xigma/*.');
    return;
  }

  const config = readConfig();
  const urls = candidateUrls(config);

  // 1. ustal SHA zdalnego brancha i sprawdź, czy nie mamy już tego stanu
  const remote = resolveRemoteSha(urls, config.branch);
  const knownNames = config.explicitPackages || [];

  if (remote && readShaMarker() === remote.sha && (knownNames.length === 0 || expectedPackagesPresent(knownNames))) {
    console.log(`> Paczki @xigma/* są już na ${remote.sha.slice(0, 9)} — pomijam.`);
    return;
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xigma-shared-'));

  try {
    // 2. klonowanie — próbujemy kolejnych URL-i (SSH z configu, potem HTTPS)
    const cloneUrls = remote ? [remote.url] : urls;
    let cloned = false;
    for (const url of cloneUrls) {
      try {
        console.log(`> Klonowanie ${url}#${config.branch}...`);
        run(`git clone --depth 1 --branch "${config.branch}" "${url}" "${tmpDir}"`);
        cloned = true;
        break;
      } catch {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        fs.mkdirSync(tmpDir, { recursive: true });
        console.warn(`! Nie udało się sklonować z ${url}`);
      }
    }

    if (!cloned) {
      const names = config.explicitPackages || [];
      if (names.length > 0 ? expectedPackagesPresent(names) : fs.existsSync(NODE_MODULES_XIGMA)) {
        console.warn('! Nie udało się pobrać xigma-app-shared — używam paczek już obecnych w node_modules.');
        return;
      }
      console.error('! Nie udało się pobrać xigma-app-shared i brak lokalnych paczek @xigma/*.');
      process.exit(1);
    }

    const actualSha = tryGit(['-C', tmpDir, 'rev-parse', 'HEAD']) || (remote && remote.sha) || 'unknown';

    // 3. instalacja + build workspace
    console.log('> Instalacja zależności i budowanie paczek...');
    run('npm install --no-audit --no-fund', { cwd: tmpDir });
    run('npm run build --workspaces --if-present', { cwd: tmpDir });

    // 4. lista paczek: jawna z xigma.json albo wszystkie z repo
    const names = config.explicitPackages || discoverPackages(tmpDir);
    console.log(`> Paczki do skopiowania: ${names.join(', ')}`);

    copyPackages(tmpDir, names, { hardFailOnMissing: Boolean(config.explicitPackages) });

    fs.writeFileSync(SHA_MARKER, `${actualSha}\n`);
    console.log(`> Gotowe (${actualSha.slice(0, 9)}).`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main();
