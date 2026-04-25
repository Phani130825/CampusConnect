# Deployment Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Frontend Issues

#### Problem: `Cannot reach API` / `CORS Error`

```
Error: Access to XMLHttpRequest at 'https://backend.onrender.com/...'
from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

**Solutions**:

1. Check Vercel environment variable:

   ```bash
   VITE_API_URL=https://your-backend.onrender.com  # NO trailing slash
   ```

2. Check backend CORS configuration in `server/server.js`:

   ```javascript
   origin: process.env.CLIENT_URL || "http://localhost:5173";
   ```

3. Verify `CLIENT_URL` is set in Render environment:

   ```
   CLIENT_URL=https://your-frontend.vercel.app
   ```

4. **Full restart**:
   - Redeploy backend on Render
   - Redeploy frontend on Vercel
   - Clear browser cache: Ctrl+Shift+Delete

---

#### Problem: Page shows blank / Error in console

```
Module not found / Failed to fetch module
```

**Solutions**:

1. Check Vercel build logs
2. Ensure `npm run build` works locally:

   ```bash
   cd client
   npm install
   npm run build
   ```

3. Check for TypeScript/JSX errors:
   ```bash
   npm run lint
   ```

---

#### Problem: Infinite loading / API never responds

**Solutions**:

1. Check if backend is actually deployed:

   ```bash
   curl https://your-backend.onrender.com/health
   ```

   Should return: `{"status":"UP","timestamp":"..."}`

2. If backend is spinning down:
   - Check Render logs for `[Keep-Alive]` messages
   - If not present, see "Keep-Alive not working" below

3. Check network latency:
   - Open DevTools → Network tab
   - Look at request timing
   - If >30s, backend may be starting up

---

### 🔴 Backend Issues

#### Problem: `MongoDB Connection Error`

```
Error: connect ECONNREFUSED 127.0.0.1:27017
Error: Server at cluster-xyz.mongodb.net:27017 unavailable
```

**Solutions**:

1. Verify MongoDB URI in Render environment:

   ```
   MONGO_URI=mongodb+srv://user:password@cluster-xyz.mongodb.net/dbname?retryWrites=true&w=majority
   ```

2. Check MongoDB credentials:
   - Username and password must be URL-encoded
   - Special chars: `@` → `%40`, `#` → `%23`
3. Check MongoDB Atlas network access:
   - Go to MongoDB Atlas
   - Security → Network Access
   - Ensure `0.0.0.0/0` is in IP whitelist
   - Or add Render's IP addresses

4. Test connection locally:
   ```bash
   mongosh "mongodb+srv://user:password@cluster.mongodb.net/dbname"
   ```

---

#### Problem: `Unexpected token` / Build failure

```
SyntaxError: Unexpected token ')'
```

**Solutions**:

1. Check server build locally:

   ```bash
   cd server
   npm install
   npm test
   ```

2. Check for CommonJS/ES modules issues:
   - Ensure `"type": "commonjs"` in `server/package.json`
   - All requires should use `require()`
   - Not `import`

3. Check `server/server.js` syntax:
   ```bash
   node -c server/server.js  # Check syntax
   ```

---

#### Problem: `PORT already in use`

```
Error: listen EADDRINUSE :::5000
```

**Solution**:

- This is usually fine on Render (different process)
- Check locally:
  ```bash
  lsof -i :5000  # Find process using port 5000
  kill -9 <PID>  # Kill process
  ```

---

### 🔴 Keep-Alive Issues

#### Problem: App spinning down (500 error after 15+ min)

**Check 1**: Verify NODE_ENV is production

```bash
# In Render environment variables:
NODE_ENV=production  # ✅ This MUST be set
```

**Check 2**: Verify keep-alive.js exists

```bash
# Should exist:
server/utils/keepAlive.js
```

**Check 3**: Check Render logs for keep-alive messages

```
Look for: [Keep-Alive] Service started
Look for: [Keep-Alive] ✅ Health check successful every 10 min
```

If these logs are missing:

- Redeploy backend
- Clear logs and wait 10 minutes
- If still missing, manually verify:
  ```bash
  # From Render terminal (if available)
  curl http://localhost:5000/health
  ```

**Check 4**: Verify health endpoint exists

- Visit: `https://your-backend.onrender.com/health`
- Should return JSON with status

**Check 5**: Enable external monitoring (backup)

- Use UptimeRobot (free) for redundancy
- Set up 5-minute interval pings to `/health`

---

#### Problem: Keep-alive failing (error messages in logs)

Example error:

```
[Keep-Alive] ❌ Health check failed: ECONNREFUSED
```

**Solutions**:

1. Verify `HEALTH_CHECK_URL` is correct:

   ```
   HEALTH_CHECK_URL=https://your-backend.onrender.com/health
   # NOT: http://localhost:5000/health
   ```

2. Verify health endpoint is accessible:

   ```bash
   curl https://your-backend.onrender.com/health
   ```

3. Check if keep-alive URL has trailing slash issue:
   ```
   ✅ GOOD: https://your-backend.onrender.com/health
   ❌ BAD: https://your-backend.onrender.com/health/
   ```

---

### 🔴 Deployment Issues

#### Problem: Render build stuck / times out

```
Build timed out after 30 minutes
```

**Solutions**:

1. Optimize dependencies:

   ```bash
   npm prune  # Remove unused packages
   npm audit  # Check for bloated packages
   ```

2. Check for large files:

   ```bash
   find . -size +10M -type f  # Find large files
   ```

3. Clear build cache in Render:
   - Go to Render dashboard
   - Service settings → "Clear build cache"
   - Redeploy

---

#### Problem: Vercel build fails

```
Build failed with error
```

**Solutions**:

1. Check Vercel build logs for specific error
2. Ensure build works locally:

   ```bash
   cd client
   npm run build
   npm run lint
   ```

3. Check for environment variable issues:
   - All `VITE_` variables must be set
   - Test locally: `VITE_API_URL=... npm run build`

---

#### Problem: Vercel deployment succeeds but site doesn't work

**Solutions**:

1. Check SPA routing in Vercel config:
   - `client/vercel.json` should have rewrites
   - Frontend routing should work without errors

2. Clear Vercel cache:
   - Vercel dashboard → Project → Redeploy

3. Hard refresh browser:
   - Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

### 🔴 Performance Issues

#### Problem: Very slow API responses (>5 seconds)

**Causes**:

1. Render free tier is spinning up (cold start)
   - First request after 15min inactivity: ~30s
   - Subsequent requests: <100ms
   - Solution: Use keep-alive to prevent spin-down

2. MongoDB query is slow
   - Add database indexes
   - Check query performance

3. Network latency
   - Choose regions closer to your users

**Solutions**:

1. Verify keep-alive is running (see above)
2. Monitor database performance in MongoDB Atlas
3. Consider upgrading Render tier

---

#### Problem: Frontend is loading slowly

**Solutions**:

1. Check bundle size:

   ```bash
   npm install -g vite
   vite analyze  # In client directory
   ```

2. Enable compression in Vercel (automatic)

3. Optimize images:
   - Use WebP format
   - Lazy load non-critical images

4. Check Vercel Analytics:
   - Vercel dashboard → Analytics
   - Identify slow pages

---

### 🔴 Authentication Issues

#### Problem: Login returns `401 Unauthorized`

**Solutions**:

1. Verify JWT_SECRET is set in Render

   ```
   JWT_SECRET=your-secret-key-same-as-local
   ```

2. Ensure same JWT_SECRET locally and in production:

   ```bash
   # Generate consistent secret:
   openssl rand -base64 32  # Use this value everywhere
   ```

3. Check token expiration in code:
   - Verify token claims are set correctly
   - Check if `expiresIn` is reasonable (e.g., 7 days)

---

#### Problem: Cookies not persisting

**Solutions**:

1. Check CORS credentials setting:

   ```javascript
   // In server.js - MUST have:
   cors({
     origin: process.env.CLIENT_URL,
     credentials: true, // ✅ This is required
   });
   ```

2. Check frontend axios config:

   ```javascript
   axios.create({
     withCredentials: true, // ✅ This must be set
   });
   ```

3. Ensure secure/SameSite cookie flags:
   - In production (https), cookies need `Secure` flag
   - This is usually automatic with credentials: true

---

### 🟡 Database Issues

#### Problem: MongoDB Atlas quota exceeded

```
Quota: Connection pool of 0 threads exhausted
```

**Solutions**:

1. Go to MongoDB Atlas dashboard
2. Upgrade from M0 (free) to M2 ($57/mo)
3. Or optimize connection pooling:
   ```javascript
   mongoose.connect(MONGO_URI, {
     maxPoolSize: 10,
     minPoolSize: 5,
   });
   ```

---

#### Problem: Data not persisting / Getting cleared

**Solutions**:

1. Verify MongoDB is actually connected:
   - Check logs for `MongoDB Connected`
   - Test connection manually

2. Verify write permissions:
   - Check MongoDB user roles in Atlas
   - Should have `readWrite@any database` role

3. Check backups:
   - MongoDB Atlas has auto backups
   - Can restore if data was accidentally deleted

---

### 🟢 Quick Diagnostic Steps

When something is broken, follow this order:

1. **Check service health**:

   ```bash
   curl https://your-backend.onrender.com/health
   # Should return: {"status":"UP",...}
   ```

2. **Check logs**:
   - Render: Dashboard → Service → Logs
   - Vercel: Dashboard → Project → Deployments → Logs
   - Look for error keywords

3. **Check environment variables**:
   - Render: Settings → Environment
   - Vercel: Settings → Environment Variables
   - Verify all required vars are set

4. **Redeploy**:
   - Clear cache
   - Full redeploy (not partial)
   - Wait for completion

5. **Test locally**:
   - Run backend: `npm start`
   - Run frontend: `npm run dev`
   - Test same flow as production

---

### 📞 Getting Help

If issues persist:

1. **Check logs first** - 90% of issues visible in logs
2. **Search existing issues**:
   - GitHub discussions
   - Stack Overflow
   - Service provider (Render, Vercel) docs
3. **Minimal reproduction**:
   - Can you replicate locally?
   - Does issue happen on every request?
   - Is it timing dependent?

---

## Useful Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Verify syntax
node -c server/server.js

# Test backend locally
NODE_ENV=production npm start

# Test frontend build
npm run build

# Check ports in use (Mac/Linux)
lsof -i :5000

# Check ports in use (Windows)
netstat -ano | findstr :5000

# Force cache clear (npm)
npm cache clean --force

# Reinstall dependencies (clean)
rm -rf node_modules package-lock.json
npm install
```

---

## Prevention Checklist

- [ ] Always test locally before deploying
- [ ] Check all environment variables before deployment
- [ ] Monitor logs regularly (first week)
- [ ] Set up external monitoring (UptimeRobot)
- [ ] Enable Render/Vercel notifications
- [ ] Keep dependencies updated
- [ ] Test keep-alive locally: `npm run test:keepalive`

Good luck! 🚀
