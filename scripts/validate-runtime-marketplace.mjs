#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const marketplacePath = path.join(rootDir, ".claude-plugin", "marketplace.json");

const skipRuntimeValidation = process.env.SKIP_CLAUDE_RUNTIME_VALIDATE === "1";
if (skipRuntimeValidation) {
  console.log("Skipping Claude runtime marketplace validation (SKIP_CLAUDE_RUNTIME_VALIDATE=1).");
  process.exit(0);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const candidates = unique([
  process.env.CLAUDE_BIN,
  "claude",
  process.env.HOME
    ? path.join(process.env.HOME, ".local", "bin", "claude")
    : undefined,
]);

for (const candidate of candidates) {
  const result = spawnSync(
    candidate,
    ["plugin", "validate", marketplacePath],
    { encoding: "utf8" },
  );

  if (result.error) {
    if (result.error.code === "ENOENT") {
      continue;
    }
    console.error(
      `validate-runtime-marketplace failed while invoking "${candidate}": ${result.error.message}`,
    );
    process.exit(1);
  }

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  process.exit(result.status ?? 1);
}

console.error(
  "validate-runtime-marketplace failed: Could not find Claude Code binary. " +
  "Install Claude Code, add it to PATH, or set CLAUDE_BIN.",
);
process.exit(1);
