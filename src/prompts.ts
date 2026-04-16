import { checkbox, confirm, input, select } from "@inquirer/prompts";
import pc from "picocolors";
import type {
  AITool,
  Answers,
  CodingStyle,
  DetectionResult,
  ProjectKind,
  StackTag,
  Verbosity,
} from "./types.js";

const STACK_CHOICES: Array<{ name: string; value: StackTag }> = [
  { name: "TypeScript", value: "typescript" },
  { name: "React", value: "react" },
  { name: "Next.js", value: "nextjs" },
  { name: "Vue", value: "vue" },
  { name: "SvelteKit", value: "sveltekit" },
  { name: "Astro", value: "astro" },
  { name: "Remix", value: "remix" },
  { name: "Node.js", value: "node" },
  { name: "Electron", value: "electron" },
  { name: "Express", value: "express" },
  { name: "Fastify", value: "fastify" },
  { name: "NestJS", value: "nest" },
  { name: "Hono", value: "hono" },
  { name: "Tailwind CSS", value: "tailwind" },
  { name: "Prisma", value: "prisma" },
  { name: "Drizzle", value: "drizzle" },
  { name: "Supabase", value: "supabase" },
  { name: "Python", value: "python" },
  { name: "FastAPI", value: "fastapi" },
  { name: "Django", value: "django" },
  { name: "Flask", value: "flask" },
  { name: "Go", value: "go" },
  { name: "Rust", value: "rust" },
  { name: "Ruby on Rails", value: "rails" },
  { name: "Laravel / PHP", value: "laravel" },
  { name: "Postgres", value: "postgres" },
  { name: "MongoDB", value: "mongo" },
  { name: "Redis", value: "redis" },
  { name: "Docker", value: "docker" },
  { name: "Vitest", value: "vitest" },
  { name: "Jest", value: "jest" },
  { name: "Pytest", value: "pytest" },
];

export async function runPrompts(detection: DetectionResult): Promise<Answers> {
  console.log();
  if (detection.stacks.length > 0) {
    console.log(pc.dim("  detected: ") + pc.cyan(detection.stacks.join(" · ")));
  } else {
    console.log(pc.dim("  no stack auto-detected — you'll pick manually"));
  }
  console.log(pc.dim(`  package manager: ${detection.packageManager}`));
  console.log();

  const projectName = await input({
    message: "Project name",
    default: detection.hint ?? "my-project",
  });

  const projectKind = (await select({
    message: "What kind of project?",
    choices: [
      { name: "Web app (user-facing UI)", value: "web-app" },
      { name: "API / backend service", value: "api" },
      { name: "Full-stack (UI + API in one repo)", value: "fullstack" },
      { name: "Library / SDK", value: "library" },
      { name: "CLI tool", value: "cli" },
      { name: "Mobile app", value: "mobile" },
      { name: "Something else", value: "other" },
    ],
    default: detection.stacks.includes("nextjs") || detection.stacks.includes("remix")
      ? "fullstack"
      : detection.stacks.includes("react") || detection.stacks.includes("vue")
        ? "web-app"
        : detection.stacks.includes("fastapi") || detection.stacks.includes("express")
          ? "api"
          : "web-app",
  })) as ProjectKind;

  const description = await input({
    message: "One sentence — what does this project do?",
    default: "",
  });

  let stacks: StackTag[] = detection.stacks;
  const confirmDetected =
    detection.stacks.length > 0
      ? await confirm({
          message: `Use the detected stack (${detection.stacks.join(", ")})?`,
          default: true,
        })
      : false;

  if (!confirmDetected) {
    stacks = (await checkbox({
      message: "Select stack tags (space to toggle, enter to confirm)",
      choices: STACK_CHOICES.map((c) => ({
        ...c,
        checked: detection.stacks.includes(c.value),
      })),
      pageSize: 20,
    })) as StackTag[];
  }

  const aiTools = (await checkbox({
    message: "Which AI tools should this config target?",
    choices: [
      { name: "Cursor (.cursorrules)", value: "cursor", checked: true },
      { name: "Claude Code (CLAUDE.md)", value: "claude-code", checked: true },
      { name: "GitHub Copilot (.github/copilot-instructions.md)", value: "copilot", checked: true },
      { name: "Windsurf / generic (AGENTS.md)", value: "windsurf", checked: true },
    ],
  })) as AITool[];

  const codingStyle = (await select({
    message: "Coding style preference",
    choices: [
      { name: "Strict — types, linting, tests required", value: "strict" },
      { name: "Pragmatic — ship it, then clean up", value: "pragmatic" },
      { name: "Fast iteration — prototype mode, quality later", value: "fast-iteration" },
    ],
    default: "pragmatic",
  })) as CodingStyle;

  const verbosity = (await select({
    message: "How should the AI talk to you?",
    choices: [
      { name: "Terse — minimal commentary, show me the code", value: "terse" },
      { name: "Balanced — short explanations when useful", value: "balanced" },
      { name: "Teach me — explain decisions as you go", value: "explain-more" },
    ],
    default: "balanced",
  })) as Verbosity;

  const testingEmphasis = (await select({
    message: "Testing expectation",
    choices: [
      { name: "Always — every new function gets a test", value: "always" },
      { name: "Critical paths only", value: "critical-paths" },
      { name: "Minimal — I'll write tests later", value: "minimal" },
    ],
    default: "critical-paths",
  })) as "always" | "critical-paths" | "minimal";

  const customRules = await input({
    message: "Any custom rules? (optional, e.g. 'use kebab-case files')",
    default: "",
  });

  return {
    detection,
    projectName,
    projectKind,
    description,
    stacks,
    aiTools,
    codingStyle,
    verbosity,
    testingEmphasis,
    customRules,
  };
}
