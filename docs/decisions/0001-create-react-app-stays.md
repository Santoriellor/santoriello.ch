# 0001 — Create React App stays

## Status

Accepted.

## Context

`front/package.json:15` pins `react-scripts` at `5.0.1`. Create React App is
no longer maintained. Every `npm test`, `npm start` and `npm run build` in
this repository already prints the upstream warning that
`babel-preset-react-app` imports
`@babel/plugin-proposal-private-property-in-object` without declaring it,
alongside the sentence:

> babel-preset-react-app is part of the create-react-app project, which is
> not maintianed anymore.

(upstream's typo — "not maintianed anymore" — quoted here as it appears in
`node_modules/@babel/plugin-proposal-private-property-in-object/lib/index.js`).

## Decision

CRA stays for this cycle. Per the estate spec's D1 ("Stacks stay. No CRA to
Vite migration..."), no framework or build-tool migration is in scope here.

## Consequences

No dependency updates to `react-scripts` or its transitive Babel/webpack
tooling are expected to arrive. A future cycle that wants a maintained
toolchain migrates to Vite, and that migration is a project of its own: it
touches `front/public/index.html` (the `%PUBLIC_URL%` placeholder Vite does
not use the same way), the Jest configuration (Vite's test runner is not
Jest by default), and `front/Dockerfile`'s build stage together — it is not
a drop-in swap of one dependency.

The one workaround this cycle deliberately does **not** take: adding
`@babel/plugin-proposal-private-property-in-object` to `devDependencies` to
silence the warning is explicitly not done. It would silence a warning
without fixing anything, and it adds a dependency the app itself does not
use anywhere in `front/src`.
