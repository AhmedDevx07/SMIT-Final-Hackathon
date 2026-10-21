FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies (cached if package files don't change)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend port
EXPOSE 5000

# Start the Express server
CMD ["node", "server.js"]
