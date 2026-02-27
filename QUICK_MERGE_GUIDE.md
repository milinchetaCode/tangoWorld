# Quick Merge Guide - Environment Configuration PR

## 🚦 Safe to Merge?

### ✅ YES, if you can answer YES to these:
- [ ] `DATABASE_URL` is set in Render Dashboard for tango-backend service
- [ ] You're okay with users logging in again (if JWT_SECRET changes)
- [ ] Your team knows to create `.env` files for local dev

### ⚠️ CHECK FIRST:
1. Go to Render Dashboard
2. Open `tango-backend` service
3. Click "Environment" tab
4. Look for `DATABASE_URL` variable
   - **Found it?** → ✅ Safe to merge
   - **Not found?** → ⚠️ Add it first (see below)

---

## 📋 Pre-Merge Setup (If Needed)

### If DATABASE_URL is Missing:

```bash
# 1. Get your PostgreSQL connection string from Render
#    Dashboard → Database Service → Connection Details

# 2. Add to tango-backend service:
#    Dashboard → tango-backend → Environment → Add Environment Variable
#    
#    Key:   DATABASE_URL
#    Value: postgresql://user:pass@host:port/database
```

**That's it!** JWT_SECRET will be auto-generated from render.yaml.

---

## 🎯 What Happens When You Merge?

### On Render (Production):
1. ✅ Render auto-deploys
2. ✅ JWT_SECRET auto-generated (if not present)
3. ✅ Backend validates config at startup
4. ✅ If validation passes → deployment succeeds
5. ❌ If validation fails → deployment fails with clear error

### For Local Development:
- ⚠️ Developers need to run:
  ```bash
  cd backend && cp .env.example .env
  cd frontend && cp .env.example .env.local
  # Then edit both files
  ```

### For Users:
- ⚠️ **If JWT_SECRET changes:** Users must log in again
- ✅ **If JWT_SECRET stays same:** No impact

---

## 🔧 Post-Merge Issues?

### "DATABASE_URL is required" error
→ Add DATABASE_URL in Render Dashboard

### "JWT_SECRET is required" error  
→ Check render.yaml has `generateValue: true` OR add manually

### Users can't log in
→ Expected if JWT_SECRET changed - they need to log in again

### Build fails
→ Check Render logs - likely missing env var

---

## 📞 Need Help?

Check detailed guides:
- `MERGE_IMPACT_ASSESSMENT.md` - Comprehensive guide
- `ENVIRONMENT_CONFIGURATION.md` - Full documentation
- `ENVIRONMENT_IMPLEMENTATION_SUMMARY.md` - What changed

---

## ⚡ TL;DR

**Check:** DATABASE_URL set in Render? → **Yes** = Merge it! → **No** = Add it first

**After merge:** Team needs `.env` files for local dev (2 min setup)

**User impact:** Might need to log in again (if JWT_SECRET changes)

**Rollback:** Revert merge if needed - previous version will redeploy

---

**Status:** ✅ Safe to merge (with proper setup)  
**Risk Level:** 🟢 Low (if DATABASE_URL configured)  
**Setup Time:** ⏱️ 2-5 minutes  
**User Impact:** 🟡 May need to re-login
