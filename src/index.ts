import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import pc from "picocolors";
import { detectStack } from "./detect.js";
import { runPrompts } from "./prompts.js";
import { buildFiles, writeFiles } from "./generate.js";

const pkgVersion = "0.1.0";

function banner(): void {
  console.log();
  console.log(pc.bold(pc.cyan("  contextarch")) + pc.dim(`  v${pkgVersion}`));
  console.log(pc.dim("  Generate AI context files for your project."));
  console.log();
}

async function runInit(cwd: string, opts: { yes: boolean; overwrite: boolean; noBackup: boolean }): Promise<void> {
  banner();
  const detection = await detectStack(cwd);
  const answers = await runPrompts(detection);
  const files = buildFiles(answers);

  if (files.length === 0) {
    console.log(pc.yellow("\nNo AI tools selected — nothing to generate."));
    return;
  }

  console.log();
  console.log(pc.bold("About to write:"));
  for (const f of files) console.log(`  ${pc.green("+")} ${f.path}`);
  console.log();

  const proceed = opts.yes
    ? true
    : await confirm({ message: "Generate these files?", default: true });
  if (!proceed) {
    console.log(pc.dim("Aborted — nothing written."));
    return;
  }

  const results = await writeFiles(cwd, files, {
    overwrite: opts.overwrite,
    backup: !opts.noBackup,
  });

  console.log();
  for (const r of results) {
    if (r.wrote) {
      const tail = r.backupPath ? pc.dim(` (backup → ${r.path}.bak)`) : "";
      console.log(`  ${pc.green("✓")} ${r.path}${tail}`);
    } else if (r.skipped === "exists") {
      console.log(
        `  ${pc.yellow("•")} ${r.path} ${pc.dim("already exists — re-run with --overwrite to replace")}`,
      );
    }
  }

  console.log();
  console.log(pc.dim("  Next: open a new session in your AI tool — it'll pick these up automatically."));
  console.log(pc.dim("  Tune the output? Edit the generated files or run `npx contextarch init --overwrite`."));
  console.log();
}

async function main(): Promise<void> {
  const program = new Command();

  program
    .name("contextarch")
    .description("Generate AI context files (.cursorrules, AGENTS.md, CLAUDE.md, copilot-instructions.md) for your project.")
    .version(pkgVersion);

  program
    .command("init", { isDefault: true })
    .description("Run the interactive wizard in the current directory.")
    .option("-y, --yes", "skip final confirmation", false)
    .option("--overwrite", "overwrite existing files without prompting", false)
    .option("--no-backup", "do not create .bak copies when overwriting", false)
    .option("-C, --cwd <dir>", "target directory", process.cwd())
    .action(async (opts: { yes: boolean; overwrite: boolean; noBackup?: boolean; backup?: boolean; cwd: string }) => {
      const noBackup = opts.backup === false;
      try {
        await runInit(opts.cwd, {
          yes: opts.yes,
          overwrite: opts.overwrite,
          noBackup,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "ExitPromptError") {
          console.log(pc.dim("\nCancelled."));
          process.exit(0);
        }
        throw err;
      }
    });

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(pc.red("Error:"), err instanceof Error ? err.message : err);
  process.exit(1);
});
