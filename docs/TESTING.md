# Testing

Run:

```sh
npm test
npm run check
npm run build
```

The test suite covers route fan-out, task acknowledgement, negative and unavailable responses, found-item references, private proof boundaries, duplicate ownership claims, escalation gates, validation, HTTP persistence and the built Pages adapter.

The repository does not yet have browser automation, authenticated role tests, file-upload tests, database migration tests or multi-organisation privacy tests. Those require the production architecture and should be added before an operational pilot.
