FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY api-gateway/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application code
COPY api-gateway/ .

# Copy frontend files
COPY frontend ./frontend

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start application
CMD ["node", "server.js"]
