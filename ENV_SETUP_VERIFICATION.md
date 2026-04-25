# ✅ Environment Variables Setup - Verification

JWT Secret is already configured: `campus_connect_dev_secret_2026`

---

## 📋 Verify All Environment Variables on Render

Go to [Render Dashboard](https://dashboard.render.com) and check your backend service has ALL of these:

| Variable             | Status | Example Value                                    |
| -------------------- | ------ | ------------------------------------------------ |
| `NODE_ENV`           | ?      | `production`                                     |
| `PORT`               | ?      | `5000`                                           |
| `MONGO_URI`          | ?      | `mongodb+srv://...`                              |
| `JWT_SECRET`         | ✅     | `campus_connect_dev_secret_2026`                 |
| `CLIENT_URL`         | ?      | `https://connectentrepreneur.vercel.app`         |
| `HEALTH_CHECK_URL`   | ?      | `https://campusconnect-7wum.onrender.com/health` |
| `HUGGING_FACE_TOKEN` | ?      | (your HuggingFace token)                         |

---

## 🚀 Next Steps

### If you've already set all env vars:

1. **Redeploy on Render**:
   - Dashboard → Backend Service → Deployments
   - Click **Manual Deploy** → **Deploy latest commit**
   - Wait for completion (~2-3 min)

2. **Check Logs** (should show):

   ```
   [dotenv] injecting env (6+) from .env
   MongoDB Connected
   [Keep-Alive] Service started
   ```

3. **Test from Frontend**:
   - Visit https://connectentrepreneur.vercel.app
   - Try to **Register** with new account
   - Should work now (no 500 error) ✅

### If you haven't set other env vars yet:

Go to Render → Your Service → Environment and add:

```
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
CLIENT_URL=https://connectentrepreneur.vercel.app
HEALTH_CHECK_URL=https://campusconnect-7wum.onrender.com/health
HUGGING_FACE_TOKEN=your_token_here_or_leave_blank
```

Then redeploy.

---

## 🧪 Quick Test

After redeploy, test the health endpoint:

```bash
curl https://campusconnect-7wum.onrender.com/health
```

Should return:

```json
{ "status": "UP", "timestamp": "2026-04-25T..." }
```

---

## ✨ If It Works

- ✅ Register endpoint should return 201 (not 500)
- ✅ Login should work
- ✅ Cookies should be set
- ✅ Keep-alive should ping every 10 min

---

## 🆘 If Still Getting 500 Error

Run this to test:

```bash
# Check if backend is running
curl https://campusconnect-7wum.onrender.com/

# Check health
curl https://campusconnect-7wum.onrender.com/health

# Try the register endpoint (will fail but shows if it reaches backend)
curl -X POST https://campusconnect-7wum.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{}'
```

Then share the response - we can debug further.

---

**Current Status**: JWT Secret ✅ | Other Env Vars ? | Redeploy ?

Once you redeploy and test, let me know if register/login works! 🚀
