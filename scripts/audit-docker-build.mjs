#!/usr/bin/env node
/**
 * Build portfolio-audit-playwright Docker image (Playwright version pinned to package-lock).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const pwVersion = lock.packages?.['node_modules/playwright']?.version;
if (!pwVersion) {
  console.error('Could not read playwright version from package-lock.json');
  process.exit(1);
}

const dockerDir = path.join(root, 'audit', 'docker');
const dockerPackage = path.join(dockerDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(dockerPackage, 'utf8'));
if (pkg.dependencies.playwright !== pwVersion) {
  pkg.dependencies.playwright = pwVersion;
  fs.writeFileSync(dockerPackage, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`Updated audit/docker/package.json playwright → ${pwVersion}`);
}

const imageTag = 'portfolio-audit-playwright';
execSync(
  `docker build --build-arg PLAYWRIGHT_VERSION=${pwVersion} -t ${imageTag} -f "${path.join(dockerDir, 'Dockerfile')}" "${dockerDir}"`,
  { stdio: 'inherit', cwd: root },
);
console.log(`Built ${imageTag} (Playwright ${pwVersion})`);
