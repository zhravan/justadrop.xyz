# syntax = docker/dockerfile:1

FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies into temp directory
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
COPY apps/web/package.json /temp/dev/apps/web/
COPY packages/types/package.json /temp/dev/packages/types/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
COPY apps/web/package.json /temp/prod/apps/web/
COPY packages/types/package.json /temp/prod/packages/types/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Build packages first
RUN cd packages/types && bun run build

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN cd apps/web && bun run build

# Copy production dependencies and built app into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/apps/web/.next ./apps/web/.next
COPY --from=prerelease /app/apps/web/public ./apps/web/public
COPY --from=prerelease /app/apps/web/package.json ./apps/web/package.json
COPY --from=prerelease /app/apps/web/next.config.js ./apps/web/next.config.js
COPY --from=prerelease /app/packages/types/dist ./packages/types/dist
COPY --from=prerelease /app/packages/types/package.json ./packages/types/package.json
COPY --from=prerelease /app/package.json ./package.json

# Expose the web port
EXPOSE 3000

# Set environment variable for production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run the app
CMD ["bun", "run", "apps/web/next", "start"]
