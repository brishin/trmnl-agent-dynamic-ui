# Agent guide

Private TRMNL plugin; see `README.md` for commands and `docs/design-system.md` for how the system works. To compose or update the screen, use the `trmnl-screen` skill (`.claude/skills/trmnl-screen/SKILL.md`). Deployment IDs are in `config/plugin.json`.

## Source and output

- `src/design/tokens.json`: type scale, spacing, rules, fills and limits; `src/design/weather.json`: conditions, icons, WMO codes.
- `src/screen.mjs`: generates the stylesheet and class list from tokens, defines the markup policy and `compose()`.
- `src/contract.liquid`: compact AI-facing contract embedded in the uploaded markup; preserve its build placeholders.
- `scripts/`: build, check, compose and the shared Chrome render harness. `examples/screens/`, `tests/`, `docs/`: canonical screens, checks, documentation.
- Edit source; `npm run build` and `npm run check` generate `dist/`. Tests write `artifacts/`. Both are ignored; never commit generated output or dependencies.
- Adding or renaming a class means updating `references/classes.md` in the skill; adding an example means citing it in `references/patterns.md` (`npm test` enforces both).
- Keep pinned `vendor/trmnl/` and `vendor/weather-icons/` assets and their documented checksums consistent.

## Design and verification

- Text >=16 CSS px; text at 16px requires weight >=600. Text is black or white; gray is for bar fills only. No auto-shrinking or decorative footer.
- Screens use only design-system classes and the allowed tags; content from outside sources is HTML-escaped, never pasted as markup.
- `npm ci`; run `npm test` after token, stylesheet, policy, harness, contract, example or skill changes. Browser checks require Chrome at the path in `scripts/render.mjs`. Documentation-only changes need a diff check.
- Check every screen with `npm run check -- screen.html` and look at the PNG. Use authorized facts and honest timestamps; included examples are fictional.

## MCP workflow

- Screen updates: upload the checked `dist/full.liquid` with `writeMarkup` (`markup_full`), verify with `readMarkup`, then inspect a device-model server preview. Routine updates rewrite only the SCREEN region; they don't change playlists or device settings.
- Save completed preview images immediately; reading consumes the result. Local 800x480, server previews, and physical screens differ; report verification accurately.
- Git history's first four commits are reconstructed; see `docs/history.md`. Do not backdate or rewrite them.
