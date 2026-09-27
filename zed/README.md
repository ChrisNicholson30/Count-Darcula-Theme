# Count Darcula — Zed

A midnight-wine dark theme and a warm porcelain light theme, led by electric **Volt**. Eight vivid
accents at one perceptual lightness, WCAG AA throughout — 139 style keys, 46 tree-sitter syntax
captures and 8 collaborator cursors, all generated from one OKLCH palette.

Both variants live in one file; Zed lists each separately in its picker:
**Count Darcula Dark** and **Count Darcula Light**.

## Install

Drop the theme where Zed looks for user themes, then pick it from
<kbd>Cmd</kbd>+<kbd>K</kbd> <kbd>Cmd</kbd>+<kbd>T</kbd>:

```bash
mkdir -p ~/.config/zed/themes
curl -o ~/.config/zed/themes/count-darcula.json \
  https://raw.githubusercontent.com/ChrisNicholson30/Count-Darcula-Theme/main/zed/themes/count-darcula.json
```

Or from a clone, symlinked so `git pull` keeps it current:

```bash
ln -s "$PWD/zed/themes/count-darcula.json" ~/.config/zed/themes/count-darcula.json
```

Zed reloads themes as the file changes — no restart.

## As a dev extension

This directory is also a valid Zed extension (`extension.toml` + `themes/`). In Zed:
**Extensions ▸ Install Dev Extension**, and choose this `zed/` folder.

- **Website:** https://countdarcula.com
- **Source:** https://github.com/ChrisNicholson30/Count-Darcula-Theme
