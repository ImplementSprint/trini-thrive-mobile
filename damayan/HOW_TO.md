# Damayan Mobile How To

## Local Setup

```sh
npm install
npm run start
```

For Expo Go on a physical device:

```sh
npm run start:expo-go
```

If LAN discovery is unreliable:

```sh
npm run start:tunnel
```

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run maestro:validate
```

## App Layout

- `app/`: Expo Router entry files
- `assets/images/`: Damayan images
- `citizen/`: citizen mobile flows
- `site-manager/`: site manager mobile flows
- `loginportal/`: shared login portal
- `components/`: shared React Native components
- `context/`: app providers
- `hooks/`: shared hooks
- `services/`: API, session, and Supabase clients
- `utils/`: shared helpers
- `tests/unit/`: unit tests
- `tests/performance/`: k6 smoke tests
