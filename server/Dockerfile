# PeoplePay360 API — production image (Express + TypeScript)
# Multi-stage: compile with dev deps, then ship a slim runtime image.
# Build context is the server/ directory (Render "Root Directory: server").

# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install ALL deps (incl. dev) for the TypeScript build.
COPY package.json package-lock.json ./
RUN npm ci

# Compile src -> dist (npm run build === tsc).
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Only production dependencies in the final image.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled output only.
COPY --from=build /app/dist ./dist

# Render injects PORT at runtime; the app reads it via config.port.
EXPOSE 10000
CMD ["node", "dist/server.js"]
