# BACKLOG.md — VideoScribe

> Sequential work plan. Coding agents work **one phase at a time**. Don't start Phase N+1 until Phase N is merged.

Status legend: ⬜ todo · 🟡 in progress · ✅ done · ❌ blocked

---

## Phase 0 — Scaffold (HUMAN-RUN, one-off)

✅ Phase 0 docs written (this file, AGENTS.md, CLAUDE.md, REQUIREMENTS.md, ARCHITECTURE.md, docs/*).

⬜ User runs `scripts/setup.ps1` from PowerShell in repo root. The script:
1. Runs `pnpm create next-app@16.2.6 . --typescript --tailwind --eslint --app --turbopack --use-pnpm --skip-install`
2. Installs deps: `pnpm add @google/genai @ffmpeg/ffmpeg @ffmpeg/util @supabase/supabase-js @supabase/ssr stripe lucide-react`
3. Installs dev deps: `pnpm add -D vitest @vitest/ui @playwright/test prettier`
4. Copies prototype reference files into `_prototype-reference/`
5. Copies Chrome extension into `chrome-extension/`
6. Initializes git, makes the initial commit
7. Creates private GitHub repo `Miqoneren/videoscribe` (requires `gh` CLI logged in, or manual step)
8. Pushes

**Acceptance:** repo on GitHub, clones cleanly, `pnpm install && pnpm dev` shows a Next.js welcome page on http://localhost:3000.

---

## Phase 1 — Transcription engine

**Goal:** server-side transcription with chunking, streaming back to client. No UI polish yet, just the pipeline.

Tasks:
1. ⬜ Create `lib/gemini/client.ts` — server-only Gemini client wrapper.
2. ⬜ Create `lib/audio/chunk.ts` — FFmpeg.wasm chunking (client-side), port from `_prototype-reference/services/geminiService.ts`.
3. ⬜ Create `app/api/transcribe/route.ts` — accepts a Storage key + chunk index, returns transcript text.
4. ⬜ Create `app/(app)/transcribe/page.tsx` — minimal UI: file picker, progress, transcript display.
5. ⬜ SSE streaming for progressive transcript display.
6. ⬜ Unit tests for `lib/audio/chunk.ts` and `lib/gemini/client.ts` (mocked).
7. ⬜ Playwright happy-path test: upload a small mp3, see transcript.

**Acceptance:** upload a 5-minute mp3, transcript appears progressively. Gemini key is NOT visible in any browser network request.

---

## Phase 2 — Analyses + output language switcher

**Goal:** all 5 output types working, with the output language switcher (independent of transcript language).

Tasks:
1. ⬜ Create `lib/analyses/types.ts` — `AnalysisType` enum + per-type metadata.
2. ⬜ Create `lib/analyses/prompts/<type>/<locale>.ts` — prompt template per type per locale (hy, en, ru × 5 types = 15 prompts).
3. ⬜ Create `app/api/analyze/route.ts` — POST { transcriptId, type, outputLang } → Gemini → save → return.
4. ⬜ Create `app/(app)/analysis/[id]/page.tsx` — transcript + analysis cards + output language switcher + "regenerate" button per type.
5. ⬜ Persist analyses to `analyses` table (upsert by transcript_id+type+output_language).
6. ⬜ Unit tests for prompt selection + Gemini wrapper.
7. ⬜ Playwright: upload transcript, generate summary in English, switch to Armenian, regenerate.

**Acceptance:** all 5 types produce sensible output in all 3 languages from one Armenian source audio.

---

## Phase 3 — Auth + database + storage (Supabase)

**Goal:** real users. Replace all localStorage with DB. Audio in Supabase Storage.

Tasks:
1. ⬜ Spin up Supabase project (Miqo provides URL + keys to .env.local).
2. ⬜ Create `supabase/migrations/0001_init.sql` — schema from ARCHITECTURE.md §4. Enable RLS.
3. ⬜ Create `lib/supabase/server.ts`, `lib/supabase/browser.ts` (using `@supabase/ssr`).
4. ⬜ Create auth flow: `app/(marketing)/login`, `app/api/auth/callback/route.ts`, Google OAuth + email magic link.
5. ⬜ Create `proxy.ts` (note: NOT `middleware.ts` in Next 16) for protected routes.
6. ⬜ Wire transcribe + analyze routes to save to DB + Storage instead of localStorage.
7. ⬜ Build `app/(app)/archive/page.tsx` — list user's transcripts from DB.
8. ⬜ Build `app/(app)/settings/page.tsx` — profile + UI locale + default output language.
9. ⬜ Usage counter table updated on every transcription.
10. ⬜ Playwright: sign up, transcribe, sign out, sign back in, see archive.

**Acceptance:** two users see only their own data. Audio files in Storage. localStorage no longer used for anything beyond UI preferences.

---

## Phase 4 — Payments (Stripe)

**Goal:** Free tier with 5/month limit, Pro tier unlocks unlimited.

Tasks:
1. ⬜ Set up Stripe product + Pro price (Miqo provides keys).
2. ⬜ `lib/stripe/client.ts` server-only Stripe SDK wrapper.
3. ⬜ `app/(app)/billing/page.tsx` — current plan, upgrade CTA.
4. ⬜ `app/api/stripe/checkout/route.ts` — creates Checkout Session, redirects.
5. ⬜ `app/api/stripe/webhook/route.ts` — handles `customer.subscription.{created,updated,deleted}`, updates `profiles.plan`.
6. ⬜ Enforce Free tier limits in `lib/billing/enforce.ts` (5 transcriptions / month, 30 min max each).
7. ⬜ Upgrade prompt UI when limit hit.
8. ⬜ Pricing page in marketing section.
9. ⬜ Playwright: hit free limit, upgrade via Stripe test card, run another transcription.

**Acceptance:** free user hits limit and gets blocked. Paid user runs unlimited.

---

## Phase 5 — Deploy to Hostinger

**Goal:** live on Miqo's domain.

Tasks:
1. ⬜ Confirm Hostinger Business plan + domain.
2. ⬜ Add Website → Node.js App → connect GitHub repo `Miqoneren/videoscribe`.
3. ⬜ Build command: `pnpm install --frozen-lockfile && pnpm build`. Start: `pnpm start`. Entry: `node_modules/.bin/next`.
4. ⬜ Set env vars in hPanel (all of `.env.example`).
5. ⬜ Point domain DNS at Hostinger (already there if domain registered with them).
6. ⬜ SSL certificate (Hostinger auto-provisions).
7. ⬜ Configure Stripe webhook to point at `https://<domain>/api/stripe/webhook`.
8. ⬜ Smoke test: full flow on production.

**Acceptance:** real user signs up at `https://<domain>`, uploads audio, gets transcript + analyses, upgrades to Pro.

---

## Phase 6+ (later)

- Chrome extension polish + Web Store listing
- Real-time mode (transcribe during call)
- More output languages (Spanish, French, etc.)
- Slack / Notion integrations
- Team plan
- Mobile-optimized UI
