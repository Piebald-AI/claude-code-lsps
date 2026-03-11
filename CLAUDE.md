# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Claude Code marketplace containing LSP (Language Server Protocol) plugins. Each plugin integrates a language server with Claude Code, providing code intelligence features like go-to-definition, find-references, hover info, and symbol search.

**Supported languages:** TypeScript/JavaScript, Rust, Python, Go, Java, Kotlin, Scala, C/C++, PHP, Ruby, C#, PowerShell, HTML/CSS, LaTeX, Julia, Vue, OCaml, BSL, Ada, Dart, Solidity, Markdown/mdbase

**Compatibility target:** Claude Code 2.1.50+ (latest release: 2.1.52)

## Repository Structure

```
.claude-plugin/marketplace.json  # Marketplace manifest with generated lspServers for local plugins
<language>/
  plugin.json                    # Plugin metadata (name, version, description, keywords)
  .lsp.json                      # Canonical LSP configuration (command, transport, mappings, timeouts)
scripts/
  validate-all.mjs               # Runs sync + internal validation + Claude runtime validation
  sync-lsp-to-marketplace.mjs    # Generates marketplace lspServers from .lsp.json files
  validate-lsp-definitions.mjs   # Validates consistency and schema constraints
  validate-runtime-marketplace.mjs # Runs Claude Code's built-in marketplace validator
```

## Adding a New LSP Plugin

1. Create a new directory named after the LSP (e.g., `texlab/`)

2. Create `plugin.json`:
```json
{
  "name": "plugin-name",
  "version": "0.1.0",
  "description": "Description of the language server",
  "author": { "name": "Piebald LLC", "email": "support@piebald.ai" },
  "repository": "https://github.com/...",
  "license": "...",
  "keywords": ["language", "lsp", "language-server"]
}
```

3. Create `.lsp.json`:
```json
{
  "languageId": {
    "command": "lsp-executable",
    "args": ["--stdio"],
    "extensionToLanguage": {
      ".ext": "languageId"
    },
    "transport": "stdio",
    "initializationOptions": {},
    "settings": {},
    "startupTimeout": 60000,
    "shutdownTimeout": 15000,
    "maxRestarts": 3
  }
}
```

4. Add entry to `.claude-plugin/marketplace.json` in the `plugins` array

5. Ensure the plugin has been added to `.claude-plugin/marketplace.json` `plugins[]` first

6. Run `node scripts/validate-all.mjs`

7. Add setup instructions to `README.md` in the language-specific details section

## LSP Configuration Fields

- `command`: The executable to run (must be in PATH)
- `args`: Command-line arguments (typically `["--stdio"]`)
- `extensionToLanguage`: Maps file extensions to LSP language IDs
- `transport`: Always `"stdio"` for this project
- `startupTimeout`: Optional server startup wait time in milliseconds (recommended for slow servers)
- `shutdownTimeout`: Optional server shutdown wait time in milliseconds
- `maxRestarts`: Number of restart attempts on crash (default: 3)
- `initializationOptions` / `settings`: LSP-specific configuration objects

## Notes

- Each plugin directory name should match the LSP tool name (e.g., `rust-analyzer`, `gopls`, `pyright`)
- The `.lsp.json` can define multiple language servers in one file (see `vscode-langservers` for HTML + CSS example)
- `.lsp.json` is canonical; generated `lspServers` in marketplace should not be hand-edited
