# Limitations and unfinished work

The current build is a dependency-free prototype, not a deployable railway operations system.

- no authentication or role-based authorisation;
- no persistent database, migrations or multi-tenant isolation;
- no real railway journey, roster, inventory, notification or CCTV integration;
- no safe file-upload pipeline;
- no bilingual UI yet, although the domain is designed to accept translated templates;
- no background escalation worker or calibrated statistical matching;
- no full case-state machine beyond the demonstrated report/search/candidate/custody flow;
- no passenger access isolation or data-subject request UI;
- simulation uses illustrative response targets, not operator SLAs;
- metrics are demo counts, not evidence of operational improvement.

The next engineering milestone should be an authenticated, operator-reviewed shadow-mode pilot with a real journey adapter contract, object-scoped access control, transactional persistence, notification receipts and a privacy/security review.
