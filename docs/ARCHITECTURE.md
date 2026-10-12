# Architecture

## Implemented v0.1

Browser (HTML/CSS/ES modules) → Node HTTP API → domain transition rules → single-process JSON store.

The API serializes mutations and atomically replaces the persisted file. Failed transitions are discarded. State reads and match responses omit private inventory evidence. Backend validation and escaped HTML output prevent submitted descriptions from being rendered as markup.

The synthetic demo intentionally has no accounts. The UI view selector is not a security boundary. The default localhost binding is part of its deployment scope.

### Entities

Loss case: item description, journey fields, assigned demo team, search task status, acknowledgment deadline, case status, candidate reference, verification flag, custody records and audit events.

Found item: descriptive fields, journey label/date, storage location, private identifying detail and reservation reference.

### State rules

Reported → Searching → Candidate review → Verified → Ready for collection → Returned.

Searching can instead become Awaiting inventory after a negative search. Candidate rejection returns to Awaiting inventory. A negative check never closes the loss case. Reservation blocks two cases claiming the same item. A return requires verification plus a recorded accepted handover. Manual escalation applies only to overdue unacknowledged tasks.

### Match score

Same category is required (+25). Same train label adds 40; same date 20; same colour 15. This is an illustrative ranking rule, not a calibrated probability. Date equality is intentionally simple and does not handle overnight/multi-day journeys. No machine learning is used.

## Proposed operator architecture

Authenticated passenger and staff apps → tenant-scoped API → PostgreSQL with transactionally enforced reservations and custody events. A transactional outbox feeds notification and workflow workers. An approved journey adapter and operator roster drive routing. Operator-authorised inventory connectors reconcile reports and found records.

Production responsibilities:

- Separate passenger access from staff roles; use operator SSO, least privilege and object-level access checks.
- Model journey instances, service dates, rerouting, cancellations, staffing, shift changes and cross-operator ownership.
- Create accepted search assignments with capacity limits and business-hours-aware deadlines.
- Require independent sender/receiver acknowledgments for custody transfers.
- Use idempotency keys and revision checks for actions; deduplicate inbound messages and retry notification delivery.
- Verify ownership through operator-agreed evidence and authorised staff; do not expose private distinguishing details.
- Define legal basis, controller/processor roles, retention, erasure, access auditing and incident response with the operator.
- Encrypt storage and transit; redact telemetry; establish backup/restore and penetration testing.
- Evaluate whether a DPIA is required for the actual processing; do not declare compliance solely from design choices.
- Introduce automatic escalation only after staffing and targets are agreed.

DB timetable API documentation indicates credentialed timetable access. It does not grant access to staff dispatch or lost-property inventory. No public operational integration is assumed.

## Acceptance tests for a real pilot

Role isolation; no cross-passenger data leakage; disputed and double claims; overnight journeys; unavailable crews; changing endpoints; late finds; concurrent updates; duplicate events; offline handovers; notification retries; stale candidates; retention execution; tamper-resistant logging; restoration from backup.
