# agent dynamic UI

A private TRMNL plugin whose screen a personal agent writes directly: an HTML fragment built from a locked, token-generated stylesheet. The agent has free rein over layout. The [`trmnl-screen` skill](.claude/skills/trmnl-screen/SKILL.md) guides it toward strong patterns, and a render check enforces readability and fit. Plugin setting **522048**: https://trmnl.com/plugin_settings/522048

## Work locally

```sh
npm ci
npm test
```

`npm test` builds the stylesheet and contract, then renders every example and stress case in Chrome with the readability, ink, markup-policy and overflow checks. It also confirms that invalid screens are rejected and the skill matches the stylesheet. Browser checks require Google Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; edit `CHROME` in `scripts/render.mjs` for another platform. Framework assets are vendored under `vendor/trmnl/`, and weather icons under `vendor/weather-icons/`, with their source URLs and checksums.

| Command | Purpose |
| --- | --- |
| `npm run build` | Generate `dist/screen.css` and `dist/AI-CONTRACT.liquid`; apply the upload size guard |
| `npm run check -- screen.html` | Validate and render a screen to `artifacts/check/`; on success write `dist/full.liquid` for upload |
| `npm run compose -- screen.html` | Wrap a screen into `dist/full.liquid` without checking it |
| `npm test` | Build, render all examples and stress cases, run rejection and skill-sync checks |

Build products go to `dist/` and renders to `artifacts/`; both are ignored. A build doesn't upload anything to TRMNL.

## Repository layout

```text
.claude/skills/trmnl-screen/  agent guide: workflow, rules, classes, patterns, fit budgets
src/
  design/tokens.json          type scale, spacing, rules, fills, limits
  design/weather.json         weather conditions, icons, WMO codes
  screen.mjs                  stylesheet + class list generator, markup policy, compose()
  contract.liquid             AI-facing contract embedded in the uploaded markup
scripts/                      build, check, compose, shared Chrome render harness
examples/screens/             one tested screen per layout pattern
tests/design.mjs              examples, stress cases, rejections, skill sync
docs/                         design system and reconstructed history
config/plugin.json            non-secret deployment identifiers
vendor/                       pinned TRMNL framework assets and weather icons
```

## Agent update workflow

1. Write `screen.html` following the skill.
2. Run `npm run check -- screen.html` and look at the PNG; fix every error and warning.
3. Upload `dist/full.liquid` with `writeMarkup({plugin_setting_id:"522048", markup_full:…})`, then confirm with `readMarkup`.
4. For a server preview, call `startPreview` with `plugin_setting_id:"522048"`, `device_model:"v2"`, `size:"markup_full"`, then `getPreview`. Save the image immediately, because reading it consumes the result.

Merge variables are no longer used; each update replaces the markup. Agents without the repository read the markup, replace only the text between `<!-- SCREEN:BEGIN -->` and `<!-- SCREEN:END -->`, and follow the embedded `AGENT_DYNAMIC_UI_CONTRACT/2`. Use real, authorized facts and an honest content time. Included examples are fictional.

Local 800×480 renders differ from device-model proportions, and a server preview doesn't verify the physical screen. Full-screen layout only; mashup sizes aren't implemented. The installed screen is the editorial example (`examples/screens/editorial.html`). No daily content-generation automation is configured.

## License

MIT; see [LICENSE](LICENSE). Vendored third-party assets keep their own licenses: the TRMNL Framework in `vendor/trmnl/` (open source, listed as MIT) and the Inter font and Weather Icons in `vendor/` (SIL Open Font License 1.1).
