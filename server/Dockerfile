# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Use non-root user for security
USER node

# Expose the port the app runs on
EXPOSE 5000

# Healthcheck to ensure container is responsive
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:5000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Command to run the application
CMD ["npm", "start"]
