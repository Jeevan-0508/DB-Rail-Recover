# Route-based shared search coordination — v0.3

## Implemented

Browser interface → browser adapter or local Node API → coordination and ownership rules → browser storage or atomic JSON store.

One case contains independent `searchTasks`. Each has team name, kind, intended scope, sent/accepted/response timestamps, due time, note, found-item reference and escalation count. Team results are preserved independently. Every desk can inspect every synthetic case; the desk filter changes which task controls appear, not shared visibility.

## Routing

Two illustrative journeys are fixtures, not DB timetable data. Input station must occur on the chosen fixture. Recipients are the onboard team, stations after passenger exit and a destination cleaning/depot team. Station tasks check local inventory/handover desks; onboard and terminal tasks request train checks. No actual crew roster, message delivery or itinerary validation exists.

An optional existing-report reference is stored as plain demo text. It is not verified or exchanged with DB. Unknown legacy routes receive an unconfirmed coordination task rather than a fabricated endpoint. Legacy stations found in a fixture gain explicitly illustrative tasks; no historical check is inferred.

## Team transitions

Pending → Accepted → Found / Checked — not found / Unable to check.

A response requires prior acceptance and a check description/reason. Found requires an available registered item of the case's category. A negative or unavailable response never closes a case. Found does not verify ownership or reserve the inventory item. Separate human candidate review and private-detail verification control reservation. Two cases cannot verify the same item. Collection requires a recorded handover.

Overdue Pending or Accepted tasks can be manually escalated; the event is recorded and an illustrative 15-minute follow-up deadline is set. No background scheduler or outbound supervisor message exists.

## Aggregate visibility

The case shows responded-task count, all individual outcomes, pending checks, recorded possible-item locations and ownership status. A station without a task on the remaining route can still inspect the shared case. Partial negatives and silence are never presented as permanent loss.

Standard acknowledgment/response targets: 30/60 minutes. Urgent essentials: 15/30 minutes. These are demonstration settings, not operational commitments.

## Ownership compatibility

The old standalone acknowledgment/search-result/escalation API actions have been removed; team-specific actions now address a task ID. Found-item matching, verification and collection remain demonstrative compatibility flows for the final handoff. Production should reference operator inventory, not create a separate competing store.

## Production architecture

Authenticated passenger and staff applications → object-scoped API → transactional cases, team tasks and response records → outbox → notification and escalation workers. Confirm actual journey instances and team ownership with operator-approved adapters. Correlate the existing loss-report ID and inventory references.

Required before a pilot with real data:

- Passenger access isolation and staff SSO; desk selector must become an authorised identity.
- Need-to-know cross-station access, rather than unrestricted case visibility.
- Current journey, stopping pattern, staff coverage, terminal/depot and rerouting confirmation.
- Capacity-aware task routing, bounded recipients and explicit acceptance/rejection.
- Delivery receipts and retries; creation is not delivery, delivery is not acceptance.
- Authenticated evidence of check scope and outcome; revisions/reopens must preserve history.
- Concurrent find/dispute handling and verified collection readiness.
- Independent custody sender/receiver acknowledgments.
- Operator-agreed urgent-item policy, service targets and alternative assistance.
- Privacy roles/legal basis, retention/erasure, security review, incident response, backups and tamper-resistant logs.

DB already uses NovaFind. Public documentation establishes matching/history/storage capabilities, not the exact deployment of this proposed early-search process. Integration feasibility and novelty remain unconfirmed.
