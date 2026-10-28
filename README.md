# agent dynamic UI — bounded grid

Private TRMNL plugin setting 522048. Five plain-text block types: brief, metric, list, agenda, table. A row holds one full block or two half blocks; the validator limits the screen to two rows.

Run `npm ci`, then `npm test`. `npm run build` copies `v1.liquid` into generated `full.liquid`; upload that output as markup_full. Browser checks require Google Chrome at the standard macOS application path. Framework assets are pinned under `assets/`.

This commit reconstructs the original grid stage. See HISTORY.md for the reconstructed-history policy. All numbered examples, browser previews and test reports are generated and ignored.
