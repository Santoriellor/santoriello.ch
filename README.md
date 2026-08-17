[![Deploy](https://github.com/Santoriellor/santoriello.ch/actions/workflows/deploy.yml/badge.svg)](https://github.com/Santoriellor/santoriello.ch/actions/workflows/deploy.yml)

# santoriello.ch

Portfolio index for the santoriello.ch estate — links to the other projects deployed alongside it.
React (create-react-app), served by nginx.

Live: <https://santoriello.ch>

## Running locally

```bash
cd front
npm ci
npm start
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which rsyncs `front/` and
`docker-compose.yml` to the VPS and rebuilds the container there. A shared Traefik instance
terminates TLS and applies the security-header middleware.

The container runs nginx unprivileged as uid 101 on port 8080; the Traefik
`loadbalancer.server.port` label must stay in step with it.
