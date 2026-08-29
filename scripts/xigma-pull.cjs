const { execFileSync, execSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// files/dirs from the package that we don't copy into node_modules/@xigma/*
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
    console.error('No xigma.json file in the project root.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const { repo, branch = 'main', packages } = config;

  if (!repo) {
    console.error("xigma.json must contain 'repo'.");
    process.exit(1);
  }

  // packages: array = explicit list; missing / "*" = all packages from the repo
  const explicitPackages = Array.isArray(packages) && packages.length > 0 ? packages : null;

  return { repo, branch, explicitPackages, repoHttps: config.repoHttps || toHttpsUrl(repo) };
}

// returns [url, url?] in the order to try: first the one from xigma.json, then HTTPS as a fallback
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
        console.error(`! @xigma/${pkgName} from xigma.json does not exist in the repo — aborting.`);
        process.exit(1);
      }
      console.warn(`! Skipped @xigma/${pkgName} — not found in the repo`);
      continue;
    }

    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(dest, { recursive: true });
    copyRecursive(src, dest);
    console.log(`> Copied @xigma/${pkgName}`);
  }
}

function main() {
  if (process.env.XIGMA_SKIP_PULL === '1') {
    console.log('> XIGMA_SKIP_PULL=1 — skipping the @xigma/* package pull.');
    return;
  }

  const config = readConfig();
  const urls = candidateUrls(config);

  // 1. resolve the remote branch SHA and check whether we already have that state
  const remote = resolveRemoteSha(urls, config.branch);
  const knownNames = config.explicitPackages || [];

  if (remote && readShaMarker() === remote.sha && (knownNames.length === 0 || expectedPackagesPresent(knownNames))) {
    console.log(`> @xigma/* packages are already at ${remote.sha.slice(0, 9)} — skipping.`);
    return;
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xigma-shared-'));

  try {
    // 2. clone — try each URL in turn (SSH from the config, then HTTPS)
    const cloneUrls = remote ? [remote.url] : urls;
    let cloned = false;
    for (const url of cloneUrls) {
      try {
        console.log(`> Cloning ${url}#${config.branch}...`);
        run(`git clone --depth 1 --branch "${config.branch}" "${url}" "${tmpDir}"`);
        cloned = true;
        break;
      } catch {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        fs.mkdirSync(tmpDir, { recursive: true });
        console.warn(`! Failed to clone from ${url}`);
      }
    }

    if (!cloned) {
      const names = config.explicitPackages || [];
      if (names.length > 0 ? expectedPackagesPresent(names) : fs.existsSync(NODE_MODULES_XIGMA)) {
        console.warn('! Failed to fetch xigma-app-shared — using the packages already present in node_modules.');
        return;
      }
      console.error('! Failed to fetch xigma-app-shared and no local @xigma/* packages present.');
      process.exit(1);
    }

    const actualSha = tryGit(['-C', tmpDir, 'rev-parse', 'HEAD']) || (remote && remote.sha) || 'unknown';

    // 3. install + build the workspace
    console.log('> Installing dependencies and building packages...');
    run('npm install --no-audit --no-fund', { cwd: tmpDir });
    run('npm run build --workspaces --if-present', { cwd: tmpDir });

    // 4. package list: explicit from xigma.json or all from the repo
    const names = config.explicitPackages || discoverPackages(tmpDir);
    console.log(`> Packages to copy: ${names.join(', ')}`);

    copyPackages(tmpDir, names, { hardFailOnMissing: Boolean(config.explicitPackages) });

    fs.writeFileSync(SHA_MARKER, `${actualSha}\n`);
    console.log(`> Done (${actualSha.slice(0, 9)}).`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main();
