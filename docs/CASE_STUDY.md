# From loss report to accountable search

Research snapshot: 12 October 2026. This is an exploratory case study, not an audit of Deutsche Bahn.

## Incident account

A traveller returning from a business trip left a laptop bag in an ICE luggage area when disembarking in Nürnberg. The passenger account states that railway loss and police reports were submitted promptly. At a subsequent station visit, the passenger did not obtain confirmation of a train check, an assigned search owner or a recovery outcome.

Exact journey date, train identity, route endpoint, report timestamps and the quoted three-working-day response period remain unverified. No employer/client names, report identifiers or real inventory descriptions are included. The application's sample journey and items are synthetic, not reconstructed incident evidence.

## Verified public baseline

DB already operates online reporting and matching against registered found items. DB InfraGO warns that items may reach the service after several hours or 1–2 days. Items found after a journey normally reach the lost-property office at the station where that journey ended. Uncollected local items transfer to Wuppertal after seven days. DB describes a four-week search period; unsuccessful searches end without a closure notification.

DB publishes 3-S station coordination contacts. Their existence contradicts an absolute claim that no communication mechanism exists; public guidance alone does not establish an immediate lost-bag search entitlement.

SBB offers a conditional paid express search. For an eligible train, it requires passenger attendants and at least 30 minutes of remaining travel; its published process promises an outcome update within four hours. This is a comparator, not proof of feasibility in Germany.

## Hypothesis

Passengers may experience an observability and accountability gap between submitting a report and physical registration of an item. A shared workflow with accepted search ownership, distinct states and explicit next-update deadlines could reduce uncertainty. One incident cannot establish the prevalence or root cause of the gap.

## Proposed controls

| Failure mode | Proposed control | Validation needed |
| --- | --- | --- |
| Unclear responsibility | Assigned task and acceptance record | Actual team responsibilities and shift coverage |
| Report mistaken for search | Distinct Reported and Searching states | Passenger comprehension tests |
| Missing updates | Deadline and escalation | Feasible operator service targets |
| Late inventory registration | Persistent open loss case | Inventory latency and reconciliation |
| Similar items | Candidate explanation and private verification | False-match and disputed-claim testing |
| Item transfer uncertainty | Accepted custody record | Physical handover practice |

## Evaluation plan

Interview station staff, onboard staff and lost-property teams before attributing causes. Reconstruct the consented incident timeline from redacted evidence. Measure median and p90 acknowledgment times, unowned/overdue tasks, time to inventory registration, incorrect match rates, custody completeness and passenger comprehension. Compare against an operator-provided baseline. Do not claim recovered-value or recovery-rate improvement without measured evidence.

## Sources

Primary sources accessed 12 October 2026:

1. DB InfraGO Fundservice: https://www.bahnhof.de/service/fundservice
2. DB English lost & found service: https://int.bahn.de/en/help/contact/lost-luggage
3. DB 3-S centres: https://www.bahnhof.de/service/3-s-zentrale
4. SBB express search: https://www.sbb.ch/en/help-and-contact/lost-found-office/submit-express-search-request.html
5. DB Timetables API: https://developers.deutschebahn.com/db-api-marketplace/apis/product/timetables
6. GDPR, especially Articles 5, 25 and 32: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679

Links and processes can change. The three-working-day statement is not confirmed by these sources.
