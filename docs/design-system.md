# agent dynamic UI design system

The screen is agent-authored HTML on a locked stylesheet. The agent chooses the layout freely, using rows, stacks and grids that nest to any depth. Consistency comes from three layers:

1. **Tokens and generated classes.** These are the only styling vocabulary. The type scale starts at 16px, there is no gray text class, and gray exists only as a bar fill.
2. **The render check.** It enforces the markup policy, the readability floor, ink and fit on every screen.
3. **The `trmnl-screen` skill.** It teaches patterns, fit budgets and taste: `.claude/skills/trmnl-screen/`.

This replaces the earlier fixed compositions (v2) and bounded grid (v1); see the git history for them.

## Sources of truth

- `src/design/tokens.json`: type scale, figures, spacing, rules, icon and bar sizes, gray fills, limits.
- `src/design/weather.json`: weather conditions, icon files and WMO codes.
- `src/screen.mjs`: generates the stylesheet and class list from the tokens; defines the markup policy, the contract and `compose()`.
- `src/contract.liquid`: the AI-facing contract embedded at the top of the uploaded markup.
- `scripts/render.mjs`: the Chrome render harness, the markup lint and the measurements shared by `npm run check` and `npm test`.
- `.claude/skills/trmnl-screen/`: the agent-facing guide (`SKILL.md`), with references for classes, patterns and fit.
- `examples/screens/`: one tested screen per pattern.

## How a screen becomes markup

`compose()` concatenates the contract comment, the generated `<style>`, and `<div class="dui">{% raw %}<!-- SCREEN:BEGIN -->…<!-- SCREEN:END -->{% endraw %}</div>`. The `raw` block keeps TRMNL from evaluating Liquid-looking text in screen content. Because merge variables are unused, a routine update rewrites only the SCREEN region and uploads the whole markup with `writeMarkup`. The fixed parts are about 18 KB, and the composed markup must stay under 60 KB (writeMarkup returned HTTP 413 near 85 KB).

## Readability and ink

No class produces text under 16 CSS px, and 16px text is weight 700. `f-unit` is clamped to at least 16px. Text is pure black, or white on `s-inverse` and dark fills; there is no gray text. Fills use the framework's dithered `bg--gray-NN` steps and only on `.s-bar-fill`. At 55 and darker, fill text turns white with a black outline, and icons invert with a white outline. The decorative footer is retired: the honest content time lives in an element marked `data-updated` in the top metadata.

These rules apply in the browser renderer; they don't guarantee physical legibility. Panel size, server scaling, viewing distance and font rendering still matter, and device feedback may justify raising the floor.

## Markup policy

| Allowed | Values |
| --- | --- |
| Tags | `div section header main footer span p h1 h2 h3 ul ol li table thead tbody tr th td img b strong em br` |
| Attributes | `class`, `alt`, `src`, `style`, `data-updated` |
| Classes | Generated classes (listed in the skill's `references/classes.md`) and `bg--gray-{15,30,45,55,60,65,70,75}` on bar fills |
| `style` | Only numeric `--from`/`--to` (0–100) and `--cols`/`--span` (1–12) |
| `src` | Only the trmnl.com Weather Icons URLs derived from `weather.json` |

Agents must HTML-escape any text that came from email, calendars or the web, because strings are no longer escaped by a template.

## The render check

`npm run check -- screen.html` composes the screen and renders it with liquidjs and Chrome at 800×480 against the vendored TRMNL Framework 3.4.0 CSS. Weather icons are served from `vendor/weather-icons/` and every other request is blocked. The check then reports:

- **Errors:** disallowed tags, attributes, classes or style properties; gray outside bar fills; image sources other than weather icons; no `data-updated` element, or an empty screen; text under 16px, or 16px under weight 600; text that isn't black or white; icons that fail to load; elements outside the frame; any clipping container (`l-row`, `l-stack`, `l-grid`, bars, the frame) whose content overflows.
- **Warnings:** more than one inverse region, more than four text sizes, or `t-display`/`t-headline` text over 40 characters.

A passing single-screen check writes `dist/full.liquid` for upload, and saves the PNG to `artifacts/check/`.

## Tests

`npm test` builds, then `tests/design.mjs` renders:

- every canonical example, which must pass with no warnings;
- stress cases for every text style at length, every figure size, every weather condition (every vendored icon must be reachable), every fill step with labels and icons, eight columns, and deep nesting.

It confirms each rejection fixture fails for the expected reason: script, style and link tags, an event handler, an external image, an unknown or framework gray-text class, an inline color, an out-of-range fill, gray outside a bar, a missing timestamp, overflow, an over-wide figure, and an empty screen. It checks that Liquid and escaped text render literally, and that compose refuses `endraw`, SCREEN markers and oversized markup. It also verifies that the skill documents every class and condition and cites every example. PNG and HTML previews go to `artifacts/design/`.

A passing local render doesn't certify every device; use a TRMNL server preview after uploading.
