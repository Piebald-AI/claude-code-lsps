#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  isPlainObject,
  normalizeLspServers,
} from "./lsp-definition-utils.mjs";

const rootDir = process.cwd();
const marketplacePath = path.join(rootDir, ".claude-plugin", "marketplace.json");

const slowStartupPluginDirs = new Set([
  "jdtls",
  "powershell-editor-services",
  "omnisharp",
  "julia-lsp",
  "kotlin-lsp",
  "ocaml-lsp",
]);

async function readJson(jsonPath) {
  const raw = await fs.readFile(jsonPath, "utf8");
  return JSON.parse(raw);
}

async function listPluginDirs() {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name.startsWith(".") || entry.name === "scripts") {
      continue;
    }

    const dirPath = path.join(rootDir, entry.name);
    const pluginJsonPath = path.join(dirPath, "plugin.json");
    const lspJsonPath = path.join(dirPath, ".lsp.json");
    const hasPluginJson = await fs
      .access(pluginJsonPath)
      .then(() => true)
      .catch(() => false);
    const hasLspJson = await fs
      .access(lspJsonPath)
      .then(() => true)
      .catch(() => false);

    if (hasPluginJson || hasLspJson) {
      dirs.push({
        name: entry.name,
        pluginJsonPath,
        lspJsonPath,
        hasPluginJson,
        hasLspJson,
      });
    }
  }
  return dirs;
}

async function validate() {
  const errors = [];
  const pluginDirs = await listPluginDirs();
  const pluginDirNames = new Set(pluginDirs.map((item) => item.name));

  for (const pluginDir of pluginDirs) {
    if (!pluginDir.hasPluginJson) {
      errors.push(`${pluginDir.name} is missing plugin.json`);
    }
    if (!pluginDir.hasLspJson) {
      errors.push(`${pluginDir.name} is missing .lsp.json`);
      continue;
    }

    const lspServers = await readJson(pluginDir.lspJsonPath);
    const lspResult = normalizeLspServers(lspServers, `${pluginDir.name}/.lsp.json`);
    errors.push(...lspResult.errors);

    if (slowStartupPluginDirs.has(pluginDir.name)) {
      for (const [serverName, serverConfig] of Object.entries(lspServers)) {
        if (!Object.hasOwn(serverConfig, "startupTimeout")) {
          errors.push(
            `${pluginDir.name}/.lsp.json -> ${serverName} requires startupTimeout`,
          );
        }
      }
    }
  }

  const marketplace = await readJson(marketplacePath);
  if (!Array.isArray(marketplace.plugins)) {
    errors.push(".claude-plugin/marketplace.json must contain a plugins array");
  } else {
    const marketplaceSources = new Set();

    for (const plugin of marketplace.plugins) {
      if (!isPlainObject(plugin) || typeof plugin.source !== "string") {
        continue;
      }
      if (!plugin.source.startsWith("./")) {
        continue;
      }

      const pluginDir = plugin.source.replace(/^\.\/+/, "");
      marketplaceSources.add(pluginDir);

      if (!pluginDirNames.has(pluginDir)) {
        errors.push(
          `marketplace plugin "${plugin.name}" points to missing directory "${pluginDir}"`,
        );
        continue;
      }

      const expectedLspPath = path.join(rootDir, pluginDir, ".lsp.json");
      const expectedLsp = await readJson(expectedLspPath);
      const normalizedExpectedResult = normalizeLspServers(
        expectedLsp,
        `${pluginDir}/.lsp.json`,
      );
      const normalizedActualResult = normalizeLspServers(
        plugin.lspServers,
        `${plugin.name}.lspServers`,
      );
      errors.push(...normalizedExpectedResult.errors);
      errors.push(...normalizedActualResult.errors);

      if (
        normalizedExpectedResult.normalized &&
        normalizedActualResult.normalized &&
        JSON.stringify(normalizedExpectedResult.normalized) !==
          JSON.stringify(normalizedActualResult.normalized)
      ) {
        errors.push(
          `marketplace plugin "${plugin.name}" has stale lspServers (run scripts/sync-lsp-to-marketplace.mjs)`,
        );
      }
    }

    for (const pluginDirName of pluginDirNames) {
      if (!marketplaceSources.has(pluginDirName)) {
        errors.push(
          `plugin directory "${pluginDirName}" is not referenced in .claude-plugin/marketplace.json`,
        );
      }
    }
  }

  if (errors.length > 0) {
    console.error("LSP definition validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("LSP definition validation passed.");
}

validate().catch((error) => {
  console.error(`validate-lsp-definitions failed: ${error.message}`);
  process.exitCode = 1;
});
