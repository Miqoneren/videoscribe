# ARCHITECTURE.md — VideoScribe

> System design. Update when structure changes.

---

## 1. High-level diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (Chrome / Edge / Firefox)                              │
│  ┌────────────────────────────┐  ┌─────────────────────────┐    │
│  │ Next.js client (RSC + CSR) │  │ Chrome Extension (MV3)  │    │
│  │ • Upload UI                │  │ • tabCapture            │    │
│  │ • FFmpeg.wasm chunking     │  │ • offscreen MediaRec    │    │
│  │ • Output language switcher │  │ • download .webm        │    │
│  └────────┬───────────────────┘  └─────────────────────────┘    │
│           │                                                     │
└───────────┼─────────────────────────────────────────────────────┘
            │ HTTPS
            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Hostinger Business (Node.js app, Next.js 16.2.6)              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ app/                                                   │    │
│  │   (marketing)/   public landing, pricing               │    │
│  │   (app)/         authed UI                             │    │
│  │   api/                                                 │    │
│  │     transcribe/  → Gemini (server-side key)           │    │
│  │     analyze/     → Gemini (server-side key)           │    │
│  │     stripe/webhook/                                    │    │
│  │     auth/        Supabase callbacks                    │    │
│  └────────┬─────────────┬──────────────────┬──────────────┘    │
│           │             │                  │                    │
└───────────┼─────────────┼──────────────────┼────────────────────┘
            ▼             ▼                  ▼
       ┌────────┐   ┌──────────┐       ┌─────────┐
       │ Gemini │   │ Supabase │       │ Stripe  │
       │ API    │   │ Postgres │       │         │
       │        │   │ Auth     │       │         │
       │        │   │ Storage  │       │         │
       └────────┘   └──────────┘       └─────────┘
```

One Next.js app. Three external services. One repo. One deploy target.

---

## 2. Why Next.js 16 (not Vite + Express)

- **Gemini API key must stay server-side.** Next.js API routes give that for free.
- **Stripe webhooks need a server endpoint.** Same.
- **Supabase auth callbacks need a server endpoint.** Same.
- **Hostinger Business supports Node.js apps via GitHub auto-deploy.** Vite would need two apps (frontend + hand-rolled backend).
- **AGENTS.md is now scaffolded by `create-next-app` in 16.2.** First-class agent support.
- **Turbopack is stable + default.** Fast dev (~400% faster startup), fast builds.

---

## 3. Data flow — transcribe + analyze

```
1. User selects file in browser
2. Client: upload file to Supabase Storage (signed URL)
3. Client: FFmpeg.wasm splits into 3-min WAV chunks (if >20 min)
4. For each chunk:
     Client → POST /api/transcribe { storageKey, chunkIndex }
     Server: load chunk from Storage, base64, call Gemini
     Server: append text to transcripts table
     Server: stream partial transcript back via SSE
5. Client: shows progressive transcript
6. User picks output type(s) + output language
7. Client → POST /api/analyze { transcriptId, type, outputLang }
8. Server: build prompt from lib/analyses/prompts/<type>/<outputLang>.ts
9. Server: Gemini → store result in analyses table → return to client
10. Client: render analysis card
```

### Streaming
- Transcript appears chunk-by-chunk via Server-Sent Events.
- Analyses are non-streaming for v1 (typically <10 s).

---

## 4. Database schema (Supabase Postgres)

```sql
-- users handled by Supabase auth (auth.users)

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  ui_locale text not null default 'en',          -- hy | en | ru
  default_output_lang text not null default 'en',
  stripe_customer_id text unique,
  plan text not null default 'free',             -- free | pro | team
  created_at timestamptz not null default now()
);

create table public.transcripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  source text not null,                          -- upload | extension
  storage_path text not null,                    -- Supabase Storage key
  duration_seconds int,
  source_language text,                          -- detected: hy | en | ru | ...
  status text not null default 'pending',        -- pending | running | done | failed
  text text,                                     -- full transcript with speaker labels
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index on public.transcripts(user_id, created_at desc);

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  transcript_id uuid not null references public.transcripts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,                            -- summary | brief | action_items | key_decisions | meeting_minutes
  output_language text not null,                 -- hy | en | ru | ...
  content text not null,
  created_at timestamptz not null default now()
);
create unique index on public.analyses(transcript_id, type, output_language);

create table public.usage_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,                    -- first of month
  transcriptions_count int not null default 0,
  total_seconds int not null default 0,
  primary key (user_id, period_start)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.transcripts enable row level security;
alter table public.analyses enable row level security;
alter table public.usage_counters enable row level security;

create policy "profiles self"   on public.profiles for all using (auth.uid() = id);
create policy "transcripts self" on public.transcripts for all using (auth.uid() = user_id);
create policy "analyses self"    on public.analyses for all using (auth.uid() = user_id);
create policy "usage self"       on public.usage_counters for all using (auth.uid() = user_id);
```

Migration files live in `supabase/migrations/`.

---

## 5. Storage (Supabase Storage)

- Bucket: `recordings` (private, user-scoped path: `{user_id}/{transcript_id}/{chunk_index}.wav`).
- Bucket: `exports` (private, user-scoped, signed URLs for downloads).

RLS: only the owner can read their objects.

---

## 6. Auth (Supabase)

- Email + password (magic link option).
- Google OAuth.
- All session handling via `@supabase/ssr` cookies.
- `app/api/auth/callback/route.ts` handles OAuth code exchange.

---

## 7. Payments (Stripe)

- Free plan = no Stripe record needed.
- Upgrade: redirect to Stripe Checkout (subscription mode).
- Webhook `app/api/stripe/webhook/route.ts` listens for `customer.subscription.{created,updated,deleted}` and updates `profiles.plan`.

---

## 8. Gemini integration

- **Server-side only.** `lib/gemini/client.ts` reads `process.env.GEMINI_API_KEY`.
- Transcription model: configurable via env, default `gemini-3-flash-preview` (carry over from prototype, upgrade when newer available).
- Analysis model: configurable via env, default `gemini-3.1-pro-preview`.
- All prompts in `lib/analyses/prompts/`. Per-type, per-language.

---

## 9. Chrome extension

Lives in `chrome-extension/`, completely independent of the Next.js app. Imported from prototype as-is. Build target: zip the folder for Web Store upload.

For v1, the extension downloads `.webm` locally and the user uploads to the web app. v2: direct handoff via signed URL.

---

## 10. Hostinger deploy

- Hostinger Business plan → Websites → Add Website → Node.js App → GitHub.
- Repo: `Miqoneren/videoscribe`.
- Auto-deploy on push to `main`.
- Env vars set in hPanel.
- Domain pointed via Hostinger DNS.
- Build command: `pnpm install && pnpm build`. Start command: `pnpm start`.

Detail: `docs/deployment.md`.

---

## 11. CI

- GitHub Actions: on every PR run `pnpm verify` (typecheck + lint + test).
- Hostinger handles the deploy build.
