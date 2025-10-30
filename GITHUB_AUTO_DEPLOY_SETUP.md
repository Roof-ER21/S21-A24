# GitHub Auto-Deploy Setup for S21-A24

**Status:** ✅ GitHub Repository Created & Pushed
**Repository:** https://github.com/Roof-ER21/S21-A24
**Branch:** main

---

## ✅ COMPLETED STEPS

1. ✅ Initialized Git repository
2. ✅ Created .gitignore (protects sensitive files)
3. ✅ Made initial commit
4. ✅ Created GitHub repository: `Roof-ER21/S21-A24`
5. ✅ Pushed code to GitHub (without API keys for security)

---

## 🎯 NEXT: Connect GitHub to Railway S21-A24

Now you need to connect your GitHub repo to the Railway **S21-A24** service (NOT the S21 service!).

### Step-by-Step Instructions:

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/project/miraculous-warmth
   - Find the **S21-A24** service (NOT "S21"!)

2. **Connect GitHub Repository**
   - Click on **S21-A24** service
   - Go to **Settings** tab
   - Find **Source** section
   - Click **"Connect Repo"** button
   - Select repository: **`Roof-ER21/S21-A24`**
   - Branch: **`main`**
   - Root Directory: `/` (leave as default)

3. **Add Environment Variables**
   - Go to **Variables** tab in S21-A24 service
   - Click **"+ New Variable"** for each:

   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_TOGETHER_API_KEY=your_together_api_key_here
   VITE_HF_API_KEY=your_huggingface_api_key_here
   ```

4. **Configure Build & Deploy** (if not auto-detected)
   - Go to **Settings** → **Build & Deploy**
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run preview -- --host 0.0.0.0 --port ${PORT:-4173}`
   - **Watch Paths:** Leave default

5. **Fix Port Configuration**
   - Go to **Settings** → **Networking**
   - **Public Networking** section
   - Change port from `3001` to `4173` (or whatever Vite preview uses)
   - This avoids conflict with the S21 service

6. **Trigger Deployment**
   - Railway should auto-deploy when you connect the repo
   - Or click **"Deploy"** button manually
   - Watch the **Deployments** tab for build logs

---

## 🔍 VERIFY DEPLOYMENT

After Railway builds and deploys:

1. **Check URL**
   - Visit: https://s21a24.up.railway.app
   - Should load S21-A24 interface
   - Should NOT affect s21.up.railway.app (original S21)

2. **Test Features**
   - [ ] Chat works
   - [ ] State selector (click "State" button → VA/MD/PA)
   - [ ] Training modal (click "Train" button)
   - [ ] Voice input (click microphone)
   - [ ] StatusDashboard (bottom-right floating button)

3. **Check S21 Is Still Running**
   - Visit: https://s21.up.railway.app
   - Original S21 service should be unaffected

---

## 🚨 TROUBLESHOOTING

### Issue: Build Fails
**Solution:**
- Check Railway build logs for errors
- Verify all dependencies in package.json
- Ensure Node version is compatible (18+)

### Issue: Deployment Crashes
**Solution:**
- Check start command is correct
- Verify environment variables (VITE_ prefix)
- Check port configuration (should be 4173 or $PORT)

### Issue: "Port Already in Use"
**Solution:**
- S21-A24 must use a different port than S21
- Change S21-A24 port to 4173 in Railway settings
- Or use custom domain

### Issue: Environment Variables Not Working
**Solution:**
- All variables must have `VITE_` prefix for Vite
- Railway variables without VITE_ won't be seen by the app
- Re-add them with VITE_ prefix

---

## 📊 AUTO-DEPLOY WORKFLOW

Once connected, auto-deploy works like this:

1. **You push code to GitHub:**
   ```bash
   cd /Users/a21/Desktop/S21-A24
   git add .
   git commit -m "Update feature"
   git push
   ```

2. **Railway automatically:**
   - Detects the push
   - Pulls latest code
   - Runs `npm run build`
   - Deploys to s21a24.up.railway.app
   - Updates live site

3. **You verify:**
   - Check deployment logs in Railway
   - Visit s21a24.up.railway.app
   - Test the new features

---

## 🔐 SECURITY NOTES

- ✅ `.env.local` is in `.gitignore` (NOT pushed to GitHub)
- ✅ API keys are in Railway environment variables (NOT in code)
- ✅ GitHub repository is public but contains no secrets
- ✅ Railway injects environment variables at build time

---

## 📝 MAKING UPDATES

To update the deployed app:

```bash
# Make changes to code
cd /Users/a21/Desktop/S21-A24
# Edit files...

# Commit and push
git add .
git commit -m "Your update message"
git push

# Railway auto-deploys!
```

---

## 🎯 CURRENT STATUS

- ✅ **GitHub Repo:** Created at https://github.com/Roof-ER21/S21-A24
- ✅ **Code Pushed:** All code (except sensitive files)
- ✅ **Branch:** main
- ⏳ **Railway Connection:** Ready to connect (follow steps above)
- ⏳ **Auto-Deploy:** Will work once connected

---

## 💡 TIPS

1. **Test Locally First:**
   ```bash
   npm run build && npm run preview
   # Visit http://localhost:4173
   ```

2. **Check Build Output:**
   - Build should succeed locally before pushing
   - Fix any TypeScript errors before deployment

3. **Monitor Railway Logs:**
   - Watch build logs for errors
   - Check deployment logs for runtime issues

4. **Use Environment Variables:**
   - Never hardcode API keys in code
   - Always use `import.meta.env.VITE_*` in Vite

---

## 🚀 READY TO DEPLOY!

**Next Action:** Go to Railway Dashboard and connect the GitHub repo to S21-A24 service!

Once connected, Railway will:
- Auto-build from GitHub
- Auto-deploy to s21a24.up.railway.app
- Auto-redeploy on every push

**Repository:** https://github.com/Roof-ER21/S21-A24
**Target Service:** S21-A24 (NOT S21!)
**Target URL:** s21a24.up.railway.app (NOT s21.up.railway.app!)

---

*Created: October 29, 2025*
*S21-A24 GitHub Auto-Deploy Setup*
