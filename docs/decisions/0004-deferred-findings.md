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
  `front/src/styles/MyWork.css:131-144` sets `transition-delay` on
  `.project:nth-child(1)` through `.project:nth-child(4)` (0s, 0.1s, 0.2s,
  0.3s), but `.project` at line 146 then sets the `transition` shorthand,
  which resets `transition-delay` back to its default (`0s`) because the
  shorthand always sets every sub-property it doesn't mention. The four
  cards therefore animate together today, not staggered. Restoring the
  stagger is a visible change and is out of scope for this cycle.

- **`font-family: "Ubuntu"` names a font that is never loaded.**
  `front/src/App.css:33` sets it on `body` with no fallback stack, and there
  is no `@font-face` rule and no web-font `<link>` in
  `front/public/index.html` (confirmed: no `@font-face`, no
  `fonts.googleapis.com` reference, no matching `<link>`). Visitors without
  Ubuntu installed locally get the browser default font. This also makes
  `front/src/index.css:3`'s system font stack
  (`-apple-system, BlinkMacSystemFont, 'Segoe UI', ...`) dead code in
  practice: it's defined on `body` too, but `App.css` is imported after
  `index.css` and its `font-family: "Ubuntu"` declaration wins. Adding a
  fallback stack to the `Ubuntu` declaration would change the rendered
  typeface on most visitors' machines (from the OS default they get today to
  whatever the fallback stack resolves to), so it is not done here.

- **The empty-filter state is unreachable.** Every one of the ten filters
  defined at `front/src/components/MyWork.js:52` (`All` plus nine tech tags)
  matches at least one of the four projects, so `filteredProjects.length ===
  0` never happens and `.no-projects` never renders. Task 6 still fixes the
  broken translation key behind it — `MyWork.js:161` reads
  `translate("myWorkNoProjects")` (plural) while every dictionary in
  `front/src/assets/translations.js` defines the key as `myWorkNoProject`
  (singular, e.g. line 15 for `en`) — even though the fixed string cannot
  currently be triggered by any filter combination in the current project
  list.

- **`<footer>` is not a `contentinfo` landmark.** `front/src/components/Contact.js:83`
  renders `<Footer />` inside `<section id="contact">` rather than as a
  direct child of `<body>`, so assistive tech does not expose it as the
  page's `contentinfo` landmark. Hoisting it out would break
  `front/src/styles/Footer.css`'s `.footer { margin-top: auto; }`, which
  depends on being a flex child of `.contact` to push itself to the bottom
  of that section. This is a layout change and is out of scope.

- **Four `<h1>` elements on one page**: `front/src/components/Home.js:53`,
  `front/src/components/AboutMe.js:66`, `front/src/components/MyWork.js:119`,
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

- **Three defects present in the current code, to be fixed by later tasks**
  in this plan (recorded here as findings, not yet acted on):
  - `front/src/components/CodeRain.js:157` calls
    `cancelAnimationFrame(animate)`, passing the callback function where the
    frame id returned by `requestAnimationFrame` belongs. Because the id was
    never captured, this cancel call has no effect, and the animation loop
    (`requestAnimationFrame(animate)` calling itself on every frame) keeps
    running after the component unmounts.
  - `front/src/components/MyWork.js:161` reads translation key
    `myWorkNoProjects`, while `front/src/assets/translations.js` defines
    `myWorkNoProject` (singular) in all three dictionaries. `translate`'s
    key-fallback means the mismatch currently renders the literal string
    `myWorkNoProjects` if this state is ever reached — see the unreachable
    empty-filter finding above for why it hasn't been observed live.
  - `front/src/reportWebVitals.js:3-8` imports the web-vitals 2.x API
    (`getCLS`, `getFID`, `getFCP`, `getLCP`, `getTTFB`) against
    `web-vitals@^4.2.4` (`front/package.json`). None of those five names
    exist in the installed package: `node_modules/web-vitals/dist/modules/index.d.ts`
    exports only `onCLS`, `onFCP`, `onINP`, `onLCP`, `onTTFB` — `onCLS`,
    `onFCP`, `onLCP` and `onTTFB` are the renamed equivalents (the `get*` →
    `on*` rename landed in v3), and `onINP` has no `get*`-era counterpart at
    all, because FID was retired and replaced by INP as a Core Web Vital,
    not renamed. The five named imports in `reportWebVitals.js` all resolve
    to `undefined` at runtime against v4, so none of the five metrics are
    ever actually reported — the `reportWebVitals()` call in
    `front/src/index.js:21` silently does nothing.

- **A filter button's doubled accessible name has a space in it, not a bare
  concatenation.** `front/src/components/MyWork.js:132-133` renders each
  filter label twice, in a `.text-layer.default` and a `.text-layer.hover`
  sibling `<div>` inside the `<button>`. Task 4's brief assumed the resulting
  accessible name would be the label glued to itself (e.g. `"AngularAngular"`),
  but the accessible-name computation (via `@testing-library/dom`'s
  `dom-accessibility-api`) inserts a space between text drawn from separate
  block-level elements, so the actual name is `"Angular Angular"` (space
  between the two copies) for every filter button, including `"All All"`.
  `front/src/components/MyWork.test.js` was written against the verified
  space-separated names rather than the brief's assumed bare-concatenation
  form. Task 8, which hides the duplicate `.text-layer` from assistive
  technology, will update these queries regardless of the exact spacing.

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
