# Damayan Mobile Onboarding

Damayan follows the same Expo Router folder shape used by `hope-card`, with the Damayan mobile implementation migrated from `damayan-system-last-merge/frontend_mobile`.

## First Run

1. Install dependencies from inside `damayan/`.
2. Configure environment values from `.env.example`.
3. Start the backend gateway on the API URL configured in `EXPO_PUBLIC_API_BASE_URL`.
4. Run `npm run start` for normal Expo development, or `npm run start:expo-go` for a physical phone on the same network.

## Before Opening a PR

Run:

```sh
npm run lint
npm run typecheck
npm test
npm run maestro:validate
```

The CI/CD migration plan expects system-owned frontend changes to stay inside this folder, with tests and Maestro smoke flows present.
