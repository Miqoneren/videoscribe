# docs/deployment.md — Deploy to Hostinger

> The production deployment target is **Hostinger Business** (or any Cloud plan), Node.js app with GitHub auto-deploy. Domain is registered with Hostinger.

---

## One-time setup

### 1. Supabase project
1. Sign up at https://supabase.com (free tier).
2. New project → region: closest to Yerevan (eu-central-1 / Frankfurt).
3. Run `supabase/migrations/0001_init.sql` from the SQL editor.
4. Auth → Providers: enable Email + Google. Set redirect URL: `https://<your-domain>/api/auth/callback`.
5. Storage → New bucket: `recordings` (private). `exports` (private).
6. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Stripe account
1. Sign up at https://stripe.com. Activate (or stay in test mode for now).
2. Products → New product: "Pro" with recurring price.
3. Copy:
   - Secret key (test or live) → `STRIPE_SECRET_KEY`
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Webhook will be added after deploy (needs prod URL).

### 3. Google AI Studio
1. Get a Gemini API key at https://aistudio.google.com/apikey.
2. Copy → `GEMINI_API_KEY`.

### 4. Hostinger
1. Log in to hPanel.
2. Confirm plan is **Business** or **Cloud Startup / Pro / Enterprise** (Node.js requires one of these).
3. Websites → Add Website → Node.js App.
4. Choose **Connect from GitHub** → authorize → pick `Miqoneren/videoscribe`.
5. Settings:
   - **Branch:** `main`
   - **Build command:** `pnpm install --frozen-lockfile && pnpm build`
   - **Start command:** `pnpm start`
   - **Output directory:** `.next`
   - **Node version:** 22 (LTS)
6. Environment variables: paste every key from `.env.example` (using real values).
7. Domain → connect your existing Hostinger-registered domain. SSL auto-provisions.

### 5. Stripe webhook (after first deploy)
1. Stripe Dashboard → Developers → Webhooks → Add endpoint.
2. URL: `https://<your-domain>/api/stripe/webhook`
3. Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`.
4. Copy signing secret → add as `STRIPE_WEBHOOK_SECRET` in Hostinger env vars → redeploy.

---

## Ongoing deploys

`git push origin main` → Hostinger auto-builds and deploys. Watch hPanel → Logs for build status.

## Rollback

hPanel → Deployments → pick previous → Redeploy.

## Local production preview

```
pnpm build
pnpm start
```

Visit http://localhost:3000.
