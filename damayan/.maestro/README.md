# Damayan Maestro Flows

Damayan ships with platform-specific smoke flows:

- smoke-android.yaml
- smoke-ios.yaml

The app IDs mirror `app.config.ts`.

Run flows:

```sh
maestro test .maestro/smoke-android.yaml
maestro test .maestro/smoke-ios.yaml
```
