# 🔧 CORS Fix for Production Deployment

**Issue**: CORS error when frontend calls backend  
**Root Cause**: Backend CORS was not allowing your Vercel frontend URL  
**Solution**: Updated backend CORS configuration to support multiple origins

---

## ✅ What Was Fixed

### Backend CORS Configuration

Updated `server/server.js` to allow:

- ✅ `http://localhost:5173` (local development)
- ✅ `http://localhost:3000` (alternative local port)
- ✅ `https://connectentrepreneur.vercel.app` (production frontend)
- ✅ `process.env.CLIENT_URL` (environment variable if set)

### Why This Works

The new configuration uses a **function-based origin check** instead of a single string. This is more flexible and production-ready.

---

## 🚀 Deploy the Fix

### Step 1: Push to GitHub

```bash
git add server/server.js
git commit -m "Fix CORS configuration for production (Vercel + Render)"
git push origin main
```

### Step 2: Redeploy Backend on Render

#### Option A: Auto-redeploy via GitHub

- If you have auto-deploy enabled, Render will automatically redeploy when you push
- Go to [Render Dashboard](https://dashboard.render.com)
- Check your backend service logs to confirm deployment

#### Option B: Manual redeploy

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your **connectors-backend** service
3. Click **Manual Deploy** → **Deploy latest commit**
4. Wait for deployment to complete

### Step 3: Verify the Fix

**Check Backend Logs**:

1. Render Dashboard → Backend Service → Logs
2. Look for: `[CORS] Blocked request from origin:` (should NOT see your Vercel URL here)
3. If you see your Vercel URL here, CORS is working correctly!

**Test from Frontend**:

1. Visit `https://connectentrepreneur.vercel.app`
2. Open DevTools → Network tab
3. Try to log in or make an API call
4. You should see:
   - ✅ Network request to `https://campusconnect-7wum.onrender.com/api/...`
   - ✅ Status `200` (not `403` or `500`)
   - ✅ No CORS error in console

**Test API Directly**:

```bash
# This should work now (no CORS error)
curl -i https://campusconnect-7wum.onrender.com/health
```

---

## 🔐 CORS Security Explained

### What Your Config Does

```javascript
const allowedOrigins = [
  "http://localhost:5173", // Local dev
  "https://connectentrepreneur.vercel.app", // Production
  process.env.CLIENT_URL, // Environment variable
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow if origin is in whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Reject if not in whitelist
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies/auth
  }),
);
```

### Why This Is Good

- ✅ **Whitelist approach** - Only allowed origins can access your API
- ✅ **Credentials enabled** - Cookies work for authentication
- ✅ **Production-ready** - No `origin: "*"` (which breaks auth)
- ✅ **Flexible** - Easy to add more origins later

### Credentials + CORS

For auth to work with cookies:

- Backend: `credentials: true` ✅ (we have this)
- Frontend: `axios.defaults.withCredentials = true` ✅ (already set)
- Both: Origins must match exactly (not `*`)

---

## 📋 After Deployment Checklist

- [ ] Pushed code to GitHub
- [ ] Render service redeployed
- [ ] Check Render logs (no blocked CORS messages for your Vercel URL)
- [ ] Visit Vercel frontend
- [ ] Try to log in
- [ ] Check Network tab - API calls should work
- [ ] No CORS errors in browser console
- [ ] Auth/cookies working

---

## 🆘 If CORS Still Fails

### 1. Verify Backend Redeployed

```bash
# Check if backend has the fix
curl https://campusconnect-7wum.onrender.com/health
# Should return: {"status":"UP",...}
```

### 2. Check Render Logs

- Go to Render Dashboard
- Select backend service
- View **Logs** tab
- Search for your Vercel URL

If you see:

```
[CORS] Blocked request from origin: https://connectentrepreneur.vercel.app
```

Then the fix didn't deploy. Redeploy again manually.

### 3. Clear Browser Cache

```
Ctrl+Shift+Delete → Clear All → Hard refresh (Ctrl+Shift+R)
```

### 4. Test Origin Directly

```bash
# Test what origins are allowed
curl -H "Origin: https://connectentrepreneur.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS https://campusconnect-7wum.onrender.com/api/auth/login
```

Should see `Access-Control-Allow-Origin: https://connectentrepreneur.vercel.app` in response.

---

## 📊 Before vs After

### Before (Broken ❌)

```
Frontend: https://connectentrepreneur.vercel.app
Backend CORS: origin: "http://localhost:5173"
Result: CORS Error ❌
```

### After (Fixed ✅)

```
Frontend: https://connectentrepreneur.vercel.app
Backend CORS: Checks whitelist including "https://connectentrepreneur.vercel.app"
Result: API Works ✅
```

---

## 🎯 Your URLs

| Service         | URL                                     |
| --------------- | --------------------------------------- |
| **Frontend**    | https://connectentrepreneur.vercel.app  |
| **Backend API** | https://campusconnect-7wum.onrender.com |
| **Database**    | MongoDB Atlas (private)                 |

---

## ✨ What's Now Whitelisted

Your backend now accepts requests from:

| Origin                                   | Purpose                       |
| ---------------------------------------- | ----------------------------- |
| `http://localhost:5173`                  | Local development (Vite)      |
| `http://localhost:3000`                  | Alternative local port        |
| `https://connectentrepreneur.vercel.app` | Production frontend           |
| `process.env.CLIENT_URL`                 | Environment variable (if set) |

All other origins will be rejected.

---

## 🚀 Next Steps

1. **Deploy**: Push and redeploy on Render
2. **Verify**: Test frontend → API calls work
3. **Use**: Your app is now live!

If you need to add more origins later (like a mobile app or another domain), just add them to the `allowedOrigins` array.

---

**Issue Fixed**: CORS now allows your production frontend ✅  
**Status**: Ready to redeploy and test! 🎉
