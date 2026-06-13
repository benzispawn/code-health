#!/usr/bin/env node
import { runCli } from '../src/cli/main';

runCli(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`code-health: ${message}`);
  process.exitCode = 1;
});
