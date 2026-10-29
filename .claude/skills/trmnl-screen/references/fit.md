# Fit budgets

Use these numbers to size content before rendering; the render check has the final word. They come from glyph widths measured in Chrome on ordinary English text, with a 10% margin for whole-word wrapping. Narrow glyphs (digits, `il1`) fit more and capitals fewer, so treat them as estimates.

## Region widths

The content area is **752 × 432 px**. A header with a thick rule and a `t-label` line takes about **45 px**, plus whatever top margin you add, which leaves about **360–380 px** for the main region.

The width of a region in a row is `(752 − gaps − padding) × grow ÷ total grow`. With dividers, the gap applies on both sides of each rule. Common results:

| Split | Approx. width |
| --- | --- |
| Full | 752 |
| 2/3 of a 2:1 split with `l-gap-xl` | 474 |
| 1/2 with `l-gap-xl` | 356 |
| 1/3 with `l-gap-lg` | 235 |
| 1/4 with `l-gap-md` | 176 |
| 1/5 | 140 |
| 1/8 | 85 |

## Characters per line

| Style | full 752 | 2/3 ≈474 | 1/2 ≈356 | 1/3 ≈235 | 1/4 ≈176 | 1/5 ≈140 | 1/8 ≈85 | line px |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `label` | 65 | 41 | 30 | 20 | 15 | 12 | 7 | 22 |
| `body` | 86 | 54 | 41 | 27 | 20 | 16 | 9 | 26 |
| `subtitle` | 62 | 39 | 29 | 19 | 14 | 11 | 7 | 30 |
| `title` | 47 | 29 | 22 | 14 | 11 | 8 | 5 | 36 |
| `title serif` | 50 | 32 | 24 | 15 | 11 | 9 | 5 | 36 |
| `headline` | 32 | 20 | 15 | 10 | 7 | 6 | 3 | 52 |
| `headline serif` | 34 | 22 | 16 | 10 | 8 | 6 | 3 | 52 |
| `display` | 21 | 13 | 10 | 6 | 4 | 3 | 2 | 78 |
| `display serif` | 22 | 14 | 10 | 7 | 5 | 4 | 2 | 78 |

A single word longer than the line breaks mid-word, which looks broken. Make sure the longest word fits the column at that style.

## Height

Lines × line px, plus gaps and padding. For a 370 px main region:

| Style | Lines that fit |
| --- | --- |
| `body` | 14 |
| `subtitle` | 12 |
| `title` | 10 |
| `headline` | 7 |
| `display` | 4 |

Spend the height on hierarchy: a two-line headline (104 px) plus three body lines (78 px) plus a gap still leaves room for a list.

## Figures

Width ≈ digits × digit width (`f-s` 14, `f-m` 22, `f-l` 33, `f-xl` 50, `f-xxl` 67 px). A unit adds about 0.5 em. Line height is 1.12 × size.

| Class | 2 digits | 3 digits | 4 chars ("6.2h") |
| --- | --- | --- | --- |
| `f-m` | 44 | 66 | 88 |
| `f-l` | 66 | 99 | 132 |
| `f-xl` | 100 | 150 | 200 |
| `f-xxl` | 134 | 201 | 268 |

## Lists, tables, bars

- List items wrap at the body width minus about 2 characters for the marker.
- Table cells share the width equally unless the content forces otherwise; keep cells to one or two words.
- Horizontal bars need `l-grow-*` in a row; vertical bars need a parent with height (a stack inside a row with `l-grow-1` main).
- Point pills with an `i-m` icon and a `t-subtitle` value need `s-bar-min-l`; a value alone fits `s-bar-min-m`.
