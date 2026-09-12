# Count Darcula — Zed

The same theme, in Zed's vocabulary: 139 style keys, 46 tree-sitter syntax captures and 8
collaborator cursors, generated from the same OKLCH palette as the VS Code build. `keyword` is
rose in both editors because it is rose in `src/palette.js`, not because it was typed twice.

All four variants live in one file — Zed themes are families, and the editor lists each entry
separately in its picker: the flagship, the **Bloodline** special edition, **Nocturne** and
**Daylight**.

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
