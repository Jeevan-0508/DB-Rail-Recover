# Demo guide

The demo is intentionally synthetic and unrestricted. It is a workflow demonstration, not authentication.

## Passenger-to-operations flow

1. Start the server with `npm start` and open `http://127.0.0.1:3000`.
2. In Passenger portal, create a fictional bag report on the northbound route.
3. Open the new case and inspect the separate onboard, station and terminal tasks.
4. Switch to Operations desk and choose a desk.
5. Accept a task and record `Checked — not found`, `Unable to check` or `Found`.
6. If a found item is recorded, review the ownership candidate.
7. Verify the private fictional detail, record an accepted handover and confirm simulated collection.
8. Review the timeline after every transition.

For a five-minute urgent escalation demonstration, create a report with **Urgent essentials**, open Operations desk, use the clearly labelled **Simulate overdue** control on a pending or accepted task, then choose **Escalate overdue**. The clock control is synthetic-only and records that no real deadline changed.

The live case-study tab describes the research boundary and why a negative response is not treated as permanent loss. The demo does not connect to Deutsche Bahn, police or real passengers.

## Phase 2 Insights flow

1. Open **Insights** to see CSAT, CES, survey response rate, acknowledgement time, search completion, recovery and unresolved rates.
2. Change urgency, category or outcome filters; each metric keeps its sample size and empty states.
3. From any demo case, use **Share feedback**. Submit once; a second submission is rejected as a duplicate.
4. Adjust the financial assumptions and run the low/base/high sensitivity model.

The default survey row is synthetic. The financial panel is hypothetical. The historical DB figures in the Research & Impact documentation are external references, not dashboard observations.

## Five-minute stakeholder run-of-show

**0:00–0:45 — Passenger problem.** Open Passenger portal and explain the gap between submitting a loss report and knowing which responsible team checked what. Point out the persistent synthetic-data banner.

**0:45–1:30 — Case 001.** Open Case study. Expand the chronology items, distinguish passenger testimony from supplied correspondence, and state that the case remains unresolved. Do not imply that RailRecover would have recovered the bag.

**1:30–2:30 — Route-aware coordination.** Return to Passenger portal, open the backpack case, then switch to Operations desk. Show onboard, remaining-station and terminal tasks. Accept one task and record a scoped negative response; show that the other pending tasks remain visible.

**2:30–3:15 — Urgent escalation.** Create a second fictional report with `Urgent essentials`. In Operations desk, use `Simulate overdue`, then `Escalate overdue`. Explain that both controls are synthetic demo controls and that the proposed targets are not operator SLAs.

**3:15–4:15 — Customer experience analytics.** Submit feedback on the new case, then open Insights. Show CSAT, CES, communication satisfaction, response rate, missing-response counts and sample sizes. Demonstrate an outcome or route filter and emphasize that recovery and satisfaction are separate outcomes.

**4:15–5:00 — Financial model and pilot ask.** Adjust improvement points or minutes saved, run the calculator, and show low/base/high sensitivity. State that the figures are hypothetical and item value is not operator savings. Close with the pilot evaluation page: baseline/intervention periods, eligibility, denominators, workload, privacy incidents, cost and uncertainty.
