#!/usr/bin/env node
// Usage: node scripts/rename.mjs my-server [github-owner]
// Updates package metadata, the server name, the lockfile, and repository links.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const newName = process.argv[2];
const githubOwner = process.argv[3];

if (!newName) {
  console.error("Usage: node scripts/rename.mjs <new-package-name> [github-owner]");
  process.exit(1);
}

const NPM_NAME_RE = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
const GITHUB_OWNER_RE = /^[A-Za-z0-9_.-]+$/;

if (newName.length > 214 || !NPM_NAME_RE.test(newName)) {
  console.error(`"${newName}" is not a valid npm package name.`);
  process.exit(1);
}

if (githubOwner && !GITHUB_OWNER_RE.test(githubOwner)) {
  console.error(`"${githubOwner}" is not a valid GitHub owner.`);
  process.exit(1);
}

const packagePath = path.join(rootDir, "package.json");
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
const oldName = packageJson.name;
const oldRepository = packageJson.repository?.url ?? "";
const oldRepositoryMatch = oldRepository.match(/github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/i);
const owner = githubOwner ?? oldRepositoryMatch?.[1] ?? "YOUR_GITHUB_OWNER";
const repositoryName = newName.replace(/^@[^/]+\//, "");
const repositoryPath = `${owner}/${repositoryName}`;
const repositoryUrl = `https://github.com/${repositoryPath}`;
const changes = [];

function updateFile(relPath, transform) {
  const filePath = path.join(rootDir, relPath);
  const before = readFileSync(filePath, "utf8");
  const after = transform(before);
  if (after !== before) {
    writeFileSync(filePath, after, "utf8");
    changes.push(relPath);
  }
}

packageJson.name = newName;
if (packageJson.bin && Object.prototype.hasOwnProperty.call(packageJson.bin, oldName)) {
  const binValue = packageJson.bin[oldName];
  delete packageJson.bin[oldName];
  packageJson.bin[newName] = binValue;
}
packageJson.repository = { type: "git", url: `${repositoryUrl}.git` };
packageJson.bugs = { url: `${repositoryUrl}/issues` };
packageJson.homepage = `${repositoryUrl}#readme`;
updateFile("package.json", () => `${JSON.stringify(packageJson, null, 2)}\n`);

updateFile("package-lock.json", (contents) => {
  const lockfile = JSON.parse(contents);
  lockfile.name = newName;
  if (lockfile.packages?.[""]) lockfile.packages[""].name = newName;
  return `${JSON.stringify(lockfile, null, 2)}\n`;
});

updateFile("src/meta.ts", (contents) =>
  contents.replace(/export const SERVER_NAME = ".*?";/, `export const SERVER_NAME = "${newName}";`),
);

updateFile("README.md", (contents) => {
  const oldRepositoryPath = oldRepositoryMatch ? `${oldRepositoryMatch[1]}/${oldRepositoryMatch[2]}` : "";
  let updated = contents.replace(/^# .*$/m, `# ${newName}`);
  updated = updated.replaceAll(oldName, newName);
  if (oldRepositoryPath) updated = updated.replaceAll(oldRepositoryPath, repositoryPath);
  return updated;
});

console.log(`Renamed to "${newName}" for ${repositoryPath}. Updated:`);
for (const file of changes) console.log(`  - ${file}`);
