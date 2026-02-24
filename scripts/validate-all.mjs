#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();

function runNodeScript(scriptFile, envOverrides = {}) {
  const scriptPath = path.join(rootDir, "scripts", scriptFile);
  const result = spawnSync(
    process.execPath,
    [scriptPath],
    {
      encoding: "utf8",
      env: { ...process.env, ...envOverrides },
    },
  );
  return result;
}

function printResult(result) {
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
}

function runStep(label, scriptFile, envOverrides = {}) {
  console.log(`\n==> ${label}`);
  const result = runNodeScript(scriptFile, envOverrides);
  printResult(result);

  if (result.error) {
    console.error(`Step failed: ${result.error.message}`);
    process.exit(1);
  }

  if ((result.status ?? 1) !== 0) {
    console.error(`Step failed: ${label}`);
    process.exit(result.status ?? 1);
  }
}

const args = new Set(process.argv.slice(2));
const skipRuntime = args.has("--skip-runtime");

if (args.has("-h") || args.has("--help")) {
  console.log("Usage: node scripts/validate-all.mjs [--skip-runtime]");
  process.exit(0);
}

runStep("Sync marketplace LSP servers", "sync-lsp-to-marketplace.mjs");
runStep("Validate repo LSP definitions", "validate-lsp-definitions.mjs");

if (skipRuntime) {
  console.log("\n==> Skipping Claude runtime validation (--skip-runtime)");
} else {
  runStep("Validate with Claude runtime schema", "validate-runtime-marketplace.mjs");
}

console.log("\nAll validations passed.");
