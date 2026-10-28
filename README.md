# agent dynamic UI

A private TRMNL plugin whose screen is selected by a personal agent using a constrained JSON contract. Plugin setting **522048**: https://trmnl.com/plugin_settings/522048

## Work locally

```sh
npm ci
npm test
```

`npm test` builds the renderer, checks the legacy grid, and renders the six v2 compositions with the design-system readability and overflow checks. Browser checks require Google Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; edit the executable path in the render scripts for another platform. Framework assets are vendored under `assets/` with their source URLs and checksums.

| Command | Purpose |
| --- | --- |
| `npm run build` | Generate `full.liquid`, `AI-CONTRACT.liquid`, and `design-system.css` |
| `npm run test:design` | Render v2 gallery; reject undersized/light small text, a returning footer, or overflow |
| `npm run test:legacy` | Validate and render the legacy v1 grid |
| `npm run validate -- payload.json` | Validate an agent's complete screen payload |

Build output, numbered gallery JSON copies, HTML, screenshots and test reports are ignored. Gallery source data lives in `gallery.json` and `v2/gallery.json`; tests regenerate the individual preview files. Keep generated files out of commits. A build does not upload anything to TRMNL.

## Source map

| File | Role |
| --- | --- |
| `v2/full.liquid` | Six current compositions |
| `v1.liquid` | Compatible legacy grid |
| `design-system.json` | Shared design tokens and readability floor |
| `DESIGN-SYSTEM.md` | Design rules and render-check details |
| `build.mjs` | Generate the combined renderer and inline MCP contract |
| `v2/screen.schema.json`, `v2/validate.mjs` | Current payload contract plus composition rules |
| `screen.schema.json`, `validate.mjs` | Legacy schema and version-aware validation entry point |
| `v2/render.mjs`, `test.mjs` | Browser checks |
| `plugin.json` | Non-secret deployment identifiers and playlist configuration recorded during setup |
| `HISTORY.md` | Explanation of the reconstructed version commits |

## Agent update workflow

An authorized client reads `readMarkup({plugin_setting_id:"522048",size:"markup_full"})`. The opening `AGENT_DYNAMIC_UI_CONTRACT/1` Liquid comment contains the minified v2 schema, ordered component requirements, design tokens, validation limits and MCP workflow. It is excluded from rendered output. `getMergeVariables` reads current content.

Prefer `schema_version:2`. Select a composition and provide plain text in the prescribed block order:

| layout | blocks |
| --- | --- |
| editorial | brief, metric, list |
| spotlight | metric, brief, agenda |
| timeline | agenda, list |
| scoreboard | four metrics, brief |
| focus | brief, list |
| dispatch | brief, table, agenda |

Validate the complete payload, then call `updatePluginSettingData({id:"522048",merge_variables:SCREEN})`. Send all required top-level fields; MCP does not enforce this custom schema. `width` and `emphasis` are ignored by v2; geometry and hierarchy come from its composition. Use real authorized facts and an honest content timestamp. Included gallery data is fictional.

For a server preview, call `startPreview` with `plugin_setting_id:"522048"`, `device_model:"v2"`, `size:"markup_full"`, then `getPreview` with its job id. Save the returned base64 image immediately: results are consumed on read. Local 800×480 previews differ from device-model proportions; a server preview does not verify the physical screen.

For renderer changes, edit canonical source/tokens, run the build and checks, then upload generated `full.liquid` with `writeMarkup`. Read it back to verify. Routine content updates need no template or playlist changes. No daily content-generation automation is configured. Full-screen layout only; mashup sizes are not implemented. Current setup uses the editorial sample as the sole visible playlist entry on device 73063; the previous Weather Glance entry is hidden and can be restored.
