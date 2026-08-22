# santoriello.ch Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Document santoriello.ch to the estate standard, pin its current behaviour with React Testing Library tests, fix the defects found during the survey, and remove the duplication in its markup and its eleven stylesheets — without changing the stack and without changing a single rendered pixel except where a change is called out as deliberate.

**Architecture:** One Create React App bundle served by unprivileged nginx behind the shared Traefik edge. There is **no router**: `App.js` renders four `<section>` elements stacked on one page and the navigation is anchor links (`#home`, `#about-me`, `#my-work`, `#contact`). Scroll reveals are driven by an `IntersectionObserver` per section that adds and removes an `.animate` class. Copy for three languages lives in `LanguageContext` + `assets/translations.js`. Work proceeds in four phases — document, characterize, refactor, verify — where the characterization suite is what makes the refactor phase safe.

**Tech Stack:** React 19, `react-scripts` 5.0.1 (Create React App), plain JavaScript, `@fortawesome/react-fontawesome`, Jest + `@testing-library/react` + `@testing-library/jest-dom`, Prettier (introduced here), ESLint via `eslint-config-react-app`, Docker, nginx, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-22-estate-refactor-design.md` (committed by Task 1)

## Global Constraints

- **Stack does not change.** Create React App stays. Do **not** migrate to Vite, do not eject, do not convert to TypeScript. That `react-scripts` is unmaintained is recorded as ADR `0001` and deliberately not acted on. (Spec D1)
- **Documentation file set is fixed and named exactly:** `README.md`, `docs/architecture.md`, `docs/design.md`, `docs/technical.md`, `docs/runbook.md`, `docs/decisions/NNNN-*.md`. No `CLAUDE.md`. (Spec D2)
- **Characterization tests assert current behaviour, never desired behaviour.** Where the current behaviour is ugly — four `<h1>` elements, a filter button whose accessible name is `"AngularAngular"` — the test says so. (Spec D3)
- **Security defects are the sole exception:** they are fixed TDD-style against the corrected behaviour, never pinned. (Spec D8)
- **The formatter sweep is one commit containing formatting only**, and its SHA is appended to `.git-blame-ignore-revs`. It is the last task in Phase C. (Spec D4)
- **Spec D5 has no counterpart here.** It names one security-motivated dependency bump, `axios@0.27` in `workshop`. This project has no dependency with a known advisory to move off; Task 11 removes four *unused* ones, which is hygiene, not a bump. Do not go looking for a version to raise.
- **Spec §5 names "routing configuration in one place" for this project. There is no routing.** `react-router-dom` is declared and imported by nothing; navigation is four anchor links. Task 1 documents that and Task 11 deletes the dependency. Do not introduce a router to satisfy the wording.
- **`.github/workflows/deploy.yml` gates the deploy on `npx react-scripts test --watchAll=false`.** A red or flaky test does not merely annoy — it stops `santoriello.ch`, a live site, from shipping. Never commit a test that depends on timing, on a real network call, or on `IntersectionObserver` actually firing (the stub in `src/setupTests.js` never fires its callback, by design).
- **Only `src/App.test.js` mounts the whole `<App />` tree.** `CodeRain` runs a 300 ms `setInterval` and a `requestAnimationFrame` loop for as long as it is mounted, and Task 6 shows the frame loop is not cancelled on unmount. Every other test file renders one component in isolation so the suite does not accumulate open handles.
- **Jest prints *"Jest did not exit one second after the test run has completed"* on every run, including the single-test suite that exists today and including runs that never mount `CodeRain`.** It is an artefact of this `react-scripts` 5 / Jest 27 setup, the process still exits 0, and the deploy gate is unaffected. Do not chase it, and never add `--forceExit` — that would mask a real open handle later.
- **CSS consolidation must not change rendered output.** Every value moved into a token keeps its literal value in both themes. Where consolidation *would* change a colour, the plan introduces a new token holding the old literal instead, and records the inconsistency in an ADR rather than silently "fixing" it.
- **Colour and typography are not redesigned.** Seven measured contrast failures are recorded in ADR `0003` with their ratios; only the structural accessibility defects (missing landmark, wrong `alt`, `div` used as a button, missing focus indicator, missing `lang`) are fixed, because those have no visual cost. (Spec §7: visual redesign is out of scope.)
- **Branch:** all work happens on `refactor/santoriello-ch`; the executor does **not** merge and does **not** open a pull request. (Spec D6)

---

## File Structure

**Created — documentation**

| File | Responsibility |
|---|---|
| `docs/architecture.md` | Component tree, the anchor-scroll "routing", the reveal mechanism, build and deployment topology |
| `docs/design.md` | What the site is for, the four sections, the three-language content model, the theme model |
| `docs/technical.md` | Build, run, the Web3Forms contact endpoint, CI, formatting tooling |
| `docs/runbook.md` | Logs, redeploy, contact-form incidents, hostname problems |
| `docs/decisions/0001-create-react-app-stays.md` | `react-scripts` 5.0.1 is unmaintained; recorded, not acted on (Spec D1) |
| `docs/decisions/0002-inline-wordmark-svg.md` | Why 1.19 MB of SVG path data lives in the JS bundle and is not shrunk in this cycle |
| `docs/decisions/0003-colour-contrast.md` | Seven measured contrast ratios, and why the palette is not changed here |
| `docs/decisions/0004-deferred-findings.md` | Everything found and deliberately left alone |
| `docs/superpowers/specs/2026-08-22-estate-refactor-design.md` | The estate spec this plan argues from |

**Created — production code**

| File | Responsibility |
|---|---|
| `front/src/components/NameLogo.js` | The wordmark `<svg>`, moved verbatim out of `Home.js`, with an accessible name |
| `front/src/data/projects.js` | `projects` and `projectFilters`, moved out of `MyWork.js` |
| `front/src/data/skills.js` | `skills`, moved out of `AboutMe.js` |
| `front/src/data/codeSnippets.js` | `codeSnippets`, moved out of `CodeRain.js` |
| `front/src/data/languages.js` | `LANGUAGES`, moved out of `LanguageToggle.js` |
| `front/src/styles/tokens.css` | The only place a colour literal or a shared timing appears |
| `front/src/styles/shared.css` | `.section`, `.separator`, `.reveal`, `.btn-outline`, `:focus-visible` |

**Modified — production code**

| File | Change |
|---|---|
| `front/src/App.js` | Wraps the four sections in `<main>`; imports `styles/shared.css` |
| `front/src/index.js` | Imports `styles/tokens.css`; drops the deleted `index.css` |
| `front/src/App.css` | Loses the token blocks and `.separator`; gains the two font-smoothing declarations from `index.css` |
| `front/src/components/Home.js` | 1 197 456 characters down to ~50 lines; renders `<NameLogo />` |
| `front/src/components/AboutMe.js` | Imports `skills`; real `alt` text; `.reveal` / `.section` classes |
| `front/src/components/MyWork.js` | Imports `projects` and `projectFilters`; `aria-hidden` on the duplicate text layer; `.reveal` / `.section` classes |
| `front/src/components/Contact.js` | Web3Forms honeypot; `<textarea>` loses its invalid `type`; `.reveal` / `.section` / `.btn-outline` classes |
| `front/src/components/DropdownMenu.js` | Burger `<div>` becomes a `<button>` with `aria-expanded` and `aria-controls` |
| `front/src/components/LanguageToggle.js` | `LANGUAGES` and `FLAGS` hoisted out of the render; accessible name and `aria-expanded` on the trigger |
| `front/src/components/CodeRain.js` | Imports `codeSnippets`; the `requestAnimationFrame` loop is actually cancelled on unmount |
| `front/src/contexts/LanguageContext.js` | Keeps `<html lang>` in step with the selected language |
| `front/src/assets/translations.js` | `myWorkNoProject` renamed to `myWorkNoProjects`; new `aboutMePhotoAlt` key in all three languages |
| `front/src/reportWebVitals.js` | Uses the web-vitals 4.x API (`onCLS`…) instead of the 2.x API (`getCLS`…) |
| `front/src/styles/*.css` | Duplicated declarations removed, literals replaced by tokens |
| `front/public/manifest.json` | Real name instead of "Create React App Sample" |
| `front/package.json` | Four unused dependencies removed; Prettier added; `eslintConfig` moved out |

**Deleted**

| File | Reason |
|---|---|
| `front/README.md` | Untouched Create React App boilerplate; `README.md` at the repository root is the entry point (Spec D2) |
| `front/src/index.css` | Contributes only two font-smoothing declarations, which move into `App.css`; its `code` rule matches no element in this app |
| `front/src/logo.svg` | Imported by nothing |
| `front/public/images/santoriello.svg` | 1 194 993 bytes, referenced by nothing (the wordmark is inlined in the JS) |
| `front/public/images/sun-solid.svg`, `front/public/images/moon-solid.svg` | Referenced by nothing; `ThemeToggle` inlines its own paths |
| `front/public/images/projects/slides/` | 12 files, 2.4 MB, referenced by nothing |

**Created — tests**

| File | Responsibility |
|---|---|
| `front/src/contexts/LanguageContext.test.js` | Default language, persistence, `translate` fallback |
| `front/src/components/DropdownMenu.test.js` | The four anchor links, the burger toggle |
| `front/src/components/ThemeToggle.test.js` | `data-theme`, `localStorage`, the switch |
| `front/src/components/LanguageToggle.test.js` | Opening the menu, switching language end to end |
| `front/src/components/AboutMe.test.js` | Nine skills, the portrait, the progress-bar levels |
| `front/src/components/MyWork.test.js` | Four cards, filtering, the outbound links |
| `front/src/components/Contact.test.js` | Where the form posts, which fields are required |
| `front/src/components/CodeRain.test.js` | The `requestAnimationFrame` cleanup (Task 6) |

**Created — repository root**

| File | Responsibility |
|---|---|
| `.git-blame-ignore-revs` | Repository root. Lists the formatting sweep commit so `git blame` skips it |
| `front/.prettierrc.json`, `front/.prettierignore`, `front/.eslintrc.json` | Formatting and linting configuration (Spec D4) |

---

## Phase A — Document

### Task 1: Documentation set and ADRs

**Files:**
- Create: `docs/architecture.md`, `docs/design.md`, `docs/technical.md`, `docs/runbook.md`
- Create: `docs/decisions/0001-create-react-app-stays.md`, `docs/decisions/0002-inline-wordmark-svg.md`, `docs/decisions/0003-colour-contrast.md`, `docs/decisions/0004-deferred-findings.md`
- Create: `docs/superpowers/specs/2026-08-22-estate-refactor-design.md`
- Modify: `README.md`
- Delete: `front/README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: `docs/decisions/0004-deferred-findings.md`, appended to by Tasks 6, 8, 9, 10, 11 and 13.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b refactor/santoriello-ch
```

- [ ] **Step 2: Copy the estate spec into the repository**

```bash
mkdir -p docs/superpowers/specs
cp "C:/Users/Maria/AppData/Local/Temp/claude/C--Users-Maria-Desktop-Dev-space-multi/1814e037-1eae-4438-a5b2-96a101fd483d/scratchpad/2026-08-22-estate-refactor-design.md" \
   docs/superpowers/specs/
```

That path is a session scratchpad and is not durable. If the file is gone, the
same document has already been committed to `space-multi` at
`docs/superpowers/specs/2026-08-22-estate-refactor-design.md`; copy it from
there. If neither exists, ask for it rather than guessing — every constraint in
this plan derives from it.

- [ ] **Step 3: Write `docs/architecture.md`**

Required sections, in this order: Overview; Component tree; Navigation; The
reveal mechanism; Theme and language; Build and deployment.

Facts that must appear, all verified during the survey:

- `src/index.js` mounts `<LanguageProvider><App /></LanguageProvider>` inside `React.StrictMode`.
- `src/App.js` renders exactly five children: `DropdownMenu`, `Home`, `AboutMe`, `MyWork`, `Contact`. `Footer` is **not** rendered by `App`; it is rendered by `Contact` (`src/components/Contact.js:83`), inside `<section id="contact">`.
- **There is no router.** `react-router-dom@^7.1.2` is declared in `front/package.json:14` and imported by no file. Navigation is four anchor links in `DropdownMenu` pointing at `#home`, `#about-me`, `#my-work`, `#contact`. `front/nginx.conf` still carries a `try_files … /index.html` fallback, which is harmless and worth keeping for direct hits on a fragment URL.
- Each of `Home`, `AboutMe`, `MyWork`, `Contact` and `DropdownMenu` constructs its own `IntersectionObserver` in a `useEffect` and toggles an `.animate` class on descendants. `DropdownMenu` uses its observer for the opposite purpose — to hide the navbar while `#home` is on screen.
- `ThemeToggle` writes `data-theme="light"|"dark"` onto `document.documentElement` and mirrors it into `localStorage.theme`. Every colour is a CSS custom property switched by that attribute.
- `LanguageContext` holds `language`, `changeLanguage` and `translate`; the three dictionaries live in `src/assets/translations.js`. The selected language is persisted in `localStorage.language`.
- Build: `react-scripts build` in a `node:20-alpine` stage, served from `nginxinc/nginx-unprivileged:1.29-alpine` on port 8080. Traefik matches `Host('santoriello.ch')` and applies `security-headers@file` and `gzip-compress@file`.

- [ ] **Step 4: Write `docs/design.md`**

Required sections: What the site is; The four sections; Content model; Theme
model.

The content model section states that all user-visible copy goes through
`translate(key)` against `src/assets/translations.js`, which holds `en`, `fr`
and `de`; that `translate` falls back to returning the key itself when a key is
missing; and that after Task 6 there are no missing keys.

State that `homeTagLine` is identical in all three dictionaries ("Full-Stack
Developer | Turning Ideas into Reality") — that is intentional, not a missing
translation.

- [ ] **Step 5: Write `docs/technical.md`**

Required sections: Prerequisites; Local development; The contact form; CI/CD;
Formatting; Assets.

The contact form section must record, verbatim, what the survey found:

- The form at `src/components/Contact.js:52` posts `method="POST"` to `https://api.web3forms.com/submit`, a third-party form-relay service. Visitor name, e-mail address and message leave the browser directly to Web3Forms, never to any host under this estate's control.
- The Web3Forms `access_key` is a *public* identifier, not a secret: it selects the destination inbox and is required to be present in the submitted form. It is in the repository at `src/components/Contact.js:60` and it is in every built bundle. Moving it to a `REACT_APP_*` environment variable would **not** hide it — `react-scripts` inlines those into the bundle at build time.
- Rotation is therefore a dashboard action on web3forms.com, not a code change. Domain restriction and captcha are also dashboard settings.

The CI/CD section records that `.github/workflows/deploy.yml` has two jobs, that
`build-and-deploy` has `needs: test`, and that the test job runs
`npx react-scripts test --watchAll=false` with `CI: true` in `front/`.

- [ ] **Step 6: Write `docs/runbook.md`**

Required sections: Where the logs are; Redeploying; The contact form stopped
delivering; Hostname or certificate problems.

The contact-form section must say that the site sends nothing itself: if mail
stops arriving, check the Web3Forms dashboard for the key at
`src/components/Contact.js:60` (quota, blocked domain, spam filtering) before
touching this repository.

The hostname section must record that this project is served at the apex
`santoriello.ch`, and that Traefik answers unmatched hostnames with a default
certificate, which curl reports as exit 60 — a symptom of a missing router, not
of a broken certificate.

- [ ] **Step 7: Write ADR `0001-create-react-app-stays.md`**

Context: `front/package.json:15` pins `react-scripts` 5.0.1. Create React App is
no longer maintained. Every `npm test`, `npm start` and `npm run build` in this
repository already prints the upstream warning that `babel-preset-react-app`
imports `@babel/plugin-proposal-private-property-in-object` without declaring
it, alongside the sentence "which is not maintianed anymore" (upstream's
typo, quote it as-is).

Decision: it stays, for this cycle. Consequences: no dependency updates are
expected to arrive; a future cycle that wants a maintained toolchain migrates to
Vite, and that migration is a project of its own because it touches
`public/index.html`, `%PUBLIC_URL%`, the Jest configuration and the Dockerfile
together.

Also record the one workaround this cycle *does* take: adding
`@babel/plugin-proposal-private-property-in-object` to `devDependencies` is
explicitly **not** done, because it silences a warning without fixing anything
and adds a dependency the app does not use.

- [ ] **Step 8: Write ADR `0002-inline-wordmark-svg.md`**

Context, with the measured numbers:

- `src/components/Home.js` is 100 lines and 1 197 456 characters. Five `d=` attributes account for 1 194 663 of those characters — 99.8 % of the file.
- The three large paths are a Figma "outside stroke" export: two near-identical 28 kB paths (the mask source and the filled glyph) and one 1 138 357-character expanded outline.
- The production bundle `build/static/js/main.*.js` measures 1 464 065 bytes raw, 330.18 kB gzipped. The path data is 81.6 % of the raw bundle.
- An identical asset already exists, unreferenced, at `public/images/santoriello.svg` (1 194 993 bytes).

Decision: Task 7 moves the markup into `src/components/NameLogo.js` unchanged.
The payload is not reduced in this cycle.

Consequences and the reason: `src/styles/Home.css` animates `.svg-path` with
`stroke-dasharray` / `stroke-dashoffset`, which only works on inline SVG — an
`<img>` cannot be styled from the containing document. Shrinking the payload
means re-exporting the wordmark as a real stroked path instead of an expanded
outline, which is a design-asset change with a visible result, and this cycle
must not change rendered output. Record the target: a stroked re-export should
land under 20 kB.

- [ ] **Step 9: Write ADR `0003-colour-contrast.md`**

Record the seven measured ratios exactly as the survey found them. Each is
computed from the composited colour, taking the alpha channel and the backdrop
into account.

| Selector | File:line | Foreground | Backdrop | Ratio | WCAG AA |
|---|---|---|---|---|---|
| `.home-btn` | `src/styles/Home.css:70` | `hsla(182,96%,40%,0.2)` → `rgb(21,59,60)` | `rgb(26,26,26)` | **1.44:1** | fails (needs 4.5:1) |
| `.description-links` | `src/styles/AboutMe.css:56` | `var(--link-color)` → `rgb(63,206,212)` | `#f9f9f9` | **1.81:1** | fails (needs 4.5:1) |
| `.project-button` | `src/styles/MyWork.css:207` | `var(--link-color)` | `var(--projects-bg-color)` = white | **1.88:1** | fails (24 px, needs 3:1) |
| `.filters button .text-layer.hover` | `src/styles/MyWork.css:80` | white | `var(--link-color)` over `#f9f9f9` | **1.90:1** | fails (needs 4.5:1) |
| `.social-link:hover` | `src/styles/Footer.css:73` | `hsla(182,96%,40%,0.76)` | `#343a40` | **3.64:1** | passes as a non-text icon (3:1), fails as text |
| `.home-tagline` | `src/styles/Home.css:48` | `rgba(255,255,255,0.4)` → `rgb(102,102,102)` | `#000` (the CodeRain backdrop) | **3.66:1** | fails (19.2 px normal, needs 4.5:1) |
| `--link-color`, dark theme | `src/App.css:22` | `hsla(182,96%,70%,0.8)` | `#4e565f` | **4.35:1** | fails (needs 4.5:1) |

For reference, the two that pass comfortably: `--text-color` `#343a40` on
`#f9f9f9` is 10.93:1, and `#dfdbdb` on `#4e565f` is 5.42:1. The body text is
fine; the accent is not.

Decision: the palette is not changed in this cycle. Every failure above is a
property of the brand accent `hsl(182, 96%, 40%)` = `rgb(4, 193, 200)`, which
measures 2.11:1 against the light page background and 2.22:1 against a white
card. Fixing them means choosing a new accent, which is a visual redesign and is
out of scope per estate spec §7.

Consequences: Task 8 fixes only the structural accessibility defects. The focus
ring it introduces deliberately does **not** use the accent, for exactly this
reason — the ADR must say so, so nobody "tidies" it into `var(--link-color)`
later.

- [ ] **Step 10: Start ADR `0004-deferred-findings.md`**

Seed it with the findings that are already known and will not be fixed. Later
tasks append to it.

- **The staggered project animation is already dead.** `src/styles/MyWork.css:131-145` sets `transition-delay` on `.project:nth-child(1..4)`, but `.project` at line 146 then sets the `transition` shorthand, which resets `transition-delay` to `0s`. The four cards therefore animate together today. Restoring the stagger is a visible change and is out of scope.
- **`font-family: "Ubuntu"` names a font that is never loaded.** `src/App.css:33` sets it with no fallback and there is no `@font-face` and no web-font `<link>` in `public/index.html`. Visitors without Ubuntu installed get the browser default font, and `src/index.css`'s carefully chosen system stack is dead because `App.css` overrides it. Adding a fallback stack would change the rendered typeface on most machines, so it is not done here.
- **The empty-filter state is unreachable.** Every one of the ten filters in `src/components/MyWork.js:52` matches at least one project, so `.no-projects` never renders. Task 6 still fixes the broken translation key behind it.
- **`<footer>` is not a `contentinfo` landmark**, because `src/components/Contact.js:83` renders it inside `<section id="contact">` rather than as a direct child of `<body>`. Hoisting it would break `.footer { margin-top: auto }`, which depends on the flex context of `.contact`. Layout change, out of scope.
- **Four `<h1>` elements on one page** (`Home.js:53`, `AboutMe.js:66`, `MyWork.js:119`, `Contact.js:48`). Task 8 fixes the first one's missing accessible name but does not demote the other three, because they carry no explicit `font-size` and demoting them changes their rendered size.
- **No Content-Security-Policy is set by this repository.** Response headers come from Traefik's `security-headers@file` middleware, which is shared estate infrastructure and is only touched in the retirement cycle (estate spec §6).

- [ ] **Step 11: Rewrite `README.md` as an entry point**

Keep the existing CI badge and the live URL. State in two sentences what the
site is. Give the shortest path to running it (`cd front && npm ci && npm
start`). Then link to each of the four `docs/` files and to `docs/decisions/`.
Move the deployment and nginx-port detail currently in the README into
`docs/technical.md` and `docs/architecture.md`; the README links to them instead
of repeating them.

- [ ] **Step 12: Delete the Create React App boilerplate README**

```bash
git rm front/README.md
```

Its content is the stock "Getting Started with Create React App" page. Nothing
links to it.

- [ ] **Step 13: Verify no production code changed**

```bash
git status --porcelain
```

Expected: only files under `docs/`, plus `README.md` and the deleted
`front/README.md`. If anything under `front/src`, `front/public` or
`front/package.json` appears, revert it — this phase changes no code.

- [ ] **Step 14: Commit**

```bash
git add docs README.md
git commit -m "docs: document architecture, design, technical detail and runbook"
```

---

## Phase B — Characterize

Today the suite is one test. It has to become a net that catches the class-name
edits, the data extractions and the CSS consolidation in Phase C.

Two facts about the harness, both already handled by `src/setupTests.js` and
neither to be changed: `IntersectionObserver` is stubbed with a no-op class, so
no `.animate` class is ever added during a test; and `window.matchMedia` always
reports `matches: false`, so `ThemeToggle` always starts in light mode.

### Task 2: Characterize the page shell and the language context

**Files:**
- Modify: `front/src/App.test.js`
- Create: `front/src/contexts/LanguageContext.test.js`
- Test: both files above

**Interfaces:**
- Consumes: `LanguageProvider` from `src/contexts/LanguageContext`.
- Produces: the `renderWithLanguage` helper pattern, repeated (not shared) in Tasks 3 and 4 so each test file stands alone.

- [ ] **Step 1: Replace `front/src/App.test.js`**

```jsx
import { render, screen } from "@testing-library/react";
import App from "./App";
import { LanguageProvider } from "./contexts/LanguageContext";

// App's components all read LanguageContext via useContext, and the context has
// no default value (createContext() with no argument), so a bare render(<App />)
// throws. The real entry point (src/index.js) wraps App in LanguageProvider; do
// the same here.
//
// This is the only test file that mounts the whole tree. CodeRain runs a 300 ms
// setInterval and a requestAnimationFrame loop while mounted, so every other
// test file renders a single component in isolation.
const renderApp = () =>
  render(
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );

beforeEach(() => {
  localStorage.clear();
});

test("the app renders without crashing", () => {
  const { container } = renderApp();
  expect(container).not.toBeEmptyDOMElement();
});

test("the four sections are on the page, in order, with the ids the nav links to", () => {
  const { container } = renderApp();
  const ids = [...container.querySelectorAll("section")].map((s) => s.id);
  expect(ids).toEqual(["home", "about-me", "my-work", "contact"]);
});

test("the footer is rendered inside the contact section", () => {
  const { container } = renderApp();
  const contact = container.querySelector("#contact");
  expect(contact.querySelector("#footer")).not.toBeNull();
});

test("there is exactly one navigation landmark", () => {
  renderApp();
  expect(screen.getByRole("navigation")).toBeInTheDocument();
});

// Characterization, not endorsement: the page has four h1 elements and no main
// landmark today. Task 8 adds <main>; it deliberately leaves the four h1
// elements alone, and this assertion is updated there.
test("the page has four h1 elements and no main landmark", () => {
  const { container } = renderApp();
  expect(container.querySelectorAll("h1")).toHaveLength(4);
  expect(container.querySelector("main")).toBeNull();
});
```

- [ ] **Step 2: Create `front/src/contexts/LanguageContext.test.js`**

```jsx
import { useContext } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageContext, LanguageProvider } from "./LanguageContext";

// A minimal consumer, so the context is tested through its public surface
// rather than through a page component.
function Probe() {
  const { language, changeLanguage, translate } = useContext(LanguageContext);
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="about">{translate("aboutMe")}</span>
      <span data-testid="missing">{translate("noSuchKeyExists")}</span>
      <button onClick={() => changeLanguage("de")}>to german</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>
  );

beforeEach(() => {
  localStorage.clear();
});

test("defaults to english when nothing is stored", () => {
  renderProbe();
  expect(screen.getByTestId("language")).toHaveTextContent("en");
  expect(screen.getByTestId("about")).toHaveTextContent("About Me");
});

test("reads the language stored by a previous visit", () => {
  localStorage.setItem("language", "fr");
  renderProbe();
  expect(screen.getByTestId("language")).toHaveTextContent("fr");
  expect(screen.getByTestId("about")).toHaveTextContent("A propos");
});

test("changing the language persists it", () => {
  renderProbe();
  fireEvent.click(screen.getByText("to german"));
  expect(screen.getByTestId("language")).toHaveTextContent("de");
  expect(screen.getByTestId("about")).toHaveTextContent("Über mich");
  expect(localStorage.getItem("language")).toBe("de");
});

test("translate returns the key itself when no translation exists", () => {
  renderProbe();
  expect(screen.getByTestId("missing")).toHaveTextContent("noSuchKeyExists");
});
```

- [ ] **Step 3: Run the suite**

```bash
cd front && CI=true npx react-scripts test --watchAll=false
```

Expected: 2 suites, 9 tests, all passing. These characterize existing behaviour,
so passing on the first run is the correct outcome.

Jest will print *"Jest did not exit one second after the test run has
completed"*. It printed that before this task too, on the one-test suite, and it
prints it on suites that never mount `CodeRain`. It is an artefact of this
toolchain, the process exits 0, and it is not something to fix. Do not add
`--forceExit`.

- [ ] **Step 4: Commit**

```bash
git add front/src/App.test.js front/src/contexts/LanguageContext.test.js
git commit -m "test: characterize the page shell and the language context"
```

### Task 3: Characterize navigation and the two toggles

**Files:**
- Create: `front/src/components/DropdownMenu.test.js`
- Create: `front/src/components/ThemeToggle.test.js`
- Create: `front/src/components/LanguageToggle.test.js`
- Test: the three files above

**Interfaces:**
- Consumes: `LanguageProvider`.
- Produces: the assertions Task 8 must keep green while changing the burger from a `<div>` to a `<button>`.

- [ ] **Step 1: Create `front/src/components/DropdownMenu.test.js`**

```jsx
import { render, screen, within, fireEvent } from "@testing-library/react";
import DropdownMenu from "./DropdownMenu";
import { LanguageProvider } from "../contexts/LanguageContext";

const renderMenu = () =>
  render(
    <LanguageProvider>
      <DropdownMenu />
    </LanguageProvider>
  );

beforeEach(() => {
  localStorage.clear();
});

test("the navigation links to the four section ids", () => {
  renderMenu();
  const nav = screen.getByRole("navigation");
  const hrefs = within(nav)
    .getAllByRole("link")
    .map((a) => a.getAttribute("href"));
  expect(hrefs).toEqual(["#home", "#about-me", "#my-work", "#contact"]);
});

// The IntersectionObserver stub in setupTests.js never fires, so isVisible stays
// false and the navbar keeps its "hidden" class for the whole test. That is the
// component's initial state, and pinning it catches an accidental inversion of
// the condition.
test("the navbar starts hidden", () => {
  const { container } = renderMenu();
  expect(container.querySelector(".navbar").className).toBe("navbar hidden");
});

test("the burger opens and closes the link list", () => {
  const { container } = renderMenu();
  const burger = container.querySelector(".toggle-burger");
  expect(container.querySelector(".dropdown-links").className).toBe(
    "dropdown-links"
  );

  fireEvent.click(burger);
  expect(container.querySelector(".dropdown-links").className).toBe(
    "dropdown-links open"
  );

  fireEvent.click(burger);
  expect(container.querySelector(".dropdown-links").className).toBe(
    "dropdown-links"
  );
});

test("clicking a link closes the open menu", () => {
  const { container } = renderMenu();
  fireEvent.click(container.querySelector(".toggle-burger"));
  fireEvent.click(screen.getByRole("link", { name: "Home" }));
  expect(container.querySelector(".dropdown-links").className).toBe(
    "dropdown-links"
  );
});

// Characterization, not endorsement: the burger is a <div> with an onClick
// today, so it is not focusable and exposes no role. Task 8 makes it a <button>
// and updates this test.
test("the burger is a div, not a button", () => {
  const { container } = renderMenu();
  expect(container.querySelector(".toggle-burger").tagName).toBe("DIV");
  expect(screen.queryAllByRole("button")).toHaveLength(1); // only the language trigger
});
```

- [ ] **Step 2: Create `front/src/components/ThemeToggle.test.js`**

```jsx
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggle from "./ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// setupTests.js stubs matchMedia to always report matches: false, i.e. the OS
// expresses no dark-mode preference, so a fresh visitor lands in light mode.
test("a fresh visitor gets the light theme, and it is written down", () => {
  render(<ThemeToggle />);
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  expect(localStorage.getItem("theme")).toBe("light");
  expect(screen.getByRole("switch")).not.toBeChecked();
});

test("a stored dark preference is restored", () => {
  localStorage.setItem("theme", "dark");
  render(<ThemeToggle />);
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  expect(screen.getByRole("switch")).toBeChecked();
});

test("clicking the switch flips the theme and persists it", () => {
  render(<ThemeToggle />);
  fireEvent.click(screen.getByRole("switch"));
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  expect(localStorage.getItem("theme")).toBe("dark");

  fireEvent.click(screen.getByRole("switch"));
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  expect(localStorage.getItem("theme")).toBe("light");
});

test("the switch has an accessible name", () => {
  render(<ThemeToggle />);
  expect(screen.getByRole("switch")).toHaveAccessibleName("dark mode toggle");
});
```

- [ ] **Step 3: Create `front/src/components/LanguageToggle.test.js`**

```jsx
import { render, screen, fireEvent } from "@testing-library/react";
import LanguageToggle from "./LanguageToggle";
import AboutMe from "./AboutMe";
import { LanguageProvider } from "../contexts/LanguageContext";

beforeEach(() => {
  localStorage.clear();
});

test("the menu is closed until the trigger is clicked", () => {
  const { container } = render(
    <LanguageProvider>
      <LanguageToggle />
    </LanguageProvider>
  );
  expect(container.querySelector(".lang-menu")).toBeNull();

  fireEvent.click(container.querySelector(".lang-current"));
  expect(screen.getByText("English")).toBeInTheDocument();
  expect(screen.getByText("Français")).toBeInTheDocument();
  expect(screen.getByText("Deutsch")).toBeInTheDocument();
});

// Characterization, not endorsement: the trigger's only content is a flag SVG
// and a "▾" glyph, so its accessible name is "▾". Task 8 gives it a real name
// and updates this assertion.
test("the trigger's accessible name is the chevron glyph", () => {
  const { container } = render(
    <LanguageProvider>
      <LanguageToggle />
    </LanguageProvider>
  );
  expect(container.querySelector(".lang-current").textContent).toBe("▾");
});

test("choosing a language re-renders the page copy and persists the choice", () => {
  const { container } = render(
    <LanguageProvider>
      <div>
        <LanguageToggle />
        <AboutMe />
      </div>
    </LanguageProvider>
  );

  expect(container.querySelector(".about-me-title").textContent).toBe(
    "< About >"
  );

  fireEvent.click(container.querySelector(".lang-current"));
  fireEvent.click(screen.getByText("Français"));

  expect(container.querySelector(".about-me-title").textContent).toBe(
    "< A propos >"
  );
  expect(localStorage.getItem("language")).toBe("fr");
});
```

- [ ] **Step 4: Run the suite**

```bash
cd front && CI=true npx react-scripts test --watchAll=false
```

Expected: 5 suites, 21 tests, all passing.

If `the burger is a div, not a button` fails because there are two buttons, read
`DropdownMenu.js` — the language trigger is the only `<button>` in that subtree
today. Correct the count to what you observe; this is a characterization test.

- [ ] **Step 5: Commit**

```bash
git add front/src/components/DropdownMenu.test.js \
        front/src/components/ThemeToggle.test.js \
        front/src/components/LanguageToggle.test.js
git commit -m "test: characterize navigation and the theme and language toggles"
```

### Task 4: Characterize the three content sections

**Files:**
- Create: `front/src/components/AboutMe.test.js`
- Create: `front/src/components/MyWork.test.js`
- Create: `front/src/components/Contact.test.js`
- Test: the three files above

**Interfaces:**
- Consumes: `LanguageProvider`.
- Produces: the assertions that prove Task 7's data extraction changed nothing, and the `alt`-text assertion Task 8 inverts.

- [ ] **Step 1: Create `front/src/components/AboutMe.test.js`**

```jsx
import { render } from "@testing-library/react";
import AboutMe from "./AboutMe";
import { LanguageProvider } from "../contexts/LanguageContext";

const renderAboutMe = () =>
  render(
    <LanguageProvider>
      <AboutMe />
    </LanguageProvider>
  );

beforeEach(() => {
  localStorage.clear();
});

test("all nine skills render, in order, with their levels", () => {
  const { container } = renderAboutMe();
  const names = [...container.querySelectorAll(".skill span")].map(
    (s) => s.textContent
  );
  expect(names).toEqual([
    "HTML/CSS",
    "JavaScript/Typescript",
    "React/Svelte",
    "Angular",
    "Django/SpringBoot",
    "Python, Java",
    "PHP",
    "MySQL/PostgreSQL",
    "NGINX/Docker/GIT",
  ]);

  const levels = [...container.querySelectorAll(".progress-bar-fill")].map((d) =>
    d.style.getPropertyValue("--level")
  );
  expect(levels).toEqual([
    "90%",
    "85%",
    "75%",
    "65%",
    "70%",
    "85%",
    "75%",
    "75%",
    "65%",
  ]);
});

test("the portrait points at the public image", () => {
  const { container } = renderAboutMe();
  expect(container.querySelector("img")).toHaveAttribute(
    "src",
    "/images/me.png"
  );
});

// Characterization, not endorsement: the alt text is the Create React App
// placeholder "Your Name". Task 8 replaces it and updates this test.
test("the portrait's alt text is still the placeholder", () => {
  const { container } = renderAboutMe();
  expect(container.querySelector("img")).toHaveAttribute("alt", "Your Name");
});

test("the army link points at the public STAT page", () => {
  const { container } = renderAboutMe();
  const link = container.querySelector(".description-links");
  expect(link).toHaveAttribute(
    "href",
    "https://www.defense.gouv.fr/terre/section-technique-larmee-terre-stat"
  );
});
```

- [ ] **Step 2: Create `front/src/components/MyWork.test.js`**

```jsx
import { render, screen, fireEvent } from "@testing-library/react";
import MyWork from "./MyWork";
import { LanguageProvider } from "../contexts/LanguageContext";

const renderMyWork = () =>
  render(
    <LanguageProvider>
      <MyWork />
    </LanguageProvider>
  );

const cardNames = (container) =>
  [...container.querySelectorAll(".project-description h3")].map(
    (h) => h.textContent
  );

beforeEach(() => {
  localStorage.clear();
});

test("four projects render by default, in order", () => {
  const { container } = renderMyWork();
  expect(cardNames(container)).toEqual([
    "La Ferme",
    "Workshop",
    "S.I.R",
    "Space Invader",
  ]);
});

test("the ten filter buttons are offered, in order", () => {
  const { container } = renderMyWork();
  const labels = [...container.querySelectorAll(".filter-button .default")].map(
    (d) => d.textContent
  );
  expect(labels).toEqual([
    "All",
    "React",
    "Angular",
    "Python",
    "Django",
    "Java",
    "SpringBoot",
    "PHP",
    "MySQL",
    "PostgreSQL",
  ]);
});

// Each filter button renders its label twice, in a .default layer and a .hover
// layer, so its accessible name is the label doubled. That is a defect; Task 8
// hides the duplicate from assistive technology and updates this query.
test("a filter button's accessible name is its label, doubled", () => {
  renderMyWork();
  expect(
    screen.getByRole("button", { name: "AngularAngular" })
  ).toBeInTheDocument();
});

test("filtering by Angular leaves only Space Invader", () => {
  const { container } = renderMyWork();
  fireEvent.click(screen.getByRole("button", { name: "AngularAngular" }));
  expect(cardNames(container)).toEqual(["Space Invader"]);
});

test("filtering by React leaves the two React projects", () => {
  const { container } = renderMyWork();
  fireEvent.click(screen.getByRole("button", { name: "ReactReact" }));
  expect(cardNames(container)).toEqual(["La Ferme", "Workshop"]);
});

test("filtering by MySQL matches on the backend list too", () => {
  const { container } = renderMyWork();
  fireEvent.click(screen.getByRole("button", { name: "MySQLMySQL" }));
  expect(cardNames(container)).toEqual(["Workshop", "S.I.R"]);
});

test("returning to All restores every project", () => {
  const { container } = renderMyWork();
  fireEvent.click(screen.getByRole("button", { name: "PHPPHP" }));
  expect(cardNames(container)).toEqual(["S.I.R"]);
  fireEvent.click(screen.getByRole("button", { name: "AllAll" }));
  expect(cardNames(container)).toHaveLength(4);
});

test("every project link opens in a new tab and severs the opener", () => {
  const { container } = renderMyWork();
  const links = [...container.querySelectorAll("a.project-button")];
  expect(links).toHaveLength(4);
  links.forEach((a) => {
    expect(a).toHaveAttribute("target", "_blank");
    expect(a.getAttribute("rel")).toMatch(/noreferrer|noopener/);
  });
  expect(links.map((a) => a.getAttribute("href"))).toEqual([
    "https://website.santoriello.ch",
    "https://workshop.santoriello.ch",
    "https://www.defense.gouv.fr/terre/section-technique-larmee-terre-stat/",
    "https://simulti.santoriello.ch/",
  ]);
});
```

- [ ] **Step 3: Create `front/src/components/Contact.test.js`**

```jsx
import { render, screen } from "@testing-library/react";
import Contact from "./Contact";
import { LanguageProvider } from "../contexts/LanguageContext";

const renderContact = () =>
  render(
    <LanguageProvider>
      <Contact />
    </LanguageProvider>
  );

beforeEach(() => {
  localStorage.clear();
});

// Where visitor data goes is the single most important fact about this
// component, so it is pinned. The access_key's value is deliberately NOT
// asserted: it is a public endpoint identifier, it may be rotated in the
// Web3Forms dashboard at any time, and a test that pins it would turn a routine
// rotation into a blocked deploy.
test("the form posts to the Web3Forms relay", () => {
  const { container } = renderContact();
  const form = container.querySelector("form.contact-form");
  expect(form).toHaveAttribute("method", "POST");
  expect(form).toHaveAttribute("action", "https://api.web3forms.com/submit");
});

test("the form carries an access key", () => {
  const { container } = renderContact();
  const key = container.querySelector('input[name="access_key"]');
  expect(key).toHaveAttribute("type", "hidden");
  expect(key.value).not.toBe("");
});

// Selected by input type rather than by "everything that is not hidden",
// because Task 5 adds a display:none checkbox to this form and a
// :not([type=hidden]) selector would pick it up.
test("name, email and message are all required", () => {
  const { container } = renderContact();
  const fields = [
    ...container.querySelectorAll(
      "input[type=text], input[type=email], textarea"
    ),
  ].map((f) => [f.tagName, f.getAttribute("name"), f.hasAttribute("required")]);
  expect(fields).toEqual([
    ["INPUT", "name", true],
    ["INPUT", "email", true],
    ["TEXTAREA", "message", true],
  ]);
});

test("the email field uses the email input type", () => {
  const { container } = renderContact();
  expect(container.querySelector('input[name="email"]')).toHaveAttribute(
    "type",
    "email"
  );
});

test("the submit button carries the translated label", () => {
  renderContact();
  expect(screen.getByRole("button")).toHaveTextContent("Submit");
});

test("the footer renders inside the contact section", () => {
  const { container } = renderContact();
  expect(container.querySelector("#contact #footer")).not.toBeNull();
});
```

- [ ] **Step 4: Run the whole suite**

```bash
cd front && CI=true npx react-scripts test --watchAll=false
```

Expected: 8 suites, 39 tests, all passing. Write the counts down; Task 12 needs
them.

- [ ] **Step 5: Confirm the deploy gate runs exactly this command**

```bash
grep -n "react-scripts test" .github/workflows/deploy.yml
```

Expected: line 25, `run: npx react-scripts test --watchAll=false`. The gate needs
no change — every test added above is picked up by the default CRA `testMatch`.

- [ ] **Step 6: Commit**

```bash
git add front/src/components/AboutMe.test.js \
        front/src/components/MyWork.test.js \
        front/src/components/Contact.test.js
git commit -m "test: characterize the about, work and contact sections"
```

---

## Phase C — Refactor

**Do not start this phase until Tasks 2 to 4 are committed and
`cd front && CI=true npx react-scripts test --watchAll=false` is green.**

Task order here is a dependency order. The two behavioural fixes come first
because they are small and independently verifiable. Data extraction comes
before the CSS work because it touches the same JSX files and doing both in one
diff would make neither reviewable. The formatter sweep comes last because
running it earlier would mix reformatting into every diff above.

### Task 5: Harden the contact form

A security fix, so it asserts corrected behaviour rather than current behaviour
(Spec D8).

**Files:**
- Modify: `front/src/components/Contact.js`
- Test: `front/src/components/Contact.test.js`
- Modify: `docs/technical.md`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Establish what the defect actually is**

Read `front/src/components/Contact.js:52-81`. The form posts name, e-mail and
message straight to `https://api.web3forms.com/submit`, identified by an
`access_key` at line 60.

That key is **not** a leaked secret. Web3Forms access keys are public by design:
the browser must send one, so it is in the bundle of every site that uses the
service, whatever the source tree looks like. Moving it into a
`REACT_APP_WEB3FORMS_ACCESS_KEY` environment variable would change nothing —
`react-scripts` inlines `REACT_APP_*` values into the JavaScript at build time.
Do not do that, and do not claim it as a fix.

The real defect is that the form has **no bot protection at all**. Anyone can
POST to that endpoint with that key from anywhere, and the owner's inbox is the
target. Web3Forms provides a first-line defence that costs one hidden input and
no dependency: a field named `botcheck`, which the service rejects the
submission on if it arrives non-empty.

- [ ] **Step 2: Write the failing test**

Append to `front/src/components/Contact.test.js`:

```jsx
// Security fix, not characterization (Spec D8): this asserts the corrected
// behaviour. The contact endpoint is public and unauthenticated by design, so
// the honeypot is the only spam defence that lives in this repository.
test("the form carries the Web3Forms honeypot field", () => {
  const { container } = renderContact();
  const honeypot = container.querySelector('input[name="botcheck"]');
  expect(honeypot).not.toBeNull();
  expect(honeypot).toHaveAttribute("type", "checkbox");
  expect(honeypot).toHaveStyle({ display: "none" });
});
```

- [ ] **Step 3: Run it to verify it fails**

```bash
cd front && CI=true npx react-scripts test --watchAll=false -t "honeypot"
```

Expected: FAIL — `Received: null`. There is no `botcheck` input today.

- [ ] **Step 4: Add the honeypot**

In `front/src/components/Contact.js`, immediately after the `access_key` input
(currently lines 57-61):

```jsx
          {/*
            Web3Forms honeypot. A real visitor never sees this field and never
            checks it; a bot that fills every input does, and Web3Forms then
            drops the submission. The access_key above is a public endpoint
            identifier, not a secret — it must be in the bundle for the form to
            work at all — so this is the only spam defence that can live in
            this repository. Domain restriction and captcha are dashboard
            settings; see docs/technical.md.
          */}
          <input
            type="checkbox"
            name="botcheck"
            style={{ display: "none" }}
            tabIndex="-1"
            autoComplete="off"
          />
```

`style={{ display: "none" }}` rather than a CSS class on purpose: the field must
stay hidden even if a stylesheet fails to load, and the two `.contact-form
input` rules in `src/styles/Contact.css` would otherwise lay it out like a real
field.

- [ ] **Step 5: Run the test to verify it passes**

```bash
cd front && CI=true npx react-scripts test --watchAll=false
```

Expected: PASS, all suites. In particular `name, email and message are all
required` from Task 4 must still pass — it selects by input type
(`input[type=text], input[type=email], textarea`), so the honeypot checkbox is
outside its net. If it now reports a fourth field, the honeypot was given
`type="text"` instead of `type="checkbox"`. Fix the markup, not the test.

- [ ] **Step 6: Record the ops-side mitigations**

Add to `docs/technical.md`, under "The contact form", the two things this
repository cannot do:

- Restrict allowed domains for the access key in the Web3Forms dashboard, so the key stops working when POSTed from anywhere but `santoriello.ch`.
- Enable hCaptcha or Cloudflare Turnstile there if the honeypot proves insufficient.

- [ ] **Step 7: Commit**

```bash
git add front/src/components/Contact.js front/src/components/Contact.test.js docs/technical.md
git commit -m "security: add the Web3Forms honeypot to the contact form"
```

### Task 6: Fix the two behavioural defects

**Files:**
- Modify: `front/src/components/CodeRain.js`
- Modify: `front/src/assets/translations.js`
- Create: `front/src/components/CodeRain.test.js`
- Modify: `docs/decisions/0004-deferred-findings.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the `myWorkNoProjects` translation key, which `MyWork.js` already reads.

- [ ] **Step 1: Confirm the translation-key mismatch**

```bash
grep -n "myWorkNoProject" front/src/components/MyWork.js front/src/assets/translations.js
```

Expected: `MyWork.js:161` reads `translate("myWorkNoProjects")` — plural — while
`translations.js` defines `myWorkNoProject` — singular — on lines 15, 37 and 61.
`translate` falls back to returning the key, so the empty state would render the
literal string `myWorkNoProjects` to a visitor.

It is latent today: all ten filters match at least one project, so `.no-projects`
never renders. It stops being latent the moment a project is removed.

- [ ] **Step 2: Rename the key in all three dictionaries**

In `front/src/assets/translations.js`, change `myWorkNoProject:` to
`myWorkNoProjects:` on lines 15, 37 and 61. Rename the key, not the component,
because the component's spelling is the one that reads correctly in English.

```bash
grep -c "myWorkNoProjects" front/src/assets/translations.js
```

Expected: `3`.

```bash
grep -c "myWorkNoProject:" front/src/assets/translations.js
```

Expected: `0`.

- [ ] **Step 3: Write the failing test for the animation-frame leak**

Create `front/src/components/CodeRain.test.js`:

```jsx
import { render } from "@testing-library/react";
import CodeRain from "./CodeRain";

// CodeRain drives its fall animation with a self-rescheduling
// requestAnimationFrame loop. Its cleanup calls
// cancelAnimationFrame(animate) — passing the callback where the frame id
// belongs — so cancelAnimationFrame silently does nothing and the loop
// survives unmount, calling setState on an unmounted component once per frame
// for as long as the page is open.
test("the animation loop is cancelled on unmount", () => {
  const cancel = jest.spyOn(window, "cancelAnimationFrame");
  const { unmount } = render(<CodeRain />);
  unmount();

  expect(cancel).toHaveBeenCalled();
  const argumentTypes = cancel.mock.calls.map((call) => typeof call[0]);
  expect(argumentTypes).toEqual(["number"]);

  cancel.mockRestore();
});

test("the drop interval is cleared on unmount", () => {
  const clear = jest.spyOn(window, "clearInterval");
  const { unmount } = render(<CodeRain />);
  unmount();

  expect(clear).toHaveBeenCalled();
  clear.mockRestore();
});
```

- [ ] **Step 4: Run it to verify the first test fails**

```bash
cd front && CI=true npx react-scripts test --watchAll=false -t "animation loop"
```

Expected: FAIL — `Expected: ["number"]`, `Received: ["function"]`. That is the
bug, reproduced. The second test passes already; `clearInterval` is correct.

- [ ] **Step 5: Fix the loop**

In `front/src/components/CodeRain.js`, delete the standalone `moveDrops`
function (lines 139-146) and replace the animation effect (lines 148-158) with:

```jsx
  // Move every drop down by its own speed, once per frame. moveDrops lives
  // inside the effect so the effect owns everything it uses and the dependency
  // array can honestly be empty; frameId holds the id that cancels the loop.
  useEffect(() => {
    let frameId = 0;

    const moveDrops = () => {
      setDrops((prevDrops) =>
        prevDrops.map((drop) => ({
          ...drop,
          top: drop.top + drop.speed,
        }))
      );
    };

    const animate = () => {
      moveDrops();
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, []);
```

- [ ] **Step 6: Run the tests to verify they pass**

```bash
cd front && CI=true npx react-scripts test --watchAll=false
```

Expected: PASS, all suites.

Jest's *"did not exit"* message will still appear. That is expected and is not a
sign the fix failed — it appears on suites that never mount `CodeRain` at all.
The evidence that the fix worked is the test above: `cancelAnimationFrame` is
now called with a `number` rather than a `function`. The real beneficiary is the
browser, where the loop previously kept running after React unmounted the
component.

- [ ] **Step 7: Record the mouse listeners as a deferred finding**

Append to `docs/decisions/0004-deferred-findings.md`:

`CodeRain` also attaches `mousemove` and `mouseout` listeners on `window` and
calls `setMousePos` on every mouse move, re-rendering up to twenty absolutely
positioned nodes per event. It is cleaned up correctly, so it is not a leak, but
it is the most expensive thing on the page. Throttling it is a performance
change, and performance tuning is out of scope for this cycle (estate spec §7).

- [ ] **Step 8: Commit**

```bash
git add front/src/components/CodeRain.js front/src/components/CodeRain.test.js \
        front/src/assets/translations.js docs/decisions/0004-deferred-findings.md
git commit -m "fix: cancel the code-rain animation frame and repair the empty-filter message"
```

### Task 7: Move content and markup out of the components

**Files:**
- Create: `front/src/data/projects.js`, `front/src/data/skills.js`, `front/src/data/codeSnippets.js`, `front/src/data/languages.js`
- Create: `front/src/components/NameLogo.js`
- Modify: `front/src/components/MyWork.js`, `front/src/components/AboutMe.js`, `front/src/components/CodeRain.js`, `front/src/components/LanguageToggle.js`, `front/src/components/Home.js`, `front/src/components/DropdownMenu.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `projects`, `projectFilters`, `skills`, `codeSnippets`, `LANGUAGES`, and the `NameLogo` component.

- [ ] **Step 1: Create `front/src/data/projects.js`**

Move `front/src/components/MyWork.js:6-47` and line 52 verbatim, including the
commented-out Price Comparator entry — the comparator host is being retired in a
later estate cycle and the entry documents why the id sequence skips 2.

```js
/**
 * The portfolio entries rendered by MyWork, newest last.
 *
 * `front` and `back` are matched literally against projectFilters below, so a
 * new technology must be spelled the same in both places or its filter button
 * will match nothing.
 */
export const projects = [
  {
    id: 1,
    name: "La Ferme",
    front: ["HTML", "CSS", "JavaScript", "React"],
    back: ["None required"],
    url: "/images/projects/laferme.jpg",
    http: "https://website.santoriello.ch",
  },
  /* Price Comparator, id 2 — its host is being retired; the entry is kept so
     the id sequence explains itself.
  {
    id: 2,
    name: "Price Comparator",
    front: ["HTML", "CSS", "JavaScript"],
    back: ["Python", "Django", "MySQL"],
    url: "/images/projects/comparator.jpg",
    http: "https://comparator.santoriello.ch",
  }, */
  {
    id: 3,
    name: "Workshop",
    front: ["HTML", "CSS", "JavaScript", "React"],
    back: ["Python", "Django", "MySQL"],
    url: "/images/projects/workshop.jpg",
    http: "https://workshop.santoriello.ch",
  },
  {
    id: 4,
    name: "S.I.R",
    front: ["HTML", "CSS", "JavaScript"],
    back: ["PHP", "MySQL"],
    url: "/images/projects/sir.jpg",
    http: "https://www.defense.gouv.fr/terre/section-technique-larmee-terre-stat/",
  },
  {
    id: 5,
    name: "Space Invader",
    front: ["Typescript", "Angular"],
    back: ["Java", "SpringBoot", "PostgreSQL"],
    url: "/images/projects/space-multi.jpg",
    http: "https://simulti.santoriello.ch/",
  },
];

/** "All" is special-cased in MyWork; the rest are matched against front/back. */
export const projectFilters = [
  "All",
  "React",
  "Angular",
  "Python",
  "Django",
  "Java",
  "SpringBoot",
  "PHP",
  "MySQL",
  "PostgreSQL",
];
```

- [ ] **Step 2: Create `front/src/data/skills.js`**

Move `front/src/components/AboutMe.js:6-16` verbatim:

```js
/** Rendered as labelled progress bars; `level` is a percentage. */
export const skills = [
  { name: "HTML/CSS", level: 90 },
  { name: "JavaScript/Typescript", level: 85 },
  { name: "React/Svelte", level: 75 },
  { name: "Angular", level: 65 },
  { name: "Django/SpringBoot", level: 70 },
  { name: "Python, Java", level: 85 },
  { name: "PHP", level: 75 },
  { name: "MySQL/PostgreSQL", level: 75 },
  { name: "NGINX/Docker/GIT", level: 65 },
];
```

- [ ] **Step 3: Create `front/src/data/codeSnippets.js`**

Move `front/src/components/CodeRain.js:5-67` verbatim — all fifty strings, the
six language comments included. Extract them mechanically rather than by
retyping:

```bash
{ echo "// Decorative snippets rained down the home section by CodeRain."
  sed -n '5,67p' front/src/components/CodeRain.js | sed '1s/^const codeSnippets/export const codeSnippets/'
} > front/src/data/codeSnippets.js
tail -3 front/src/data/codeSnippets.js
```

Expected last lines: `"DESCRIBE users;"` then `];`. Do not edit, reorder or
deduplicate the strings; they are decorative and their exact set is not
interesting, but changing them changes what the page shows.

- [ ] **Step 4: Create `front/src/data/languages.js`**

Move `front/src/components/LanguageToggle.js:36-40`:

```js
/**
 * The languages offered by LanguageToggle. The keys are the codes stored in
 * localStorage and used to index src/assets/translations.js, so adding one here
 * without adding a dictionary there makes translate() fall through to the key.
 */
export const LANGUAGES = {
  en: { label: "EN", name: "English" },
  fr: { label: "FR", name: "Français" },
  de: { label: "DE", name: "Deutsch" },
};
```

- [ ] **Step 5: Create `front/src/components/NameLogo.js`**

Move `front/src/components/Home.js:54-84` — the whole `<svg>` element — verbatim
into a new component. Do not retype the path data, do not reformat it and do not
attempt to shorten it (see ADR `0002`). Extract it mechanically:

```bash
mkdir -p front/src/data
sed -n '54,84p' front/src/components/Home.js > /tmp/namelogo-body.txt
wc -c /tmp/namelogo-body.txt
```

Expected: about 1 195 000 bytes. Paste that block, unchanged, between the two
markers in the file below, then add `role="img"` and `aria-label` to the opening
`<svg>` tag — those two attributes are the only edit this step makes to the
markup.

```jsx
/**
 * The "Santoriello Rémy" wordmark.
 *
 * This is 1.19 MB of path data, 81.6 % of the raw production bundle. It is
 * inline rather than an <img> because src/styles/Home.css animates .svg-path
 * with stroke-dasharray / stroke-dashoffset, and a stylesheet cannot reach
 * inside an external image. See docs/decisions/0002-inline-wordmark-svg.md.
 *
 * role="img" plus aria-label gives the enclosing <h1> an accessible name; the
 * heading is otherwise empty to a screen reader. aria-label is used rather
 * than a <title> element so no native tooltip appears on hover.
 */
const NameLogo = () => (
  <svg
    viewBox="0 0 374 72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Santoriello Rémy"
  >
    {/* --- BEGIN copied unchanged from Home.js:54-84 --- */}
    {/* the <mask id="path-1-outside-1_1_3"> element and the three <path>
        elements, including the 1.13 MB masked outline path */}
    {/* --- END copied unchanged --- */}
  </svg>
);

export default NameLogo;
```

- [ ] **Step 6: Rewrite the five components to import instead of declare**

`front/src/components/Home.js`: delete lines 54-84 and render `<NameLogo />`
inside the `<h1>`. Add `import NameLogo from "./NameLogo";`. The file goes from
100 lines and 1 197 456 characters to roughly 50 lines.

`front/src/components/MyWork.js`: delete lines 6-47, delete the `filters` array
on line 52, add `import { projects, projectFilters } from "../data/projects";`
and change the two references from `filters` to `projectFilters`.

`front/src/components/AboutMe.js`: delete lines 6-16, add
`import { skills } from "../data/skills";`.

`front/src/components/CodeRain.js`: delete lines 5-67, add
`import { codeSnippets } from "../data/codeSnippets";`.

`front/src/components/LanguageToggle.js`: delete lines 36-40, add
`import { LANGUAGES } from "../data/languages";`, **and move the `FLAGS` object
(lines 11-34) from inside the component body to module scope**, just below the
imports. It is a constant map of JSX elements that is currently rebuilt on every
render.

- [ ] **Step 7: Confirm nothing is left behind**

```bash
grep -n "const projects\|const skills\|const codeSnippets\|const LANGUAGES\|const filters" front/src/components/*.js
```

Expected: no output. If `const projects` still appears in `MyWork.js`, that is
the *local* `const projects = document.querySelectorAll(".project")` on line 95
of the original file — rename that local to `projectNodes` so it stops shadowing
the imported data.

- [ ] **Step 8: Measure what moved**

```bash
wc -c front/src/components/Home.js front/src/components/NameLogo.js
```

Expected: `Home.js` under 2 000 bytes, `NameLogo.js` around 1 195 000 bytes. The
total is unchanged — this task makes the repository readable, it does not make
the bundle smaller.

- [ ] **Step 9: Normalise the two component declaration styles**

Seven of the nine components are declared as `const Name = () => { … }; export
default Name;`. Two are not, and the inconsistency is the "component structure
and naming" item in estate spec §5:

- `front/src/components/DropdownMenu.js:14` uses `function DropdownMenu() { … }` with `export default DropdownMenu;` at the end.
- `front/src/components/LanguageToggle.js:5` uses `export default function LanguageToggle() { … }` with no separate export line.

Convert both to the majority form. For `LanguageToggle`, that means changing the
declaration to `const LanguageToggle = () => {` and appending `export default
LanguageToggle;` at the end of the file. This is a syntax change with no
behavioural difference — arrow components and function components are the same
thing to React — and the Phase B specs for both files must stay green without
edits.

- [ ] **Step 10: Run the suite and build**

```bash
cd front && CI=true npx react-scripts test --watchAll=false && CI=false npx react-scripts build
```

Expected: all suites PASS, and the build reports **within a few hundred bytes of
330.18 kB** gzipped for `main.*.js`. It will not be exactly the baseline —
Tasks 5 and 6 added the honeypot markup and rewrote the animation effect — but
this task itself only *moves* code, so the delta from the build at the end of
Task 6 must be near zero. A jump of kilobytes means something was retyped rather
than moved; find it before committing.

- [ ] **Step 11: Commit**

```bash
git add front/src/data front/src/components
git commit -m "refactor: move content and the wordmark markup into their own modules"
```

### Task 8: Structural accessibility fixes

Only the defects with no visual cost. The colour contrast failures are recorded
in ADR `0003` and are deliberately not touched here.

**Files:**
- Modify: `front/src/App.js`, `front/src/components/AboutMe.js`, `front/src/components/DropdownMenu.js`, `front/src/components/LanguageToggle.js`, `front/src/components/MyWork.js`, `front/src/components/Contact.js`, `front/src/contexts/LanguageContext.js`, `front/src/assets/translations.js`, `front/src/styles/DropdownMenu.css`
- Test: `front/src/App.test.js`, `front/src/components/AboutMe.test.js`, `front/src/components/DropdownMenu.test.js`, `front/src/components/LanguageToggle.test.js`, `front/src/components/MyWork.test.js`

**Interfaces:**
- Consumes: `translate` from `LanguageContext`; `LANGUAGES` from Task 7.
- Produces: the `id="dropdown-links"` referenced by `aria-controls`.

- [ ] **Step 1: Write the failing tests**

In `front/src/App.test.js`, replace the last test:

```jsx
// Task 8 added the main landmark. The four h1 elements are deliberately left
// alone: they carry no explicit font-size, so demoting them would shrink them.
// See docs/decisions/0004-deferred-findings.md.
test("the page has one main landmark wrapping the four sections", () => {
  const { container } = renderApp();
  const main = container.querySelector("main");
  expect(main).not.toBeNull();
  expect([...main.querySelectorAll(":scope > section")].map((s) => s.id)).toEqual(
    ["home", "about-me", "my-work", "contact"]
  );
  expect(container.querySelectorAll("h1")).toHaveLength(4);
});

test("the html element carries the selected language", () => {
  localStorage.setItem("language", "de");
  renderApp();
  expect(document.documentElement.lang).toBe("de");
});
```

In `front/src/components/AboutMe.test.js`, replace `the portrait's alt text is
still the placeholder`:

```jsx
test("the portrait has real, translated alt text", () => {
  const { container } = renderAboutMe();
  expect(container.querySelector("img")).toHaveAttribute(
    "alt",
    "Portrait of Rémy Santoriello"
  );
});
```

In `front/src/components/DropdownMenu.test.js`, replace `the burger is a div,
not a button`:

```jsx
test("the burger is a real button that announces whether the menu is open", () => {
  const { container } = renderMenu();
  const burger = screen.getByRole("button", { name: "Menu" });
  expect(burger.tagName).toBe("BUTTON");
  expect(burger).toHaveAttribute("type", "button");
  expect(burger).toHaveAttribute("aria-expanded", "false");
  expect(burger).toHaveAttribute("aria-controls", "dropdown-links");
  expect(container.querySelector("#dropdown-links")).not.toBeNull();

  fireEvent.click(burger);
  expect(burger).toHaveAttribute("aria-expanded", "true");
});
```

In `front/src/components/LanguageToggle.test.js`, replace `the trigger's
accessible name is the chevron glyph`:

```jsx
test("the trigger names the current language and announces the menu state", () => {
  const { container } = render(
    <LanguageProvider>
      <LanguageToggle />
    </LanguageProvider>
  );
  const trigger = screen.getByRole("button", { name: "Language: English" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveAttribute("aria-haspopup", "true");

  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(container.querySelector(".flag svg")).toHaveAttribute(
    "aria-hidden",
    "true"
  );
});
```

In `front/src/components/MyWork.test.js`, replace `a filter button's accessible
name is its label, doubled` and update the six `getByRole` queries that used the
doubled names:

```jsx
test("a filter button's accessible name is its label, once", () => {
  renderMyWork();
  expect(screen.getByRole("button", { name: "Angular" })).toBeInTheDocument();
});
```

Then change every `{ name: "AngularAngular" }` to `{ name: "Angular" }`,
`"ReactReact"` to `"React"`, `"MySQLMySQL"` to `"MySQL"`, `"PHPPHP"` to `"PHP"`
and `"AllAll"` to `"All"`.

- [ ] **Step 2: Run them to verify they fail**

```bash
cd front && CI=true npx react-scripts test --watchAll=false
```

Expected: FAIL, in `App.test.js`, `AboutMe.test.js`, `DropdownMenu.test.js`,
`LanguageToggle.test.js` and `MyWork.test.js`. Read each failure before writing
any code — they are the specification for the next five steps.

- [ ] **Step 3: Add the main landmark**

In `front/src/App.js`:

```jsx
const App = () => {
  return (
    <>
      <DropdownMenu />
      <main>
        <Home />
        <AboutMe />
        <MyWork />
        <Contact />
      </main>
    </>
  );
};
```

`<main>` is `display: block` by default and the four sections are already
full-width block-level elements, so this adds a wrapper with no layout effect.
The `<footer>` stays inside `<section id="contact">` and therefore stays inside
`<main>`; it was not a `contentinfo` landmark before this change either. See
ADR `0004`.

- [ ] **Step 4: Keep `<html lang>` in step with the language**

`front/public/index.html:2` declares `<html lang="en">` and nothing ever changes
it, while `LanguageToggle` offers English, French and German. A screen reader
therefore reads the French and German copy with English pronunciation rules for
the whole visit.

In `front/src/contexts/LanguageContext.js`, add `useEffect` to the React import
and add the effect inside `LanguageProvider`, above the `return`:

```jsx
  // Assistive technology picks pronunciation from <html lang>. Without this it
  // stays "en" from public/index.html and French and German copy is read with
  // English phonemes.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
```

- [ ] **Step 5: Give the portrait real alt text**

Add `aboutMePhotoAlt` to all three dictionaries in
`front/src/assets/translations.js`:

```js
    aboutMePhotoAlt: "Portrait of Rémy Santoriello",   // en
    aboutMePhotoAlt: "Portrait de Rémy Santoriello",   // fr
    aboutMePhotoAlt: "Porträt von Rémy Santoriello",   // de
```

In `front/src/components/AboutMe.js`, replace `alt="Your Name"`:

```jsx
          <img src="/images/me.png" alt={translate("aboutMePhotoAlt")} />
```

- [ ] **Step 6: Make the burger a button**

In `front/src/components/DropdownMenu.js`, give the links container an id and
replace the `<div>`:

```jsx
      <div
        id="dropdown-links"
        className={`dropdown-links${menuOpen ? " open" : ""}`}
      >
```

```jsx
      <button
        type="button"
        className="toggle-burger"
        aria-label="Menu"
        aria-expanded={menuOpen}
        aria-controls="dropdown-links"
        onClick={toggleMenu}
      >
        {menuOpen ? "✖" : "☰"}
      </button>
```

A `<button>` brings user-agent styles a `<div>` did not have. Add the four
resets to `.toggle-burger` in `front/src/styles/DropdownMenu.css:44`, keeping
every existing declaration:

```css
.toggle-burger {
  /* Reset the user-agent button styling; this element was a div until the
     accessibility pass and must keep rendering exactly as it did. */
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  line-height: 1;

  display: none;
  position: absolute;
  left: 50%;
  top: 6px;
  cursor: pointer;
  font-size: 2rem;
  color: var(--menu-link-color);
  z-index: 1001;
}
```

- [ ] **Step 7: Name the language trigger and hide the decorative flags**

In `front/src/components/LanguageToggle.js`:

```jsx
            <button
                className="lang-current"
                aria-label={`Language: ${LANGUAGES[language].name}`}
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen(!open)}
            >
```

Add `aria-hidden="true"` and `focusable="false"` to each of the three `<svg>`
elements in `FLAGS`. They duplicate the adjacent language name in the menu and
are covered by the trigger's `aria-label` when collapsed, so they carry no
information of their own. Both attributes are needed: `aria-hidden` for modern
screen readers, `focusable="false"` because Internet Explorer's descendants put
SVGs in the tab order.

- [ ] **Step 8: Hide the duplicated filter label**

In `front/src/components/MyWork.js`, the hover layer exists only to be wiped in
by `clip-path`; it must not be announced:

```jsx
              <div className="text-layer default">{filter}</div>
              <div className="text-layer hover" aria-hidden="true">
                {filter}
              </div>
```

`aria-hidden` has no rendering effect, so the wipe animation is unchanged.

- [ ] **Step 9: Remove the invalid attribute on the textarea**

In `front/src/components/Contact.js`, delete `type="text"` from the
`<textarea name="message">` element. `type` is not a valid `<textarea>`
attribute; browsers ignore it and React passes it straight through to the DOM.
(No line number: Task 5 inserted the honeypot above it.)

- [ ] **Step 10: Add a focus indicator**

There is no `:focus` or `:focus-visible` rule anywhere in `front/src` today —
verify with `grep -rn "focus" front/src` before this step, which should print
nothing. Keyboard users get whatever the browser default is, which several of
these controls suppress.

This rule is created in Task 10 as part of `front/src/styles/shared.css`. Add it
there when that file is created; nothing else in this task depends on it.

- [ ] **Step 11: Run the suite**

```bash
cd front && CI=true npx react-scripts test --watchAll=false
```

Expected: PASS, all suites. If `the four sections are on the page, in order`
from Task 2 now fails, the `querySelectorAll("section")` is picking up something
new — read the failure, do not loosen the assertion.

- [ ] **Step 12: Verify in a browser that nothing moved**

```bash
cd front && CI=false npx react-scripts build && npx --yes serve -s build -l 3000
```

Open `http://localhost:3000` and check, in both themes:

1. The burger at a viewport narrower than 590 px sits in the same place, is the same size and the same colour as before, and opens the menu.
2. Tab through the page: every link and button now shows a visible focus ring (this arrives with Task 10 — if Task 10 is not yet done, expect no ring and re-check after it).
3. The filter buttons still wipe from one label to the other on hover.
4. Nothing on any of the four sections shifted position.

- [ ] **Step 13: Commit**

```bash
git add front/src docs
git commit -m "a11y: add the main landmark, real alt text, a real burger button and accessible names"
```

### Task 9: One place for every colour and every shared timing

This is a pure consolidation task. **Every value below keeps its exact literal
in both themes.** Nothing renders differently afterwards.

**Files:**
- Create: `front/src/styles/tokens.css`
- Modify: `front/src/App.css`, `front/src/index.js`
- Modify: `front/src/styles/Footer.css`, `front/src/styles/Home.css`
- Modify: `docs/decisions/0004-deferred-findings.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the custom properties `--accent`, `--accent-strong`, `--accent-faint`, `--on-dark`, `--reveal-transition` and `--section-top-padding`, all consumed by Task 10.

- [ ] **Step 1: Record what is being consolidated**

The survey found these, exactly:

| Value | Occurrences | Where |
|---|---|---|
| `hsla(182, 96%, 40%, 0.76)` | 4 literals + 1 token definition | `Footer.css:73`, `Footer.css:79`, `Home.css:83`, `Home.css:84`; defined as `--link-color` at `App.css:10` |
| `hsla(182, 96%, 40%, 1)` | 1 | `Footer.css:34` |
| `hsla(182, 96%, 40%, 0.2)` | 1 | `Home.css:70` |
| `#343a40` | 1 literal + 5 token definitions | `Footer.css:12`; defined at `App.css:7,9,19,25,26,27` |
| `rgba(255, 255, 255, 0.4)` | 2 | `Home.css:48`, `Home.css:104` |
| `transition: transform 0.4s ease-in, opacity 0.4s ease-in` | 8 | `App.css:51`; `AboutMe.css:18,38,72`; `Contact.css:17,38`; `MyWork.css:17,42` |
| `padding-top: 54px` | 3 | `AboutMe.css:10`, `Contact.css:10`, `MyWork.css:10` |

The rule this task follows, so the next person applies it the same way: **a
literal becomes a token if it appears twice or more, or if it is a variant of
the brand accent `hsl(182, 96%, 40%)` — because those must move together if the
accent ever changes.** `rgba(255, 255, 255, 0.1)` at `Home.css:71` and `#020202`
at `ThemeToggle.css:34` therefore stay as literals: one occurrence each, neither
is the accent.

- [ ] **Step 2: Create `front/src/styles/tokens.css`**

Lines 5-28 of `App.css` move here unchanged, and the six new tokens are added.

```css
/*
 * Every colour literal and every shared timing in this project lives here.
 *
 * The tokens under :root and [data-theme="dark"] are theme-switched by
 * ThemeToggle, which sets data-theme on <html>. The tokens in the third block
 * are NOT theme-switched: they hold the literal values that were hard-coded in
 * Footer.css and Home.css, and those two files render on backdrops that do not
 * change with the theme (the #343a40 navbar bar and the black CodeRain
 * backdrop). Switching them with the theme would change what the site looks
 * like, which this task must not do.
 * See docs/decisions/0003-colour-contrast.md before changing any of these.
 */
:root {
  --background-color: #f9f9f9;
  --background-menu: #343a40;
  --menu-link-color: #dfdbdb;
  --text-color: #343a40;
  --link-color: hsla(182, 96%, 40%, 0.76);
  --link-hover-color: hsla(182, 96%, 40%, 1.4);
  --border-color: #dee2e6;
  --projects-bg-color: white;
  --form-bg-color: white;
  --filters-btn-hover-color: white;
}

[data-theme="dark"] {
  --background-color: #4e565f;
  --background-menu: #343a40;
  --menu-link-color: #dfdbdb;
  --text-color: #dfdbdb;
  --link-color: hsla(182, 96%, 70%, 0.8);
  --link-hover-color: hsla(182, 96%, 70%, 1.4);
  --border-color: #707070;
  --projects-bg-color: #343a40;
  --form-bg-color: #343a40;
  --filters-btn-hover-color: #343a40;
}

:root {
  /* The brand accent at the three alphas the site actually uses. Identical in
     both themes, on purpose — see the note above. */
  --accent-strong: hsla(182, 96%, 40%, 1);
  --accent: hsla(182, 96%, 40%, 0.76);
  --accent-faint: hsla(182, 96%, 40%, 0.2);

  /* Text on the black CodeRain backdrop. */
  --on-dark: rgba(255, 255, 255, 0.4);

  /* The scroll-reveal transition, used by eight rules across five files. */
  --reveal-transition: transform 0.4s ease-in, opacity 0.4s ease-in;

  /* Clearance for the fixed navbar at the top of each section. */
  --section-top-padding: 54px;
}
```

- [ ] **Step 3: Import it first**

In `front/src/index.js`, add the import above the existing `./index.css` import,
so the tokens are defined before any rule that reads them:

```js
import "./styles/tokens.css";
import "./index.css";
```

- [ ] **Step 4: Delete the token blocks from `App.css`**

Remove lines 5-28 of `front/src/App.css` — the `:root` and `[data-theme="dark"]`
blocks that just moved. Everything else in the file stays where it is.

- [ ] **Step 5: Replace the seven literals**

`front/src/styles/Footer.css`:

| Line | From | To |
|---|---|---|
| 12 | `background-color: #343a40;` | `background-color: var(--background-menu);` |
| 34 | `background: hsla(182, 96%, 40%, 1);` | `background: var(--accent-strong);` |
| 73 | `color: hsla(182, 96%, 40%, 0.76);` | `color: var(--accent);` |
| 79 | `color: hsla(182, 96%, 40%, 0.76);` | `color: var(--accent);` |

`front/src/styles/Home.css`:

| Line | From | To |
|---|---|---|
| 48 | `color: rgba(255, 255, 255, 0.4);` | `color: var(--on-dark);` |
| 70 | `color: hsla(182, 96%, 40%, 0.2);` | `color: var(--accent-faint);` |
| 83 | `border-color: hsla(182, 96%, 40%, 0.76);` | `border-color: var(--accent);` |
| 84 | `color: hsla(182, 96%, 40%, 0.76);` | `color: var(--accent);` |
| 104 | `color: rgba(255, 255, 255, 0.4);` | `color: var(--on-dark);` |

Line 12 of `Footer.css` is provably safe: `--background-menu` is `#343a40` in
**both** the light and the dark block, so the substitution cannot change
anything. The other eight resolve to non-theme-switched tokens holding the same
literal, so they cannot either.

- [ ] **Step 6: Prove no colour literal survives outside the token file**

```bash
grep -rn "hsla(182" front/src --include=*.css
```

Expected: exactly six lines, **all** in `front/src/styles/tokens.css` — the two
`--link-color`, the two `--link-hover-color`, and `--accent-strong`,
`--accent`, `--accent-faint`. (`--accent` shares its literal with the light
`--link-color`; that is intentional and the comment in `tokens.css` explains
why.)

```bash
grep -rn "#343a40" front/src --include=*.css
```

Expected: six lines, all in `front/src/styles/tokens.css`.

If either grep finds a line in `Footer.css` or `Home.css`, a replacement was
missed.

- [ ] **Step 7: Record the dark-theme inconsistency**

Append to `docs/decisions/0004-deferred-findings.md`:

`--accent`, `--accent-strong` and `--accent-faint` deliberately do **not**
switch with the theme, while `--link-color` does. That is what the code did
before this cycle: `Footer.css` and `Home.css` hard-coded the light-theme
accent, so the footer's social-icon hover and the home buttons keep
`hsl(182, 96%, 40%)` even in dark mode, while everything using `--link-color`
moves to `hsl(182, 96%, 70%)`. Unifying them is a visible change to the dark
theme and belongs with the palette decision recorded in ADR `0003`.

- [ ] **Step 8: Build and compare**

```bash
cd front && CI=true npx react-scripts test --watchAll=false && CI=false npx react-scripts build
```

Expected: all suites PASS, and the build reports **3.78 kB** or less gzipped for
`main.*.css`. A larger number means a rule was duplicated rather than moved.

- [ ] **Step 9: Verify in a browser, in both themes**

```bash
cd front && npx --yes serve -s build -l 3000
```

Check specifically the nine substituted values, because they are the only things
that could have changed:

1. Light theme, footer: the chevron button above the footer is solid teal; the LinkedIn and GitHub icons turn teal on hover; the `©2025` is teal.
2. Light theme, home: the tagline is dim grey on black; the two buttons are barely-visible teal at rest and bright teal with a teal border on hover.
3. Switch to dark theme with the toggle. All six of the above must look **exactly the same** — that is the whole point of the non-switching tokens.
4. The footer bar is the same dark grey as the navbar in both themes.

- [ ] **Step 10: Commit**

```bash
git add front/src/styles/tokens.css front/src/App.css front/src/index.js \
        front/src/styles/Footer.css front/src/styles/Home.css \
        docs/decisions/0004-deferred-findings.md
git commit -m "refactor(css): move every colour literal into one token file"
```

### Task 10: One place for every shared rule

Also a pure consolidation task. Same rule: nothing renders differently.

**Files:**
- Create: `front/src/styles/shared.css`
- Modify: `front/src/App.js`, `front/src/App.css`, `front/src/index.js`
- Delete: `front/src/index.css`
- Modify: `front/src/styles/AboutMe.css`, `front/src/styles/MyWork.css`, `front/src/styles/Contact.css`
- Modify: `front/src/components/AboutMe.js`, `front/src/components/MyWork.js`, `front/src/components/Contact.js`

**Interfaces:**
- Consumes: `--reveal-transition`, `--section-top-padding`, `--background-color`, `--link-color`, `--text-color` from Task 9.
- Produces: the classes `.section`, `.separator`, `.reveal`, `.btn-outline` and the `:focus-visible` rule.

- [ ] **Step 1: Record what is being consolidated, with counts**

| Pattern | Sites | Duplicated declarations |
|---|---|---|
| The section shell — 10 identical declarations | `.about-me` (`AboutMe.css:1`), `.my-work` (`MyWork.css:1`), `.contact` (`Contact.css:1`) | 30, of which 20 are removable |
| `.X.animate { transform: translateX(0); opacity: 1; }` | `App.css:54`; `AboutMe.css:20,40,74`; `Contact.css:19,41`; `MyWork.css:19,45` | 16, of which 14 are removable |
| `transition: var(--reveal-transition)` | the 8 sites listed in Task 9 | 8, of which 7 are removable |
| The outline button — 8 declarations plus a 2-declaration `:hover` | `.project-button` (`MyWork.css:207`), `.contact-form button` (`Contact.css:97`) | 20, of which 10 are removable |

**51 duplicated declarations in total.** Two things that look like duplication
but are not, and are therefore left alone:

- `.about-content`, `.my-work-content` and `.contact-content` share only three declarations (`display: flex`, `width: 100%`, `margin-top: 20px`); their flex direction, wrap and justification all differ. Not worth a class.
- `.footer` shares the first six declarations with the section shell but then diverges completely — `min-height: 50px`, `margin-top: auto`, `position: relative`, its own background. Do **not** give it `.section`; that would add `padding-top: 54px` and `background-color: var(--background-color)` and visibly move it.

- [ ] **Step 2: Create `front/src/styles/shared.css`**

```css
/*
 * Rules used by more than one section. Imported by App.js immediately after
 * App.css, so every component stylesheet loads after this file and can still
 * override it at equal specificity.
 */

/*
 * The outer <section> of About Me, My Work and Contact. The three differed only
 * in their height rule, which stays in each component's own stylesheet:
 *   .about-me  height: 100vh; cursor: default;
 *   .my-work   min-height: 100vh;
 *   .contact   height: 100vh;
 */
.section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  padding: 0;
  margin: 0;
  padding-top: var(--section-top-padding);
  overflow: hidden;
  background-color: var(--background-color);
}

/*
 * Scroll reveal. Each section's IntersectionObserver adds .animate to its
 * descendants when the section is on screen and removes it when it leaves.
 * Only the starting offset differs per element, so that stays in the component
 * stylesheet; the transition and the end state are the same everywhere.
 *
 * translateX(0) and translateY(0) both produce the identity transform, so this
 * one rule is correct for .project, which starts at translateY(80%).
 *
 * .contact-form is NOT a .reveal: it animates with scale and the popIn
 * keyframes, not with a transition.
 */
.reveal {
  opacity: 0;
  transition: var(--reveal-transition);
}

.reveal.animate {
  transform: translateX(0);
  opacity: 1;
}

/*
 * The rule under each section heading. It lives here rather than in App.css
 * because its transition-delay must be declared AFTER .reveal's transition
 * shorthand — a shorthand resets transition-delay to 0s, and App.css is loaded
 * before this file.
 */
.separator {
  width: 100px;
  min-height: 5px;
  border-radius: 5px;
  background-color: var(--text-color);
  transform: translateX(300%);
  transition-delay: 0.1s;
}

/*
 * The outlined call-to-action shared by the project cards and the contact form.
 * Size, spacing and transition stay with each caller, which is where they
 * differ.
 */
.btn-outline {
  position: relative;
  z-index: 2;
  border: 2px solid var(--link-color);
  border-radius: 5px;
  font-size: 1.5rem;
  color: var(--link-color);
  cursor: pointer;
  background: transparent;
}

.btn-outline:hover {
  background-color: var(--link-color);
  color: var(--text-color);
}

/*
 * Keyboard focus. There was no :focus or :focus-visible rule anywhere in this
 * project before, and several controls suppress the user-agent outline.
 *
 * Two rings, white inside and black outside, on purpose: the page has both a
 * near-white surface (#f9f9f9) and a near-black one (the CodeRain backdrop),
 * and the brand accent measures only 2.11:1 against the light background — it
 * cannot be the focus colour. Whichever backdrop a control sits on, one of the
 * two rings contrasts with it. Do not "tidy" this into var(--link-color);
 * see docs/decisions/0003-colour-contrast.md.
 */
:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
  box-shadow: 0 0 0 5px #000000;
}
```

- [ ] **Step 3: Import it in the right place**

In `front/src/App.js`, immediately after the existing `import './App.css';`:

```js
import './App.css';
import './styles/shared.css';
```

Order matters and is the whole reason this is a separate step. `App.js` imports
the five components *after* these two lines, so every component stylesheet is
emitted after `shared.css` and wins any equal-specificity tie — which is what
lets `.project`'s own `transition` (which also animates `box-shadow`) override
`.reveal`'s.

- [ ] **Step 4: Delete `.separator` from `App.css`**

Delete both the `.separator` rule and the now-redundant `.separator.animate`
rule from `front/src/App.css`. `.separator` is re-declared in `shared.css`;
`.separator.animate` is replaced by `.reveal.animate`. (They were lines 44-57
before Task 9 removed the token blocks above them; find them by selector, not by
line.) `App.css` is then three rules long: `*`, `body` and `#root`.

- [ ] **Step 5: Fold `index.css` away**

`front/src/index.css` has two rules. Its `code` rule matches nothing — verify:

```bash
grep -rn "<code" front/src
```

Expected: no output. (`CodeRain` renders `<div className="code">`, not `<code>`.)

Its `body` rule is entirely overridden by `App.css`'s `body` rule, which is
loaded after it, **except** for two declarations. Move exactly those two into
the `body` rule in `front/src/App.css`:

```css
body {
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: "Ubuntu";
  margin: 0;
  padding: 0;
  transition: background-color 0.5s ease, color 0.5s ease;
  /* Moved from the deleted src/index.css, which contributed nothing else. */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Then:

```bash
git rm front/src/index.css
```

and remove `import "./index.css";` from `front/src/index.js`.

Note for the reader: `font-family: "Ubuntu"` names a font this project never
loads, and it is the reason `index.css`'s system font stack was already dead.
That is recorded in ADR `0004` and is **not** changed here — adding a fallback
stack would change the rendered typeface on most machines.

- [ ] **Step 6: Adopt `.section` in the three sections**

Replace the shell declarations in each stylesheet and add the class in each
component. The stylesheets below are untouched by Tasks 5 to 9, so their line
numbers are still accurate; the *component* files are not, so those are
identified by their JSX attribute instead.

`front/src/styles/AboutMe.css`, lines 1-14 become:

```css
.about-me {
  height: 100vh;
  cursor: default;
}
```

`front/src/styles/MyWork.css`, lines 1-13 become:

```css
.my-work {
  min-height: 100vh;
}
```

`front/src/styles/Contact.css`, lines 1-13 become:

```css
.contact {
  height: 100vh;
}
```

Then in the components, on the outermost `<section>` of each:

- `AboutMe.js`, `<section id="about-me">`: `className="about-me"` → `className="section about-me"`
- `MyWork.js`, `<section id="my-work">`: `className="my-work"` → `className="section my-work"`
- `Contact.js`, `<section id="contact">`: `className="contact"` → `className="section contact"`

The `@media screen and (max-width: 816px) { .about-me { height: auto } }` block
lower down in `AboutMe.css` is untouched and still wins — it is in the same
file, later in source order, at equal specificity.

- [ ] **Step 7: Adopt `.reveal` — eight rules, eleven elements**

In each component stylesheet, delete the `opacity: 0;` and the `transition:
transform 0.4s ease-in, opacity 0.4s ease-in;` declaration from the eight rules
listed in Task 9, and delete the eight `.X.animate` blocks entirely. Keep the
`transform` start offset and any `transition-delay`.

For example, `.about-me-title` and `.about-me-title.animate` in
`front/src/styles/AboutMe.css` collapse from two rules to one:

```css
.about-me-title {
  transform: translateX(-300%);
}
```

The eleven elements, and the class list each ends up with. Three of them are the
`.separator` divs, which now get their end state from `.reveal.animate` instead
of the deleted `.separator.animate`.

| Component | Element | Class list becomes |
|---|---|---|
| `AboutMe.js` | the `<h1>` | `"about-me-title reveal"` |
| `AboutMe.js` | the separator `<div>` | `"separator reveal"` |
| `AboutMe.js` | the description `<div>` | `"about-description reveal"` |
| `AboutMe.js` | the skills `<div>` | `"about-skills reveal"` |
| `MyWork.js` | the `<h1>` | `"my-work-title reveal"` |
| `MyWork.js` | the separator `<div>` | `"separator reveal"` |
| `MyWork.js` | the filter row `<div>` | `"filters reveal"` |
| `MyWork.js` | each card `<div>` in the map | `"project reveal"` |
| `Contact.js` | the `<h1>` | `"contact-title reveal"` |
| `Contact.js` | the separator `<div>` | `"separator reveal"` |
| `Contact.js` | the description `<p>` | `"contact-descr reveal"` |

**Do not add `reveal` to `.contact-form`.** It uses `transform: scale(0)` and
the `popIn` keyframes; `.reveal.animate`'s `transform: translateX(0)` would
fight the animation.

Two rules keep their own timing because it is not the shared one, and both are
in files loaded after `shared.css` so they win:

- `.project` in `MyWork.css` keeps its full `transition` shorthand, because it also transitions `box-shadow`.
- `.filters` in `MyWork.css` and `.contact-descr` in `Contact.css` keep their `transition-delay: 0.2s`.

- [ ] **Step 8: Adopt `.btn-outline` in the two buttons**

In `front/src/styles/MyWork.css`, delete the eight `.btn-outline` declarations
from `.project-button`, and delete the whole `.project-button:hover` rule. What
is left is:

```css
.project-button {
  display: inline-block;
  bottom: 50px;
  text-decoration: none;
  margin: 10px auto 0;
  padding: 13px;
  width: 180px;
  transform: translateY(50px);
  transition: all 0.4s ease;
  opacity: 0;
}
```

In `front/src/styles/Contact.css`, do the same to `.contact-form button` and
delete `.contact-form button:hover`:

```css
.contact-form button {
  align-self: center;
  justify-self: center;
  margin: 10px 0;
  padding: 0.75rem;
  width: 80%;
  max-width: 500px;
  transition: 0.4s ease;
}
```

Then add the class in the JSX:

- `MyWork.js`, the `<a>` inside each card: `className="project-button"` → `className="project-button btn-outline"`
- `Contact.js`, the submit button: `<button type="submit">` → `<button type="submit" className="btn-outline">`

The rule `.contact-form input:invalid ~ button[type="submit"]` in `Contact.css`
still matches and still wins — it has higher specificity than `.btn-outline`, so
the submit button still greys out and stops accepting clicks while a field is
invalid.

- [ ] **Step 9: Count what is left**

```bash
grep -rc "transform: translateX(0);" front/src/App.css front/src/styles/*.css
```

Expected: `1`, in `shared.css`. It was 8 across four files.

```bash
grep -rn "padding-top: 54px" front/src --include=*.css
```

Expected: no output — the value now exists only as `--section-top-padding` in
`tokens.css`.

- [ ] **Step 10: Run the suite and build**

```bash
cd front && CI=true npx react-scripts test --watchAll=false && CI=false npx react-scripts build
```

Expected: all suites PASS, and `main.*.css` at **3.78 kB gzipped or smaller**.
This task removes 51 declarations and adds about 25, so it should shrink a
little; a few bytes either way is noise, a jump of a kilobyte is a rule that was
duplicated instead of moved.

The Phase B tests are what catch a mistyped class here: they query
`.about-me-title`, `.project-description h3`, `.filter-button .default`,
`.separator` and `a.project-button` by class. A class list edited wrongly fails
them.

- [ ] **Step 11: Verify in a browser that nothing moved**

```bash
cd front && npx --yes serve -s build -l 3000
```

This is the verification that matters; the tests cannot see CSS. Work through
all of it, in **both** themes:

1. **Reveal animations.** Scroll slowly from top to bottom. Each section's title slides in from the left, its separator from the right, the About description from the left, the skills panel from the right, the filter row from the left, the project cards up from below, the contact paragraph from the left, and the contact form pops in. Scroll back up and down again: they replay. If anything appears without animating, it lost its `reveal` class; if anything never appears, it kept `opacity: 0` and lost `.animate`.
2. **Section geometry.** Each of the three sections still starts 54 px below the top of the viewport, with the fixed navbar clearing the heading.
3. **Buttons.** A project card's "Let's see it!" button and the contact form's "Submit" button are the same size, in the same place, with the same teal border, and both fill with teal on hover.
4. **Separator.** The teal-grey bar under each heading is 100 × 5 px with rounded ends.
5. **Narrow viewport.** At 500 px wide: the About section stacks and grows past 100vh, the burger appears, the menu opens and closes.
6. **Focus.** Tab from the top of the page. Every link and button shows the white-on-black double ring, including the home buttons on the black backdrop and the nav links on the dark bar.
7. **Body font smoothing.** Text is not visibly heavier than before — that is the check on the `index.css` deletion.

- [ ] **Step 12: Commit**

```bash
git add front/src
git commit -m "refactor(css): extract the section shell, the reveal, the outline button and a focus ring"
```

### Task 11: Remove what nothing uses

**Files:**
- Modify: `front/package.json`
- Modify: `front/src/reportWebVitals.js`
- Modify: `front/public/manifest.json`
- Delete: `front/src/logo.svg`, `front/public/images/santoriello.svg`, `front/public/images/sun-solid.svg`, `front/public/images/moon-solid.svg`, `front/public/images/projects/slides/`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Prove each dependency is unused before removing it**

```bash
grep -rn "react-router" front/src
grep -rn "cra-template" front/src
grep -rn "free-regular-svg-icons\|free-solid-svg-icons" front/src
grep -rn "fortawesome" front/src
```

Expected: the first three print nothing. The fourth prints exactly two lines,
both in `front/src/components/Footer.js`:
`@fortawesome/react-fontawesome` and `@fortawesome/free-brands-svg-icons`.

Note for anyone who has seen the sibling repository: `website-laferme` carries
**both** the legacy `react-fontawesome` package and the scoped
`@fortawesome/react-fontawesome`. This repository has only the scoped one.
There is nothing to untangle here.

- [ ] **Step 2: Remove the four unused dependencies**

Delete these four lines from `front/package.json`:

```json
    "@fortawesome/free-regular-svg-icons": "^6.7.2",
    "@fortawesome/free-solid-svg-icons": "^6.7.2",
    "cra-template": "1.2.0",
    "react-router-dom": "^7.1.2",
```

Keep `@fortawesome/fontawesome-svg-core` — it is a peer dependency of
`@fortawesome/react-fontawesome` and removing it breaks the footer icons.

```bash
cd front && npm install
```

This rewrites `package-lock.json`. Commit that change with this task.

- [ ] **Step 3: Verify the build still works without them**

```bash
cd front && CI=true npx react-scripts test --watchAll=false && CI=false npx react-scripts build
```

Expected: all suites PASS, build succeeds. The LinkedIn and GitHub icons in the
footer are the thing at risk — confirm them in the browser check in Task 13.

If the build fails naming `react-router-dom`, then something does import it and
step 1's grep was run against the wrong path. Restore the dependency and
investigate.

- [ ] **Step 4: Fix `reportWebVitals.js`**

`front/src/reportWebVitals.js` imports `getCLS`, `getFID`, `getFCP`, `getLCP`
and `getTTFB`. Those are the web-vitals **2.x** names. `front/package.json`
pins `web-vitals` at `^4.2.4`, which exports `onCLS`, `onINP`, `onFCP`, `onLCP` and
`onTTFB`; `getFID` does not exist at all in 4.x, where FID was replaced by INP.

It has never thrown because `front/src/index.js:21` calls `reportWebVitals()`
with no argument, so the `if (onPerfEntry && …)` guard is false and the dynamic
import never runs. Anyone who follows the comment above that call and passes
`console.log` gets five `undefined is not a function` errors.

```js
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // web-vitals 4.x: the on* names, and INP in place of the retired FID.
    import("web-vitals").then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onINP(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
```

- [ ] **Step 5: Fix the manifest**

`front/public/manifest.json` still says `"short_name": "React App"` and
`"name": "Create React App Sample"`. Those are what an installed home-screen
icon is labelled with.

```json
  "short_name": "Santoriello",
  "name": "Rémy Santoriello — Full-Stack Developer",
```

Change **only** those two keys. Leave `theme_color`, `background_color`,
`start_url`, `display` and `icons` exactly as they are — `theme_color` is
`#000000` here and `public/index.html:7` declares the same value in its
`<meta name="theme-color">`, and changing one without the other makes them
disagree. Note the pair in `docs/decisions/0004-deferred-findings.md` so the
next person knows they are coupled.

- [ ] **Step 6: Prove the unreferenced assets are unreferenced, then delete them**

```bash
for a in logo.svg santoriello.svg sun-solid.svg moon-solid.svg slides; do
  printf '%s: ' "$a"
  grep -rl "$a" front/src front/public/index.html front/public/manifest.json 2>/dev/null || echo "UNREFERENCED"
done
```

Expected: all five print `UNREFERENCED`.

```bash
git rm front/src/logo.svg \
       front/public/images/santoriello.svg \
       front/public/images/sun-solid.svg \
       front/public/images/moon-solid.svg
git rm -r front/public/images/projects/slides
```

That is 3.6 MB: `santoriello.svg` alone is 1 194 993 bytes (a second copy of the
wordmark now in `NameLogo.js`) and `slides/` is 2.4 MB across twelve files that
no component ever loaded.

Keep `front/public/images/projects/comparator.jpg`. It is referenced only from
the commented-out entry in `front/src/data/projects.js`, and that entry is kept
on purpose (Task 7).

- [ ] **Step 7: Rebuild and check the image the deployment actually serves**

```bash
cd front && CI=false npx react-scripts build && du -sh build
```

Expected: the build succeeds and is roughly 3.6 MB smaller than before. Anything
under `public/` is copied verbatim into the image, so this is a real reduction in
what nginx ships.

- [ ] **Step 8: Commit**

```bash
git add front/package.json front/package-lock.json front/src/reportWebVitals.js \
        front/public/manifest.json
git commit -m "chore: drop four unused dependencies, 3.6 MB of unreferenced assets and the dead web-vitals API"
```

### Task 12: Formatter sweep

> **ADDED BEFORE EXECUTION — gate the formatters in CI.**
>
> As written this task adopts Prettier and ESLint but never runs them anywhere
> automatic, so formatting drifts back and the sweep's value decays. The
> space-multi cycle finished with exactly that gap named at its final review; the
> workshop plan closed it and its gates passed on their first real deploy.
>
> So in the commit that records `.git-blame-ignore-revs`, also add two steps to
> the **`test` job** of `.github/workflows/deploy.yml`, after the existing
> dependency install:
>
> ```yaml
>       - name: Check formatting
>         working-directory: front
>         run: npx prettier --check .
>
>       - name: Lint
>         working-directory: front
>         run: npx eslint src --max-warnings 0
> ```
>
> Adjust paths and flags to match what this repo's config actually needs — the
> point is the gate, not the exact invocation.
>
> **Three constraints:**
>
> 1. **Run both locally and confirm they pass before committing.** A gate that
>    fails on its first push blocks deployment of a live site, and this is the
>    commit that makes failure blocking.
> 2. **Touch only the `test` job.** The `deploy` job's rsync line carries
>    `--delete` on the `./front/` transfer, added earlier today to fix a broken
>    deploy. The second rsync, whose source is the single file
>    `docker-compose.yml`, must never gain `--delete` — its source is one file, so
>    rsync would treat everything else in the destination as extraneous and delete
>    it, `front/` included.
> 3. **Do not add `plugin:jsx-a11y/recommended`** or any rule set that turns
>    existing warnings into errors. The plan already forbids this: `CI=true`
>    makes `react-scripts build` treat warnings as errors, and smuggling a
>    deploy-blocking rule change into a formatting commit is exactly the kind of
>    surprise this structure exists to prevent.


Deliberately last: running it earlier would mix reformatting into every review
diff above. (Spec D4)

**Files:**
- Create: `front/.prettierrc.json`, `front/.prettierignore`, `front/.eslintrc.json`
- Modify: `front/package.json`
- Create: `.git-blame-ignore-revs`
- Modify: every file under `front/src` (formatting only)
- Modify: `docs/technical.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the sweep commit SHA, recorded in `.git-blame-ignore-revs`.

- [ ] **Step 1: Establish the baseline**

```bash
cd front && CI=true npx react-scripts test --watchAll=false
```

Expected: PASS. **Write down the suite and test counts.** Step 6 compares
against them.

Do not proceed if the suite is red. A sweep applied on top of a red suite makes
it impossible to tell formatting from breakage.

- [ ] **Step 2: Add Prettier**

```bash
cd front && npm install --save-dev --save-exact prettier@3.4.2 eslint-config-prettier@9.1.0
```

`--save-exact` on purpose: a formatter that drifts with a caret range produces
spurious diffs in unrelated pull requests.

- [ ] **Step 3: Write the Prettier configuration**

Create `front/.prettierrc.json`. These are Prettier 3's defaults, written out
explicitly so nobody has to look them up, and chosen deliberately: `singleQuote:
false` matches the majority of this codebase (only `App.js`, `App.test.js` and
`Footer.js` use single quotes).

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all"
}
```

Create `front/.prettierignore`:

```
build/
node_modules/
package-lock.json
```

- [ ] **Step 4: Move the ESLint configuration out of `package.json`**

Create `front/.eslintrc.json`:

```json
{
  "extends": ["react-app", "react-app/jest", "prettier"]
}
```

`prettier` last, so `eslint-config-prettier` can switch off the stylistic rules
that would otherwise argue with the formatter. `react-app` and `react-app/jest`
are exactly what the inline `eslintConfig` key holds today, so no rule changes.

Delete the whole `eslintConfig` key from `front/package.json` (it was lines
28-33 before Task 11 removed four dependency lines above it; find it by name).
Confirm it is gone:

```bash
grep -c "eslintConfig" front/package.json
```

Expected: `0`.

**Do not add `plugin:jsx-a11y/recommended`.** `eslint-config-react-app` already
enables a subset of `jsx-a11y`, and the full recommended set would produce
warnings that `react-scripts build` turns into errors when `CI=true`, which is
how GitHub Actions runs. That is a deploy-blocking change disguised as a
formatting one.

- [ ] **Step 5: Add the scripts**

In `front/package.json`, add to `scripts`:

```json
    "format": "prettier --write \"src/**/*.{js,css,json}\"",
    "format:check": "prettier --check \"src/**/*.{js,css,json}\"",
    "lint": "eslint src --ext .js"
```

- [ ] **Step 6: Confirm ESLint is clean before reformatting**

```bash
cd front && npm run lint
```

Expected: exit 0 with no findings — the survey confirmed the current tree is
clean under `react-app`. If anything is reported, it came from Phase C; fix it
now, in its own commit, before the sweep. Never mix a lint fix into a formatting
commit.

- [ ] **Step 7: Run the formatter**

```bash
cd front && npm run format
```

Expect it to rewrite essentially every file: `prettier --check` against the
pre-refactor tree flagged **27 of 27** files under `src/`. The largest sources of
churn are the four-space indentation in `Home.css`, `CodeRain.css`,
`LanguageToggle.css`, `LanguageToggle.js` and `Footer.js`, and the single-quote
files listed in step 3.

`NameLogo.js` is 1.19 MB with one 1.13 MB attribute value. Prettier handles it —
it will not break a string literal — but it takes a few seconds. Do not add it
to `.prettierignore`; a file excluded from the sweep is a file that drifts.

- [ ] **Step 8: Confirm nothing but formatting changed**

```bash
cd front && CI=true npx react-scripts test --watchAll=false
```

Expected: PASS, with **the same suite and test counts as step 1**. A changed
count means something other than formatting happened.

```bash
git diff --stat
git diff -- front/src/data/projects.js
```

The `--stat` should list every file under `front/src`. Read the
`data/projects.js` diff in full: it is the file where a formatter mangling a
string would matter most, and it is short enough to check by eye. Every URL,
every project name and every technology string must be character-identical.

If any diff shows a changed string literal, revert and investigate before going
further.

- [ ] **Step 9: Build once more**

```bash
cd front && CI=true npx react-scripts build
```

Expected: succeeds. `CI=true` on purpose here and nowhere else in this plan: it
turns the build's ESLint warnings into errors, which is the strictest reading of
the `.eslintrc.json` created in step 4 and the only check that it is actually
being picked up by `react-scripts`. The real deploy builds inside Docker with
`CI` unset, so this is deliberately stricter than production.

If it fails on a warning, do **not** relax the config to make it pass. Fix the
code in a separate commit before the sweep, or — if the warning is one
`eslint-config-react-app` was already emitting before this task — record it in
`docs/decisions/0004-deferred-findings.md` and rerun with `CI=false`.

The gzipped `main.*.js` may move by a few bytes; that is minification responding
to the reformatted source and is fine.

- [ ] **Step 10: Commit formatting alone**

```bash
git add -A
git commit -m "style: adopt Prettier and apply it across the front-end"
```

- [ ] **Step 11: Record the sweep so blame stays readable**

```bash
git rev-parse HEAD
```

Create `.git-blame-ignore-revs` at the **repository root** — not in `front/`:

```
# Commits that only reformat. Enable with:
#   git config blame.ignoreRevsFile .git-blame-ignore-revs
# Prettier sweep, 2026-08-22
<paste the SHA printed above>
```

- [ ] **Step 12: Commit it and enable it locally**

```bash
git add .git-blame-ignore-revs
git commit -m "chore: ignore the formatting sweep in git blame"
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

- [ ] **Step 13: Document the tooling**

Add a "Formatting" section to `docs/technical.md` stating:

- `cd front && npm run format` rewrites; `npm run format:check` only reports.
- `cd front && npm run lint` runs ESLint with `react-app` plus `eslint-config-prettier`.
- Prettier and `eslint-config-prettier` are pinned exactly, on purpose.
- Every fresh clone needs the one-time `git config blame.ignoreRevsFile .git-blame-ignore-revs` for `git blame` to skip the sweep.

```bash
git add docs/technical.md
git commit -m "docs: record the formatting tooling"
```

---

## Phase D — Verify

### Task 13: Full verification and handover

**Files:**
- Modify: `docs/decisions/0004-deferred-findings.md`

**Interfaces:**
- Consumes: everything above.
- Produces: the verification record the reviewing session reads before merging.

- [ ] **Step 1: Run the suite from a clean install**

```bash
cd front && rm -rf node_modules && npm ci && CI=true npx react-scripts test --watchAll=false
```

Expected: PASS. `npm ci` rather than `npm install`, because that is what the
GitHub Actions test job runs and it is the only way to catch a
`package-lock.json` that Task 11 left inconsistent with `package.json`.

Record the suite and test counts.

- [ ] **Step 2: Build the image the way the deploy does**

```bash
docker compose build frontend
```

Expected: the image builds. Task 11 deleted files from `front/public` and Task 7
added `front/src/data` and `front/src/components/NameLogo.js`; a stale path
surfaces here rather than during a production deploy.

- [ ] **Step 3: Run the built image and check the real thing**

```bash
docker compose up -d frontend
docker compose ps
```

Expected: the container reports healthy — `docker-compose.yml:6` polls
`http://127.0.0.1:8080/` every 15 s.

Then browse to the container's port and walk the whole checklist one last time,
in both themes and at both a wide and a 500 px viewport:

1. The wordmark draws itself on load.
2. The navbar appears after scrolling past the home section, and its links jump to the right sections.
3. All four project cards render with their background images; the Angular filter leaves one card; every card's button opens its site in a new tab.
4. The About portrait loads from `/images/me.png` and all nine skill bars fill.
5. The footer's LinkedIn and GitHub icons render — this is the check on the FontAwesome dependencies Task 11 pruned.
6. Switching to French changes the copy and survives a reload.
7. Switching to dark mode changes the palette and survives a reload.
8. Tabbing shows a visible focus ring on every control.

```bash
docker compose down
```

- [ ] **Step 4: Confirm nothing was left in a half-moved state**

```bash
grep -rn "index.css" front/src
grep -rn "myWorkNoProject\b" front/src
grep -rn "hsla(182" front/src --include=*.css
grep -rn "Your Name" front/src
```

Expected: the first, second and fourth print nothing; the third prints six lines,
all in `front/src/styles/tokens.css`.

- [ ] **Step 5: Confirm the CI workflow still matches**

```bash
grep -n "working-directory\|react-scripts test\|npm ci" .github/workflows/deploy.yml
```

Expected: `working-directory: front` on lines 19 and 22, `npm ci` on line 20,
`npx react-scripts test --watchAll=false` on line 25. This plan changes none of
them — the gate runs exactly the suite that was just extended from 1 test to the
count from step 1.

- [ ] **Step 6: Complete the deferred findings record**

`docs/decisions/0004-deferred-findings.md` must list everything found and not
fixed, each with a reason. At minimum, the six seeded in Task 1 plus:

- the `CodeRain` mouse listeners (Task 6)
- the non-theme-switching accent tokens (Task 9)
- the `theme_color` coupling between `manifest.json` and `index.html`, left alone because the two agree today (Task 11)
- anything surprising found while running the characterization tests in Phase B

```bash
git add docs/decisions/0004-deferred-findings.md
git commit -m "docs: record what this cycle deliberately left alone"
```

- [ ] **Step 7: Write the handover summary**

Report to the reviewing session. State:

- the suite result and test count, before (1 test) and after
- the `docker compose build` result and the healthcheck result
- the defects fixed and the test covering each: the missing contact-form bot defence (Task 5), the `requestAnimationFrame` leak and the broken translation key (Task 6), the placeholder `alt` text, the `div`-as-button, the missing `main` landmark, the missing `lang` synchronisation, the doubled filter-button name and the missing focus indicator (Tasks 8 and 10), the dead web-vitals API (Task 11)
- the measurements: 3.6 MB of unreferenced assets deleted, four unused dependencies removed, 51 duplicated CSS declarations and 9 hard-coded colour literals eliminated
- the list of deferred findings, with the pointer to ADR `0003` for the seven contrast failures

- [ ] **Step 8: Push the branch and stop**

```bash
git push -u origin refactor/santoriello-ch
```

Do not open a pull request and do not merge to `main`. Per Spec D6 the reviewing
session reads the diff, re-runs the suite, and merges.

---

## Deployment note

Merging to `main` triggers `.github/workflows/deploy.yml`, which runs the suite
and then rsyncs `front/` to the VPS and rebuilds the container there. After the
reviewing session merges, confirm the live site recovered:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://santoriello.ch/
```

Expected: `200`.

A `000` with exit 60 means the hostname resolved but no Traefik router matched.
That is a routing symptom, not a certificate failure — see `docs/runbook.md`
before touching certificates.

Then load the site in a browser once, on a phone as well as a desktop, and check
the contact form end to end by sending a real message. Task 5 changed that form,
and it is the only path on the site whose failure is silent: a broken form does
not 500, it just stops delivering mail.
