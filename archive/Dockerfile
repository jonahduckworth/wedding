# Draft only: do not connect this Dockerfile to an auto-deploying branch yet.
FROM node:24-bookworm-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20 AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM node:24-bookworm-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20 AS dependencies
WORKDIR /build/archive
COPY archive/package.json archive/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

FROM node:24-bookworm-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20
ENV NODE_ENV=production PORT=8080 ARCHIVE_ORIGIN=https://wedding.jdbuilds.ca \
    ARCHIVE_PUBLIC_DIR=/app/public ARCHIVE_UPLOADS_DIR=/app/uploads \
    ARCHIVE_AUTH_FILE=/run/secrets/archive-auth.json \
    ARCHIVE_DATABASE_URL_FILE=/run/secrets/archive-database-url
WORKDIR /app/archive
COPY --from=dependencies --chown=node:node /build/archive/node_modules ./node_modules
COPY --chown=node:node archive/package.json ./package.json
COPY --chown=node:node archive/src ./src
COPY --from=frontend --chown=node:node /build/frontend/dist /app/public
USER node
EXPOSE 8080
CMD ["node", "src/start.mjs"]
