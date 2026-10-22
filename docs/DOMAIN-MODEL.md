# Domain model

## Current prototype entities

| Entity | Purpose | Prototype representation |
| --- | --- | --- |
| Case | Missing-item report and aggregate status | `cases[]` in the local JSON/browser store |
| Search task | Accountable check for one onboard, station or terminal team | `case.searchTasks[]` |
| Found item | Synthetic inventory reference and storage location | `items[]`; private proof is never returned by read APIs |
| Event | Append-only application event for the demo timeline | `case.events[]` |
| Custody event | Recorded transfer after ownership verification | `case.custody[]` |
| Route | Explicitly synthetic stopping pattern | `coordination.mjs` route fixtures |

## Important invariants

- search responses require prior task acknowledgement;
- a found response references an available item of the same category;
- a found response never verifies ownership;
- private identifying proof is not included in public/API read responses;
- one found item cannot be verified for two cases;
- collection requires verified ownership and an accepted custody handover;
- negative or unavailable tasks do not close the loss case;
- all mutation rules are applied in the shared domain module used by the Node and Pages adapters.

## Production target

A production implementation should separate users, organisations, roles, journeys, train services, stations, cases, tasks, responses, evidence, match candidates, custody events, escalations, notifications, audit events and data-subject requests in a transactional database. The operator's existing report and inventory identifiers should be correlated rather than duplicated.
