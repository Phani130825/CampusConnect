# Deployment Guide: Vercel + Render with 24/7 Keep-Alive

This guide walks you through deploying your full-stack Connectors application on Vercel (frontend) and Render (backend) with automated keep-alive to prevent app suspension.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ GitHub account with your code pushed
- ✅ Vercel account (free tier available)
- ✅ Render account (free tier available)
- ✅ MongoDB Atlas account with a cluster (free tier available)
- ✅ HuggingFace API key for embeddings
- ✅ npm/Node.js installed locally

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

The Connectors app uses MongoDB. We'll use the free MongoDB Atlas tier.

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project (e.g., "Connectors")
4. Click "Create a Deployment" and select:
   - **Provider**: AWS (or your preference)
   - **Tier**: M0 (Free)
   - **Region**: Choose closest to your deployment region
5. Create database user:
   - Username: `connectors_user`
   - Generate a secure password (save this!)
6. Add IP address whitelist:
   - Click "Security" → "Network Access"
   - Add IP `0.0.0.0/0` (allows any IP - required for Render)
7. Get connection string:
   - Click "Database" → "Connect" → "Drivers"
   - Copy the connection string (looks like: `mongodb+srv://...`)

### 1.2 Update Connection String

Your MongoDB URI format:

```
mongodb+srv://connectors_user:PASSWORD@cluster-xyz.mongodb.net/connectors?retryWrites=true&w=majority
```

Replace:

- `PASSWORD` with your database user password
- `cluster-xyz` with your actual cluster name

---

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Connect GitHub Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Select "Build and deploy from a Git repository"
4. Click "Connect GitHub" and authorize Render
5. Find and select your `Connectors` repository

### 2.2 Configure Backend Service

Fill in the following:

| Field             | Value                        |
| ----------------- | ---------------------------- |
| **Name**          | `connectors-backend`         |
| **Environment**   | `Node`                       |
| **Build Command** | `npm install`                |
| **Start Command** | `npm start`                  |
| **Instance Type** | Free (or Starter+ if needed) |
| **Auto-deploy**   | Yes                          |

### 2.3 Set Environment Variables

Click "Environment" and add these variables:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://connectors_user:PASSWORD@cluster-xyz.mongodb.net/connectors?retryWrites=true&w=majority
CLIENT_URL=https://your-frontend.vercel.app  (you'll get this from Vercel later)
JWT_SECRET=generate-a-random-secret-key-here
HUGGINGFACE_API_KEY=your_huggingface_api_key
HEALTH_CHECK_URL=https://your-backend.onrender.com/health  (you'll get the actual URL after deployment)
```

**Note**: Mark sensitive variables as "Secret" for security

### 2.4 Get Your Render URL

After deployment completes:

1. Go to your service page
2. Copy the service URL (looks like: `https://connectors-backend-xxxx.onrender.com`)
3. **Save this URL** - you'll need it for the frontend

### 2.5 Verify Backend Deployment

Test your deployment:

```bash
# Test basic health endpoint
curl https://your-backend.onrender.com/health

# Should return:
# {"status":"UP","timestamp":"2026-04-25T..."}
```

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Authorize GitHub and select your `Connectors` repository
5. Select the `client` directory as root (or let Vercel auto-detect)

### 3.2 Configure Frontend Deployment

Vercel will auto-detect your Vite setup. Verify settings:

| Field                | Value           |
| -------------------- | --------------- |
| **Framework**        | Vite            |
| **Build Command**    | `npm run build` |
| **Output Directory** | `dist`          |
| **Install Command**  | `npm install`   |

### 3.3 Set Environment Variables

In Vercel dashboard, go to "Settings" → "Environment Variables":

```
VITE_API_URL=https://your-backend.onrender.com
```

Replace with your actual Render backend URL from Step 2.4

### 3.4 Get Your Vercel URL

After deployment:

1. Go to your project dashboard
2. Copy the production URL (looks like: `https://connectors.vercel.app`)
3. **Update your Render backend** with this URL:
   - Go to Render dashboard
   - Edit environment variables
   - Update `CLIENT_URL` to your Vercel frontend URL
   - Save changes (Render will redeploy automatically)

### 3.5 Verify Frontend Deployment

1. Visit your Vercel URL
2. Test logging in and making API calls
3. Check browser console for errors

---

## ⏰ Step 4: Set Up 24/7 Keep-Alive

Render's free tier spins down inactive apps after 15 minutes. We have **two options** to prevent this:

### Option A: Built-in Keep-Alive Service (Automatic) ✅ RECOMMENDED

The keep-alive service is already integrated in your `server.js`. It will:

- ✅ Automatically start in production
- ✅ Ping `/health` endpoint every 10 minutes
- ✅ Keep your app awake indefinitely
- ✅ No additional setup needed

This uses the internal mechanism, so it's always running when deployed.

### Option B: External Monitoring Service (Free Tier)

Use an external service that will ping your app regularly. **Choose one:**

#### Option B1: UptimeRobot (Recommended - 5min intervals)

1. Go to [UptimeRobot](https://uptimerobot.com)
2. Sign up (free account)
3. Click "Add Monitor"
4. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Connectors Backend
   - **URL**: `https://your-backend.onrender.com/health`
   - **Monitoring Interval**: 5 minutes
   - **Alert Contacts**: Add your email
5. Click "Create Monitor"

#### Option B2: Kron (Also Free)

1. Go to [Kron](https://kron.app)
2. Sign up
3. Create new cron job:
   - **Interval**: Every 10 minutes
   - **URL**: `https://your-backend.onrender.com/health`
   - **Method**: GET
4. Save and activate

#### Option B3: Cronhub (Also Free)

1. Go to [Cronhub.io](https://cronhub.io)
2. Sign up
3. Create monitor with same settings as above

**Recommendation**: Use the built-in keep-alive (Option A). If you want extra redundancy, also set up UptimeRobot as a backup.

---

## ✅ Verification Checklist

After deployment, verify everything works:

### Backend Checks

- [ ] Visit `https://your-backend.onrender.com/health` - should return `{"status":"UP","timestamp":"..."}`
- [ ] Visit `https://your-backend.onrender.com/api/test` - should return text
- [ ] Check Render logs for keep-alive pings (should see `[Keep-Alive] ✅ Health check successful` every 10 minutes)
- [ ] MongoDB connection is working (check Render logs for `MongoDB Connected`)

### Frontend Checks

- [ ] Visit your Vercel URL
- [ ] Page loads without errors
- [ ] Can navigate to Login/Register pages
- [ ] Browser console has no CORS errors
- [ ] Network tab shows successful API calls to your Render backend

### Keep-Alive Verification

1. **Check Render Logs**:
   - Go to Render dashboard
   - View logs for your backend service
   - Should see periodic messages: `[Keep-Alive] ✅ Health check successful at ...`
   - If using UptimeRobot, also check UptimeRobot dashboard for ping history

2. **Verify App Doesn't Spin Down**:
   - Note the last log time
   - Wait 15+ minutes (don't access the app)
   - Check logs again - should see keep-alive pings at the 10-minute mark
   - This proves the app is staying awake

---

## 🔧 Troubleshooting

### Frontend won't load

**Problem**: `CORS error` or `Cannot connect to API`

- **Solution**:
  - Verify `VITE_API_URL` is set correctly in Vercel
  - Verify backend CORS is configured for your Vercel URL
  - Check server.js: `CLIENT_URL` should match your Vercel URL

### Backend returning errors

**Problem**: `MongoDB connection error`

- **Solution**:
  - Verify `MONGO_URI` is correct in Render env vars
  - Check MongoDB Atlas network access allows `0.0.0.0/0`
  - Verify database user password is correct

**Problem**: `Keep-Alive not working`

- **Solution**:
  - Check Render logs for `[Keep-Alive]` messages
  - Verify `NODE_ENV=production` in Render env vars
  - Verify `HEALTH_CHECK_URL` is set and correct

### Deployment failures

**Problem**: Build fails on Render

- **Solution**:
  - Check build logs in Render dashboard
  - Ensure `npm start` works locally: `NODE_ENV=production npm start`
  - Verify all dependencies in `package.json`

**Problem**: Build fails on Vercel

- **Solution**:
  - Ensure `npm run build` works locally: `npm run build`
  - Check Vercel build logs for errors
  - Verify `dist` directory is created

---

## 📊 Monitoring & Maintenance

### Regular Checks

- **Weekly**: Verify health endpoint is responding
- **Monthly**: Check Render logs for any errors or restart patterns
- **Monthly**: Verify keep-alive pings are consistent in logs

### Scaling Up

When ready to go beyond free tier:

1. **Frontend**:
   - Vercel Hobby tier ($5/mo) for better performance
   - Vercel Pro ($20/mo) for unlimited scale

2. **Backend**:
   - Render Starter ($7/mo) for persistent uptime (no spin-down)
   - Render Standard ($12+/mo) for better performance

3. **Database**:
   - MongoDB Atlas M2 ($57/mo) for dedicated cluster

---

## 🔐 Security Notes

### Environment Variables

Never commit sensitive data:

- ✅ Store in `.env.example` as templates
- ✅ Store actual values in Vercel/Render dashboards
- ❌ Never push `.env` files to GitHub

### CORS Configuration

Current setup:

```javascript
cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
});
```

This is **secure** - only your frontend domain can access the API.

### Database Security

Current setup:

- ✅ MongoDB authentication enabled
- ✅ Database user has limited permissions
- ⚠️ IP whitelist set to `0.0.0.0/0` (open to all IPs, required for Render)
- Recommendation: Consider IP whitelist when moving to production tier

---

## 📞 Support & Resources

- **Render Docs**: https://docs.render.com
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Render Community**: https://render.com/community
- **Vercel Community**: https://vercel.com/support

---

## 🎉 Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Set up keep-alive (built-in is automatic)
4. ✅ Test both deployments
5. ✅ Share your app link with others!

Good luck! 🚀
