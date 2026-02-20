# Build stage
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Define build argument with default
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage to nginx public directory
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create env config script for runtime environment variables
RUN echo '#!/bin/sh' > /docker-entrypoint.d/40-env-config.sh && \
    echo 'if [ -n "$VITE_API_URL" ]; then' >> /docker-entrypoint.d/40-env-config.sh && \
    echo '  echo "window.ENV = { VITE_API_URL: \"$VITE_API_URL\" };" > /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.d/40-env-config.sh && \
    echo 'fi' >> /docker-entrypoint.d/40-env-config.sh && \
    chmod +x /docker-entrypoint.d/40-env-config.sh

# Expose port 80
EXPOSE 80

# Healthcheck to ensure nginx is serving the app
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Start nginx (entrypoint scripts will run automatically)
CMD ["nginx", "-g", "daemon off;"]
