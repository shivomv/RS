FROM node:22-bookworm-slim AS build

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
ENV JOBS=1
RUN MAKEFLAGS="-j1" npm install --omit=dev --no-audit --build-from-source=sqlite3

FROM node:22-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

RUN mkdir -p /app/data && chown -R node:node /app

COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node firebase-service-account*.json ./

EXPOSE 5000

USER node

CMD ["node", "src/server.js"]
