# Runbook

## Where the logs are

The site is a static build served by nginx; there is no application server
producing its own logs. On the VPS, container logs are the nginx access/error
logs of the `frontend` service defined in `docker-compose.yml`:

```bash
docker compose logs -f frontend
```

The compose healthcheck (`wget -q -O /dev/null http://127.0.0.1:8080/`) is
what `docker compose ps` uses to report the container as healthy; a
container stuck `unhealthy` for more than the `start_period` (10s) with 3
failed retries at a 15s interval is the first thing to check when a deploy
looks like it succeeded but the site doesn't respond.

## Redeploying

Pushing to `main` is the only redeploy path today; there is no manual deploy
trigger in `.github/workflows/deploy.yml`. The `test` job must pass before
`build-and-deploy` runs at all (`needs: test`) — a failing
`react-scripts test` blocks the deploy, it does not just warn.

To redeploy without a code change (e.g. to pick up a `docker-compose.yml`
edit), push an empty or trivial commit to `main`; there is no `workflow_dispatch`
trigger configured.

On the VPS itself, the deploy job's last step is:

```bash
cd "$VPS_DEPLOY_PATH"
docker compose build frontend
docker compose up -d frontend
```

which can be run by hand over SSH if a manual rebuild is ever needed without
going through GitHub Actions.

## The contact form stopped delivering

The site sends nothing itself — the browser posts straight to Web3Forms
(`docs/technical.md`), so there is no outbound mail step in this repository
to debug. If mail stops arriving, check the Web3Forms dashboard for the
access key at `front/src/components/Contact.js:62` — quota, a blocked
domain, or spam filtering on Web3Forms' side — before touching this
repository. A code change here cannot fix a delivery problem on Web3Forms'
side.

## Hostname or certificate problems

This project is served at the apex domain `santoriello.ch` only (no `www.`
router is defined in `docker-compose.yml`). Traefik answers requests for
hostnames it has no router for with its default certificate rather than
refusing the connection, which `curl` reports as **exit 60** (SSL
certificate problem: the presented certificate doesn't match the requested
host). Seeing exit 60 against `santoriello.ch` is a symptom of a missing or
misconfigured Traefik router for that host — check
`docker-compose.yml`'s `traefik.http.routers.santoriello-frontend.rule` and
that the shared Traefik instance has picked up the label (it watches the
Docker socket, so this usually means the container needs to be recreated,
not just restarted) — it is not evidence of a broken certificate.
