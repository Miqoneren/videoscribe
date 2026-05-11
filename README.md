# VideoScribe

Transcribe meetings (audio or video) in their original language. Get summaries, briefs, action items, key decisions, and meeting minutes in **any** language you choose. Built for Armenian-speaking teams; works in English and Russian too. Chrome extension captures Google Meet and Zoom calls.

## Status

🟡 Building v1. Working logic exists in `_prototype-reference/`. Migrating to Next.js + Supabase + Stripe + Hostinger.

## Stack

Next.js 16.2.6 · React 19.2 · TypeScript · Supabase (auth/DB/Storage) · Gemini API · FFmpeg.wasm · Stripe · Tailwind v4 · shadcn/ui · pnpm · Hostinger Business (GitHub auto-deploy).

## Quick start

```bash
pnpm install
cp .env.example .env.local      # fill in keys
pnpm dev                         # http://localhost:3000
```

See `docs/deployment.md` for production setup.

## For AI coding agents

Read [`AGENTS.md`](./AGENTS.md) first. It's the cross-agent context file (Codex, Claude Code, Cursor, Copilot, Qwen all use it). Claude Code reads [`CLAUDE.md`](./CLAUDE.md) on top of that.

Work flows through [`BACKLOG.md`](./BACKLOG.md) phase by phase. One phase at a time. Don't skip ahead.

## Docs

- [`REQUIREMENTS.md`](./REQUIREMENTS.md) — product spec
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system design
- [`BACKLOG.md`](./BACKLOG.md) — prioritized tasks
- [`docs/`](./docs/) — API, language handling, deployment, decisions

## License

Proprietary. © NewCo, 2026.
