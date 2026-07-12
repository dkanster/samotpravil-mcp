# syntax=docker/dockerfile:1

FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm ci && npm run build

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV SAMOTPRAVIL_HTTP_HOST=0.0.0.0
ENV SAMOTPRAVIL_HTTP_PORT=3000

COPY package.json package-lock.json ./
COPY data ./data
COPY server.json smithery.yaml ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/mcp',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(r=>process.exit(r.status===401||r.status===200?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js", "--http", "--port", "3000"]
