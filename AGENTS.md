# AGENTS.md — VideoScribe

> **Read this first, every session.** Single source of truth for any AI coding agent working on this repo (OpenAI Codex, Claude Code, Cursor, GitHub Copilot, Gemini, Qwen, etc.). Keep under 200 lines. Reference, don't duplicate.

---

## 1. What this project is

**VideoScribe** is a SaaS web app that transcribes audio and video recordings and produces structured outputs (summary, brief, action items, key decisions, meeting minutes). Built by **NewCo**.

**Primary user:** Armenian-speaking business teams + global English/Russian users running meetings on Google Meet / Zoom.

**Differentiator:** No competitor (Otter.ai, Fireflies, Fathom) supports Armenian meeting transcription. VideoScribe does — and runs analyses in the user's chosen output language regardless of the audio language.

Product spec: `REQUIREMENTS.md`. Architecture: `ARCHITECTURE.md`. Backlog: `BACKLOG.md`. Reference prototype: `_prototype-reference/`.

---

## 2. Two languages, one product (CRITICAL)

This is the **central product behavior** every agent must respect:

1. **Transcription language = source audio language (auto-detected).** Never translate the transcript.
2. **Output language = user-selected via a switcher.** Summary / brief / action items / key decisions / meeting minutes all render in the chosen output language.
3. Transcription language and output language are **independent**. Example: Armenian call → English summary is a valid, common path.

Supported languages MVP: **Armenian (hy), English (en), Russian (ru)**. Architecture must allow trivial addition of more.

Detail: `docs/language-handling.md`.

---

## 3. Tech stack (LOCKED — do not change without a decision doc)

| Layer | Tech | Version |
|---|---|---|
| Framework | **Next.js** (App Router, Turbopack) | **16.2.6** |
| Runtime | React | 19.2 |
| Language | TypeScript (strict) | 5.x |
| AI | Google Gemini API (`@google/genai`) | latest |
| Audio | FFmpeg.wasm (`@ffmpeg/ffmpeg`) | 0.12.x |
| Database + Auth + Storage | **Supabase** | latest SDK |
| Payments | **Stripe** | latest SDK |
| Styling | Tailwind CSS | v4 |
| UI primitives | shadcn/ui | latest |
| Package manager | **pnpm** | 9.x |
| Node | **22 LTS** | |
| Deploy | **Hostinger Business** (Node.js app, GitHub auto-deploy) | — |
| Chrome extension | Manifest V3 | — |

Next.js 16 specifics:
- **Turbopack is default** for `next dev` and `next build`. Do NOT add `--turbopack` flag.
- **`proxy.ts`** replaces `middleware.ts`. Export function is named `proxy`, not `middleware`.
- **Cache Components** via `cacheComponents: true` in `next.config.ts`. Do not use the old `experimental.ppr` flag.

Do **not** introduce other frameworks (no Express, Remix, SvelteKit, tRPC, Prisma) without a written decision in `docs/decisions/`.

---

## 4. Folder convention

```
/                          # Next.js root
  app/                     # App Router
    (marketing)/           # Landing, pricing, about (public)
    (app)/                 # Authed product UI
      transcribe/          # Upload + transcribe flow
      analysis/[id]/       # View transcript + run analyses
      archive/             # Past transcriptions
      settings/            # User settings
    api/                   # Route handlers
      transcribe/          # POST chunked audio → Gemini
      analyze/             # POST transcript + type + language → Gemini
      stripe/webhook/      # Stripe → DB sync
      auth/                # Supabase callbacks
  components/              # React components (PascalCase.tsx, stateless preferred)
    ui/                    # shadcn/ui primitives
  lib/
    gemini/                # Gemini client wrappers (SERVER ONLY)
    supabase/              # Server + browser Supabase clients
    audio/                 # FFmpeg.wasm helpers (CLIENT)
    analyses/              # Output-type prompts (summary, brief, action-items, …)
    i18n/                  # Language switcher + translations
    stripe/                # Stripe client + subscription helpers
    result.ts              # Typed Result<T, E>
  chrome-extension/        # MV3 build (separate, no Next deps)
  _prototype-reference/    # Working code from the v0 prototype (READ-ONLY reference)
  docs/                    # Spec docs (immutable history)
  tests/                   # Vitest + Playwright
  supabase/                # SQL migrations
```

- **Files:** `kebab-case.ts` (utilities), `PascalCase.tsx` (components).
- **No business logic in components.** Put it in `lib/`.
- **DB access only from server actions or `app/api/*` route handlers.** Never call Supabase service-role from the client.
- **Gemini API key NEVER reaches the browser.** All Gemini calls go through `app/api/*` route handlers.

---

## 5. Coding standards

- **TypeScript strict** (`"strict": true`). No `any` without a `// reason:` comment.
- **Functional components** + hooks. No class components.
- **Async:** every `await` in a `try / catch`. Surface errors via typed `Result<T, E>` from `lib/result.ts`.
- **Tailwind** for styling. No CSS modules, no styled-components.
- **shadcn/ui** for primitives (Button, Dialog, Select, etc.). Install via CLI.
- **Lint + format:** ESLint + Prettier, enforced via `pnpm verify`.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).

---

## 6. Commands

| Task | Command |
|---|---|
| Install | `pnpm install` |
| Dev | `pnpm dev` |
| Build | `pnpm build` |
| Typecheck | `pnpm typecheck` |
| Lint (fix) | `pnpm lint:fix` |
| Test (unit) | `pnpm test` |
| Test (e2e) | `pnpm test:e2e` |
| Verify (CI gate) | `pnpm verify` |
| Generate Supabase types | `pnpm db:types` |
| Apply Supabase migrations | `pnpm db:migrate` |

Every PR must pass `pnpm verify` locally before push.

---

## 7. Secrets & environment

Local `.env.local` (gitignored). See `.env.example` for the full list. Required:

```
GEMINI_API_KEY=                          # server-only, NEVER NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=               # server-only
STRIPE_SECRET_KEY=                       # server-only
STRIPE_WEBHOOK_SECRET=                   # server-only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=                     # e.g. https://videoscribe.<domain>
```

**Never log, print, or commit secrets.** Never put a secret in a `NEXT_PUBLIC_*` var unless it is meant to be public.

---

## 8. Workflow expectations (for agents)

1. **Before starting a task**, read `BACKLOG.md` and the relevant `docs/*` file.
2. **Plan first** on any task with 3+ steps. State the plan, get confirmation.
3. **Ask clarifying questions** when a requirement is ambiguous. Don't heroically guess.
4. **Small commits.** One logical change per commit.
5. **Tests first** for new business logic in `lib/`. Playwright for happy-path UI.
6. **Update docs.** If you change behavior described in `REQUIREMENTS.md` or `ARCHITECTURE.md`, update them in the same PR.
7. **Phase boundaries.** Backlog phases are sequential. Don't start Phase N+1 until Phase N is merged.
8. **Reference prototype is read-only.** Copy logic FROM `_prototype-reference/` INTO `lib/` and `app/`. Never edit `_prototype-reference/`.
9. **Never modify** `chrome-extension/manifest.json` permissions without explicit instruction.

---

## 9. Anti-patterns (don't do)

- ❌ Translating the transcript itself. Transcript = source language, always.
- ❌ Calling Gemini from a client component. Always via `app/api/*` route handler.
- ❌ Putting `GEMINI_API_KEY` in any `NEXT_PUBLIC_*` var.
- ❌ Storing audio files in Postgres. Use Supabase Storage.
- ❌ Adding a new dependency without checking `package.json` for an existing equivalent.
- ❌ Inventing routes. Follow `docs/api-spec.md`.
- ❌ Touching `BACKLOG.md` priorities without instruction.
- ❌ Using `middleware.ts` (Next.js 16 uses `proxy.ts`).
- ❌ Adding `--turbopack` flag (already default in v16).

---

## 10. References

- Product spec → `REQUIREMENTS.md`
- Architecture → `ARCHITECTURE.md`
- API → `docs/api-spec.md`
- Language handling → `docs/language-handling.md`
- Deployment (Hostinger) → `docs/deployment.md`
- Current task list → `BACKLOG.md`
- Decision log → `docs/decisions/`
- Reference prototype (read-only) → `_prototype-reference/`
