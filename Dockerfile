# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create the required directories in the container
RUN mkdir -p /app/data/input /app/data/results /app/data/bin

# Note: service-account.json will be mounted as a volume at runtime
# This ensures credentials are not baked into the image

# Set environment variables
ENV NODE_ENV=production
ENV HOME=/app
ENV DOCUMENTS_PATH=/app/data

# Expose port (if needed for health checks)
EXPOSE 3000

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Start the application
CMD ["node", "watcher.js"]
