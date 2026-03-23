<div>
<div align="right">
<a href="https://piebald.ai"><img width="200" top="20" align="right" src="https://github.com/Piebald-AI/.github/raw/main/Wordmark.svg"></a>
</div>

<div align="left">

### Check out Piebald
We've released **Piebald**, the ultimate agentic AI developer experience. \
Download it and try it out for free!  **https://piebald.ai/**

<a href="https://piebald.ai/discord"><img src="https://img.shields.io/badge/Join%20our%20Discord-5865F2?style=flat&logo=discord&logoColor=white" alt="Join our Discord"></a>
<a href="https://x.com/PiebaldAI"><img src="https://img.shields.io/badge/Follow%20%40PiebaldAI-000000?style=flat&logo=x&logoColor=white" alt="X"></a>

<sub>[**Scroll down for Claude Code LSPs.**](#claude-code-lsps) :point_down:</sub>

</div>
</div>

<div align="left">
<a href="https://piebald.ai">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://piebald.ai/screenshot-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="https://piebald.ai/screenshot-light.png">
  <img alt="hero" width="800" src="https://piebald.ai/screenshot-light.png">
</picture>
</a>
</div>

# Claude Code LSPs

This repository contains a [Claude Code marketplace](https://code.claude.com/docs/en/plugin-marketplaces) with plugins that offer LSP servers for TypeScript, Rust, Python, Go, Java, Kotlin, Scala, C/C++, PHP, Ruby, C#, PowerShell, HTML/CSS, LaTeX, Julia, Vue, Svelte, OCaml, BSL (1C:Enterprise), Ada, Dart, Solidity, and Markdown/mdbase.  [LSP servers](https://microsoft.github.io/language-server-protocol) provide powerful and familiar code intelligence features to IDEs, and now Claude Code directly.

[**Claude Code officially supports LSP.**](https://www.reddit.com/r/ClaudeAI/comments/1otdfo9/lsp_is_coming_to_claude_code_and_you_can_try_it)  In 2.0.74 they officially added it to the [changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#2074).  Previously, the new `LSP` builtin tool had to be enabled manually via `$ENABLE_LSP_TOOL=1`.

This marketplace currently targets **Claude Code 2.1.50+** (latest release: **2.1.52**) to use modern LSP configuration fields like `startupTimeout`.

Claude can use the LSP tool to
- Go to the definition for symbols (`goToDefinition`)
- Go to the implementation for symbols (`goToImplementation`)
- Hover over symbols (`hover`)
- List all the symbols in a file (`documentSymbol`)
- Find all references to a symbol (`findReferences`)
- Search for symbols across the workspace (`workspaceSymbol`)
- Get the call hierarchy for a given function (`prepareCallHierarchy`)
- Find all functions that call a given function (`incomingCalls`)
- Find all functions/methods called by a given function (`outgoingCalls`)

## Patching Claude Code

Run `npx tweakcc --apply`. [tweakcc](https://github.com/Piebald-AI/tweakcc) automatically detects your Claude Code installation (npm or native) and applies the necessary patches.   It will automatically patch your Claude Code installation to make CC's builtin LSP support usable.  (It also does a bunch of other things like let you customize all the system prompt parts, create new CC themes, change the thinking verbs, and a lot more.)

## Installing the plugins

Install them the usual way.  First make CC aware of the marketplace:
1. Run `claude`
2. `/plugin marketplace add Piebald-AI/claude-code-lsps`

Then enable the plugins of your choice:
1. Run `claude`
2. Type `/plugins`
3. Tab to `Marketplaces`
4. Enter the `claude-code-lsps` marketplace and choose `Browse plugins`
5. Select the plugins you'd like with the spacebar (e.g. TypeScript, Rust)
6. Press "i" to install them
7. Restart Claude Code

## LSP definition workflow (for contributors)

- `.lsp.json` files are the canonical source of LSP configuration.
- `.claude-plugin/marketplace.json` `lspServers` entries are generated from `.lsp.json`.
- Do not hand-edit generated `lspServers` blocks.
- `sync-lsp-to-marketplace` only updates plugins that already exist in marketplace `plugins[]`. Add a marketplace entry first when introducing a new plugin directory.
- `validate-lsp-definitions` will fail if a plugin directory exists but is not referenced in marketplace `plugins[]`.

Run this workflow after any LSP config change:

```bash
node scripts/validate-all.mjs
```

`validate-all` runs:
- `sync-lsp-to-marketplace.mjs`
- `validate-lsp-definitions.mjs`
- `validate-runtime-marketplace.mjs`

Optional: `node scripts/validate-all.mjs --skip-runtime` to skip Claude runtime validation.

## Language-specific setup instructions

You need to install various components in order for the plugins to use them:

<details>
<summary>Rust (<code>rust-analyzer</code>)</summary>

Uses `rust-analyzer`, the official modern Rust Language Server and the same one used by the official VS Code extension.  If you have `rustup`, installing `rust-analyzer` is easy:

```bash
rustup component add rust-analyzer
```

The `rust-analyzer` executable needs to be in your PATH.

</details>

<details>
<summary>JavaScript/TypeScript (<code>vtsls</code>)</summary>

Install **vtsls** and `typescript` packages globally:
```bash
# npm
npm install -g @vtsls/language-server typescript

# pnpm
pnpm install -g @vtsls/language-server typescript

# bun
bun install -g @vtsls/language-server typescript
```
Make sure the `vtsls` executable is in your PATH.

</details>

<details>
<summary>Python (<code>pyright</code>)</summary>

Install **pyright** for its speed and excellent type checking:
```bash
# npm
npm install -g pyright

# pnpm
pnpm install -g pyright

# bun
bun install -g pyright
```

</details>

<details>
<summary>Go (<code>gopls</code>)</summary>

Install **gopls**, the official Go language server:
```bash
go install golang.org/x/tools/gopls@latest
```
Make sure your Go bin directory is in your PATH (usually `~/go/bin`).

</details>

<details>
<summary>Java (<code>jdtls</code>)</summary>

Install **Eclipse JDT Language Server** (jdtls). Requires Java 21+ runtime:
```bash
# Download from official sources
# Latest snapshot:
curl -LO http://download.eclipse.org/jdtls/snapshots/jdt-language-server-latest.tar.gz
mkdir -p ~/jdtls
tar -xzf jdt-language-server-latest.tar.gz -C ~/jdtls

# Or install via package manager (varies by OS)
# macOS with Homebrew:
brew install jdtls
```

Set `JAVA_HOME` environment variable to Java 21+ installation.

</details>

<details>
<summary>Kotlin (<code>kotlin-lsp</code>)</summary>

Requires **Java 17+**. Install **kotlin-lsp**:
```bash
# macOS with Homebrew
brew install JetBrains/utils/kotlin-lsp
```

For manual installation, download from [releases](https://github.com/Kotlin/kotlin-lsp/releases) and add to PATH.

> **Note:** Currently supports JVM-only Kotlin Gradle projects.

</details>

<details>
<summary>Scala (<code>metals</code>)</summary>

Requires **Java 11 or 17**. Install **Metals** using [Coursier](https://get-coursier.io/):
```bash
# Install Coursier (if not already installed)
# macOS with Homebrew:
brew install coursier/formulas/coursier

# Then bootstrap Metals:
coursier bootstrap org.scalameta:metals_2.13:1.6.5 -o metals -f
# Move the generated `metals` binary to a directory on your PATH

# Or with recommended JVM options:
coursier bootstrap \
  --java-opt -XX:+UseG1GC \
  --java-opt -XX:+UseStringDeduplication \
  --java-opt -Xss4m \
  --java-opt -Xms100m \
  org.scalameta:metals_2.13:1.6.5 -o metals -f
```

Ensure `metals` is on your PATH and `JAVA_HOME` points to a Java 11 or 17 installation.

> **Supported build tools:** sbt, Gradle, Maven, Mill (via Bloop/BSP).

</details>

<details>
<summary>C/C++ (<code>clangd</code>)</summary>

Install **clangd**, the official LLVM-based language server:
```bash
# macOS
brew install llvm

# Ubuntu/Debian
sudo apt-get install clangd

# Arch Linux
sudo pacman -S clang

# Or download from LLVM releases
# https://github.com/clangd/clangd/releases
```

</details>

<details>
<summary>PHP (<code>phpactor</code>)</summary>

Install **Phpactor**:
```bash
# Using composer (recommended)
composer global require --dev phpactor/phpactor

# Or using package manager
# macOS with Homebrew:
brew install phpactor/tap/phpactor
```

Ensure `~/.composer/vendor/bin` (or `~/.config/composer/vendor/bin` on some systems) is in your PATH.

</details>

<details>
<summary>Ruby (<code>ruby-lsp</code>)</summary>

Install **ruby-lsp**:
```bash
gem install ruby-lsp
```

</details>

<details>
<summary>C# (<code>omnisharp</code>)</summary>

Install **OmniSharp** (requires .NET SDK):
```bash
# macOS with Homebrew:
brew install omnisharp/omnisharp-roslyn/omnisharp-mono

# Or download from releases:
# https://github.com/OmniSharp/omnisharp-roslyn/releases

# Extract and add to PATH, or use the install script:
# Linux/macOS:
curl -L https://github.com/OmniSharp/omnisharp-roslyn/releases/latest/download/omnisharp-linux-x64-net6.0.tar.gz | tar xz -C ~/.local/bin

# Ensure the OmniSharp executable is in your PATH
```

</details>

<details>
<summary>PowerShell (<code>powershell-editor-services</code>)</summary>

Requires **PowerShell 7+** (`pwsh`) installed and available in PATH.

```bash
# Windows (winget)
winget install Microsoft.PowerShell

# macOS
brew install powershell/tap/powershell

# Ubuntu/Debian
# See: https://learn.microsoft.com/en-us/powershell/scripting/install/install-ubuntu
```

The **PowerShellEditorServices** module is not installed automatically at runtime. Install it manually:
```powershell
Install-Module -Name PowerShellEditorServices -Scope CurrentUser
```

</details>

<details>
<summary>HTML/CSS/ESLint (<code>vscode-langservers</code>)</summary>

Install **@zed-industries/vscode-langservers-extracted** for HTML, CSS, and ESLint:
```bash
# npm
npm install -g @zed-industries/vscode-langservers-extracted

# pnpm
pnpm install -g @zed-industries/vscode-langservers-extracted

# bun
bun install -g @zed-industries/vscode-langservers-extracted
```

This provides `vscode-html-language-server`, `vscode-css-language-server`, and `vscode-eslint-language-server` executables.

The ESLint language server requires ESLint to be installed in your project:
```bash
npm install --save-dev eslint
```

</details>

<details>
<summary>LaTeX (<code>texlab</code>)</summary>

Install **texlab**, a cross-platform LSP implementation for LaTeX:
```bash
# Cargo
cargo install --locked texlab

# macOS
brew install texlab

# Arch Linux
pacman -S texlab

# Windows
scoop install texlab
# or
choco install texlab
```

The `texlab` executable needs to be in your PATH. Supports `.tex`, `.bib`, `.cls`, and `.sty` files.

</details>

<details>
<summary>Julia (<code>julia-lsp</code>)</summary>

Install **LanguageServer.jl** in Julia:
```julia
using Pkg
Pkg.add("LanguageServer")
Pkg.add("SymbolServer")
```

Make sure `julia` is in your PATH. The language server will automatically detect your Julia project environment based on `Project.toml`.

> **Note:** The language server may take some time to start on first use while it precompiles. Subsequent starts will be faster, especially with Julia 1.9+.

</details>

<details>
<summary>Vue (<code>vue-volar</code>)</summary>

Install **@vue/language-server** (v2.x) globally for Vue.js Single File Component support:
```bash
# npm
npm install -g @vue/language-server@2

# pnpm
pnpm install -g @vue/language-server@2

# bun
bun install -g @vue/language-server@2
```

> **Important:** Version 2.x is required. Version 3.x removed the internal TypeScript communication layer and requires the LSP client to implement custom request forwarding (`tsserver/request` → `tsserver/response`) between Vue and TypeScript language servers. Claude Code's simple LSP integration does not support this mechanism. See [v3 upgrade guide](https://github.com/vuejs/language-tools/discussions/5456) for details.

The plugin launcher scans `PATH` and picks the newest compatible `vue-language-server` **2.x.x** binary (ignoring `3.x.x`).

**Important:** For full functionality, TypeScript must be installed in your project:
```bash
npm install --save-dev typescript
```

The language server uses the project's `node_modules/typescript/lib` for type checking. This enables:
- Template expression type-checking
- Component prop validation
- Slot type inference
- CSS/SCSS intellisense in `<style>` blocks
- Go-to-definition across `<template>`, `<script>`, `<style>`

> **Note:** This plugin complements the existing `vtsls` plugin for TypeScript, providing full Vue + TS coverage.

</details>

<details>
<summary>Svelte (<code>svelte-lsp</code>)</summary>

Install **svelte-language-server** globally for Svelte Single File Component support:

```bash
# npm
npm install -g svelte-language-server

# bun
bun add -g svelte-language-server

# pnpm
pnpm add -g svelte-language-server
```

This provides:
- Diagnostics for `.svelte` files
- Hover info and completions
- Go-to-definition for components and props
- TypeScript support within `<script>` blocks

</details>

<details>
<summary>BSL / 1C:Enterprise (<code>bsl-language-server</code>)</summary>

Install **bsl-language-server**, the Language Server Protocol implementation for BSL (1C:Enterprise) and OneScript.

Download the native executable for your platform from [GitHub Releases](https://github.com/1c-syntax/bsl-language-server/releases):

| Platform | Download |
|----------|----------|
| Windows | `bsl-language-server_win.zip` |
| macOS | `bsl-language-server_mac.zip` |
| Linux | `bsl-language-server_nix.zip` |

Extract the archive and add the directory containing `bsl-language-server` executable to your PATH:

```bash
# Linux/macOS example
unzip bsl-language-server_nix.zip -d ~/bsl-language-server
export PATH="$HOME/bsl-language-server/bin:$PATH"

# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.) to make it permanent
```

```powershell
# Windows (PowerShell) example
Expand-Archive bsl-language-server_win.zip -DestinationPath $env:USERPROFILE\bsl-language-server
$env:PATH += ";$env:USERPROFILE\bsl-language-server\bin"

# Add to system PATH via System Properties to make it permanent
```

The `bsl-language-server` executable needs to be in your PATH. Supports `.bsl` and `.os` files.

</details>

<details>
<summary>Ada (<code>ada-language-server</code>)</summary>

Install **ada_language_server** from AdaCore for Ada, SPARK, and GPR project support.

**Using Alire (recommended):**
```bash
alr get ada_language_server
cd ada_language_server*
alr build
# Add the bin directory to your PATH
```

**From GitHub releases:**

Download pre-built binaries from [GitHub Releases](https://github.com/AdaCore/ada_language_server/releases).

**From source:**
```bash
git clone https://github.com/AdaCore/ada_language_server.git
cd ada_language_server
make
# Add the resulting executable to your PATH
```

The `ada_language_server` executable needs to be in your PATH. Supports `.adb` (body), `.ads` (spec), `.adc` (configuration), and `.gpr` (project) files.

> **Note:** For best results, ensure your project has a valid `.gpr` project file. The language server uses GNAT project files to understand project structure and dependencies.

</details>

<details>
<summary>OCaml (<code>ocaml-lsp</code>)</summary>

Install **ocaml-lsp-server** using opam (OCaml package manager):

```bash
# Install opam first (if not already installed)
# macOS
brew install opam

# Ubuntu/Debian
apt install opam

# Initialize opam (first time only)
opam init
eval $(opam env)

# Install ocaml-lsp-server
opam install ocaml-lsp-server
```

The plugin uses `opam exec -- ocamllsp` to run the language server, ensuring correct PATH resolution within your opam environment.

Supports `.ml` (implementation), `.mli` (interface), `.mly` (Menhir parser), and `.mll` (OCamllex lexer) files.

> **Note:** Make sure you have an active opam switch with OCaml installed. The language server works best when run from a project directory with a proper `dune` build setup.

</details>

<details>
<summary>Dart (<code>dart</code>)</summary>

Install the Dart SDK or Flutter (which includes Dart). The language server uses the `dart language-server` command which is built into the Dart SDK.

**Option 1: Flutter (recommended for Flutter projects)**
```bash
# macOS
brew install --cask flutter

# Linux (snap)
sudo snap install flutter --classic

# Windows (winget)
winget install Google.Flutter

# Or from https://flutter.dev/docs/get-started/install
```

**Option 2: Standalone Dart SDK**
```bash
# macOS
brew install dart

# Linux (apt)
sudo apt-get install dart

# Windows (winget)
winget install Google.Dart

# Or from https://dart.dev/get-dart
```

Ensure `dart` is in your PATH. You can verify with:
```bash
dart language-server --help
```

</details>

<details>
<summary>Solidity (<code>solidity-language-server</code>)</summary>

A fast Solidity language server built in Rust, powered by Foundry's AST. Provides go-to-definition, find-references, rename, completions, hover (with NatSpec docs and selectors), document links, formatting (via `forge fmt`), and diagnostics.

**Install via Cargo:**
```bash
cargo install solidity-language-server
```

Or download a pre-built binary from the [latest release](https://github.com/mmsaki/solidity-language-server/releases).

Ensure `solidity-language-server` is in your PATH. You can verify with:
```bash
solidity-language-server --version
```

Your project should have a `foundry.toml` at the root (i.e., be a [Foundry](https://book.getfoundry.sh/) project).

</details>

<details>
<summary>Markdown / mdbase (<code>mdbase-lsp</code>)</summary>

A language server for [mdbase](https://github.com/callumalpass/mdbase-lsp) markdown collections. Provides diagnostics, completions, hover info, and go-to-definition for mdbase frontmatter and link targets.

**Build from source:**
```bash
git clone https://github.com/callumalpass/mdbase-lsp.git
cd mdbase-lsp
cargo build --release
```

Then add the binary to your PATH (e.g., copy `target/release/mdbase-lsp` to a directory in `$PATH`).

Or download a pre-built binary from the [latest release](https://github.com/callumalpass/mdbase-lsp/releases).

Ensure `mdbase-lsp` is in your PATH. Your project must be a valid mdbase collection (a folder containing `mdbase.yaml`).

</details>
