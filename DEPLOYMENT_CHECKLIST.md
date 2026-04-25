# Deployment Checklist

Complete this checklist to ensure smooth deployment of your Connectors app.

## Pre-Deployment Setup (Do Once)

### Accounts & Services

- [ ] Create MongoDB Atlas account (free tier)
- [ ] Create Vercel account (free tier)
- [ ] Create Render account (free tier)
- [ ] Create HuggingFace account for API key
- [ ] Have GitHub account with repo pushed

### Credentials & Keys

- [ ] MongoDB Atlas connection string (from MongoDB)
- [ ] HuggingFace API key (from HuggingFace dashboard)
- [ ] Generate JWT_SECRET (use: `openssl rand -base64 32`)

### Files & Configuration

- [ ] ✅ Keep-Alive service created: `server/utils/keepAlive.js`
- [ ] ✅ Server updated to use keep-alive: `server/server.js`
- [ ] ✅ Vercel config created: `client/vercel.json`
- [ ] ✅ Render config created: `render.yaml`
- [ ] ✅ Deployment guide created: `DEPLOYMENT.md`

## Local Testing (Before Deployment)

### Backend Testing

- [ ] Run `npm install` in `server/` directory
- [ ] Create `.env` file in `server/` (copy from `.env.example`)
- [ ] Update `.env` with local MongoDB URL
- [ ] Run `npm start` - server should start without errors
- [ ] Test health endpoint: `curl http://localhost:5000/health`
- [ ] Test API endpoint: `curl http://localhost:5000/api/test`

### Frontend Testing

- [ ] Run `npm install` in `client/` directory
- [ ] Create `.env.local` file in `client/` (set `VITE_API_URL=http://localhost:5000`)
- [ ] Run `npm run build` - should complete without errors
- [ ] Run `npm run dev` - dev server should start
- [ ] Visit `http://localhost:5173` and test navigation
- [ ] Verify no console errors or CORS warnings

### Keep-Alive Testing

- [ ] Run `npm run test:keepalive` in `server/` directory
- [ ] Should see: `[Keep-Alive] Service started`
- [ ] Wait 10+ minutes
- [ ] Should see: `[Keep-Alive] ✅ Health check successful`
- [ ] Press Ctrl+C to stop

### Run Deployment Check

- [ ] Run `node deployment-check.js` from project root
- [ ] All checks should pass (0 failed)

## Backend Deployment (Render)

### 1. Create MongoDB Atlas Cluster

- [ ] Log in to MongoDB Atlas
- [ ] Create new project: "Connectors"
- [ ] Create M0 (free) cluster
- [ ] Create database user (e.g., `connectors_user`)
- [ ] Add IP whitelist: `0.0.0.0/0`
- [ ] Get connection string
- [ ] Save MongoDB URI securely

### 2. Deploy on Render

- [ ] Log in to Render dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub and authorize
- [ ] Select your Connectors repository
- [ ] Configure:
  - [ ] Name: `connectors-backend`
  - [ ] Environment: `Node`
  - [ ] Region: Choose appropriate region
  - [ ] Instance Type: `Free` (or Starter+)
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Auto-deploy: Yes

### 3. Set Environment Variables on Render

- [ ] Add `NODE_ENV=production`
- [ ] Add `PORT=5000`
- [ ] Add `MONGO_URI=mongodb+srv://...` (from MongoDB Atlas)
- [ ] Add `CLIENT_URL=https://your-frontend.vercel.app` (placeholder for now)
- [ ] Add `JWT_SECRET=generated-secret-key`
- [ ] Add `HUGGINGFACE_API_KEY=your_api_key`
- [ ] Add `HEALTH_CHECK_URL=https://your-backend.onrender.com/health` (placeholder for now)
- [ ] Mark sensitive variables as "Secret"
- [ ] Click "Create Web Service"

### 4. Wait for Render Deployment

- [ ] Monitor build and deployment progress
- [ ] Should see: `[Keep-Alive] Service started` in logs
- [ ] Deployment complete when you get the service URL

### 5. Get Render URL

- [ ] Copy service URL from Render dashboard
- [ ] Format: `https://connectors-backend-xxxx.onrender.com`
- [ ] Test health endpoint: Visit URL + `/health` in browser
- [ ] Should return JSON with status and timestamp

### 6. Update Render Environment Variables

- [ ] Go back to Render dashboard
- [ ] Edit environment variables
- [ ] Update `HEALTH_CHECK_URL` with actual Render URL
- [ ] Update `CLIENT_URL` with Vercel URL (when available)
- [ ] Save (Render will redeploy)

## Frontend Deployment (Vercel)

### 1. Deploy on Vercel

- [ ] Log in to Vercel dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Click "Import Git Repository"
- [ ] Authorize GitHub
- [ ] Select your Connectors repository
- [ ] Configure Root Directory: `client`
- [ ] Verify settings:
  - [ ] Framework: Vite
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
  - [ ] Install Command: `npm install`

### 2. Set Environment Variables on Vercel

- [ ] Add `VITE_API_URL=https://your-backend.onrender.com`
  - (Use the actual Render URL from backend deployment)
- [ ] Click "Deploy"

### 3. Wait for Vercel Deployment

- [ ] Monitor build and deployment progress
- [ ] Deployment complete when you get the project URL

### 4. Get Vercel URL

- [ ] Copy project URL from Vercel dashboard
- [ ] Format: `https://connectors.vercel.app` (or custom domain)
- [ ] Save this URL

### 5. Update Backend with Vercel URL

- [ ] Go to Render dashboard
- [ ] Go to backend service settings
- [ ] Edit environment variables
- [ ] Update `CLIENT_URL` with your Vercel URL
- [ ] Save (Render will redeploy)

## Post-Deployment Verification

### Backend Verification

- [ ] Health endpoint responds: `https://your-backend.onrender.com/health`
- [ ] API test endpoint works: `https://your-backend.onrender.com/api/test`
- [ ] Check Render logs for:
  - [ ] `MongoDB Connected`
  - [ ] `[Keep-Alive] Service started`
  - [ ] Regular `[Keep-Alive] ✅ Health check successful` messages

### Frontend Verification

- [ ] Visit your Vercel URL
- [ ] Page loads without errors
- [ ] Can navigate pages
- [ ] Check browser console - no errors
- [ ] Check Network tab - API calls to backend succeed
- [ ] Test login/register flow
- [ ] Verify CORS headers are present

### Keep-Alive Verification

- [ ] Monitor Render logs for 15+ minutes
- [ ] Should see keep-alive pings every 10 minutes
- [ ] If using UptimeRobot, verify pings in dashboard
- [ ] Wait 20+ minutes without accessing app
- [ ] Check logs - app is still responsive (not suspended)

## Monitoring & Maintenance

### Daily (First week after deployment)

- [ ] Check for any deployment errors in logs
- [ ] Verify app is still responding
- [ ] Test core functionality (login, API calls)

### Weekly

- [ ] Review Render logs for errors or warnings
- [ ] Check keep-alive is running consistently
- [ ] Verify database connection is stable
- [ ] Monitor API response times

### Monthly

- [ ] Update dependencies for security
- [ ] Review usage and consider upgrades if needed
- [ ] Check for any deprecation warnings
- [ ] Backup important data

## Scaling & Upgrades

### When Ready to Go Beyond Free Tier

#### Backend (Render)

- [ ] Upgrade to Starter ($7/mo) for permanent uptime
  - No more spin-down
  - 512 MB RAM
  - Keep-alive still recommended for redundancy
- [ ] Upgrade to Standard ($12+/mo) for production load
  - 1 GB RAM
  - Better performance

#### Frontend (Vercel)

- [ ] Stay on free tier (generous limits)
- [ ] Or upgrade to Hobby ($5/mo) for edge features
- [ ] Or Pro ($20/mo) for team collaboration

#### Database (MongoDB Atlas)

- [ ] Stay on M0 (free) for small projects
- [ ] Upgrade to M2 ($57/mo) for production
- [ ] Add backups and dedicated cluster

## Troubleshooting

### App not loading

- [ ] Check Render logs for deployment errors
- [ ] Verify MongoDB connection in logs
- [ ] Check `NODE_ENV=production` is set
- [ ] Verify `CLIENT_URL` is correct

### API errors (CORS, 404, 500)

- [ ] Check backend logs in Render
- [ ] Verify `VITE_API_URL` in Vercel
- [ ] Verify `CLIENT_URL` in Render
- [ ] Test health endpoint directly

### Keep-alive not running

- [ ] Check Render logs for `[Keep-Alive]` messages
- [ ] Verify `NODE_ENV=production` is set
- [ ] Check `HEALTH_CHECK_URL` is correct
- [ ] Verify keep-alive.js is in utils folder

### Build failures

- [ ] Check build logs in Vercel/Render
- [ ] Run builds locally to diagnose
- [ ] Verify dependencies are correct
- [ ] Check for syntax errors

## Done! 🎉

Your app is now:

- ✅ Deployed on Vercel (frontend)
- ✅ Deployed on Render (backend)
- ✅ Running 24/7 with keep-alive
- ✅ Ready for users!

Share your Vercel URL with others to start using the app.

For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
