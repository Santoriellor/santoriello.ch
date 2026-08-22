# 0002 — Inline wordmark SVG stays inline, and stays this large

## Status

Accepted.

## Context, with the measured numbers

`front/src/components/Home.js` is 100 lines and 1,197,556 bytes on disk
(the file uses CRLF line endings; counted with one line terminator per line
instead of two, that is 1,197,456 characters). It contains one `<svg>` with
**three** `<path>` elements — not five. (A naive `grep -o 'd="[^"]*"'`
over-counts here: it also matches the tail of two `id="..."` attributes
elsewhere in the file — `id="home"` and
`id="path-1-outside-1_1_3"` — because `d="` is itself a substring of `id="`.
Anchoring the match so it cannot start mid-attribute — i.e. requiring that
`d=` not be preceded by another identifier character — finds exactly three
real path attributes.)

Those three `d=` attributes together account for 1,194,631 characters —
99.8% of the file. Two are near-identical 28,144-character paths (28 kB
each); the third is a single 1,138,343-character expanded outline. This
matches a Figma "outside stroke" export: a mask-source path, a filled-glyph
path, and one hugely expanded outline path standing in for what a real
stroked path would otherwise render as.

The production bundle `build/static/js/main.*.js` measures 1,464,065 bytes
raw, 330.18 kB gzipped (verified by building the project locally with
`react-scripts build`). The path data is 1,194,631 ÷ 1,464,065 = 81.6% of
the raw bundle.

An identical asset already exists, unreferenced, at
`front/public/images/santoriello.svg` (1,194,993 bytes, confirmed on disk).

## Decision

Task 7 moves this markup into `front/src/components/NameLogo.js` unchanged.
The payload is not reduced in this cycle.

## Consequences and the reason

`front/src/styles/Home.css` animates `.svg-path` with `stroke-dasharray` /
`stroke-dashoffset` on scroll-reveal. That only works against an inline
`<svg>` in the document — an `<img src="...svg">` (which is what
`public/images/santoriello.svg` would have to become to be "just used
instead") is opaque to the containing document's CSS and cannot be targeted
this way. Swapping to the `<img>` would silently break the reveal animation
that `Home.css` already implements.

Shrinking the payload means re-exporting the wordmark as a real stroked path
instead of an expanded outline, which is a design-asset change with a
visible rendering result (stroked paths and expanded-outline paths do not
composite pixel-identically at every zoom level), and this cycle must not
change rendered output. Target for that future re-export: land under 20 kB.

## Correction to the original survey

The original finding this ADR was drafted from stated "five `d=`
attributes." That count was a false positive from an unanchored `grep`
match against two `id="..."` attributes elsewhere in the file, as described
above. The corrected, verified count is three `d=` attributes (three
`<path>` elements in one `<svg>`), and it changes none of the downstream
figures: the 99.8%-of-file and 81.6%-of-bundle percentages both round to the
same values whether the two spurious matches (32 characters total) are
included or not.
