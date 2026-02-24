#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  MARKETPLACE_SCHEMA_URL,
  MARKETPLACE_KEY_ORDER,
  PLUGIN_KEY_ORDER,
  isPlainObject,
  normalizeLspServers,
  reorderKeys,
} from "./lsp-definition-utils.mjs";

const rootDir = process.cwd();
const marketplacePath = path.join(rootDir, ".claude-plugin", "marketplace.json");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(jsonPath) {
  const raw = await fs.readFile(jsonPath, "utf8");
  return JSON.parse(raw);
}

async function sync() {
  const marketplace = await readJson(marketplacePath);
  assert(Array.isArray(marketplace.plugins), "marketplace.plugins must be an array");

  // Keep the same schema identifier used by Anthropic's official marketplace manifest.
  marketplace.$schema ??= MARKETPLACE_SCHEMA_URL;
  marketplace.version ??= "1.0.0";
  marketplace.description ??=
    "Claude Code marketplace providing language server integrations across popular programming languages.";

  let syncedCount = 0;
  const orderedPlugins = [];
  for (const plugin of marketplace.plugins) {
    if (!isPlainObject(plugin)) {
      orderedPlugins.push(plugin);
      continue;
    }

    const updatedPlugin = { ...plugin };
    if (typeof updatedPlugin.source === "string" && updatedPlugin.source.startsWith("./")) {
      const pluginDirName = updatedPlugin.source.replace(/^\.\/+/, "");
      const pluginDirPath = path.join(rootDir, pluginDirName);
      const lspPath = path.join(pluginDirPath, ".lsp.json");

      try {
        await fs.access(lspPath);
      } catch {
        throw new Error(
          `Expected .lsp.json for marketplace plugin "${updatedPlugin.name}" at ${updatedPlugin.source}`,
        );
      }

      const lspConfig = await readJson(lspPath);
      const lspResult = normalizeLspServers(
        lspConfig,
        updatedPlugin.name ?? pluginDirName,
      );
      assert(
        lspResult.normalized !== null,
        lspResult.errors.join("; "),
      );

      updatedPlugin.lspServers = lspResult.normalized;
      syncedCount += 1;
    }

    orderedPlugins.push(reorderKeys(updatedPlugin, PLUGIN_KEY_ORDER));
  }

  marketplace.plugins = orderedPlugins;

  const orderedMarketplace = reorderKeys(marketplace, MARKETPLACE_KEY_ORDER);
  await fs.writeFile(
    marketplacePath,
    `${JSON.stringify(orderedMarketplace, null, 2)}\n`,
    "utf8",
  );

  console.log(`Synced lspServers for ${syncedCount} plugins.`);
}

sync().catch((error) => {
  console.error(`sync-lsp-to-marketplace failed: ${error.message}`);
  process.exitCode = 1;
});
