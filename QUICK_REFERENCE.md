# ⚡ Deployment Quick Reference

Your Connectors App - Production URLs

---

## 🔗 Service URLs

| Service         | URL                                       | Status             |
| --------------- | ----------------------------------------- | ------------------ |
| **Backend API** | `https://campusconnect-7wum.onrender.com` | ✅ Deployed        |
| **Frontend**    | `https://campusconnect.vercel.app`        | 🔄 Ready to Deploy |
| **MongoDB**     | Atlas (Private)                           | ✅ Connected       |

---

## 📝 Environment Variables

### For Vercel Frontend

Set these in Vercel Dashboard: Settings → Environment Variables

```
VITE_API_URL=https://campusconnect-7wum.onrender.com
```

Then **Redeploy** or push to trigger automatic deployment.

### For Render Backend (Already Set)

```
NODE_ENV=production
MONGO_URI=<your-mongodb-uri>
CLIENT_URL=<your-vercel-url>  # Update when frontend is deployed
JWT_SECRET=<secret>
HUGGINGFACE_API_KEY=<api-key>
HEALTH_CHECK_URL=https://campusconnect-7wum.onrender.com/health
```

---

## ✅ Current Status

| Component  | Status       | Actions              |
| ---------- | ------------ | -------------------- |
| Backend    | ✅ Deployed  | Monitor logs         |
| Frontend   | 🔄 Ready     | Deploy to Vercel     |
| Database   | ✅ Connected | Running              |
| Keep-Alive | ✅ Active    | Check logs for pings |

---

## 🚀 Next Step: Deploy Frontend

### Quick Deploy (2 minutes)

1. **Go to** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Select** your Connectors project
3. **Click** Settings → Environment Variables
4. **Add**:
   ```
   VITE_API_URL=https://campusconnect-7wum.onrender.com
   ```
5. **Click** Deployments → Redeploy (or push to GitHub)
6. **Wait** for deployment (~2 min)
7. **Visit** your Vercel URL

### Verify It Works

```bash
# Test backend
curl https://campusconnect-7wum.onrender.com/health

# Test frontend (after deployed)
# Visit your Vercel URL in browser
# Check DevTools → Network tab
# API calls should go to campusconnect-7wum.onrender.com
```

---

## 🔍 Testing

### Backend Health

```bash
curl https://campusconnect-7wum.onrender.com/health
# Expected: {"status":"UP","timestamp":"..."}
```

### Backend API

```bash
curl https://campusconnect-7wum.onrender.com/api/test
# Expected: API Test Working
```

### Frontend (After Deploy)

- Visit your Vercel URL
- Check browser console for errors
- Test login/register flow
- Network tab should show API calls to campusconnect-7wum.onrender.com

---

## 📊 Keep-Alive Monitoring

Check Render logs for:

```
[Keep-Alive] ✅ Health check successful
```

This should appear every 10 minutes. If you see it, your app is staying awake 24/7.

---

## 🆘 Common Issues

| Issue                       | Solution                                                     |
| --------------------------- | ------------------------------------------------------------ |
| API calls fail / CORS error | Update `CLIENT_URL` on Render with your Vercel URL, redeploy |
| Frontend blank page         | Hard refresh: `Ctrl+Shift+R`, check build logs               |
| Slow first request          | Normal if backend was sleeping (keep-alive prevents this)    |
| Backend error 500           | Check Render logs for database/API errors                    |

---

## 📞 Quick Commands

```bash
# Test from terminal
curl -i https://campusconnect-7wum.onrender.com/health

# Check it's production
curl https://campusconnect-7wum.onrender.com/ | head -20

# Verify keep-alive in logs
# (In Render dashboard → Logs → search for "Keep-Alive")
```

---

## 🎉 What's Next

1. ✅ Backend deployed ✓
2. 🔄 Deploy frontend to Vercel (set VITE_API_URL)
3. 🔗 Link them (update CLIENT_URL on Render with Vercel URL)
4. ✅ Test end-to-end
5. 📊 Monitor logs weekly

---

**Backend**: https://campusconnect-7wum.onrender.com ✅  
**Frontend**: Ready to deploy 🚀  
**Keep-Alive**: Active 24/7 ✅

Next: Follow [VERCEL_BACKEND_SETUP.md](VERCEL_BACKEND_SETUP.md) to deploy frontend.
