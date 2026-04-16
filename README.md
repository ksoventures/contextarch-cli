# contextarch

Generate high-quality AI context files for your project in 30 seconds.

One command, and you get well-tuned `.cursorrules`, `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md` — all consistent with each other, all tailored to the stack you actually use.

```bash
npx contextarch init
```

That's it. No account, no config file to learn, no AI round-trip. Just a 60-second wizard and four files on disk.

---

## Why this exists

Every AI coding tool wants a different context file. `.cursorrules` for Cursor, `AGENTS.md` for Windsurf and the emerging standard, `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for Copilot. Each one you write by hand is 2–4k tokens of boilerplate that you copy-paste from a blog post and never update.

**contextarch** does two things:

1. **Detects your stack** — reads `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, lockfiles, `tsconfig.json`, `Dockerfile` — and picks the right rules for React vs Next.js vs Vue, FastAPI vs Django, etc.
2. **Generates all four files** from a single source of truth, so your Cursor agent and your Claude Code agent and your Copilot agent are all reading the same instructions.

The rules baked in aren't generic "write clean code" slop. They're specific anti-patterns and preferences — the kind of guidance that actually changes what the AI outputs.

---

## Install & run

No install needed — just run it:

```bash
npx contextarch init
```

Or install globally:

```bash
npm i -g contextarch
contextarch init
```

### Options

```
Usage: contextarch init [options]

Run the interactive wizard in the current directory.

Options:
  -y, --yes           skip the final "generate these files?" prompt
  --overwrite         overwrite existing files without prompting
  --no-backup         do not create .bak copies when overwriting
  -C, --cwd <dir>     target directory (default: current)
  -h, --help          display help
```

### What the wizard asks

1. Project name (pre-filled from your manifest)
2. What kind of project (web app, API, full-stack, library, CLI, mobile)
3. One-sentence description
4. Confirm the detected stack (or pick manually)
5. Which AI tools should this target (Cursor, Claude Code, Copilot, Windsurf — all by default)
6. Coding style (strict / pragmatic / fast-iteration)
7. How the AI should talk to you (terse / balanced / explain more)
8. Testing expectations (always / critical paths / minimal)
9. Any custom rules specific to your project

---

## What you get

Running in a Next.js 15 + TypeScript + Tailwind + Prisma project produces (abridged):

```
### TypeScript
- Prefer `type` for object shapes, `interface` only when extending third-party types.
- Never use `any` — use `unknown` and narrow, or write a proper type.
- Import types with `import type { ... }` to avoid runtime import cost.

### Next.js (App Router)
- Server Components by default. Add `"use client"` only when you need state, effects, or browser APIs.
- Data fetching lives in Server Components or Route Handlers — not in `useEffect`.
- Server Actions for mutations — always validate inputs with Zod/Valibot before doing work.

### Prisma
- Schema is the source of truth. Migrations via `prisma migrate`, never raw SQL drift.
- Select only needed fields (`select: { ... }`) — don't return full rows to clients.
```

Every file starts with the same core behavior rules (scope discipline, ask-when-ambiguous, no invented dependencies) so agents behave consistently regardless of which tool you're in.

---

## Supported stacks

**JavaScript / TypeScript:** React · Next.js · Vue · SvelteKit · Astro · Remix · Node · Express · Fastify · NestJS · Hono · Tailwind · Prisma · Drizzle · Supabase · Vitest · Jest

**Python:** FastAPI · Django · Flask · Pytest

**Others:** Go · Rust · Ruby on Rails · Laravel / PHP · Postgres · MongoDB · Redis · Docker

Missing one? [Open an issue](https://github.com/ksoventures/contextarch-cli/issues) — stack templates are one file to add.

---

## Re-running

The wizard is idempotent. Re-run anytime:

```bash
npx contextarch init --overwrite
```

By default your previous files get backed up to `.cursorrules.bak`, `CLAUDE.md.bak`, etc. Use `--no-backup` if you don't want that.

---

## Roadmap

- **Pro tier** (coming): AI-powered repo analysis — scan your codebase and auto-derive conventions you already follow.
- **Team sync**: one central config, synced across every engineer's generated files.
- **Editor extension**: Cursor / VS Code extension to browse and apply rule updates without leaving the editor.

---

## License

MIT © ContextArch

Built by [ContextArch](https://contextarch.ai).
