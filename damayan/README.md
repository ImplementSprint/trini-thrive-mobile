# Damayan Mobile

Expo Router mobile app for the Damayan emergency response platform.

## Structure

This folder follows the same mobile app shape as `hope-card`:

```text
app/
assets/images/
citizen/
components/
context/
hooks/
loginportal/
scripts/
site-manager/
tests/
utils/
```

The Damayan implementation was migrated from `damayan-system-last-merge/frontend_mobile`.

## Commands

- `npm run start`: start Expo
- `npm run start:expo-go`: start Expo Go on LAN with API URL detection
- `npm run start:tunnel`: start Expo Go through an ngrok tunnel
- `npm run web`: run the web target
- `npm run lint`: lint all files
- `npm run typecheck`: type-check the app
- `npm test`: run unit tests with coverage
- `npm run maestro:validate`: validate `.maestro` smoke flow files

## Environment

Copy values into your local environment or CI secret store:

```text
EXPO_PUBLIC_APP_NAME=Damayan Mobile
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```
