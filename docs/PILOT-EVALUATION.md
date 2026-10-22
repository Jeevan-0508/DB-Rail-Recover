# Pilot evaluation framework

## Design

Use a baseline period followed by an intervention period, or a comparable stepped rollout where operationally appropriate. Pre-register eligibility, exclusions, metric definitions, privacy safeguards and the analysis plan before looking at results.

## Eligibility and comparability

Include cases with a confirmed journey context and an operator-approved route/search owner. Exclude duplicates, test records, cases without the minimum timestamps needed for a metric, and cases affected by an unrecorded system outage. Report exclusions rather than silently dropping them.

Comparable groups should be matched or stratified by urgency, item category, route complexity, journey type and case outcome. Do not infer causal impact from a before/after change alone.

## Scorecard

| Measure | Baseline | Intervention | Difference | Validity note |
| --- | ---: | ---: | ---: | --- |
| Acknowledgement time | Not observed | Not observed | — | Requires authorised timestamps |
| Search completion rate | Not observed | Not observed | — | Preserve task denominator |
| Verified recovery rate | Not observed | Not observed | — | Recovery definition must be agreed |
| CSAT / CES | Not observed | Not observed | — | Survey response and missingness required |
| Staff handling time | Not observed | Not observed | — | Recorded work is a proxy |
| Privacy incidents | Not observed | Not observed | — | Report numerator and exposure definition |
| Implementation / operating cost | Not observed | Not observed | — | Finance owner validates cost ledger |

The dashboard shows “insufficient data” until authorised observations exist. Synthetic demo values never populate this scorecard as pilot observations.

## Statistical uncertainty

Report sample size, confidence intervals or other appropriate uncertainty estimates when sample size and design support them. Small pilots may only support descriptive estimates and workflow learning. Recovery outcomes are often delayed and selected by item type, so follow-up windows and censoring rules must be agreed in advance.
