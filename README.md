# Claude Code LSPs

This repository contains a [Claude Code marketplace](https://code.claude.com/docs/en/plugin-marketplaces) with plugins that offer LSP servers for TypeScript, Rust, Python, Go, Java, Kotlin, C/C++, PHP, Ruby, C#, PowerShell, HTML/CSS, LaTeX, and BSL (1C:Enterprise).  [LSP servers](https://microsoft.github.io/language-server-protocol) provide powerful and familiar code intelligence features to IDEs, and now Claude Code directly.

[**Claude Code is going to officially support LSP soon.**](https://www.reddit.com/r/ClaudeAI/comments/1otdfo9/lsp_is_coming_to_claude_code_and_you_can_try_it)  In 2.0.30 (October 31st) they adding the working beginnings of a system to run LSP servers from plugins automatically on startup, and an `LSP` tool (enable via `$ENABLE_LSP_TOOL=1`) that Claude can use to
- Go to the definition for symbols (`goToDefinition`)
- Hover over symbols (`hover`)
- List all the symbols in a file (`documentSymbol`)
- Find all references to a symbol (`findReferences`)
- Search for symbols across the workspace (`workspaceSymbol`)

> [!warning]
> Support for LSP in Claude Code is pretty raw still.  There are bugs in the different LSP operations, no documention, and no UI indication that your LSP servers are started/running/have errors or even exist.  But it's there, and with [tweakcc](https://github.com/Piebald-AI/tweakcc) you can make it work.

## Patching Claude Code

You can manually patch it, but it's much easier to use [tweakcc](https://github.com/Piebald-AI/tweakcc) to automatically detect your Claude Code installation (npm or native) apply the necessary patches.

Run `npx tweakcc --apply`.  It will automatically patch your Claude Code installation to make LSP support usable.  (It also does a bunch of other things like let you customize all the system prompt parts, create new CC themes, change the thinking verbs, and a lot more.)

If you'd like to apply the patches yourself, go the bottom of this page.

## Installing the plugins

Install them the usual way.  First make CC aware of the marketplace:
1. Run `claude`
2. `/plugin marketplace add Piebald-AI/claude-code-lsps`

Then enable the plugins of your choice:
1. Run `claude`
2. Type `/plugins`
3. Choose `Browse and install plugins`
4. Enter the `Claude Code Language Servers` marketplace
5. Select the plugins you'd like with the spacebar (e.g. TypeScript, Rust)
6. Press "i" to install them
7. Restart Claude Code

Here's a screenshot:

<img width="603" height="374" alt="image" src="https://github.com/user-attachments/assets/207ebb79-8c45-446b-9c08-eb81d235c301" />


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
composer global require phpactor/phpactor

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

The **PowerShellEditorServices** module will be automatically installed on first use if not already present. To install it manually:
```powershell
Install-Module -Name PowerShellEditorServices -Scope CurrentUser
```

</details>

<details>
<summary>HTML/CSS (<code>vscode-langservers</code>)</summary>

Install **vscode-langservers-extracted** for both HTML and CSS:
```bash
# npm
npm install -g vscode-langservers-extracted

# pnpm
pnpm install -g vscode-langservers-extracted

# bun
bun install -g vscode-langservers-extracted
```

This provides `vscode-html-language-server` and `vscode-css-language-server` executables.

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
