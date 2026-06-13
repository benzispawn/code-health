import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DEFAULT_CONFIG } from './default-config';
import { validateConfig } from './schema';
import { CodeHealthError } from '../shared/errors/code-health-error';
import type { CodeHealthConfig } from '../shared/types/config';

const CONFIG_FILES = [
  'code-health.config.ts',
  'code-health.config.mjs',
  'code-health.config.js',
  'code-health.config.cjs',
  'code-health.config.json',
];

export interface LoadConfigOptions {
  cwd: string;
  configPath?: string;
}

export async function loadConfig(
  options: LoadConfigOptions,
): Promise<CodeHealthConfig> {
  const configFile = findConfigFile(options.cwd, options.configPath);
  const userConfig = configFile ? await readConfigFile(configFile) : {};
  const config = mergeConfig(DEFAULT_CONFIG, userConfig);
  const validation = validateConfig(config);

  if (!validation.valid) {
    throw new CodeHealthError(
      `Invalid code health config:\n${validation.errors.join('\n')}`,
    );
  }

  return config;
}

export function findConfigFile(
  cwd: string,
  configPath?: string,
): string | undefined {
  if (configPath) {
    const resolved = path.resolve(cwd, configPath);
    if (!fs.existsSync(resolved)) {
      throw new CodeHealthError(`Config file not found: ${configPath}`);
    }
    return resolved;
  }

  for (const fileName of CONFIG_FILES) {
    const resolved = path.resolve(cwd, fileName);
    if (fs.existsSync(resolved)) {
      return resolved;
    }
  }

  return undefined;
}

async function readConfigFile(
  filePath: string,
): Promise<Partial<CodeHealthConfig>> {
  if (filePath.endsWith('.json')) {
    return JSON.parse(
      fs.readFileSync(filePath, 'utf8'),
    ) as Partial<CodeHealthConfig>;
  }

  if (filePath.endsWith('.ts')) {
    return readTypeScriptConfig(filePath);
  }

  const imported = (await import(pathToFileURL(filePath).href)) as {
    default?: Partial<CodeHealthConfig>;
  };
  return imported.default ?? {};
}

function readTypeScriptConfig(filePath: string): Partial<CodeHealthConfig> {
  const source = fs.readFileSync(filePath, 'utf8');
  const callStart = source.indexOf('defineConfig(');

  if (callStart === -1) {
    throw new CodeHealthError(
      `${path.basename(filePath)} must export defineConfig({ ... })`,
    );
  }

  const objectStart = source.indexOf('(', callStart) + 1;
  const objectText = extractBalancedExpression(source, objectStart);
  const readConfig = new Function(
    'defineConfig',
    `return defineConfig(${objectText});`,
  ) as (
    defineConfig: (
      value: Partial<CodeHealthConfig>,
    ) => Partial<CodeHealthConfig>,
  ) => Partial<CodeHealthConfig>;

  return readConfig((value) => value);
}

function extractBalancedExpression(source: string, start: number): string {
  let depth = 0;
  let inString: '"' | "'" | '`' | undefined;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === inString) {
        inString = undefined;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = char;
      continue;
    }
    if (char === '(' || char === '{' || char === '[') {
      depth += 1;
      continue;
    }
    if (char === ')' || char === '}' || char === ']') {
      if (depth === 0) {
        return source.slice(start, index);
      }
      depth -= 1;
    }
  }

  throw new CodeHealthError('Unable to parse TypeScript config');
}

function mergeConfig(
  base: CodeHealthConfig,
  override: Partial<CodeHealthConfig>,
): CodeHealthConfig {
  return {
    project: { ...base.project, ...override.project },
    spec: { ...base.spec, ...override.spec },
    scan: { ...base.scan, ...override.scan },
    architecture: {
      ...base.architecture,
      ...override.architecture,
      layers: { ...base.architecture.layers, ...override.architecture?.layers },
      rules: override.architecture?.rules ?? base.architecture.rules,
    },
    thresholds: { ...base.thresholds, ...override.thresholds },
    scoring: { ...base.scoring, ...override.scoring },
    reports: { ...base.reports, ...override.reports },
  };
}
