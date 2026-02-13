# Stage 1: Build Frontend
FROM node:20-alpine AS builder-frontend
WORKDIR /app/frontend

# Copy dependency definitions
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend ./

# Build the frontend
RUN npm run build

# Stage 2: Build Backend
FROM golang:1.24-alpine AS builder-backend
WORKDIR /app/backend

# Install build dependencies (needed for CGO/SQLite)
RUN apk add --no-cache build-base

# Copy dependency definitions
COPY backend/go.mod backend/go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY backend ./

# Build the Go binary
# CGO_ENABLED=1 is required for go-sqlite3
RUN CGO_ENABLED=1 GOOS=linux go build -o main .

# Stage 3: Final Image
FROM alpine:latest

# Install runtime dependencies (sqlite libs if needed, ca-certificates)
RUN apk --no-cache add ca-certificates sqlite-libs

WORKDIR /app

# Create necessary directories
# backend/data for the SQLite DB
# backend/uploads for team logos
# frontend/dist for static files
RUN mkdir -p /app/backend/data /app/backend/uploads /app/frontend/dist

# Copy frontend build artifacts
COPY --from=builder-frontend /app/frontend/dist /app/frontend/dist

# Copy backend binary
COPY --from=builder-backend /app/backend/main /app/backend/main

# Set working directory to backend so relative paths work (e.g. "../frontend/dist")
WORKDIR /app/backend

# Expose the port used by the application
EXPOSE 8080

# Run the application
CMD ["./main"]
