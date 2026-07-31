# Investment Time Machine is a Vite app, not a folder of static files: the
# source index.html points at /src/main.jsx, which a browser will not execute.
# It has to be built first and the *built* output served — copying the repo in
# directly serves the dev entry point and renders a blank page.

# ---- Build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Accounts are opt-in and baked in at build time. Left empty the game runs
# anonymously and makes no network calls; pass it to enable cloud saves:
#   fly deploy --build-arg VITE_PLAYKIT_URL=https://your-playkit-host
ARG VITE_PLAYKIT_URL=""
ENV VITE_PLAYKIT_URL=$VITE_PLAYKIT_URL

# Google sign-in. The client ID is public (it ships in the bundle), but it must
# be declared here — Docker silently ignores a --build-arg with no matching ARG,
# and Vite then inlines an empty string and drops the whole button as dead code.
ARG VITE_GOOGLE_CLIENT_ID=""
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# ---- Serve ----
FROM pierrezemb/gostatic
COPY --from=build /app/dist /srv/http/
CMD ["-port", "8080", "-https-promote", "-enable-logging"]
