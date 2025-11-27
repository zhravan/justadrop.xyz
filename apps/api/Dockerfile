# syntax = docker/dockerfile:1

FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
COPY apps/api/package.json /temp/dev/apps/api/
COPY packages/db/package.json /temp/dev/packages/db/
COPY packages/types/package.json /temp/dev/packages/types/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
COPY apps/api/package.json /temp/prod/apps/api/
COPY packages/db/package.json /temp/prod/packages/db/
COPY packages/types/package.json /temp/prod/packages/types/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Build packages first
RUN cd packages/db && bun run build
RUN cd packages/types && bun run build

# Build the API
RUN cd apps/api && bun run build

# Copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/apps/api/dist ./apps/api/dist
COPY --from=prerelease /app/packages/db/dist ./packages/db/dist
COPY --from=prerelease /app/packages/types/dist ./packages/types/dist
COPY --from=prerelease /app/apps/api/package.json ./apps/api/package.json
COPY --from=prerelease /app/packages/db/package.json ./packages/db/package.json
COPY --from=prerelease /app/packages/types/package.json ./packages/types/package.json
COPY --from=prerelease /app/package.json ./package.json

# Expose the API port
EXPOSE 3001

# Run the app
CMD ["bun", "run", "apps/api/dist/index.js"]
