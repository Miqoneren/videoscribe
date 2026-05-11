# CLAUDE.md — VideoScribe

> Claude Code reads this on every session. **Canonical rules live in `AGENTS.md`.** This file imports it and adds Claude-specific notes.

@./AGENTS.md

---

## Claude-specific behavior

### When you start a session
1. Read `AGENTS.md` (above), then `BACKLOG.md`, then any task-relevant `docs/*`.
2. Use the TodoWrite tool to plan work before touching files.
3. Prefer **Plan Mode** for tasks ≥ 3 steps.

### When uncertain
- Ask the user one clarifying question rather than guessing.
- Don't fabricate file paths, env vars, or API responses. Read the actual files.

### Subagent usage
- Delegate independent file edits to subagents to parallelize.
- Always pass the subagent the exact file paths + the rule from `AGENTS.md` it should follow.

### Memory hygiene
- Use `/compact` when conversation exceeds ~50% context fill on a long task.
- Don't re-explain rules already in `AGENTS.md`; reference the section instead.

### Slash commands
Custom commands live in `.claude/commands/`:
- `/feature` — scaffold a new feature with spec → tests → impl
- `/fix-bug` — bug triage + minimal-diff fix workflow
- `/deploy` — pre-deploy verification checklist
- `/new-analysis-type` — add a new output analysis type (summary/brief/etc.)
- `/port-from-prototype` — port a specific file from `_prototype-reference/` to its new location

### Compound engineering
When Claude makes a mistake here, **append a new rule to `AGENTS.md`** (or the relevant `docs/*`). This file is a living document. The rule should be one line, imperative.

### Next.js 16 DevTools MCP (optional)
Add to `.mcp.json` for in-editor Next.js diagnostics:
```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

---

## User context

- The user (Miqo) prefers casual, short responses. No corporate fluff.
- If a task is large, surface a plan first, then execute in chunks.
- Don't ask permission for trivial reads. Do ask before deletes, destructive writes, or new dependencies.
- The Obsidian vault at `C:\Users\micha\Documents\Obsidian Vault\Work\NewCo\Products\Transcriber\` is the **product brain**. Code lives here. Product notes live there. Keep them in sync.
