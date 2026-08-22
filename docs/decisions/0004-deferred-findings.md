# 0004 — Deferred findings

## Status

Living document — appended to by Tasks 4, 6, 8, 9, 10, 11 and 13.

## Purpose

Findings from the Phase A survey that are real, verified against the current
source, and will not be fixed in this cycle — either because fixing them is
a visible/behavioural change the estate spec puts out of scope, or because a
later task in this same plan already owns the fix and this entry exists so
the finding isn't lost between now and then.

## Findings

- **The staggered project animation is already dead.**
  `front/src/styles/MyWork.css:111-124` sets `transition-delay` on
  `.project:nth-child(1)` through `.project:nth-child(4)` (0s, 0.1s, 0.2s,
  0.3s), but `.project` at line 126 then sets the `transition` shorthand,
  which resets `transition-delay` back to its default (`0s`) because the
  shorthand always sets every sub-property it doesn't mention. The four
  cards therefore animate together today, not staggered. Restoring the
  stagger is a visible change and is out of scope for this cycle.

- **`font-family: "Ubuntu"` names a font that is never loaded.**
  `front/src/App.css:8` sets it on `body` with no fallback stack, and there
  is no `@font-face` rule and no web-font `<link>` in
  `front/public/index.html` (confirmed: no `@font-face`, no
  `fonts.googleapis.com` reference, no matching `<link>`). Visitors without
  Ubuntu installed locally get the browser default font. Task 9 deleted
  `front/src/index.css` (its two font-smoothing declarations moved into
  `App.css:15-16`; its system font-stack fallback
  `-apple-system, BlinkMacSystemFont, 'Segoe UI', ...` was **not** carried
  over — it is simply gone, not shadowed). Adding a fallback stack to the
  `Ubuntu` declaration would change the rendered typeface on most visitors'
  machines (from the OS default they get today to whatever the fallback
  stack resolves to), so it is not done here.

- **The empty-filter state is unreachable.** Every one of the ten filters
  defined at `front/src/data/projects.js:52-63` (`All` plus nine tech tags)
  matches at least one of the four projects, so `filteredProjects.length ===
  0` never happens and `.no-projects` never renders
  (`front/src/components/MyWork.js:119-121`). Task 6 already fixed the
  translation key behind it (`MyWork.js:120` now reads
  `translate("myWorkNoProjects")`, matching the plural key every dictionary
  in `front/src/assets/translations.js` defines), but the fixed string still
  cannot be triggered by any filter combination in the current project list.

- **`<footer>` is not a `contentinfo` landmark.** `front/src/components/Contact.js:102`
  renders `<Footer />` inside `<section id="contact">` rather than as a
  direct child of `<body>`, so assistive tech does not expose it as the
  page's `contentinfo` landmark. Hoisting it out would break
  `front/src/styles/Footer.css`'s `.footer { margin-top: auto; }`, which
  depends on being a flex child of `.contact` to push itself to the bottom
  of that section. This is a layout change and is out of scope.

- **Four `<h1>` elements on one page**: `front/src/components/Home.js:54`,
  `front/src/components/AboutMe.js:55`, `front/src/components/MyWork.js:76`,
  `front/src/components/Contact.js:48`. Task 8 fixes the first one's missing
  accessible name but does not demote the other three to `<h2>`, because
  none of the four carry an explicit `font-size` in their stylesheets —
  their size comes from the browser's default `<h1>` sizing — and demoting
  the tag changes the rendered size along with the semantics.

- **No Content-Security-Policy is set by this repository.** Response
  headers come from Traefik's `security-headers@file` middleware
  (`docker-compose.yml`, in the same middlewares list as
  `gzip-compress@file`), which is shared estate infrastructure defined
  outside this repository. Per the estate spec, shared Traefik
  configuration is only touched during the retirement cycle (estate spec
  §6), not during an individual project's refactor.

> Three defects were flagged here during Phase B characterization
> (`CodeRain`'s `cancelAnimationFrame(animate)` passing a callback instead of
> the captured frame id; `MyWork`'s translation key mismatch,
> `myWorkNoProjects` vs. the dictionaries' `myWorkNoProject`; and
> `reportWebVitals.js`'s five web-vitals 2.x `get*` imports resolving to
> `undefined` against the installed v4 package) as findings for later tasks
> to act on. All three are now fixed — Task 6 fixed the first two
> (`CodeRain.js`'s effect now captures `frameId` and cancels that; the
> translation key now matches in all three dictionaries) and Task 11 fixed
> the third (`reportWebVitals.js` now imports the v4 `on*` names, `onINP` in
> place of the retired `getFID`). None of the three belong in this document
> any more; see the Task 13 handover report for the test covering each.

- **A filter button's doubled `.text-layer` no longer doubles its accessible
  name — Task 8 already fixed this.** `front/src/components/MyWork.js:88-89`
  still renders each filter label twice, in a `.text-layer.default` and a
  `.text-layer.hover` sibling `<div>` inside the `<button>`, but the hover
  copy now carries `aria-hidden="true"`, so it drops out of the
  accessible-name computation entirely: the name is just `"Angular"` (or
  `"All"`), not `"Angular Angular"`. Phase B's characterization tests
  (`front/src/components/MyWork.test.js`) were originally written against
  the pre-fix, space-separated names (`dom-accessibility-api` inserts a
  space between text drawn from separate block-level elements — verified
  against jsdom, not assumed), and were updated to the single-copy names
  once Task 8 landed; `getByRole("button", { name: "Angular" })` is what the
  suite asserts today.

- **`CodeRain` re-renders up to twenty nodes on every `mousemove`.**
  `front/src/components/CodeRain.js` also attaches `mousemove` and `mouseout`
  listeners on `window` and calls `setMousePos` on every mouse move,
  re-rendering up to twenty absolutely positioned nodes per event. It is
  cleaned up correctly, so it is not a leak, but it is the most expensive
  thing on the page. Throttling it is a performance change, and performance
  tuning is out of scope for this cycle (estate spec §7).

- **`front/public/manifest.json`'s `theme_color` and `front/public/index.html`'s
  `<meta name="theme-color">` are coupled and must stay in agreement.** Task
  11 changed only `manifest.json`'s `short_name` and `name` (the CRA
  boilerplate labels an installed home-screen icon would show); its
  `theme_color` (`#000000`) was left untouched because `index.html:7`
  declares the identical value in its `<meta name="theme-color">` tag, and
  editing one without the other would make them disagree.

- **The brand accent fails WCAG AA in every context it is used in.** The
  accent, `hsl(182, 96%, 40%)`, measures roughly 2.11:1 against the light
  page background on its own, and every translucent use built from it fails
  4.5:1 (or 3:1 for large text/borders) in turn: `.home-btn` **1.44:1**,
  `.description-links` **1.81:1**, `.project-button` **1.88:1**, the active
  filter button's hover text-layer **1.90:1**, the dark-theme `--link-color`
  **4.35:1**. Fixing this means choosing a new accent colour — a visual
  redesign, out of scope per estate spec §7. See
  `docs/decisions/0003-colour-contrast.md` for the full seven-row
  measurement table and the two rules (body text, the focus ring) that were
  deliberately built to avoid the accent for this reason.

- **`--accent`, `--accent-strong` and `--accent-faint` deliberately do not
  switch with the theme, while `--link-color` does.** That is what the code
  did before this cycle: `Footer.css` and `Home.css` hard-coded the
  light-theme accent, so the footer's social-icon hover and the home buttons
  keep `hsl(182, 96%, 40%)` even in dark mode, while everything using
  `--link-color` moves to `hsl(182, 96%, 70%)`. Unifying them is a visible
  change to the dark theme and belongs with the palette decision recorded in
  ADR `0003`.

- **The `testing-library/no-container`/`no-node-access` override in
  `front/.eslintrc.json` is scoped by a glob that also exempts future test
  files.** Task 12 disabled `testing-library/no-container` and
  `testing-library/no-node-access` for `**/*.test.js` to unblock the new
  `npm run lint` CI gate against 83 pre-existing violations in the six
  characterization test files that predate this rule ever being enforced
  (see the commit body of `c424189`). The glob is file-shaped, not
  site-shaped: any test file added later inherits the exemption even if it
  never needed it. Worth narrowing (e.g. to the specific files, or converting
  the override to targeted `eslint-disable-next-line` comments) whenever new
  test files start landing, so the exemption doesn't quietly widen its own
  scope over time.

- **Six of the 83 suppressed `testing-library` sites are role-queryable and
  could be converted opportunistically.** Most of the 83 assert DOM
  structure, order, or CSS-attribute-selected fields with no faithful
  Testing-Library-query equivalent (e.g. the Web3Forms honeypot's
  `display:none` field is deliberately unreachable by any role query — that
  is the behaviour under test). A minority, however, query elements
  (buttons/links/etc.) that do have an accessible role and could be
  rewritten with `getByRole`/`within` without changing what's asserted.
  Left as `container`/DOM access for now rather than partially rewritten
  inside the CI-gate commit, since converting only some sites while leaving
  the override in place for the rest would produce a mixed, harder-to-audit
  diff for no immediate benefit; a future pass through the six can tighten
  the tests without touching the rule scope.
