# Integration boundary

## Current adapters

- **Pages adapter:** browser-only simulation using local storage.
- **Node adapter:** local HTTP API with atomic JSON persistence.
- **Route fixtures:** two synthetic stopping patterns used to demonstrate bounded task fan-out.

## Future provider interfaces

An authorised integration should expose separate contracts for:

1. journey confirmation and service identity;
2. station, onboard and terminal responsibility;
3. existing lost-property report correlation;
4. found-item inventory references and storage location;
5. notification delivery and receipt;
6. identity, role and organisation authorisation.

No current adapter sends messages to railway teams, accesses DB systems, reads CCTV or claims live timetable accuracy. Provider failures must leave the case explicit about what was not confirmed.
