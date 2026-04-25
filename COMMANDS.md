# Quick Command Reference

## Pre-Deployment Testing

```bash
# 1. Verify setup is complete
node deployment-check.js

# 2. Test keep-alive locally (from server directory)
cd server
npm run test:keepalive
# Wait 10+ minutes to see: [Keep-Alive] ✅ Health check successful
# Then Ctrl+C to stop

# 3. Generate a secure JWT secret for production
openssl rand -base64 32

# 4. Run local development (if testing)
cd server && npm install && npm start
cd client && npm install && npm run dev
```

## Local Verification

```bash
# Test backend health endpoint
curl http://localhost:5000/health
# Expected: {"status":"UP","timestamp":"..."}

# Test API
curl http://localhost:5000/api/test

# Test frontend build
cd client
npm run build  # Should create dist/ folder
npm run lint   # Should pass without errors
```

## Deployment Commands (On Vercel/Render Dashboards)

### Render Backend Setup

```bash
# These are set in Render dashboard, not terminal

# Build Command:
npm install

# Start Command:
npm start

# Environment Variables:
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
CLIENT_URL=https://your-frontend.vercel.app
JWT_SECRET=<generated-secret>
HUGGINGFACE_API_KEY=<your-api-key>
HEALTH_CHECK_URL=https://your-backend.onrender.com/health
```

### Vercel Frontend Setup

```bash
# These are auto-detected or set in Vercel dashboard

# Build Command (auto-detected):
npm run build

# Output Directory (auto-detected):
dist

# Environment Variables (in Vercel dashboard):
VITE_API_URL=https://your-backend.onrender.com
```

## MongoDB Atlas Setup

```bash
# Connection String Format:
mongodb+srv://username:password@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority

# Example:
mongodb+srv://connectors_user:MyPassword123@cluster-xyz.mongodb.net/connectors?retryWrites=true&w=majority

# If password has special characters, URL-encode them:
@ = %40
# = %23
: = %3A
/ = %2F
```

## Verification After Deployment

```bash
# Test health endpoint
curl https://your-backend.onrender.com/health

# Test API
curl https://your-backend.onrender.com/api/test

# Check Render logs for keep-alive
# (In Render dashboard, view service logs)
# Look for: [Keep-Alive] Service started
# Look for: [Keep-Alive] ✅ Health check successful (every 10 min)
```

## Troubleshooting Commands

```bash
# Check if port is in use (Mac/Linux)
lsof -i :5000

# Check if port is in use (Windows)
netstat -ano | findstr :5000

# Kill process using port (Mac/Linux)
kill -9 <PID>

# Check Node.js version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Verify file exists and syntax is correct
node -c server/server.js

# Check .env file is configured
cat server/.env
```

## Environment Setup

```bash
# Create .env file in server directory
cat > server/.env << EOF
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/connectors
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-local-secret-key
HUGGINGFACE_API_KEY=your-api-key
HEALTH_CHECK_URL=http://localhost:5000/health
EOF

# Create .env.local file in client directory
cat > client/.env.local << EOF
VITE_API_URL=http://localhost:5000
EOF
```

## GitHub Setup (For CI/CD)

```bash
# Add GitHub Secrets (via GitHub UI or gh CLI)
gh secret set RENDER_DEPLOY_HOOK --body "https://api.render.com/deploy/your-hook-url"
gh secret set VERCEL_TOKEN --body "your-vercel-token"
gh secret set VERCEL_PROJECT_ID --body "your-project-id"
gh secret set VERCEL_ORG_ID --body "your-org-id"

# Verify secrets are set
gh secret list
```

## MongoDB Atlas Commands

```bash
# Connect to MongoDB locally (requires mongosh)
mongosh "mongodb+srv://user:password@cluster.mongodb.net/dbname"

# Check MongoDB connection from Node.js
node -e "require('mongoose').connect(process.env.MONGO_URI)"
```

## Useful Diagnostic Commands

```bash
# Check what's running on your server
ps aux | grep node

# Monitor server in real-time
top -p $(pgrep -f "node server.js")

# View file permissions (important for Docker)
ls -la server/server.js

# Check for syntax errors in all JS files
find . -name "*.js" -exec node -c {} \;

# Pretty print JSON responses
curl https://your-backend.onrender.com/health | jq .
```

## File Locations

```
Project Root:
├── server/
│   ├── utils/
│   │   └── keepAlive.js          ← Keep-alive service
│   ├── server.js                 ← Updated with keep-alive
│   ├── package.json              ← Has test:keepalive script
│   └── .env                      ← Your local env variables
│
├── client/
│   ├── vercel.json               ← Vercel config
│   ├── vite.config.js            ← Vite config
│   └── .env.local                ← Your local env variables
│
├── render.yaml                   ← Render config
├── DEPLOYMENT.md                 ← Full guide
├── DEPLOYMENT_CHECKLIST.md       ← Step-by-step checklist
├── TROUBLESHOOTING.md            ← Problem solving
├── deployment-check.js           ← Verification script
└── test-keepalive.js             ← Keep-alive test
```

## Common Issues Quick Fixes

```bash
# CORS Error? Update CLIENT_URL in Render:
# Render Dashboard → Settings → Environment → CLIENT_URL

# Keep-Alive not running? Check logs:
# Render Dashboard → Service → Logs (search for [Keep-Alive])

# API not connecting? Test endpoint:
curl -v https://your-backend.onrender.com/health

# Build failed? Test locally:
npm install
npm run build
npm test

# Port in use? Find and kill:
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Wrong URL? Check environment variables:
grep VITE_API_URL client/.env.local
grep CLIENT_URL server/.env  # (or Render dashboard)
```

## Performance Monitoring

```bash
# Check response time
time curl https://your-backend.onrender.com/health

# Monitor API calls
curl -w "\nResponse time: %{time_total}s\n" \
     https://your-backend.onrender.com/health

# Check database performance
# MongoDB Atlas Dashboard → Performance → Database Profiler
```

## Cleanup & Reset

```bash
# Remove local MongoDB (if installed)
# This varies by OS - check MongoDB docs

# Clear old build files
rm -rf server/dist
rm -rf client/dist

# Clear npm cache
npm cache clean --force

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Documentation Links

- Keep-Alive Service: `server/utils/keepAlive.js` - Read for technical details
- Deployment Guide: `DEPLOYMENT.md` - Step-by-step instructions
- Checklist: `DEPLOYMENT_CHECKLIST.md` - Interactive checklist
- Troubleshooting: `TROUBLESHOOTING.md` - Problem-solving
- This File: `COMMANDS.md` - Quick reference

---

**Tip**: Most issues can be solved by:

1. Running `deployment-check.js`
2. Checking Render/Vercel logs
3. Reading TROUBLESHOOTING.md
4. Verifying environment variables

Good luck! 🚀
