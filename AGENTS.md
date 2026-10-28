# Agent guide

Private TRMNL plugin; see `README.md` for commands and `docs/design-system.md` for design rules. Deployment IDs are in `config/plugin.json`.

## Source and output

- `src/templates/`: v1 grid and nine v2 compositions; prefer schema v2.
- `src/schemas/`, `src/validate*.mjs`: payload contracts and composition checks.
- `src/design/tokens.json`: shared typography and spacing.
- `src/contract.liquid`: compact AI-facing contract; preserve its build placeholders.
- `examples/`, `tests/`, `docs/`: canonical samples, browser checks, documentation.
- Edit source; `npm run build` generates `dist/`. Tests write `artifacts/`. Both are ignored; never commit generated output or dependencies.
- Keep pinned `vendor/trmnl/` assets and their documented checksums consistent.

## Design and verification

- Text >=16 CSS px; text at 16px requires weight >=600. No auto-shrinking, gray small text, or v2 decorative footer.
- Use whitespace, rules, and hierarchy; keep block order compatible with the selected composition. Strings are escaped content, never executable HTML/Liquid.
- `npm ci`; run `npm test` after renderer, schema, token, build, or check changes. Browser checks require Chrome at the path in `tests/*.mjs`. Documentation-only changes need a diff check.
- Validate content with `npm run validate -- payload.json`. Use authorized facts and honest timestamps; included examples are fictional.

## MCP workflow

- Data: `updatePluginSettingData` with a complete validated screen. Routine updates do not change templates, playlists, or device settings.
- Renderer: build/test, upload `dist/full.liquid` via `writeMarkup` (`markup_full`), verify with `readMarkup`, then inspect a device-model server preview.
- Save completed preview images immediately; reading consumes the result. Local 800x480, server previews, and physical screens differ; report verification accurately.
- Git history's first four commits are reconstructed; see `docs/history.md`. Do not backdate or rewrite them.
