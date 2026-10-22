# Customer experience measurement

Passenger feedback is optional and can be submitted for both recovered and unresolved cases. The demo form records:

- CSAT on a 1–5 scale, with 4–5 counted as satisfied;
- CES on a 1–5 scale, where 1 means very easy;
- communication satisfaction;
- confidence in the recovery process;
- perceived transparency;
- survey timing and optional written feedback.

Each case receives a synthetic invitation. A submitted survey is single-use per case; unanswered invitations stay visible in the denominator and are not treated as satisfied passengers. The dashboard reports sample size, missing responses and the survey period.

The current UI uses synthetic records only. A production service needs authenticated survey links, consent/transparency language, retention limits, response deduplication, accessibility review, translation into German and a privacy-approved feedback access model.

## Outcome distinction

Customer experience is not a proxy for recovery. Pilot reporting should show a two-by-two view:

|  | Positive experience | Negative experience |
| --- | --- | --- |
| Recovered | Recovery plus clear communication | Item recovered, but process felt difficult or opaque |
| Unresolved | No item found, but updates were clear | No item found and poor communication |

This prevents an unresolved case with good communication from disappearing from the experience analysis.
