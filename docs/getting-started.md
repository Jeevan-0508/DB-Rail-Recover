# Getting started

RailRecover is a route-aware coordination prototype for railway lost-property reports. One passenger report becomes targeted tasks for relevant teams, and each response is visible in the shared case.

## Try the prototype

Open the [live demo](https://Jeevan-0508.github.io/DB-Rail-Recover/), then walk through the Hamburg → Nürnberg example. Compare the passenger view with the staff view and inspect how a request records team, time, scope and response status.

The demo uses synthetic journeys and records. It is an independent concept, not a Deutsche Bahn system or an assertion about Deutsche Bahn policy.

## Run locally

Node 22 or newer is required:

```bash
npm install
npm run build
npm test
npm run check
npm start
```

Open the local URL printed by the server. The static Pages build and the local server share the same domain logic, while the demo API supplies deterministic sample responses.

## Research boundary

The prototype explores coordination before or alongside an existing inventory process. It does not replace ownership verification, chain-of-custody controls, safety procedures or production railway integrations.
