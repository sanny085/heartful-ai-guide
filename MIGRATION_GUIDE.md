# Migration Guide: Lovable → External Supabase

## 📋 Overview

This guide will help you migrate your Heartful AI Guide project from Lovable's internal Supabase to your own external Supabase instance. This includes migrating databases, authentication, edge functions, and replacing Lovable-specific services.

---

## 🔍 Current State Analysis

### Lovable-Specific Components Found:

1. **Lovable Tagger** (Development only)
   - `lovable-tagger` package in `vite.config.js`
   - Used for component tagging in development mode
   - **Action**: Remove or keep (optional, dev-only)

2. **Lovable AI Gateway**
   - Used in 3 edge functions:
     - `chat/index.js` - Chat completions
     - `generate-health-insights/index.js` - Health insights generation
     - `summarize-file/index.js` - File summarization
   - **Action**: Replace with OpenAI, Anthropic, or another AI provider

3. **Supabase Configuration**
   - Currently using Lovable's internal Supabase (`project_id: khkbaiabktpmjgpnxxse`)
   - Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Action**: Point to your external Supabase instance

4. **Edge Functions**
   - All functions use `Deno.env.get()` for environment variables
   - Functions are already structured for external Supabase
   - **Action**: Deploy to your external Supabase project

---

## 🚀 Migration Steps

### Phase 1: Set Up External Supabase Project

#### Step 1.1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Fill in:
   - **Name**: `heartful-ai-guide` (or your preferred name)
   - **Database Password**: Save this securely
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start

#### Step 1.2: Get Your Supabase Credentials
1. Go to **Project Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

#### Step 1.3: Install Supabase CLI (if not already installed)
```bash
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase

# Verify installation
supabase --version
```

#### Step 1.4: Link Your Project
```bash
cd /Users/sannymacpro/Documents/Projects/Company/Error_Tech/10000hearts/heartful-ai-guide
supabase link --project-ref YOUR_PROJECT_REF
# You'll find project-ref in Project Settings → General → Reference ID
```

---

### Phase 2: Database Migration

#### Step 2.1: Review Existing Migrations
Your project has 11 migration files in `supabase/migrations/`. These need to be applied to your new Supabase instance.

#### Step 2.2: Apply Migrations to External Supabase

**Option A: Using Supabase CLI (Recommended)**
```bash
# Make sure you're linked to your project
supabase db push

# This will apply all migrations in chronological order
```

**Option B: Manual Migration via Supabase Dashboard**
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy contents of each migration file (in order)
3. Run them sequentially

**Option C: Using Supabase Migration Tool**
```bash
# Generate a migration from your local database (if you have one)
supabase db diff -f initial_schema

# Or apply migrations directly
supabase migration up
```

#### Step 2.3: Verify Database Schema
1. Go to **Table Editor** in Supabase Dashboard
2. Verify these tables exist:
   - `profiles`
   - `user_roles`
   - `heart_health_assessments`
   - `conversations` (if exists)
   - `messages` (if exists)
   - Any other tables from your migrations

#### Step 2.4: Set Up Storage Buckets
1. Go to **Storage** in Supabase Dashboard
2. Create bucket: `chat-files`
   - Set as **Public** if files should be accessible
   - Or **Private** with RLS policies

---

### Phase 3: Replace Lovable AI Gateway

#### Step 3.1: Choose Your AI Provider

**Option A: OpenAI (Recommended - Already used for transcription)**
- Pros: Same provider as your `transcribe-audio` function, reliable
- Cons: Costs per token
- Setup: Get API key from [platform.openai.com](https://platform.openai.com)

**Option B: Anthropic Claude**
- Pros: Great for health/medical content, competitive pricing
- Cons: Different API structure
- Setup: Get API key from [console.anthropic.com](https://console.anthropic.com)

**Option C: Google Gemini (Direct API)**
- Pros: Same model you're using (`gemini-2.5-flash`)
- Cons: Need to set up Google Cloud account
- Setup: Get API key from [makersuite.google.com](https://makersuite.google.com)

#### Step 3.2: Update Edge Functions

You'll need to update these 3 functions:
- `supabase/functions/chat/index.js`
- `supabase/functions/generate-health-insights/index.js`
- `supabase/functions/summarize-file/index.js`

**For OpenAI (Example):**
Replace:
```javascript
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
// ...
fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    // ...
  })
})
```

With:
```javascript
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
// ...
fetch("https://api.openai.com/v1/chat/completions", {
  headers: {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: "gpt-4o-mini", // or "gpt-4", "gpt-3.5-turbo"
    // ...
  })
})
```

**For Anthropic:**
```javascript
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
// ...
fetch("https://api.anthropic.com/v1/messages", {
  headers: {
    "x-api-key": ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-3-5-sonnet-20241022",
    // ...
  })
})
```

#### Step 3.3: Set Environment Variables for Edge Functions
```bash
# Set secrets for your Supabase project
supabase secrets set OPENAI_API_KEY=sk-...
# OR
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

Or via Dashboard:
1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add your API key

---

### Phase 4: Update Frontend Configuration

#### Step 4.1: Create Environment Variables File
Create `.env.local` (or `.env`) in project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here

# Optional: For custom domain
VITE_DOMAIN=/
```

#### Step 4.2: Update Supabase Client (Already Correct)
Your `src/integrations/supabase/client.js` is already set up correctly to read from environment variables. No changes needed!

#### Step 4.3: Remove Lovable Tagger (Optional)
If you want to remove the Lovable tagger completely:

1. Remove from `vite.config.js`:
```javascript
// Remove this import
import { componentTagger } from "lovable-tagger";

// Remove from plugins array
mode === 'development' && componentTagger(),
```

2. Remove from `package.json`:
```bash
npm uninstall lovable-tagger
```

**Note**: You can keep it if you want - it's dev-only and doesn't affect production builds.

---

### Phase 5: Deploy Edge Functions

#### Step 5.1: Update Function Code
Make sure all edge functions are updated with:
- New AI provider API endpoints
- Correct environment variable names
- Proper error handling

#### Step 5.2: Deploy Functions
```bash
# Deploy all functions
supabase functions deploy chat
supabase functions deploy generate-health-insights
supabase functions deploy summarize-file
supabase functions deploy transcribe-audio

# Or deploy all at once
supabase functions deploy
```

#### Step 5.3: Verify Function Deployment
1. Go to **Edge Functions** in Supabase Dashboard
2. Verify all 4 functions are listed
3. Test each function using the **Invoke** button or via your frontend

---

### Phase 6: Authentication Setup

#### Step 6.1: Configure OAuth Providers
1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Enable **Google** OAuth:
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Add **Authorized redirect URIs**:
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     - `http://localhost:8080/profile` (for local dev)
   - Copy **Client ID** and **Client Secret** to Supabase

#### Step 6.2: Update Redirect URLs
Your `useAuth.jsx` already has the correct redirect setup:
```javascript
redirectTo: `${window.location.origin}/profile`
```

This will work automatically with your new Supabase instance.

#### Step 6.3: Test Authentication
1. Run your dev server: `npm run dev`
2. Try signing in with Google
3. Verify user is created in **Authentication** → **Users** in Supabase Dashboard

---

### Phase 7: Update Supabase Config

#### Step 7.1: Update `supabase/config.toml`
Replace the project_id:
```toml
project_id = "YOUR_NEW_PROJECT_REF"

[functions.chat]
verify_jwt = true

[functions.generate-health-insights]
verify_jwt = true

[functions.summarize-file]
verify_jwt = true

[functions.transcribe-audio]
verify_jwt = true
```

---

### Phase 8: Data Migration (If Needed)

If you have existing data in Lovable's Supabase:

#### Step 8.1: Export Data from Lovable
1. Connect to Lovable's Supabase instance (if you have access)
2. Export data using Supabase CLI or pg_dump:
```bash
# If you have access to Lovable's database
pg_dump -h HOST -U USER -d DATABASE > backup.sql
```

#### Step 8.2: Import Data to New Supabase
```bash
# Import to your new instance
psql -h YOUR_NEW_HOST -U postgres -d postgres < backup.sql
```

**Note**: You may need to adjust user IDs if auth.users don't match.

---

## ✅ Post-Migration Checklist

- [ ] External Supabase project created
- [ ] All migrations applied successfully
- [ ] Storage buckets created (`chat-files`)
- [ ] Edge functions deployed and tested
- [ ] Environment variables set (frontend + edge functions)
- [ ] AI provider API keys configured
- [ ] OAuth providers configured (Google)
- [ ] Authentication tested (sign in/out)
- [ ] Database RLS policies verified
- [ ] Edge functions tested individually
- [ ] Frontend connects to new Supabase instance
- [ ] Production build tested (`npm run build:prod`)
- [ ] Lovable tagger removed (optional)
- [ ] README.md updated with new setup instructions

---

## 🔧 Troubleshooting

### Issue: Edge functions can't access environment variables
**Solution**: Make sure you set secrets using `supabase secrets set` or via Dashboard

### Issue: CORS errors
**Solution**: Edge functions already have CORS headers. Check if your frontend URL is allowed in Supabase Dashboard → Settings → API → CORS

### Issue: Authentication redirect not working
**Solution**: 
1. Check redirect URL in Google OAuth settings
2. Verify `redirectTo` in `useAuth.jsx` matches your domain
3. Check Supabase Dashboard → Authentication → URL Configuration

### Issue: RLS policies blocking queries
**Solution**: Verify RLS policies are correctly set. Check `supabase/migrations/` files for policy definitions.

### Issue: AI API errors
**Solution**: 
1. Verify API key is set correctly
2. Check API rate limits
3. Verify model names are correct for your provider
4. Check API response format matches your code expectations

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Supabase Migration Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com)

---

## 🎯 Quick Start Commands

```bash
# 1. Link to Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# 2. Apply migrations
supabase db push

# 3. Set secrets
supabase secrets set OPENAI_API_KEY=sk-...

# 4. Deploy functions
supabase functions deploy

# 5. Start local dev (with new env vars)
npm run dev
```

---

## 📝 Notes

- **Keep Lovable project as backup** until migration is fully tested
- **Test in development** before deploying to production
- **Monitor API usage** and costs for your chosen AI provider
- **Set up monitoring/alerts** in Supabase Dashboard
- **Backup your database** regularly after migration

---

Good luck with your migration! 🚀

