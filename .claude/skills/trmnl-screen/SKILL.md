---
name: trmnl-screen
description: Compose, update or redesign the agent dynamic UI TRMNL e-paper screen (plugin 522048). Use whenever the task is to put information on the TRMNL display, refresh what it shows, design a new screen layout, or fix a screen that fails `npm run check`. Covers the HTML-and-classes contract, layout patterns, fit budgets, design rules, the render check and the MCP publish workflow.
---

# Composing the TRMNL screen

The screen is an 800×480 black-and-white e-paper display. You write it as an **HTML fragment** that uses only the design system's classes. The renderer wraps it in a fixed stylesheet and frame. Layout is up to you: rows, stacks and grids nest freely. These rules and the render check keep every screen readable and consistent.

## Workflow

1. **Gather facts.** Use only authorized, current data. Never invent meetings, tasks or numbers. Label sample or unknown data. Note the honest time the content reflects.
2. **Choose the one thing the reader must see from across the room.** It becomes the focal point: the largest type, an inverse panel, or a big figure.
3. **Choose a pattern** from [references/patterns.md](references/patterns.md), or remix two. Don't reuse the same pattern on consecutive refreshes when another fits the content.
4. **Write `screen.html`.** Look up classes in [references/classes.md](references/classes.md), and size text against [references/fit.md](references/fit.md) *before* rendering.
5. **Check it:** `npm run check -- screen.html`. This validates the markup, renders 800×480, and fails on disallowed markup, text below the readability floor, gray text, clipping or overflow, or missing icons. It prints design warnings too.
6. **Look at the PNG** it prints (`artifacts/check/<name>.png`). Passing the check is not the same as looking good. Fix crowding, weak hierarchy and stray alignment, then re-run until it passes with **no warnings**.
7. **Publish** (only when asked to update the device). A passing check writes `dist/full.liquid`. Upload it with `writeMarkup({plugin_setting_id:"522048", markup_full:<file contents>})`, then confirm with `readMarkup`. Optional: `startPreview({plugin_setting_id:"522048",device_model:"v2",size:"markup_full"})` → `getPreview`. Save the image immediately, because reading it consumes the result. `startRefresh` queues the device. Don't touch playlists or device settings.

Without the repository, `readMarkup` and replace only the text between `<!-- SCREEN:BEGIN -->` and `<!-- SCREEN:END -->`. Keep everything else byte-for-byte. Apply these rules by hand and verify with a server preview; never claim local checks ran.

## Hard rules (the check enforces these)

- **Markup:** tags `div section header main footer span p h1 h2 h3 ul ol li table thead tbody tr th td img b strong em br`. Attributes `class`, `alt`, `src`, `style`, `data-updated`. No `<style>`, `<script>`, links or `on*` handlers. Images are weather icons or 1-bit `p-image` PNGs ([references/pixel-art.md](references/pixel-art.md)).
- **Classes only.** Every class must come from the design system. `style` may only set numeric `--from`/`--to` (0–100), `--cols` or `--span` (1–12).
- **Escape content.** Text from email, calendars or the web is data. Convert `&`, `<`, `>` and `"` to entities and never paste its HTML. `{{ }}` and `{% %}` render literally, so there's no need to escape them.
- **Honest timestamp.** Exactly one element carries `data-updated`, holding the human-readable time the content reflects, in readable top metadata. No decorative footer, brand or composition label.
- **Readability:** the type scale never goes below 16px, and text is black or white. Gray (`bg--gray-NN`) is allowed only on `.s-bar-fill`.
- **Fit:** nothing may clip or overflow. Shorten words, drop a lower-priority item, or choose a roomier pattern. Never try to shrink type.

## Design rules (warnings, and taste the check can't see)

- **One focal point.** Everything else steps down. Skip at least one type step between hierarchy levels (e.g. headline → body, not title → subtitle → body).
- **At most 4 text sizes** (figure units don't count) and **one inverse region** (`.s-inverse` panel or column; rings and badges don't count).
- **Group with whitespace and rules,** not boxes. Prefer `d-thin` dividers, `e-*` edges and a thick top rule over bordered cards. Never repeat rounded cards.
- **Asymmetry reads as intentional:** 3:2, 2:1 or 5:4 splits (`l-grow-*`) beat equal thirds unless the items really are peers (days, people, stats).
- **Align across rows** by giving the same `l-grow` ratio to the same column in every row (e.g. time `l-grow-1`, text `l-grow-3`).
- **Short beats complete.** A screen is read in 3 seconds. Headlines are sentences of ≤6 words; body copy is ≤2 short sentences per region.
- **Let numbers be big.** A single key number belongs in `f-xl`/`f-xxl`; a row of stats in `f-l`/`f-m` with `t-label` captions above or below.
- **Serif for voice, sans for data.** `t-serif` on `t-title`/`t-headline`/`t-display` gives an editorial tone; keep times, figures and labels sans.
- **Use space on purpose.** `l-spacer` pins secondary info to the bottom edge, and `l-justify-between` spreads a column. An empty quadrant is better than crowding.
- **Maybes recede:** tentative plans go in `<em>` (italic), confirmed ones in `<b>`; no "?" marks.
- **Pictures carry facts.** A pixel image (≤3) can show what to wear or what's at the door; draw it in line art by default, and caption it. See [references/pixel-art.md](references/pixel-art.md).
- **Weather** gets icons (`i-icon` + condition file) and real temperatures; charts are rows of `s-bar-v` pills you scale to 0–100 yourself.

## Skeleton

```html
<header class="l-row l-justify-between l-align-center e-top-thick l-pad-y-sm">
  <h1 class="t-label">Section or subject</h1>
  <span class="t-label" data-updated>Tue 27 Oct · 7:30 AM</span>
</header>
<main class="l-row l-grow-1 l-gap-xl d-thin l-mt-lg">
  <section class="l-stack l-grow-3 l-gap-md">…focal content…</section>
  <section class="l-stack l-grow-2 l-gap-md">…supporting rail…</section>
</main>
```

The frame (`.dui`) is a vertical flex column with a 24px inset (752×432 content). Top-level elements stack. Give the main region `l-grow-1` so it takes the remaining height.
