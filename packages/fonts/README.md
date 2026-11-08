# @tiket-ds/fonts

Tiket Odyssey Text, converted to woff2 and declared as a single CSS family.

## Supplying the source files

**Font binaries are not committed.** Odyssey is proprietary Tiket type, and this
repository may end up mirrored somewhere public. The workspace `.gitignore` excludes
`*.ttf`, `*.woff`, `*.woff2` and `*.otf` everywhere — which matters more than it used to
now that the drop sits in a directory whose other contents (the icons) *are* committed.

Put the eight TTFs in `tds library/tds font/`, alongside the `tds library/tds icon/`
SVGs, then:

```bash
pnpm fonts:build
```

To read them from somewhere else:

```bash
TDS_FONT_SOURCE_DIR=/path/to/fonts pnpm fonts:build
```

Expected files:

```
TiketOdysseyText-Regular.ttf          TiketOdysseyText-Italic.ttf
TiketOdysseyText-SemiBold.ttf         TiketOdysseyText-SemiBoldItalic.ttf
TiketOdysseyText-Bold.ttf             TiketOdysseyText-BoldItalic.ttf
TiketOdysseyText-ExtraBold.ttf        TiketOdysseyText-ExtraBoldItalic.ttf
```

## Building without the source files

Every environment other than a machine with the asset drop — CI, Vercel, a
stakeholder's clone — has none of the TTFs. That's expected, not a failure:
`pnpm fonts:build` writes a `fonts.css` with no `@font-face` rules instead of erroring.
`--tds-font-family` already carries a system-font fallback (`-apple-system,
BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`), so the site still renders, just in
a stand-in typeface until someone builds it from a machine that has the real TTFs.

Two cases are still called out. A *partial* drop — some faces present, some missing —
warns on stderr, because a family rendering half in Odyssey and half in the fallback
reads as a styling bug rather than a missing asset. And a `TDS_FONT_SOURCE_DIR` pointing
at a directory that doesn't exist fails outright, since that's a typo in an explicit
instruction rather than the expected proprietary-asset gap.

## Why the build step exists at all

The TTFs report three different family names, so Figma lists them as three separate
families:

| Figma family | Figma style | CSS |
|---|---|---|
| Tiket Odyssey Text | Regular / Italic / Bold / Bold Italic | 400, 400i, 700, 700i |
| Tiket Odyssey Text SemiBold | Regular / Italic | 600, 600i |
| Tiket Odyssey Text ExtraBold | Regular / Italic | 800, 800i |

If you just dropped the TTFs into `@font-face` blocks and let the browser infer,
you would get three families and no working weight axis. The build normalizes all
eight into one family with explicit `font-weight` / `font-style`.

There is no Light (300) or Medium (500) weight. Only 400, 600, 700 and 800 exist, and
only 400/600/700 are used by the type ramp.

## Usage

```ts
import "@tiket-ds/fonts/fonts.css";
```
