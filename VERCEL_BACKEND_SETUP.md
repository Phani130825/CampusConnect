# 🚀 Vercel Setup with Deployed Backend

Your backend is now live at: `https://campusconnect-7wum.onrender.com/`

## ✅ Quick Vercel Setup

### Option 1: Update via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `Connectors` project
3. Click **Settings** → **Environment Variables**
4. Add or update:
   ```
   VITE_API_URL=https://campusconnect-7wum.onrender.com
   ```
5. Click **Save**
6. Go to **Deployments** and click **Redeploy** (or push to GitHub to trigger auto-deploy)
7. Wait for deployment to complete

### Option 2: Deploy via Git Push

1. Make sure your code is committed
2. Push to your main branch:
   ```bash
   git push origin main
   ```
3. This will trigger automatic deployment if you have it configured
4. Vercel will use the environment variable you set

### Option 3: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not already)
npm install -g vercel

# Navigate to client directory
cd client

# Deploy with environment variables
vercel env pull  # Pull existing env vars
vercel deploy --prod  # Deploy to production
```

---

## ✅ Test Your Setup

### 1. Verify Environment Variable is Set

- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Confirm `VITE_API_URL` is set to: `https://campusconnect-7wum.onrender.com`

### 2. Test the Frontend

- Visit your Vercel URL (e.g., `https://campusconnect.vercel.app`)
- Open browser DevTools → Network tab
- Try to log in or make an API call
- Verify network requests go to `https://campusconnect-7wum.onrender.com/api/...`
- Should see `200` responses (not `404` or `CORS errors`)

### 3. Test in Browser Console

```javascript
// In browser console:
fetch("https://campusconnect-7wum.onrender.com/health")
  .then((r) => r.json())
  .then(console.log);

// Should return: {"status":"UP","timestamp":"..."}
```

### 4. Check for CORS Issues

- Network tab should NOT show CORS errors
- If you see CORS errors, it means the backend needs to allow your Vercel URL
- Contact backend admin to add your Vercel URL to `CLIENT_URL` environment variable

---

## 📋 Backend Configuration (Already Done)

Your backend `campusconnect-7wum.onrender.com` should have:

```
NODE_ENV=production
MONGO_URI=<MongoDB URI>
CLIENT_URL=<your-vercel-url>  # Will be set when frontend is deployed
JWT_SECRET=<secret>
HUGGINGFACE_API_KEY=<api-key>
```

---

## 🔗 Frontend ↔ Backend Communication Flow

```
Your Browser
    ↓
https://campusconnect.vercel.app (Vercel Frontend)
    ↓ (Makes API calls to)
https://campusconnect-7wum.onrender.com/api/... (Render Backend)
    ↓ (Queries)
MongoDB Atlas (Database)
```

---

## ✨ What's Happening

1. **Frontend** (Vercel):
   - Runs your React app
   - `VITE_API_URL=https://campusconnect-7wum.onrender.com`
   - Makes API calls to backend

2. **Backend** (Render):
   - Processes API requests
   - Connects to MongoDB
   - Keep-alive service pings every 10 minutes

3. **Database** (MongoDB Atlas):
   - Stores all data
   - Accessible only to backend

---

## 🆘 Troubleshooting

### Frontend Shows Blank Page

- Check Vercel build logs for errors
- Verify `VITE_API_URL` is set
- Hard refresh: `Ctrl+Shift+R`

### API Calls Fail / CORS Error

```
Access to XMLHttpRequest at 'https://campusconnect-7wum.onrender.com/api/...'
from origin 'https://campusconnect.vercel.app' has been blocked by CORS policy
```

**Solution**:

1. Update backend's `CLIENT_URL` environment variable with your Vercel URL
2. Redeploy backend
3. Try again

### Can't Connect to Backend

```bash
# Test the backend directly
curl https://campusconnect-7wum.onrender.com/health

# Should return: {"status":"UP","timestamp":"..."}
```

If this fails, the backend is down. Check [Render Dashboard](https://dashboard.render.com).

---

## 📱 Local Development (if needed)

To test locally before Vercel:

```bash
# Terminal 1: Start backend locally
cd server
npm install
npm start

# Terminal 2: Start frontend locally
cd client
npm install
npm run dev

# In browser:
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# API calls: http://localhost:5000/api/...
```

---

## 🔐 Security Notes

- ✅ Backend URL is public (it's an API)
- ✅ Frontend code is public (it's a web app)
- ✅ Secrets (JWT, API keys) stay on backend
- ✅ Database credentials never exposed to frontend

---

## 📞 Support

If you need to update the backend URL in the future:

1. Update `VITE_API_URL` in Vercel Environment Variables
2. Redeploy frontend
3. Done!

Or if backend moves to a different URL:

1. Update `VITE_API_URL=<new-url>` in Vercel
2. Update `HEALTH_CHECK_URL=<new-url>` on Render backend
3. Redeploy both services

---

## ✅ Checklist

- [ ] Backend URL: `https://campusconnect-7wum.onrender.com` ✓
- [ ] Set `VITE_API_URL` in Vercel Environment Variables
- [ ] Redeployed frontend
- [ ] Verified frontend loads
- [ ] Tested API calls (Network tab shows 200 responses)
- [ ] No CORS errors
- [ ] Login/Features work end-to-end

---

You're all set! Your frontend is now connected to your deployed backend. 🎉
