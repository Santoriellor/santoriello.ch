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

The real gap is that the form has no bot protection: no honeypot field, no
CAPTCHA, nothing that distinguishes a script filling in `access_key` directly
from a visitor using the page. See
`docs/decisions/0004-deferred-findings.md`.

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

Later, Task 12 is expected to add `prettier --check` and `eslint` steps to
this same `test` job, so formatting and lint violations block a deploy the
same way a failing test does today. That is not yet the case as this
document is written.

## Formatting

Formatting and linting are not yet enforced in `front/`: `package.json`
declares only `"eslintConfig": { "extends": ["react-app", "react-app/jest"] }`
(`front/package.json:28-31`), which is CRA's bundled ESLint config that runs
as part of `react-scripts` compilation, and there is no Prettier
configuration, no `.prettierrc`, and no standalone `eslint` script.

## Assets

Static assets live under `front/public` (served as-is by nginx) and
`front/src/assets` (bundled by webpack, currently just `translations.js`).
Project thumbnail images referenced by `front/src/components/MyWork.js` live
at `front/public/images/projects/`. An unreferenced copy of the site's
wordmark also exists at `front/public/images/santoriello.svg` — see
`docs/decisions/0002-inline-wordmark-svg.md` for why it is not simply used
in place of the inline SVG in `Home.js`.
