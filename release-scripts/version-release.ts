import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

async function main() {
  // 1. Bump version in package.json
  const packageJsonPath = resolve('./package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const currentVersion = packageJson.version;
  const newVersion = bumpVersion(currentVersion);
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // 3. Commit changes
  execSync(`git add .`);
  execSync(`git commit -m "Release v${newVersion}"`);

  // 4. Create and push tag
  execSync(`git tag v${newVersion}`);
  execSync(`git push --follow-tags`);

}

function bumpVersion(version: string): string {
  const parts = version.split('.');
  parts[2] = String(parseInt(parts[2]) + 1);
  return parts.join('.');
}

main();