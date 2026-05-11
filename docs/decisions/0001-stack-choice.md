# 0001-stack-choice.md — Stack choice

**Date:** 2026-05-11
**Status:** Accepted
**Decision-makers:** Miqo (CPO)

## Context

VideoScribe needs to ship as a real SaaS: multi-user auth, persistent storage, payments, deploy to Hostinger Business. An earlier prototype exists in React + Vite with all the transcription/analysis logic working. Codex had also begun a Next.js scaffold from earlier instructions but that work was deleted; this decision locks the path forward.

## Options considered

1. **Migrate the React + Vite prototype** + add an Express-style backend for the Gemini key.
   - Pro: less new code; prototype logic stays as-is.
   - Con: two apps to deploy (frontend + backend), more env/CI complexity, Hostinger Node.js apps assume one project.

2. **Rebuild on Next.js 16.2.6** (App Router, Turbopack, React 19.2), port prototype logic.
   - Pro: one project, native API routes for Gemini/Stripe/Supabase callbacks, Hostinger has a one-click Node.js GitHub deploy path matched to this shape.
   - Pro: Next.js 16.2 ships `AGENTS.md` in `create-next-app` — first-class agent support.
   - Pro: Turbopack stable + default, ~400% faster dev startup.
   - Con: re-port the prototype's services + UI (~1 week of agent work).

## Decision

**Option 2.** Next.js 16.2.6 App Router. Prototype lives in `_prototype-reference/` as read-only source material to port from.

## Consequences

- Single repo, single deploy target (Hostinger Business + GitHub auto-deploy).
- `proxy.ts` instead of `middleware.ts` (Next 16).
- `cacheComponents: true` if/when we need PPR.
- Chrome extension copied verbatim from prototype, lives as a sibling folder.
