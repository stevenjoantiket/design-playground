# Loading

`smile_loading.svg` is the face inside Figma's `Loading - General` (`1:856`) and
`Loading - 01 Icon` (`2:5429`), exported from the button page (`[SSoT] NFT` `408:19737`) —
the drop ships no icon for it. `tds_ic_smile.svg` is a different glyph: a face in a circle,
for a rating, not a spinner.

It is one path — two eyes and a mouth, no circle — drawn on a 32.73 × 20.47 artboard, and
the export's `fill` is whatever colour the button it sat in used. `currentColor` and the
button's own text token replace that, so one transcription covers all five variants.

Transcribed into `packages/ui/src/icons/loading.tsx`. Figma renders it at three sizes: 24
inside a small button, 32 inside a medium one, 40 inside a large one or a slide button.
