# Publishing to the VS Code Marketplace

The extension is packaging-clean today — `npm run package` produces a ~120 KB VSIX with no
warnings. What is missing is an identity to publish it *as*, which only you can create.

## One-time setup

1. **Create an Azure DevOps organisation** (free) at <https://dev.azure.com>. The Marketplace
   uses it purely for authentication; you never have to look at it again.

2. **Create a Personal Access Token**
   - In Azure DevOps: *User settings ▸ Personal access tokens ▸ New Token*
   - **Organization:** `All accessible organizations` — this one matters; a token scoped to a
     single org fails with a confusing 401
   - **Scopes:** *Custom defined* ▸ **Marketplace ▸ Manage**
   - Copy the token now; Azure will not show it again

3. **Create the publisher** at <https://marketplace.visualstudio.com/manage>. Note the
   **publisher ID** it gives you — not the display name.

4. **Make `package.json` match.** The `publisher` field is currently `cn-design`. It must be
   character-for-character your publisher ID or the upload is rejected:

   ```jsonc
   "publisher": "your-publisher-id"
   ```

## Publishing

### Option A — the browser, no token needed

```bash
npm run package          # writes count-darcula-1.0.0.vsix
```

Then at <https://marketplace.visualstudio.com/manage>, open your publisher and use
**New extension ▸ Visual Studio Code**, and drop the `.vsix` in. This is the simplest route and
it needs no PAT at all.

### Option B — the CLI

```bash
npx @vscode/vsce login your-publisher-id     # paste the PAT once; it is stored in your keychain
npm run publish:marketplace
```

Or in one shot, reading the token from the environment rather than your shell history:

```bash
export VSCE_PAT="…"
npx @vscode/vsce publish
```

> Keep the PAT out of chat logs, commit messages and CI logs. If one is ever pasted somewhere it
> shouldn't be, revoke it in Azure DevOps and issue a new one — it grants publish rights to
> everything under your publisher.

## Releasing an update

```bash
npm test                                   # build + validate + audit must pass
npx @vscode/vsce publish minor             # bumps package.json, tags, publishes
git push --follow-tags
```

Add an entry to [`CHANGELOG.md`](../CHANGELOG.md) first — the Marketplace renders it on the
extension's *Changelog* tab.

## What the listing will show

- **Icon** — `assets/icon.png` (256×256 crop of the logo card)
- **Banner** — `#282b35`, the theme's own canvas, set in `galleryBanner`
- **Body** — `README.md`. `vsce` rewrites its relative links to
  `raw.githubusercontent.com/ChrisNicholson30/Count-Darcula-Theme/HEAD/…`, which is why the
  screenshots are excluded from the VSIX in `.vscodeignore` — they are served from GitHub rather
  than shipped in the package.

So the README must be pushed to the default branch *before* publishing, or the listing renders
with broken images.

## Also worth doing

**Publish to Open VSX too.** This is not optional if you care about reach: Cursor, Windsurf,
VSCodium, Gitpod and code-server cannot use Microsoft's Marketplace, so Open VSX is the *only*
registry they search. It is the same VSIX and a separate, free account at <https://open-vsx.org>
(sign in with GitHub, then create a namespace matching your `publisher` field):

```bash
npx ovsx create-namespace your-publisher-id -p "$OVSX_PAT"
npx ovsx publish count-darcula-1.0.0.vsix -p "$OVSX_PAT"
```

Publishing to both registries from the same `package.json` is normal and expected — keep the
version numbers in step so the two listings don't drift.
