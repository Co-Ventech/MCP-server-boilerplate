#!/usr/bin/env node
// Usage: node scripts/rename.mjs my-server
// Rewrites package.json name/bin, src/meta.ts SERVER_NAME, and the README's `# ` title line.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const newName = process.argv[2];

if (!newName) {
  console.error("Usage: node scripts/rename.mjs <new-package-name>");
  process.exit(1);
}

// Valid npm package name: lowercase, may be scoped, letters/digits/hyphens/dots/underscores,
// must not start with . or _, length 1-214, URL-safe.
const NPM_NAME_RE = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

if (newName.length > 214 || !NPM_NAME_RE.test(newName)) {
  console.error(`"${newName}" is not a valid npm package name.`);
  process.exit(1);
}

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

// package.json: name and bin key
updateFile("package.json", (contents) => {
  const pkg = JSON.parse(contents);
  const oldName = pkg.name;
  pkg.name = newName;
  if (pkg.bin && Object.prototype.hasOwnProperty.call(pkg.bin, oldName)) {
    const binValue = pkg.bin[oldName];
    delete pkg.bin[oldName];
    pkg.bin[newName] = binValue;
  }
  return JSON.stringify(pkg, null, 2) + "\n";
});

// src/meta.ts: SERVER_NAME constant
updateFile("src/meta.ts", (contents) =>
  contents.replace(/export const SERVER_NAME = ".*?";/, `export const SERVER_NAME = "${newName}";`),
);

// README.md: the `# ` title line (first line starting with "# ")
updateFile("README.md", (contents) => contents.replace(/^# .*$/m, `# ${newName}`));

if (changes.length === 0) {
  console.log("No files changed.");
} else {
  console.log(`Renamed to "${newName}". Updated:`);
  for (const file of changes) console.log(`  - ${file}`);
}
