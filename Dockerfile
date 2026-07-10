# Build stage
FROM node:24-alpine AS builder
WORKDIR /app
ENV HUSKY=0
RUN npm install -g pnpm@11.10.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build

# Serve stage
FROM caddy:2-alpine
COPY --from=builder /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile