# Pinned to repo package-lock playwright version; update via npm run audit:docker:build
ARG PLAYWRIGHT_VERSION=1.63.0
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble

WORKDIR /audit
COPY package.json ./
RUN npm install --omit=dev
COPY run-interaction.mjs ./

ENV AUDIT_BASE_URL=http://host.docker.internal:4321

ENTRYPOINT ["node", "run-interaction.mjs"]
