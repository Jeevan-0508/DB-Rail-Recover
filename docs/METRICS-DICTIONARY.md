# Metrics dictionary

The executable definitions live in [`metrics.mjs`](../metrics.mjs). The API returns the dictionary alongside each KPI response so that labels and denominators travel with the numbers.

## Customer experience

| Metric | Calculation | Denominator | Missing data |
| --- | --- | --- | --- |
| CSAT | Percentage of valid submitted CSAT scores that are 4 or 5 | Submitted CSAT responses | Invalid or unanswered scores excluded; unanswered surveys are not satisfied |
| CES | Mean submitted effort score; 1 means very easy | Valid submitted CES scores | Invalid or unanswered scores excluded |
| Communication satisfaction | Mean 1–5 communication score | Valid submitted communication scores | Invalid or unanswered scores excluded |
| Recovery confidence | Mean 1–5 confidence score | Valid submitted confidence scores | Invalid or unanswered scores excluded |
| Perceived transparency | Mean 1–5 transparency score | Valid submitted transparency scores | Invalid or unanswered scores excluded |
| Survey response rate | Submitted surveys / invited surveys | Invited surveys | Invited but unanswered surveys remain in the denominator |

## Operational KPIs

| Metric | Calculation | Timestamp rule |
| --- | --- | --- |
| Acknowledgement time | Mean report event → first task `ackAt` | First acknowledgement per case |
| First assigned search | Mean report event → first task `sentAt` | First route task per case |
| First meaningful update | Mean report event → first terminal task `responseAt` | Terminal response must include a result/reason |
| Verified match | Mean report event → `verifiedAt` | Human ownership verification only |
| Verified recovery | Mean report event → `recoveredAt` | Verified ownership plus accepted handover plus collection |
| Search completion | Terminal tasks / all created tasks | `Found`, `Checked — not found`, `Unable to check` are terminal |
| Search coverage | Responded tasks / created tasks by team kind | Onboard, Station and Terminal shown separately |
| Overdue task rate | Pending/accepted tasks past `dueAt` / pending/accepted tasks | Snapshot at `asOf`; no background scheduler implied |
| Duplicate enquiry rate | Cases sharing a non-empty external report reference / cases with such references | Requires a supplied correlation reference |
| Escalation response time | Escalation → next acknowledgement or response | Only escalations with a follow-up event |
| Recovery rate | Cases with `recoveredAt` / eligible cases | Verified collection required |
| Unresolved rate | Cases without recovery and not administratively closed / eligible cases | Negative checks do not auto-close cases |
| Staff handling time | Mean task `ackAt` → `responseAt` | Proxy for recorded task handling, not all staff labour |

Insufficient evidence returns a null value and sample size rather than a fabricated zero.
