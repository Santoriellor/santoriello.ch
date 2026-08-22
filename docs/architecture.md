# Architecture

## Overview

`santoriello.ch` is a single-page React 19 site built with Create React App
(`react-scripts` 5.0.1). It has no backend of its own: the only outbound
network call the app makes is the contact form posting directly to a
third-party relay (see `docs/technical.md`). The whole site is one page —
four full-height sections stacked vertically, navigated by anchor links.

## Component tree

`front/src/index.js` mounts the tree inside `React.StrictMode`:

```
<React.StrictMode>
  <LanguageProvider>
    <App />
  </LanguageProvider>
</React.StrictMode>
```

`front/src/App.js` renders `DropdownMenu` and one `<main>` landmark wrapping
`Home`, `AboutMe`, `MyWork`, `Contact`, in that order. `Footer` is **not** one
of `App`'s children — it is rendered by `Contact` itself, at
`front/src/components/Contact.js:102`, as the last element inside
`<section id="contact">`. There is one `<footer>` element on the page and it
lives nested inside the contact section, not as a sibling of it.

`Home` additionally renders `CodeRain` (an animated background) and
`NameLogo` (the wordmark, its own component since Task 7 — see
`docs/decisions/0002-inline-wordmark-svg.md`), and `DropdownMenu` renders
`ThemeToggle` and `LanguageToggle`.

## Navigation

**There is no router.** `react-router-dom` used to be declared in
`front/package.json` but was imported by no file in `front/src`; Task 11
removed it along with three other unused dependencies and 3.6 MB of
unreferenced assets. Navigation is four `<a href="#home">` / `#about-me` /
`#my-work` / `#contact`
links inside `DropdownMenu` (`front/src/components/DropdownMenu.js:57-66`);
the browser's native fragment-scroll does the rest.

`document.getElementById` appears in three places
(`front/src/components/Home.js:37`, `front/src/components/DropdownMenu.js:37`,
and `front/src/index.js:9` for the React root) but in every case it is used to
grab a section's own root node so its `IntersectionObserver` can watch it —
none of these calls drive scrolling. There is no `window.scrollTo` call
anywhere in `front/src`; scrolling to a section is entirely native browser
behaviour triggered by the anchor `href`.

`front/nginx.conf` still carries a `try_files $uri $uri/ /index.html;`
fallback (a single-page-app catch-all). It is not needed for anything this
app currently does — there are no client-side routes to fall back into — but
it is harmless and worth keeping: it means a direct hit or refresh on any
path still resolves to `index.html` instead of a bare nginx 404, and it costs
nothing to leave in place.

## The reveal mechanism

`Home`, `AboutMe`, `MyWork`, `Contact` and `DropdownMenu` each construct their
own `IntersectionObserver` inside a `useEffect` on mount, and each tears it
down (`observer.disconnect()` or `observer.unobserve()`) in the effect's
cleanup function. Four of the five toggle an `.animate` class on their own
descendants — title, separator, description text, and (in `Home`) each
`.svg-path`, and (in `MyWork`) every `.project` card — when their section
crosses a threshold (0.5 for `Home`, 0.2 for the others).

`DropdownMenu` uses its observer for the opposite purpose:
(`front/src/components/DropdownMenu.js:26-35`) it watches `#home` and toggles
a `hidden` class on the navbar itself, hiding the menu while the hero section
is on screen and revealing it once the visitor scrolls past.

## Theme and language

`ThemeToggle` (`front/src/components/ThemeToggle.js`) writes
`data-theme="light"` or `data-theme="dark"` onto `document.documentElement`
and mirrors the same value into `localStorage.theme` via
`localStorage.setItem("theme", theme)`. On mount it reads the stored value,
falling back to `window.matchMedia("(prefers-color-scheme: dark)")` when
nothing is stored. Every themed colour in the app is a CSS custom property
defined once on `:root` and overridden under `[data-theme="dark"]` in
`front/src/styles/tokens.css:13-37` — components never branch on theme in
JavaScript. `tokens.css` also defines a third, non-theme-switched `:root`
block (`--accent`, `--accent-strong`, `--accent-faint`, `--on-dark`,
`--reveal-transition`, `--section-top-padding`); see
`docs/decisions/0004-deferred-findings.md` for why the accent tokens
deliberately do not switch while `--link-color` does.

`LanguageContext` (`front/src/contexts/LanguageContext.js`) holds `language`,
`changeLanguage` and `translate`. `language` is initialised from
`localStorage.getItem("language")` (default `"en"`), and `changeLanguage`
persists the new value back to `localStorage.language`. The three
dictionaries (`en`, `fr`, `de`) live in `front/src/assets/translations.js`;
see `docs/design.md` for how `translate` behaves against them.

## Build and deployment

The build is a two-stage `front/Dockerfile`: stage 1 runs `npm ci` and
`npm run build` (i.e. `react-scripts build`) in `node:20-alpine`; stage 2
copies the `build/` output into `nginxinc/nginx-unprivileged:1.29-alpine` and
serves it on port 8080 (an unprivileged image cannot bind a port below 1024).
`front/nginx.conf` and `docker-compose.yml` both carry comments noting that
this port must stay in step with the `loadbalancer.server.port` label below.

`docker-compose.yml` defines one service, `frontend`, built from `./front`,
with a `wget`-based healthcheck against `http://127.0.0.1:8080/`. Its Traefik
labels register `Host(\`santoriello.ch\`)` on the `websecure` entrypoint with
the `le` cert resolver, and attach two middlewares from Traefik's shared file
provider: `security-headers@file` and `gzip-compress@file`. The service joins
the external `proxy-network`, which is how it reaches the shared Traefik
instance that also serves the estate's other live sites.

Deployment itself — what triggers it, and how the repository gets onto the
VPS — is described in `docs/technical.md`'s CI/CD section, including an
asymmetry between the two `rsync` calls in `.github/workflows/deploy.yml`
that is easy to miss and easy to break.
