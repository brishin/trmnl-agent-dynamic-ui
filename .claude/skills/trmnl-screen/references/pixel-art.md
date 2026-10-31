# Pixel images

A screen may carry small 1-bit pictures: a character dressed for the weather, a parcel at the door, a pet, a bike for a dry commute. Use one when a picture says it faster than a sentence. The picture supports a fact on the screen; it is never decoration and never the only place the fact appears.

## The contract (the check enforces it)

- `<img class="p-image" src="data:image/png;base64,…" alt="Short description">`. No other image source except the weather icons.
- Opaque pure black and white pixels only. Grays are drawn as dither patterns, not gray values.
- Shown at its own size: never scaled, never cropped. Draw it at the size it will appear, at most 360×432 px.
- At most 4096 bytes of PNG each, and at most 3 per screen. A typical 80×136 figure is ~600 bytes.
- On `s-inverse` it inverts automatically, like the icons.

## Drawing one

`src/pixel.mjs` draws shapes at device resolution and returns a valid image. Write a module that exports drawing functions, each taking a style and returning a `Pixels` canvas, and lists their names in `export const drawings`. Then render it:

```sh
npm run pixel -- art.mjs            # every drawing, line art
npm run pixel -- art.mjs bike --style=shaded
```

It writes `artifacts/pixel/<name>-<style>@4x.png` (look at it) and `<name>-<style>.html` (the `<img>` tag to paste into the screen). Then run `npm run check` on the screen as usual.

| Call | Draws |
| --- | --- |
| `new Pixels(w, h, {style})` | A canvas; `style` is `'lineart'` (default) or `'shaded'` |
| `poly(points, {fill, stroke, mirror})` | A filled polygon; `stroke` is the outline width (default 2, 0 for none); `mirror` also draws it reflected across the vertical center |
| `rect([x0,y0,x1,y1], opts)` | A rectangle, same options |
| `ellipse([x0,y0,x1,y1], {…, half})` | An ellipse in a box; `half: 'top'` or `'bottom'` keeps one half (hats, hoods, umbrellas) |
| `line(points, {ink, width, mirror})` | A crisp polyline; `ink` is a tone, default black |
| `shade()` | Adds form shadows; call once after the main shapes, before small details |
| `img(alt)` | The finished `<img class="p-image">` tag |

Tones run from `0` (ink) to `254` (paper); `tone.ink`, `dark`, `denim`, `mid`, `light` and `paper` name the useful ones. Draw back to front. Coordinates are whole pixels, origin top-left.

`examples/pixel/character.mjs` is a worked library: an 80×136 front-facing character in `warm` (tee), `jacket`, `winter` (puffer, mittens) and `rain` (raincoat, umbrella) outfits. It exports its parts (`figure`, `head`, `hair`, `beanie`, `scarf`, `face`), so a new outfit or prop reuses the same body. Extend it rather than starting a figure from scratch, so characters stay consistent across refreshes.

Without the repository, any PNG that meets the contract works; verify it with a server preview.

## Style: prefer line art

Line art is the default because it matches the weather icons' thin strokes and the black-on-white type, and it stays readable across the room.

- Outline every main shape at 2 px and leave its inside as paper.
- Keep solid ink for small dark masses only: hair, boots, a hat band, a mitten. Large black areas outweigh the type.
- Mid tones (`denim`, roughly 80–139) become a light dot texture; use it for one material, such as jeans, not everywhere.
- Light comes from the upper left. `shade()` puts a light dot inside each shape's right edge. Draw faces, zippers, buttons and seams after it, so they cast no shadow.
- Keep 2 px between parts that must read as separate, and no detail smaller than 2 px except 1 px seam lines.

Use `--style=shaded` when tone has to tell materials apart, such as a coat versus jeans, or when one large picture stands alone. It reads grayer and busier beside text, so give it room.

## Placing it

- Pair it with its fact: a `t-label` caption under it, or one short sentence beside it in a row with `l-align-center` or `l-align-end`.
- Two side-by-side figures show a change ("Fri tee → Sat jacket") without a sentence. Three is the most a column can carry.
- Budget its height like a block of text: an 80×136 figure plus its caption takes about 160 px of a column.
- Weather conditions already have icons; use pixel images for what icons can't say.
