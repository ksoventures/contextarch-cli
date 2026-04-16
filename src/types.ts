export type StackTag =
  | "react"
  | "nextjs"
  | "vue"
  | "sveltekit"
  | "astro"
  | "remix"
  | "typescript"
  | "tailwind"
  | "node"
  | "electron"
  | "express"
  | "fastify"
  | "nest"
  | "hono"
  | "python"
  | "fastapi"
  | "django"
  | "flask"
  | "go"
  | "rust"
  | "ruby"
  | "rails"
  | "php"
  | "laravel"
  | "prisma"
  | "drizzle"
  | "supabase"
  | "postgres"
  | "mongo"
  | "redis"
  | "vitest"
  | "jest"
  | "pytest"
  | "docker";

export type AITool = "cursor" | "claude-code" | "copilot" | "windsurf";

export type ProjectKind =
  | "web-app"
  | "api"
  | "fullstack"
  | "library"
  | "cli"
  | "mobile"
  | "other";

export type CodingStyle = "strict" | "pragmatic" | "fast-iteration";

export type Verbosity = "terse" | "balanced" | "explain-more";

export interface DetectionResult {
  stacks: StackTag[];
  language: "typescript" | "javascript" | "python" | "go" | "rust" | "ruby" | "php" | "mixed" | "unknown";
  packageManager: "npm" | "pnpm" | "yarn" | "bun" | "pip" | "poetry" | "uv" | "cargo" | "go" | "bundler" | "composer" | "unknown";
  hint: string | null;
}

export interface Answers {
  detection: DetectionResult;
  projectName: string;
  projectKind: ProjectKind;
  description: string;
  stacks: StackTag[];
  aiTools: AITool[];
  codingStyle: CodingStyle;
  verbosity: Verbosity;
  testingEmphasis: "always" | "critical-paths" | "minimal";
  customRules: string;
}
