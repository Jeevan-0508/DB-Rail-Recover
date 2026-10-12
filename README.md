# RailRecover

**An evidence-led operational prototype for railway lost-property recovery.**

Report a loss, assign a search, record its outcome, review a found item, verify ownership, record custody and close the case after collection. The passenger timeline reflects recorded actions rather than reassuring but unverified status messages.

Independent project by Jeevan. Not affiliated with Deutsche Bahn, SBB, police or a German public authority. All initial data and operator actions are fictional. Do not enter real personal information or work-device secrets.

## Run locally

Requires Node.js 22 or newer. No external packages, API keys or installation are needed.

```sh
npm start
```

Open http://127.0.0.1:3000. On Windows the same command works in PowerShell from this project directory.

```sh
npm test
npm run check
```

`PORT` changes the port. `RAILRECOVER_DATA_DIR` selects the data directory. Server binds to localhost by default. Demo records persist in ignored `data/demo.json`; the Reset demo button restores the synthetic fixture.

## Try the full workflow

1. Open the sample report in Passenger portal.
2. Switch to Operations desk and select the same report.
3. Acknowledge the search task.
4. Link the sample found backpack for human review.
5. Try an incorrect ownership detail: the item remains withheld.
6. Verify with the sample detail **Blue spiral notebook**.
7. Record an accepted handover to **Demo collection desk**.
8. Confirm simulated collection. The report becomes Returned.

Alternative: record No item found after acknowledgment. The report remains open for later inventory matching. Create another found item to explore ranking. Deadlines are 30 minutes for demonstration only; overdue escalation is manual in this version.

## Included

- Responsive passenger portal and operations desk
- Loss intake and found-item registration
- Separate case and search-task states
- Deterministic, explained candidate ranking (not ownership probability)
- Server-enforced verification, reservation and return gates
- Custody and timestamped audit histories
- Manual overdue escalation
- Serialized, atomic local writes
- Research-backed case-study screen and pilot documentation
- Tests for invalid transitions, double claims, negative searches and evidence withholding

## Honest limits

This is a single-user, shared demo. The view switch is **not authentication or authorisation**. Every demo visitor can see all synthetic cases and perform operations. Do not expose it to the public with real data.

No real DB reports are submitted. No railway staff are contacted. Routing uses a fictional team, not an actual service roster. Notifications are on-screen messages, not email/SMS. It cannot locate a bag or guarantee recovery. There is no background scheduler, real train feed, production identity verification or independent receiver signature. The JSON store supports one server process, not distributed deployment. Audit entries are append-only through the application but not tamper-proof against filesystem administrators. Exact-detail verification is a demonstrative control, not a production identity check.

## Project documents

- [Case study and sources](docs/CASE_STUDY.md)
- [Architecture and production roadmap](docs/ARCHITECTURE.md)
- [Operator pilot proposal](docs/PILOT_PROPOSAL.md)

## Licence

MIT. The code is reusable; the licence does not imply approval, affiliation or operational readiness.
