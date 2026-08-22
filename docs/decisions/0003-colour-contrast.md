# 0003 — Colour contrast failures are not fixed this cycle

## Status

Accepted.

## Context

Seven ratios were measured, each computed from the composited colour —
taking the foreground's alpha channel and its backdrop into account, not the
raw declared colour alone. File:line references below are as of Task 9's
token consolidation (`--accent`/`--accent-strong`/`--accent-faint` now live
in `front/src/styles/tokens.css`, not as literals in each component
stylesheet); the ratios themselves are unaffected by that refactor — the same
declared colours, just referenced through custom properties instead of typed
out at each site:

| Selector | File:line | Foreground | Backdrop | Ratio | WCAG AA |
|---|---|---|---|---|---|
| `.home-btn` | `front/src/styles/Home.css:70` (`color: var(--accent-faint)`, `front/src/styles/tokens.css:44`) | `hsla(182,96%,40%,0.2)` → `rgb(21,59,60)` composited | `rgb(26,26,26)` | **1.44:1** | fails (needs 4.5:1) |
| `.description-links` | `front/src/styles/AboutMe.css:33` (`color: var(--link-color)`) | `var(--link-color)` → `rgb(63,206,212)` composited | `#f9f9f9` | **1.81:1** | fails (needs 4.5:1) |
| `.project-button` | `front/src/styles/shared.css:69-76` (`.btn-outline`, shared with the contact-form submit button since Task 9) | `var(--link-color)` | `var(--projects-bg-color)` = white | **1.88:1** | fails (24 px text/border, needs 3:1) |
| `.filters button .text-layer.hover` | `front/src/styles/MyWork.css:60` | white | `var(--link-color)` over `#f9f9f9` | **1.90:1** | fails (needs 4.5:1) |
| `.social-link:hover` | `front/src/styles/Footer.css:73` (`color: var(--accent)`, `front/src/styles/tokens.css:43`) | `hsla(182,96%,40%,0.76)` | `#343a40` | **3.64:1** | passes as a non-text icon (3:1), fails as text |
| `.home-tagline` | `front/src/styles/Home.css:48` (`color: var(--on-dark)`, `front/src/styles/tokens.css:47`) | `rgba(255,255,255,0.4)` → `rgb(102,102,102)` composited | `#000` (the CodeRain backdrop) | **3.66:1** | fails (19.2 px normal weight, needs 4.5:1) |
| `--link-color`, dark theme | `front/src/styles/tokens.css:31` | `hsla(182,96%,70%,0.8)` | `#4e565f` | **4.35:1** | fails (needs 4.5:1) |

For reference, the two checked that pass comfortably: `--text-color`
`#343a40` on `#f9f9f9` is 10.93:1, and `#dfdbdb` on `#4e565f` (the dark-theme
body text) is 5.42:1. Body text is fine; the accent is not.

## Decision

The palette is not changed in this cycle. Every failure above is a property
of the brand accent, `hsl(182, 96%, 40%)` = `rgb(4, 193, 200)`
(`front/src/components/CodeRain.js:126` uses the same hue as `rgba(4, 193,
200, ...)`), which measures roughly 2.11:1 against the light page background
(`#f9f9f9`) and 2.22:1 against a white card — too low a starting point for
any of its translucent uses above to clear 4.5:1 no matter how the alpha is
adjusted. Fixing every row above means choosing a new accent colour, which
is a visual redesign and is out of scope per estate spec §7 ("visual
redesign" is explicitly listed as out of scope).

## Consequences

Task 8 fixes only the *structural* accessibility defects (see
`docs/decisions/0004-deferred-findings.md`); at the time this ADR was
drafted there were zero `:focus` / `:focus-visible` rules anywhere under
`front/src`. The focus ring Task 10 went on to add
(`front/src/styles/shared.css:96-100`, a two-colour ring — white inset,
black outset, so it contrasts against both the light page and the black
`CodeRain` backdrop) deliberately does **not** use the accent colour, for
exactly the reason recorded above: the accent fails contrast in every
context it currently appears in, so building a new accessibility affordance
out of the same colour would ship it already non-compliant. This must not be
"tidied" into `var(--link-color)` later — that would silently reintroduce
the same failure in the one place this project added contrast-aware color on
purpose.
