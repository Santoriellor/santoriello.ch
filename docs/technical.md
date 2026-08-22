# Technical

## Prerequisites

- Node 20 (the Dockerfile's build stage pins `node:20-alpine`; there is no
  `.nvmrc` in the repository).
- No environment variables are required to build or run the app locally —
  there is no `.env` file and no `REACT_APP_*` variable read anywhere in
  `front/src`.

## Local development

```bash
cd front
npm ci
npm start
```

`npm start` runs `react-scripts start` (`front/package.json:23`). `npm run
build` (`react-scripts build`) produces the same `build/` directory the
Dockerfile's stage 1 produces; `npm test` runs `react-scripts test` against
the one existing spec, `front/src/App.test.js`.

## The contact form

The form at `front/src/components/Contact.js:52-56` posts `method="POST"` to
`https://api.web3forms.com/submit`, a third-party form-relay service.
Visitor name, e-mail address and message leave the browser directly to
Web3Forms — they never touch any host under this estate's control.

The Web3Forms `access_key` is a *public* identifier, not a secret: it selects
the destination inbox and is required to be present in the submitted form. It
is committed in the repository at `front/src/components/Contact.js:60`
(`value="c9e4e021-c095-4eb8-95f2-a93d49403bd6"`), and it is present in every
built bundle regardless. Moving it to a `REACT_APP_*` environment variable
would **not** hide it — `react-scripts` inlines any `REACT_APP_*` value into
the bundle at build time, so the key would still ship to every visitor, just
via a different source file. There is no code fix available here.

Rotation is therefore a dashboard action on web3forms.com, not a code change.
Domain restriction and captcha are also dashboard settings, not something
this repository configures.

The form carries Web3Forms' honeypot field: a `botcheck` checkbox, hidden with
`style={{ display: "none" }}` (which also removes it from the accessibility
tree and tab order), never `required`. A human never sees or fills it; a bot
that fills every field in the form does, and Web3Forms silently drops any
submission where it arrives non-empty. This is the only spam defence that can
live in this repository — everything else is dashboard configuration on
web3forms.com:

- Restrict allowed domains for the access key in the Web3Forms dashboard, so
  the key stops working when POSTed from anywhere but `santoriello.ch`.
- Enable hCaptcha or Cloudflare Turnstile there if the honeypot proves
  insufficient.

See `docs/decisions/0004-deferred-findings.md`.

## CI/CD

`.github/workflows/deploy.yml` runs on every push to `main` and defines two
jobs:

- **`test`** — checks out the code, sets up Node 20, runs `npm ci` in
  `front/`, then runs `npx react-scripts test --watchAll=false` with `CI:
  true` set in the environment (`CI: true` makes CRA's test runner exit
  non-interactively instead of watching).
- **`build-and-deploy`** — declares `needs: test`, so it only runs once the
  test job succeeds. It is additionally guarded with `if: github.ref ==
  'refs/heads/main'`, so a widened trigger cannot make it deploy from a
  feature branch. It copies the repository to the VPS over `rsync` and then
  runs `docker compose build frontend` and `docker compose up -d frontend`
  over SSH.

The deploy step runs two `rsync` calls with different flags, and the
difference is deliberate, not an oversight:

```bash
rsync -avz --delete ./front/ "$VPS_USER@$VPS_HOST:$VPS_DEPLOY_PATH/front"
rsync -avz docker-compose.yml "$VPS_USER@$VPS_HOST:$VPS_DEPLOY_PATH/"
```

The first call, whose source is the `front/` directory, carries `--delete`:
the server-side `front/` now mirrors the repository exactly, so a file that
gets renamed or removed in the repo no longer lingers on the VPS after
deploy. The second call, whose source is the single file
`docker-compose.yml`, deliberately does **not** carry `--delete`. If it did,
rsync would treat every other file already present at `$VPS_DEPLOY_PATH/` —
including the just-synced `front/` directory — as extraneous relative to a
source that contains only `docker-compose.yml`, and delete it. The asymmetry
exists because the two calls have different-shaped sources (a directory
versus a single file), not because one of them was forgotten.

Task 12 added `prettier --check` and `eslint` steps to this same `test` job,
after `npm ci` and before the test step, so a formatting or lint violation now
blocks a deploy the same way a failing test does.

## Formatting

`cd front && npm run format` rewrites every file under `src/**/*.{js,css,json}`
with Prettier; `npm run format:check` runs the same check without writing,
which is what CI runs.

`cd front && npm run lint` runs ESLint (`eslint src --ext .js`) against
`front/.eslintrc.json`, which extends `react-app`, `react-app/jest` and
`prettier` — the last so `eslint-config-prettier` can switch off the
stylistic rules that would otherwise argue with the formatter. This is the
same `react-app`/`react-app/jest` rule set the inline `eslintConfig` key held
before Task 12; no rule was added or promoted to error. One override exists:
`testing-library/no-container` and `testing-library/no-node-access` are off
for `*.test.js` files, because several characterization tests deliberately
assert DOM structure (section order, the `main` landmark, the Web3Forms
honeypot's attributes) that Testing Library's semantic queries have no
faithful equivalent for; `react-scripts build` never linted test files in the
first place, so this is not a change to what was previously enforced there.

Prettier and `eslint-config-prettier` are pinned exactly (`3.4.2` and
`9.1.0`), on purpose: a formatter or its config that drifts with a caret
range produces spurious diffs in unrelated pull requests.

The formatting sweep that reformatted the whole tree at once is recorded in
`.git-blame-ignore-revs`. Every fresh clone needs the one-time
`git config blame.ignoreRevsFile .git-blame-ignore-revs` for `git blame` to
skip it.

## Assets

Static assets live under `front/public` (served as-is by nginx) and
`front/src/assets` (bundled by webpack, currently just `translations.js`).
Project thumbnail images referenced by `front/src/components/MyWork.js` live
at `front/public/images/projects/`. An unreferenced copy of the site's
wordmark also exists at `front/public/images/santoriello.svg` — see
`docs/decisions/0002-inline-wordmark-svg.md` for why it is not simply used
in place of the inline SVG in `Home.js`.
