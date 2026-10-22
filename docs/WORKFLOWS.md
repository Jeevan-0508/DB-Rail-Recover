# RailRecover workflows

## Passenger intake

1. Passenger submits a minimum missing-item report.
2. System validates the route, station and item fields.
3. A case reference is created and a synthetic route fan-out is shown.
4. Passenger can inspect task states, recorded responses and unresolved questions.

## Team response

1. A named demo desk accepts its task.
2. The desk records `Found`, `Checked — not found` or `Unable to check` with a scope/reason.
3. The shared timeline records actor and time.
4. Overdue pending or accepted tasks may be escalated manually.

## Candidate and custody

1. A staff user reviews a potential item candidate.
2. The match explanation is treated as a review aid only.
3. Ownership is verified using a private identifying detail.
4. An accepted handover records a custody transfer.
5. Simulated collection closes the case only after verification and handover.

## Case 001 workflow proposal

Case 001 would remain unresolved until an authorised operator could verify a recovery event. RailRecover would display the difference between unacknowledged tasks, completed negative checks, potential matches and confirmed custody. It would not reconstruct missing journey facts or access CCTV.
