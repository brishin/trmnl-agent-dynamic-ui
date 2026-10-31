# Class reference

Values come from `src/design/tokens.json`. The stylesheet is generated from those tokens, so this file and `npm test` stay in sync with it. Classes not listed here are rejected.

## Frame

`.dui` is fixed: an 800×480 vertical flex column with a 24px inset (752×432 content), white ground, 18px/26px body text. Your top-level elements stack inside it; give the main one `l-grow-1`.

## Layout

| Class | Effect |
| --- | --- |
| `l-row` | Horizontal flex container; clips overflow |
| `l-stack` | Vertical flex container; clips overflow |
| `l-grid` | Grid of `--cols` equal columns (`style="--cols:7"`, default 2); a child spans with `style="--span:2"` |
| `l-rows-equal` | Grid rows share the height equally (calendars, tile dashboards) |
| `l-place-center` | Centers every grid cell's content both ways |
| `l-grow-*` | `l-grow-1` … `l-grow-12`: share of the free space along the parent's axis. Siblings with `l-grow-3` and `l-grow-2` split 3:2 |
| `l-none` | Natural size; never grows or shrinks (time columns, figures) |
| `l-spacer` | Empty element that absorbs leftover space, pushing later siblings to the far end |
| `l-align-*` | Cross-axis alignment of children: `start`, `center`, `end`, `stretch` (default), `baseline` |
| `l-self-*` | The same values for one child |
| `l-justify-*` | Main-axis distribution: `start`, `center`, `end`, `between`, `around`, `evenly` |

Children of rows and stacks may shrink, so give the region that must stay large a grow weight and let text wrap elsewhere.

## Spacing

All take `none` 0, `xs` 4, `sm` 8, `md` 16, `lg` 24, `xl` 40 px.

| Class | Effect |
| --- | --- |
| `l-gap-*` | Gap between children (rows, stacks, grids, lists); also the padding beside `d-*` dividers |
| `l-pad-*` | Padding on all sides |
| `l-pad-x-*` | Left and right padding |
| `l-pad-y-*` | Top and bottom padding |
| `l-mt-*` | Top margin |
| `l-mb-*` | Bottom margin |

## Rules and edges

Weights: thin 1px, medium 3px, thick 5px.

| Class | Effect |
| --- | --- |
| `d-thin`, `d-medium`, `d-thick` | On a row or stack: a rule between each pair of children, padded by the gap |
| `r-thin`, `r-medium`, `r-thick` | A standalone rule element (`<div class="r-thin"></div>`): horizontal in a stack, vertical in a row |
| `e-top`, `e-bottom`, `e-left`, `e-right` | A thin border on that edge |
| `e-top-*`, `e-bottom-*`, `e-left-*`, `e-right-*` | `-medium` or `-thick` versions, e.g. `e-top-thick` for the classic header rule |

## Type

| Class | Size / weight / line | Use |
| --- | --- | --- |
| `t-label` | 16 / 700 / 22, uppercase, tracked | Metadata, captions, column heads, the timestamp |
| `t-body` | 18 / 400 / 26 | Default for all text; rarely needed explicitly |
| `t-subtitle` | 24 / 700 / 30 | Short leads, times in lists, column names |
| `t-title` | 32 / 700 / 36 | Section headline, big times |
| `t-headline` | 48 / 700 / 52 | Screen headline (≤ ~30 characters) |
| `t-display` | 76 / 800 / 78 | Poster line (≤ ~20 characters) |
| `t-serif` | Georgia; drops to 400 on title/headline/display | Editorial voice |
| `t-bold` | 700 | Emphasis inside body text (or use `<b>`) |
| `t-caps` | Uppercase, tracked | Short headings at larger sizes |
| `t-center`, `t-end` | Text alignment | Centered covers, right-aligned values |
| `t-nowrap` | No wrapping | Values that must stay on one line (check the width!) |

`<b>`/`<strong>` are bold. `<em>` is italic: use it for tentative or optional items ("maybe" plans) so they recede next to bold confirmed ones, without a "?" or gray text.

## Figures

Numerals at weight 800, never wrapping. The average digit width is noted so you can check width before rendering.

| Class | Size | ≈ digit width |
| --- | --- | --- |
| `f-s` | 28px | 14px |
| `f-m` | 42px | 22px |
| `f-l` | 64px | 33px |
| `f-xl` | 96px | 50px |
| `f-xxl` | 130px | 67px |
| `f-unit` | Inside a figure: `<span class="f-xl">72<span class="f-unit">%</span></span>`; 40% of the figure, never under 16px | |

## Surfaces

| Class | Effect |
| --- | --- |
| `s-inverse` | Black ground, white text, inverted icons. Use for one focal region per screen |
| `s-round` | 12px corners (for an inverse panel; not for cards) |
| `s-badge` | Outlined uppercase tag, 16px bold |
| `s-badge-filled` | Solid badge (add to `s-badge`) |
| `s-ring` | Circles short content (a day number); with `s-inverse` it becomes a solid disc |

## Pixel images

| Class | Effect |
| --- | --- |
| `p-image` | Required on every pixel image: `<img class="p-image" src="data:image/png;base64,…" alt="">`. Shown at its own size, never scaled; inverts on `s-inverse`. Draw it with `npm run pixel`; see [pixel-art.md](pixel-art.md) |

## Lists

Use `<ul>` or `<ol>` with `s-list` and one marker class; `l-gap-*` sets item spacing (default 8px).

| Class | Marker |
| --- | --- |
| `s-list` | Vertical list, no marker |
| `s-list-bullet` | • |
| `s-list-dash` | – |
| `s-list-number` | 01, 02, 03 in bold |
| `s-list-check` | Empty checkbox; `<li class="s-done">` fills it |
| `s-done` | Marks a checklist item done |

## Bars and charts

You scale values to 0–100 before writing them. The renderer only positions the fill.

| Class | Effect |
| --- | --- |
| `s-bar` | Horizontal outlined track, 14px tall. Inside a row give it `l-grow-*` (it has no width of its own) |
| `s-bar-lg` | 36px tall track, room for a label inside the fill |
| `s-bar-bare` | Removes the track outline (floating ranges) |
| `s-bar-v` | Vertical track that fills the available height; put several in a row for a chart |
| `s-bar-min-*` | `s-bar-min-s` 32, `s-bar-min-m` 64, `s-bar-min-l` 104 px minimum fill height, so icons and values fit; a fill near the top or bottom is kept inside the track |
| `s-bar-fill` | The filled span: `<span class="s-bar-fill bg--gray-45" style="--from:20;--to:75">`. A point value uses the same `--from` and `--to` with a minimum height. May contain text and an icon |
| `bg--gray-*` | Fill shade, only on `s-bar-fill`: `bg--gray-15` (darkest), 30, 45, 55, 60, 65, 70, `bg--gray-75` (lightest). At 55 and darker, text inside turns white with a black outline. With no gray class the fill is solid black |

Weather shades by severity: clear 70, cloud 65, light precipitation 60, moderate 45, heavy 30, severe 15.

## Icons

`<img class="i-icon" src="https://trmnl.com/images/plugins/weather/wi-rain.svg" alt="">` sits inline at 1.25em. Sizes: `i-s` 24px, `i-m` 36px, `i-l` 64px, `i-xl` 112px. The base class `i-icon` is always required. Icons invert automatically on `s-inverse` and dark fills.

| Condition | Icon `src` | Open-Meteo WMO codes |
| --- | --- | --- |
| `clear` | `.../wi-day-sunny.svg` | 0 |
| `mostly-clear` | `.../wi-day-sunny-overcast.svg` | 1 |
| `partly-cloudy` | `.../wi-day-cloudy.svg` | 2 |
| `cloudy` | `.../wi-cloudy.svg` | 3 |
| `fog` | `.../wi-fog.svg` | 45, 48 |
| `drizzle` | `.../wi-day-showers.svg` | 51, 80 |
| `showers` | `.../wi-showers.svg` | 53, 81 |
| `heavy-showers` | `.../wi-showers.svg` | 55, 82 |
| `freezing-drizzle` | `.../wi-day-sleet.svg` | 56, 85 |
| `sleet` | `.../wi-sleet.svg` | 57, 86 |
| `light-rain` | `.../wi-day-rain.svg` | 61 |
| `rain` | `.../wi-rain.svg` | 63 |
| `heavy-rain` | `.../wi-rain.svg` | 65 |
| `freezing-rain` | `.../wi-day-rain-mix.svg` | 66 |
| `heavy-freezing-rain` | `.../wi-rain-mix.svg` | 67 |
| `light-snow` | `.../wi-snow.svg` | 71 |
| `snow` | `.../wi-snow.svg` | 73 |
| `heavy-snow` | `.../wi-snow.svg` | 75, 77 |
| `thunderstorm` | `.../wi-thunderstorm.svg` | 95 |
| `hail` | `.../wi-hail.svg` | 96 |
| `severe-hail` | `.../wi-hail.svg` | 99 |
| `unknown` | `.../wi-na.svg` | — |
