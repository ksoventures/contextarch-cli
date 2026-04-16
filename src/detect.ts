import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { join, basename } from "node:path";
import type { DetectionResult, StackTag } from "./types.js";

async function exists(p: string): Promise<boolean> {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readJson<T = unknown>(p: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(p, "utf8")) as T;
  } catch {
    return null;
  }
}

async function readText(p: string): Promise<string | null> {
  try {
    return await readFile(p, "utf8");
  } catch {
    return null;
  }
}

interface PkgJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  packageManager?: string;
}

function allDeps(pkg: PkgJson): Set<string> {
  return new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ]);
}

const JS_FRAMEWORK_MATCHERS: Array<{ dep: string; tag: StackTag }> = [
  { dep: "next", tag: "nextjs" },
  { dep: "@remix-run/react", tag: "remix" },
  { dep: "@remix-run/node", tag: "remix" },
  { dep: "astro", tag: "astro" },
  { dep: "@sveltejs/kit", tag: "sveltekit" },
  { dep: "nuxt", tag: "vue" },
  { dep: "vue", tag: "vue" },
  { dep: "react", tag: "react" },
  { dep: "@nestjs/core", tag: "nest" },
  { dep: "fastify", tag: "fastify" },
  { dep: "express", tag: "express" },
  { dep: "hono", tag: "hono" },
  { dep: "electron", tag: "electron" },
];

const JS_EXTRA_MATCHERS: Array<{ dep: string; tag: StackTag }> = [
  { dep: "tailwindcss", tag: "tailwind" },
  { dep: "prisma", tag: "prisma" },
  { dep: "@prisma/client", tag: "prisma" },
  { dep: "drizzle-orm", tag: "drizzle" },
  { dep: "@supabase/supabase-js", tag: "supabase" },
  { dep: "mongoose", tag: "mongo" },
  { dep: "mongodb", tag: "mongo" },
  { dep: "pg", tag: "postgres" },
  { dep: "redis", tag: "redis" },
  { dep: "ioredis", tag: "redis" },
  { dep: "vitest", tag: "vitest" },
  { dep: "jest", tag: "jest" },
];

const PYTHON_MATCHERS: Array<{ pattern: RegExp; tag: StackTag }> = [
  { pattern: /^fastapi\b/im, tag: "fastapi" },
  { pattern: /^django\b/im, tag: "django" },
  { pattern: /^flask\b/im, tag: "flask" },
  { pattern: /^pytest\b/im, tag: "pytest" },
];

export async function detectStack(cwd: string): Promise<DetectionResult> {
  const stacks = new Set<StackTag>();
  let language: DetectionResult["language"] = "unknown";
  let packageManager: DetectionResult["packageManager"] = "unknown";
  let hint: string | null = null;

  const pkgPath = join(cwd, "package.json");
  const goMod = join(cwd, "go.mod");
  const cargo = join(cwd, "Cargo.toml");
  const pyproject = join(cwd, "pyproject.toml");
  const reqTxt = join(cwd, "requirements.txt");
  const pipfile = join(cwd, "Pipfile");
  const gemfile = join(cwd, "Gemfile");
  const composer = join(cwd, "composer.json");

  const [hasPkg, hasGo, hasCargo, hasPy, hasReq, hasPipfile, hasGem, hasComposer] = await Promise.all([
    exists(pkgPath),
    exists(goMod),
    exists(cargo),
    exists(pyproject),
    exists(reqTxt),
    exists(pipfile),
    exists(gemfile),
    exists(composer),
  ]);

  if (hasPkg) {
    const pkg = await readJson<PkgJson>(pkgPath);
    if (pkg) {
      const deps = allDeps(pkg);
      const isTs = deps.has("typescript") || (await exists(join(cwd, "tsconfig.json")));
      language = isTs ? "typescript" : "javascript";
      if (isTs) stacks.add("typescript");
      stacks.add("node");

      for (const { dep, tag } of JS_FRAMEWORK_MATCHERS) {
        if (deps.has(dep)) stacks.add(tag);
      }
      for (const { dep, tag } of JS_EXTRA_MATCHERS) {
        if (deps.has(dep)) stacks.add(tag);
      }

      if (pkg.packageManager?.startsWith("pnpm")) packageManager = "pnpm";
      else if (pkg.packageManager?.startsWith("yarn")) packageManager = "yarn";
      else if (pkg.packageManager?.startsWith("bun")) packageManager = "bun";
      else if (await exists(join(cwd, "pnpm-lock.yaml"))) packageManager = "pnpm";
      else if (await exists(join(cwd, "yarn.lock"))) packageManager = "yarn";
      else if (await exists(join(cwd, "bun.lockb"))) packageManager = "bun";
      else packageManager = "npm";

      hint ??= pkg.name ?? null;
    }
  }

  if (hasPy || hasReq || hasPipfile) {
    language = language === "unknown" ? "python" : "mixed";
    stacks.add("python");
    const text = [
      hasPy ? await readText(pyproject) : null,
      hasReq ? await readText(reqTxt) : null,
      hasPipfile ? await readText(pipfile) : null,
    ]
      .filter(Boolean)
      .join("\n");

    for (const { pattern, tag } of PYTHON_MATCHERS) {
      if (pattern.test(text)) stacks.add(tag);
    }

    if (hasPy && /poetry/i.test(text)) packageManager = "poetry";
    else if (hasPy && /\[tool\.uv\]/i.test(text)) packageManager = "uv";
    else if (packageManager === "unknown") packageManager = "pip";
  }

  if (hasGo) {
    language = language === "unknown" ? "go" : "mixed";
    stacks.add("go");
    if (packageManager === "unknown") packageManager = "go";
    const gomod = await readText(goMod);
    if (gomod) {
      const moduleMatch = gomod.match(/module\s+(.+)/);
      if (moduleMatch) hint ??= basename(moduleMatch[1]!.trim());
    }
  }

  if (hasCargo) {
    language = language === "unknown" ? "rust" : "mixed";
    stacks.add("rust");
    if (packageManager === "unknown") packageManager = "cargo";
    const toml = await readText(cargo);
    if (toml) {
      const nameMatch = toml.match(/\[package\][\s\S]*?name\s*=\s*"([^"]+)"/);
      if (nameMatch) hint ??= nameMatch[1] ?? null;
    }
  }

  if (hasGem) {
    language = language === "unknown" ? "ruby" : "mixed";
    stacks.add("ruby");
    if (packageManager === "unknown") packageManager = "bundler";
    const gem = await readText(gemfile);
    if (gem && /gem\s+['"]rails['"]/.test(gem)) stacks.add("rails");
  }

  if (hasComposer) {
    language = language === "unknown" ? "php" : "mixed";
    stacks.add("php");
    if (packageManager === "unknown") packageManager = "composer";
    const comp = await readJson<{ require?: Record<string, string>; name?: string }>(composer);
    if (comp?.require && "laravel/framework" in comp.require) stacks.add("laravel");
    if (comp?.name) hint ??= comp.name;
  }

  if (await exists(join(cwd, "Dockerfile"))) stacks.add("docker");

  return {
    stacks: [...stacks],
    language,
    packageManager,
    hint: hint ?? basename(cwd),
  };
}
