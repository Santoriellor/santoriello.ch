# 0003 — Colour contrast failures are not fixed this cycle

## Status

Accepted.

## Context

Seven ratios were measured, each computed from the composited colour —
taking the foreground's alpha channel and its backdrop into account, not the
raw declared colour alone:

| Selector | File:line | Foreground | Backdrop | Ratio | WCAG AA |
|---|---|---|---|---|---|
| `.home-btn` | `front/src/styles/Home.css:70` | `hsla(182,96%,40%,0.2)` → `rgb(21,59,60)` composited | `rgb(26,26,26)` | **1.44:1** | fails (needs 4.5:1) |
| `.description-links` | `front/src/styles/AboutMe.css:56` | `var(--link-color)` → `rgb(63,206,212)` composited | `#f9f9f9` | **1.81:1** | fails (needs 4.5:1) |
| `.project-button` | `front/src/styles/MyWork.css:207` | `var(--link-color)` | `var(--projects-bg-color)` = white | **1.88:1** | fails (24 px text/border, needs 3:1) |
| `.filters button .text-layer.hover` | `front/src/styles/MyWork.css:80` | white | `var(--link-color)` over `#f9f9f9` | **1.90:1** | fails (needs 4.5:1) |
| `.social-link:hover` | `front/src/styles/Footer.css:73` | `hsla(182,96%,40%,0.76)` | `#343a40` | **3.64:1** | passes as a non-text icon (3:1), fails as text |
| `.home-tagline` | `front/src/styles/Home.css:48` | `rgba(255,255,255,0.4)` → `rgb(102,102,102)` composited | `#000` (the CodeRain backdrop) | **3.66:1** | fails (19.2 px normal weight, needs 4.5:1) |
| `--link-color`, dark theme | `front/src/App.css:22` | `hsla(182,96%,70%,0.8)` | `#4e565f` | **4.35:1** | fails (needs 4.5:1) |

For reference, the two checked that pass comfortably: `--text-color`
`#343a40` on `#f9f9f9` is 10.93:1, and `#dfdbdb` on `#4e565f` (the dark-theme
body text) is 5.42:1. Body text is fine; the accent is not.

## Decision

The palette is not changed in this cycle. Every failure above is a property
of the brand accent, `hsl(182, 96%, 40%)` = `rgb(4, 193, 200)`
(`front/src/components/CodeRain.js:183` uses the same hue as `rgba(4, 193,
200, ...)`), which measures roughly 2.11:1 against the light page background
(`#f9f9f9`) and 2.22:1 against a white card — too low a starting point for
any of its translucent uses above to clear 4.5:1 no matter how the alpha is
adjusted. Fixing every row above means choosing a new accent colour, which
is a visual redesign and is out of scope per estate spec §7 ("visual
redesign" is explicitly listed as out of scope).

## Consequences

Task 8 fixes only the *structural* accessibility defects (see
`docs/decisions/0004-deferred-findings.md` and this repository's zero
`:focus` / `:focus-visible` rules — confirmed absent from every file under
`front/src`). The focus ring Task 8 introduces deliberately does **not** use
the accent colour, for exactly the reason recorded above: the accent fails
contrast in every context it currently appears in, so building a new
accessibility affordance out of the same colour would ship it already
non-compliant. This must not be "tidied" into `var(--link-color)` later —
that would silently reintroduce the same failure in the one place this
project added contrast-aware color on purpose.
