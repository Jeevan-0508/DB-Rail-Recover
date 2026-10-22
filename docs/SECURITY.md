# Security posture

## Implemented in the prototype

- server-side domain validation for mutations;
- same-origin check on local mutation requests;
- JSON body size limit;
- strict response content type and basic security headers;
- atomic replacement of the local JSON data file;
- private item proof excluded from read responses and match ranking;
- explicit ownership and custody gates;
- append-only application events within the demo record.

## Threats considered

The design considers false ownership claims, fake found-item submissions, cross-case item claims, evidence leakage, malicious reports, insider misuse, and confusing a similarity score with proof.

## Not production-ready

The demo has no authentication, staff SSO, organisation or case-level access control, rate limiting, malware-safe file upload pipeline, encrypted storage, tamper-evident audit log, background worker, secrets management or incident response. Do not enter real passenger data. A production security review is required before any operational pilot.
