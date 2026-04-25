/**
 * Keep-Alive Service: Prevents Render app from spinning down
 * This module pings the health endpoint regularly to keep the server active
 * 
 * Usage: Import and call startKeepAlive() in your main server file
 * 
 * Render's free tier spins down inactive apps after 15 minutes.
 * This ensures constant uptime by pinging every 10 minutes.
 */

const axios = require('axios');

const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const HEALTH_ENDPOINT = process.env.HEALTH_CHECK_URL || 'http://localhost:5000/health';

/**
 * Start the keep-alive service
 * @param {string} healthUrl - Optional custom health check URL
 */
function startKeepAlive(healthUrl = null) {
  const url = healthUrl || HEALTH_ENDPOINT;
  
  // Log startup
  console.log(`[Keep-Alive] Service started. Health check URL: ${url}`);
  console.log(`[Keep-Alive] Ping interval: ${PING_INTERVAL / 1000 / 60} minutes`);

  // Perform first ping immediately
  performHealthCheck(url);

  // Set up recurring health checks
  setInterval(() => {
    performHealthCheck(url);
  }, PING_INTERVAL);
}

/**
 * Perform a single health check by hitting the /health endpoint
 * @param {string} url - URL to ping
 */
async function performHealthCheck(url) {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
    });

    const timestamp = new Date().toISOString();
    console.log(`[Keep-Alive] ✅ Health check successful at ${timestamp} - Status: ${response.status}`);
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[Keep-Alive] ❌ Health check failed at ${timestamp}:`, error.message);
  }
}

/**
 * Alternative: External Keep-Alive Service
 * 
 * If running on Render's free tier, you can also use external services like:
 * - UptimeRobot (https://uptimerobot.com) - Free tier with 5-minute intervals
 * - Kron (https://kron.app) - Free cron job scheduler
 * - Cronhub (https://cronhub.io) - Free HTTP monitoring
 * 
 * Setup steps for UptimeRobot:
 * 1. Go to https://uptimerobot.com/
 * 2. Click "Add Monitor"
 * 3. Select "HTTP(s)"
 * 4. Enter your Render app URL: https://your-app.onrender.com/health
 * 5. Set monitoring interval to 5 minutes
 * 6. Click "Create Monitor"
 * 
 * This will ping your app every 5 minutes, keeping it awake indefinitely
 */

module.exports = { startKeepAlive, performHealthCheck };
