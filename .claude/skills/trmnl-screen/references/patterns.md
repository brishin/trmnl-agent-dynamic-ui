# Layout patterns

These are starting points, not templates. Each one names a full, tested example; open it, copy the structure, and change the content and proportions to suit. Mixing two patterns is encouraged. Every example passes `npm run check` with no warnings.

Pick by asking **what is the one thing**, and **how many peers sit beside it**:

| Focal point | Peers | Try |
| --- | --- | --- |
| One sentence | none | poster, cover |
| One sentence | a short list | editorial, dispatch |
| One number | context + a few times | spotlight, split, countdown |
| 3–5 equal numbers | an interpretation | scoreboard, cover |
| A schedule | a side note | timeline, spotlight |
| People, projects, days | none | board, week |
| Dates in a month | the events behind them | month |
| A quantity over time | an interpretation | outlook, bands |
| Many small statuses | none | dashboard |

## Editorial: lead and rail

`examples/screens/editorial.html`. A big serif headline and a paragraph on the left (`l-grow-3`); a figure, numbered list and footnote on the right (`l-grow-2`), split by `d-thin`. Use it for a briefing or "tomorrow" summary. Headline ≤ 32 characters at `t-headline`; body ≤ 220 characters; rail list ≤ 3 items of ~30 characters.

## Spotlight: inverse number column

`examples/screens/spotlight.html`. An inverse column holds a label, an `f-xxl` figure and a caption spread with `l-justify-between`. The right side holds a title, a short paragraph, and a divided list of times pinned to the bottom with `l-spacer`. Use it for "leave in", "days until" or "items due". The figure is ≤ 3 digits at `f-xxl` in a 2/5 column.

## Split: half and half

`examples/screens/split.html`. No separate header. The inverse left half is the answer; the right half holds the header row with `data-updated`, options and a footnote. Use it when there's a decision plus alternatives (commute, which train, go or wait). It works well as a change of pace from header-led screens.

## Scoreboard: peers and a verdict

`examples/screens/scoreboard.html`. A row of 4 equal stat columns (`d-thin`): label, `f-l` figure with `f-unit`, one line of context. A `footer` with `e-top-medium` holds a serif title and the interpretation. Figures ≤ 4 characters at `f-l` in quarter columns; use `f-m` for 5–6 columns.

## Cover: centered statement

`examples/screens/cover.html`. A centered kicker, a `t-display t-serif` statement and a deck, over a footer row of stats. A symmetric layout is the point here, so use it sparingly: for weekly reviews, milestones and greetings. Display line ≤ 20 characters.

## Poster: one action

`examples/screens/poster.html`. A `t-display` directive (two short lines) with one supporting sentence; a checklist rail with a thick top rule. Use it for "the one thing to do now". The display text is ≤ 20 characters; it may break onto two lines in a 3/5 column.

## Dispatch: digest with columns

`examples/screens/dispatch.html`. A serif masthead, a full-width lead band with a bottom rule, then two divided columns: a table and a list aligned by grow ratios. Use it for inbox, news or a deliveries digest. Tables hold ≤ 3 rows of 3 short cells in a 3/5 column.

## Timeline: big times

`examples/screens/timeline.html`. Rows of `t-title` times (`l-grow-1`) and descriptions (`l-grow-3`) divided by thin rules; a side rail with the weather and a short reminder list pinned to the bottom. Use it for a day plan or an itinerary. Up to 5 rows; descriptions ≤ 40 characters.

## Board: one column per owner

`examples/screens/board.html`. Equal columns separated by `e-right`, each a stack: name and badge, items, `l-spacer`, small stats at the bottom. The one exceptional column goes `s-inverse`. Use it for team, family or project boards. 3–5 columns; with 6–8, drop the stats and keep items to ~10 characters per line.

## Week: days as columns

`examples/screens/week.html`. Day columns with label, `f-m` date and items. Today or the odd day is inverse. A footer sentence interprets the week. 5–7 columns. At 7, items are ~12 characters per line; abbreviate ("Swim 4:15").

## Month: calendar grid and dates

`examples/screens/month.html`. A weekday header grid with a medium bottom rule, then a 7-column `l-grid l-rows-equal l-place-center` of days. Today is `s-ring s-inverse` and marked days are `s-ring`. A divided rail lists what the marks mean. Leading blank cells use one `<span style="--span:N"></span>`. You compute weekdays; the renderer does no date math.

## Countdown: number beside a headline

`examples/screens/countdown.html`. An `f-xxl` number inline with a serif headline and a sentence, centered vertically, over a footer row of upcoming dates with "in N days" labels. Use it for trips, deadlines and birthdays.

## Outlook: pills on a shared scale

`examples/screens/outlook.html`. A left rail with "now" (`f-xl`), the headline and a sentence; on the right, a row of columns each holding a time label over an `s-bar-v s-bar-min-l` whose fill carries an icon and a temperature. Hourly data uses point fills (`--from` = `--to` = scaled temperature). Daily highs and lows use ranges (`--from` = scaled low, `--to` = scaled high). Shade each fill by condition. Scale: `(t − min) / (max − min) × 100`, rounded. 5–8 columns.

## Bands: ranges in rows

`examples/screens/bands.html`. A "right now" figure and the advice on the left; on the right, rows of label (`l-grow-1`), `s-bar s-bar-lg` (`l-grow-6`) and the raw values (`l-grow-2`, `t-end`). Use it for prices, temperatures by day, or sleep windows. Darker fills mean worse or higher. Keep values outside the fill when fills can be narrow.

## Dashboard: tiles without boxes

`examples/screens/dashboard.html`. A 3×2 `l-grid l-rows-equal` of tiles, each just a top rule, label, `f-m` value and one line. The tile needing attention gets `e-top-thick` instead of an inverse fill. A tile may hold a horizontal `s-bar`. Use it for home, server or finance status. ≤ 6 tiles; values ≤ 5 characters.

## Remixing

- **Swap the axis.** A board with rows instead of columns becomes a ranked list; a timeline turned sideways becomes a week.
- **Change the focal device.** The same content works with an inverse column (spotlight), a display line (poster) or a giant figure (countdown). Rotate between them across refreshes.
- **Move the header.** Thick top rule (default), bottom-ruled header (poster), serif masthead (dispatch), centered stamp (cover), or a header inside one half (split).
- **Change the proportions.** 3:2, 2:1, 5:4 and 1:1 make different screens from the same parts.

## Anti-patterns

- Three or more equal boxed cards in a row: use dividers or a board.
- Every region bold and large: only the focal point is large.
- Two inverse panels, or an inverse header *and* an inverse column.
- A row of 8 figures at `f-l`: they won't fit; step down to `f-m` or `f-s`.
- Paragraphs longer than two sentences anywhere.
- Footers with timestamps, sources or "updated by agent" text.
