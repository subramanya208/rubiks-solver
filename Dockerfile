FROM node:18-alpine

# Create app directory with correct permissions
RUN mkdir -p /app && chown -R node:node /app

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Use non-root user
USER node

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start app
CMD ["node", "server.js"]
