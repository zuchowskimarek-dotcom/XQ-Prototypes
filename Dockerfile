# ─── Stage 1: Build frontend ───
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Build & run backend ───
FROM node:20-alpine
WORKDIR /app

# Copy backend and install all deps (tsx needed at runtime)
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY backend/ ./backend/

# Generate Prisma client
RUN cd backend && npx prisma generate

# Copy frontend build output
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Railway sets PORT env var automatically
EXPOSE ${PORT:-3005}

# Start: push schema + run server
CMD cd backend && npx prisma db push && npm start
