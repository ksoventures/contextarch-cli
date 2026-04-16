import type { StackTag } from "./types.js";

export interface StackGuidance {
  label: string;
  rules: string[];
  antiPatterns?: string[];
}

export const STACK_GUIDANCE: Partial<Record<StackTag, StackGuidance>> = {
  typescript: {
    label: "TypeScript",
    rules: [
      "Prefer `type` for object shapes, `interface` only when extending third-party types.",
      "Never use `any` — use `unknown` and narrow, or write a proper type.",
      "No non-null assertions (`!`) except in tests or when a type guard just ran.",
      "Use `readonly` for props, return types, and array params that don't mutate.",
      "Prefer discriminated unions over enums. Enums only for stable public APIs.",
      "Import types with `import type { ... }` to avoid runtime import cost.",
    ],
    antiPatterns: [
      "Declaration-merging global namespaces.",
      "Using `Function`, `Object`, or `{}` as types.",
    ],
  },

  react: {
    label: "React",
    rules: [
      "Function components only. No class components.",
      "Prefer composition over props drilling. Lift state only when siblings need it.",
      "`useState` for local UI state, `useReducer` for state with multiple transitions, a store (Zustand/Jotai) only for cross-tree state.",
      "Memoize (`useMemo`, `useCallback`, `React.memo`) only when there's a measured render cost — not prophylactically.",
      "Effects are for syncing with external systems. If you're computing derived state in an effect, compute it in render instead.",
      "Keys on lists must be stable IDs, never array indexes (except for static lists).",
      "Accessibility isn't optional — buttons are `<button>`, links are `<a>`, inputs have labels.",
    ],
    antiPatterns: [
      "Fetching in `useEffect` without cleanup/abort.",
      "Mutating state objects directly before setting.",
      "`dangerouslySetInnerHTML` with un-sanitized content.",
    ],
  },

  nextjs: {
    label: "Next.js (App Router)",
    rules: [
      "App Router (`app/`) is the default. Only use Pages Router in an existing project that uses it.",
      "Server Components by default. Add `\"use client\"` only when you need state, effects, or browser APIs.",
      "Data fetching lives in Server Components or Route Handlers — not in `useEffect`.",
      "Server Actions for mutations — always validate inputs with Zod/Valibot before doing work.",
      "Use `loading.tsx` and `error.tsx` boundaries. Stream with `<Suspense>` where it helps.",
      "`next/image` for images, `next/font` for fonts. Never `<img>` or `<link rel=stylesheet>` for Google Fonts.",
      "Cache with `fetch` options (`next: { revalidate }`, `cache: 'force-cache'`) — don't reinvent.",
      "Metadata goes in `generateMetadata` or a static `metadata` export, not ad-hoc.",
    ],
    antiPatterns: [
      "Putting server-only secrets in client components (they'll leak into the bundle).",
      "Calling an API route from a Server Component on the same server — just call the function directly.",
    ],
  },

  vue: {
    label: "Vue 3",
    rules: [
      "Composition API with `<script setup lang=\"ts\">`. Options API only in legacy files.",
      "`ref` for primitives, `reactive` for objects, `computed` for derived state, `watchEffect` for side effects.",
      "Pinia for stores. Don't share state via globals.",
      "Scoped styles by default (`<style scoped>`) to avoid CSS leaks.",
      "Emit typed events with `defineEmits<{ ... }>()`.",
    ],
  },

  sveltekit: {
    label: "SvelteKit",
    rules: [
      "Load data in `+page.server.ts` / `+page.ts` — never fetch in the component `<script>` block.",
      "Form actions for mutations. Use progressive enhancement (`use:enhance`).",
      "Stores (`writable`, `readable`) for shared state; prefer `$state` runes in Svelte 5.",
      "Put server-only code in `$lib/server/` so it can't leak to the client bundle.",
    ],
  },

  astro: {
    label: "Astro",
    rules: [
      "Static by default. Add `client:load` / `client:visible` / `client:idle` only where interactivity is needed.",
      "Content Collections (`src/content/`) for structured content — use Zod schemas.",
      "Prefer Astro components for layout and static UI; reach for React/Vue/Svelte islands only when needed.",
    ],
  },

  remix: {
    label: "Remix",
    rules: [
      "`loader` for reads, `action` for mutations. Validate all inputs.",
      "Let the framework handle errors via `ErrorBoundary`. Don't try/catch everything in loaders.",
      "Nested routes = nested layouts. Use `<Outlet />` and `useMatches()` intentionally.",
    ],
  },

  node: {
    label: "Node.js",
    rules: [
      "Node 20+ features are fair game (top-level await, fetch, test runner).",
      "ESM only for new code. If the repo is CJS, match it — don't mix.",
      "Never block the event loop. Long work goes to workers or a queue.",
      "Env vars via `process.env.X` — validate at startup (Zod or `envsafe`). Fail fast on missing config.",
    ],
  },

  electron: {
    label: "Electron",
    rules: [
      "Main process and renderer process are different worlds. Never import renderer code in main or vice versa.",
      "Keep `contextIsolation: true` and `nodeIntegration: false`. Expose APIs to the renderer via a `preload.js` contextBridge, nothing else.",
      "All IPC is typed — define channel names and payload types once, share between main and preload.",
      "File system, shell, and native APIs belong in main. Renderer calls them via IPC, never directly.",
      "Ship with auto-updates (electron-updater) from day one — retrofitting is painful.",
      "Sign and notarize for macOS; without notarization your app is blocked by Gatekeeper.",
    ],
    antiPatterns: [
      "Enabling `nodeIntegration` in the renderer — huge security hole.",
      "Loading remote URLs with `nodeIntegration` or without `sandbox`.",
    ],
  },

  express: {
    label: "Express",
    rules: [
      "Async route handlers must bubble errors to an error middleware — use `express-async-errors` or wrap with a helper.",
      "Validate every request body/query/param (Zod, Joi, express-validator). Never trust inputs.",
      "Security middleware baseline: `helmet`, `cors` (explicit origins), rate limiting, body size limits.",
      "Keep routes thin — delegate business logic to services, persistence to repos.",
    ],
  },

  fastify: {
    label: "Fastify",
    rules: [
      "Use the JSON schema validation built in — don't reach for Zod unless you need its types.",
      "Plugins for everything reusable (auth, db). Register order matters.",
      "Return objects from handlers; let Fastify serialize via schemas for speed.",
    ],
  },

  nest: {
    label: "NestJS",
    rules: [
      "Module-per-feature. Controllers are thin; logic lives in providers/services.",
      "Use DTOs + `class-validator` / `class-transformer` with the global `ValidationPipe`.",
      "Dependency injection via the DI container — no `new Service()` in controllers.",
    ],
  },

  hono: {
    label: "Hono",
    rules: [
      "Use the validator middleware (`@hono/zod-validator` or similar) for every route with input.",
      "Keep handlers small — compose with `.use()` for shared middleware.",
      "Typed env via `Hono<{ Bindings: ...; Variables: ... }>`.",
    ],
  },

  tailwind: {
    label: "Tailwind CSS",
    rules: [
      "Use utility classes; extract to a component only when a class list repeats 3+ times.",
      "Use design tokens (`tailwind.config.ts`) — no magic `#hex` values in markup.",
      "Use `clsx` / `cn()` for conditional classes. Don't build class strings with template literals.",
      "Prefer `@apply` in global CSS only for truly reused primitives (buttons, inputs).",
    ],
  },

  prisma: {
    label: "Prisma",
    rules: [
      "Schema is the source of truth. Migrations via `prisma migrate`, never raw SQL drift.",
      "Select only needed fields (`select: { ... }`) — don't return full rows to clients.",
      "Wrap multi-step mutations in `prisma.$transaction([...])`.",
      "Singleton client in server code; don't instantiate `new PrismaClient()` per request.",
    ],
  },

  drizzle: {
    label: "Drizzle ORM",
    rules: [
      "Schema in `db/schema.ts`. Use `drizzle-kit` for migrations.",
      "Prefer the query builder over raw SQL unless you need a feature it doesn't expose.",
      "Use relational queries (`db.query.*`) for joins instead of manual joins where readable.",
    ],
  },

  supabase: {
    label: "Supabase",
    rules: [
      "Row-Level Security is mandatory on every table. No public tables without policies.",
      "Use typed client (`database.types.ts` generated via `supabase gen types`).",
      "Auth: prefer server-side session reads over client-side when possible.",
      "Use Edge Functions for logic that must not run on the client; validate all inputs.",
    ],
  },

  python: {
    label: "Python",
    rules: [
      "Python 3.11+ features are fair game (PEP 695 generics in 3.12, `Self`, `LiteralString`).",
      "Type hints on every function signature. Use `mypy --strict` or `pyright` in CI.",
      "f-strings for formatting. Never `%` or `.format()` in new code.",
      "Prefer `pathlib.Path` over `os.path`. Use `match/case` where it clarifies branching.",
      "Dependency management: match the repo's tool (`uv`, `poetry`, or `pip-tools`). Don't mix.",
    ],
    antiPatterns: [
      "Bare `except:` clauses — always catch a specific exception.",
      "Mutable default arguments (`def f(x=[])`).",
    ],
  },

  fastapi: {
    label: "FastAPI",
    rules: [
      "Pydantic v2 models for every request body and response. Let FastAPI do the validation.",
      "Dependency injection via `Depends(...)` — don't import globals inside routes.",
      "Async routes for I/O-bound work; sync routes when the library is sync (don't fake async).",
      "Return typed response models via `response_model=` — don't leak ORM objects.",
    ],
  },

  django: {
    label: "Django",
    rules: [
      "Use class-based views for CRUD, function views for one-offs. Pick a lane per app.",
      "Model managers and QuerySets — don't put query logic in views.",
      "Migrations are sacred: never edit a merged migration. Squash only on release branches.",
      "For APIs use DRF serializers with explicit `fields`. Never `fields = '__all__'` on a model that might grow.",
    ],
  },

  flask: {
    label: "Flask",
    rules: [
      "Application factory pattern (`create_app`) — no module-level `app = Flask(__name__)`.",
      "Blueprints per feature. Keep `app/__init__.py` boring.",
      "Use `Flask-Pydantic` or marshmallow for validation — never trust `request.json` raw.",
    ],
  },

  go: {
    label: "Go",
    rules: [
      "Go 1.22+ features are fair game. Prefer the standard library.",
      "Errors as values — wrap with `fmt.Errorf(\"context: %w\", err)` and check with `errors.Is/As`.",
      "Return early. Avoid nested `if err == nil` pyramids.",
      "Accept interfaces, return structs. Keep interfaces small — define them where consumed.",
      "Context propagation: every I/O function takes `ctx context.Context` as the first arg.",
      "Table-driven tests with `t.Run(name, ...)` subtests.",
    ],
    antiPatterns: [
      "Panicking in library code for recoverable errors.",
      "Stuffing everything in `package main`.",
    ],
  },

  rust: {
    label: "Rust",
    rules: [
      "Reach for `Result<T, E>` over panics. `?` for propagation, `thiserror` for library errors, `anyhow` for applications.",
      "Derive `Debug`, `Clone`, `PartialEq` by default on data structs; add `Serialize`/`Deserialize` when they hit a boundary.",
      "Lifetimes: name them when they're load-bearing (`'a`, `'input`), elide when obvious.",
      "Prefer iterators over index-based loops. Collect lazily.",
      "Clippy-clean. Treat clippy warnings as errors in CI.",
    ],
  },

  rails: {
    label: "Ruby on Rails",
    rules: [
      "Fat models, skinny controllers — but extract to service objects / interactors before the model hits 300 lines.",
      "Strong parameters on every controller write action.",
      "ActiveRecord scopes over ad-hoc `where` chains in controllers.",
      "Background jobs (Sidekiq / GoodJob) for anything > 200ms in a request.",
    ],
  },

  laravel: {
    label: "Laravel / PHP",
    rules: [
      "Eloquent for CRUD, query builder when Eloquent is awkward, raw SQL as a last resort.",
      "Form Requests for validation — not inline in controllers.",
      "Jobs + Queues for anything slow. Events for cross-cutting notifications.",
      "Use Blade components / Livewire / Inertia consistently — pick one per project.",
    ],
  },

  postgres: {
    label: "PostgreSQL",
    rules: [
      "UUIDv7 or bigint identity for PKs — never auto-increment integers for user-visible IDs.",
      "Indexes on every foreign key and on columns used in WHERE/ORDER BY. Check with `EXPLAIN ANALYZE`.",
      "Use `jsonb` (not `json`). Add GIN indexes only when you query into it.",
      "Transactions for multi-row writes. Be explicit about isolation level when it matters.",
    ],
  },

  mongo: {
    label: "MongoDB",
    rules: [
      "Model for reads — embed what's read together, reference what's read separately.",
      "Indexes on every query field. Compound indexes must match query order.",
      "Use transactions across documents only when you really need them; they're expensive.",
    ],
  },

  redis: {
    label: "Redis",
    rules: [
      "Set TTLs on every key unless it's a durable primary store. No accidental forever-keys.",
      "Use pipelines for multi-command batches; don't round-trip per command.",
      "Namespace keys (`app:user:123:session`) for clarity and eviction control.",
    ],
  },

  docker: {
    label: "Docker",
    rules: [
      "Multi-stage builds. Final image runs as non-root.",
      "Pin base image versions. Don't use `:latest` in production.",
      "`.dockerignore` everything that's not runtime. Layer cache depends on it.",
    ],
  },

  vitest: {
    label: "Vitest",
    rules: [
      "Co-locate test files (`*.test.ts`) with the code they test.",
      "Prefer `describe` only when grouping helps. Flat tests are fine.",
      "Mock at the boundary (network, fs, clock) — never mock the unit under test.",
    ],
  },

  jest: {
    label: "Jest",
    rules: [
      "One behavior per test. Use `describe` sparingly.",
      "`jest.useFakeTimers()` for time-dependent code; always restore.",
      "Avoid snapshot tests for anything that isn't a pure renderer output.",
    ],
  },

  pytest: {
    label: "Pytest",
    rules: [
      "Fixtures over setUp/tearDown. Scope them appropriately (`function`, `module`, `session`).",
      "Parametrize repetitive tests with `@pytest.mark.parametrize`.",
      "Mark slow / integration tests and keep them out of the default run.",
    ],
  },
};

export function buildStackSection(stacks: StackTag[]): string {
  const seen = new Set<string>();
  const sections: string[] = [];

  for (const tag of stacks) {
    const g = STACK_GUIDANCE[tag];
    if (!g || seen.has(g.label)) continue;
    seen.add(g.label);

    const lines: string[] = [];
    lines.push(`### ${g.label}`);
    for (const r of g.rules) lines.push(`- ${r}`);
    if (g.antiPatterns && g.antiPatterns.length > 0) {
      lines.push("");
      lines.push(`**Avoid:**`);
      for (const a of g.antiPatterns) lines.push(`- ${a}`);
    }
    sections.push(lines.join("\n"));
  }

  return sections.join("\n\n");
}
