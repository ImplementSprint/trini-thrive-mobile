# syntax=docker/dockerfile:1.7
#
# This image runs the Expo dev server only. Containers can't drive iOS/Android
# device builds — use `npm run android` / `npm run ios` on the host for those.
# What this image is good for:
#   - serving the Expo Metro bundler so Expo Go / a dev client on a real device
#     can connect to it over the network
#   - running the web target (`expo start --web`) headless for smoke tests
#
# Usage:
#   docker build -t bayanihub-mobile .
#   docker run --rm -p 8081:8081 -p 19000:19000 -p 19001:19001 -p 19002:19002 \
#     -e REACT_NATIVE_PACKAGER_HOSTNAME=<your-LAN-ip> bayanihub-mobile

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache git bash
RUN npm install -g expo-cli@latest

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=development
ENV CI=1
ENV EXPO_NO_TELEMETRY=1

# Expo / Metro ports
EXPOSE 8081 19000 19001 19002

CMD ["npm", "run", "start", "--", "--host", "lan", "--port", "8081"]
