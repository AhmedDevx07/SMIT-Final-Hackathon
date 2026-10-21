# Stage 1: Build the React application with Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cached if package files don't change)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL (defaults to local backend)
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=${VITE_API_URL}

# Build production bundle
RUN npm run build

# Stage 2: Serve the static files using Nginx Alpine
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for React Router SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
