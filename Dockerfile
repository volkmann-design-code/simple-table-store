# Build stage
FROM oven/bun:1.3.3-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build CSS and JavaScript bundle
RUN bun run build

# Runtime stage
FROM oven/bun:1.3.3-alpine

WORKDIR /app

# Copy built assets and source (src needed for migrations)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S hono -u 1001 -G nodejs && \
    chown -R hono:nodejs /app

USER hono

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "start"]
