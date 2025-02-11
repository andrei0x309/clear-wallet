import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

async function main() {

  // -1. Check if you are in the main branch
  const branch = execSync(`git branch --show-current`).toString().trim();
  if (branch !== 'main') {
    console.log('You must be in the main branch to create a release');
    return
  }

  // 0. Check tag is not already created
  const tags = execSync(`git tag --list`).toString();
  if(!process.env.npm_package_version) {
    console.log('No version found in package.json');
    return;
  }

  const nextVersion = bumpVersion(process.env.npm_package_version);
  if (tags.includes(`v${nextVersion}`)) {
    console.log(`Tag v${nextVersion} already exists`);
    return;
  }

  // 1. Bump version in package.json
  const packageJsonPath = resolve('./package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  packageJson.version = nextVersion;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // 3. Commit changes
  execSync(`git add .`);
  execSync(`git commit -m "clear-wallet@v${nextVersion}"`);

  // 4. Create and push tag
  execSync(`git tag v${nextVersion}`);
  execSync(`git push --follow-tags`);

}

function bumpVersion(version: string): string {
  const parts = version.split('.');
  parts[2] = String(parseInt(parts[2]) + 1);
  return parts.join('.');
}

main();