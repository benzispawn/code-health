import { execFileSync } from "node:child_process";

export function readGitChurn(cwd: string, days = 90): Map<string, number> {
  try {
    const output = execFileSync(
      "git",
      ["log", `--since=${days} days ago`, "--name-only", "--pretty=format:"],
      { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    const churn = new Map<string, number>();

    for (const line of output.split(/\r?\n/)) {
      const file = line.trim();
      if (!file || !file.endsWith(".ts")) {
        continue;
      }
      churn.set(file, (churn.get(file) ?? 0) + 1);
    }

    return churn;
  } catch {
    return new Map<string, number>();
  }
}
