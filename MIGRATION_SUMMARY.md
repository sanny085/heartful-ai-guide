# Migration Summary: Lovable → External Supabase

## 🎯 What You Need to Do

### 1. **Create External Supabase Project** (15 min)
- Sign up at [supabase.com](https://supabase.com)
- Create new project
- Copy credentials (URL, anon key, service role key)

### 2. **Migrate Database** (10 min)
```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 3. **Replace Lovable AI Gateway** (30 min)
- Choose AI provider (OpenAI recommended - you already use it for transcription)
- Get API key
- Update 3 edge functions:
  - `supabase/functions/chat/index.js`
  - `supabase/functions/generate-health-insights/index.js`
  - `supabase/functions/summarize-file/index.js`
- See `CODE_CHANGES_REFERENCE.md` for exact changes

### 4. **Configure Environment Variables** (5 min)
- Create `.env.local` with Supabase credentials
- Set AI API key in Supabase Dashboard → Edge Functions → Secrets

### 5. **Deploy Edge Functions** (5 min)
```bash
supabase functions deploy
```

### 6. **Set Up Authentication** (10 min)
- Configure Google OAuth in Supabase Dashboard
- Test sign in/out

### 7. **Test Everything** (15 min)
- Test authentication
- Test chat function
- Test health insights
- Test file summarization

**Total Time: ~1.5 hours**

---

## 📋 Quick Checklist

- [ ] Supabase project created
- [ ] Database migrated (`supabase db push`)
- [ ] Storage bucket created (`chat-files`)
- [ ] Edge functions updated (replace Lovable API)
- [ ] Environment variables set (`.env.local` + Supabase secrets)
- [ ] Edge functions deployed
- [ ] Google OAuth configured
- [ ] Everything tested

---

## 🔑 Key Files to Change

1. **Edge Functions** (3 files):
   - `supabase/functions/chat/index.js`
   - `supabase/functions/generate-health-insights/index.js`
   - `supabase/functions/summarize-file/index.js`

2. **Config**:
   - `supabase/config.toml` (change project_id)

3. **Environment**:
   - Create `.env.local` (Supabase credentials)

4. **Optional**:
   - `vite.config.js` (remove lovable-tagger if desired)

---

## 📚 Detailed Guides

- **Full Migration Guide**: See `MIGRATION_GUIDE.md`
- **Exact Code Changes**: See `CODE_CHANGES_REFERENCE.md`

---

## 🆘 Need Help?

1. Check `MIGRATION_GUIDE.md` for detailed steps
2. Check `CODE_CHANGES_REFERENCE.md` for exact code changes
3. Verify environment variables are set correctly
4. Check Supabase Dashboard → Edge Functions → Logs for errors

---

## 💡 Recommended AI Provider: OpenAI

**Why?**
- ✅ You already use it for `transcribe-audio` function
- ✅ Same API format as Lovable (easy migration)
- ✅ Good documentation
- ✅ Reliable service

**Models to use:**
- Chat: `gpt-4o-mini` (cheap) or `gpt-4o` (better quality)
- File summarization (with images): `gpt-4o` (has vision)
- Health insights: `gpt-4o-mini` (text-only, cheaper)

---

## 🚀 After Migration

1. Update your deployment (Vercel, Netlify, etc.) with new env vars
2. Monitor API usage and costs
3. Set up Supabase monitoring/alerts
4. Backup database regularly

---

Good luck! 🎉

