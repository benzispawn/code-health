import fs from 'node:fs';
import path from 'node:path';
import { CodeHealthConfig } from '../../shared/types/config';
import {
  ClassAnalysis,
  FileAnalysis,
  FunctionAnalysis,
  ImportAnalysis,
} from '../../shared/types/project-health';
import { relativePosix, stripExtension } from '../../shared/fs/path-utils';
import { detectDomain } from '../architecture/domain-boundary-rules';
import { detectLayer } from '../architecture/layer-rules';
import { calculateCyclomaticComplexity } from '../metrics/complexity/cyclomatic.metric';
import { calculateCognitiveComplexity } from '../metrics/complexity/cognitive.metric';
import { estimateNPathComplexity } from '../metrics/complexity/npath.metric';
import { calculateMaintainabilityIndex } from '../metrics/maintainability/maintainability-index.metric';
import { calculateFanOut } from '../metrics/coupling/fan-out.metric';

const CONTROL_NAMES = new Set(['if', 'for', 'while', 'switch', 'catch', 'function']);

export function scanFile(cwd: string, filePath: string, allFiles: string[], config: CodeHealthConfig): FileAnalysis {
  const source = fs.readFileSync(filePath, 'utf8');
  const relativePath = relativePosix(cwd, filePath);
  const imports = extractImports(cwd, filePath, source, allFiles);
  const functions = extractFunctions(source);
  const classes = extractClasses(source);
  const loc = countLoc(source);
  const cyclomaticComplexity = sum(functions.map((item) => item.cyclomaticComplexity));
  const cognitiveComplexity = sum(functions.map((item) => item.cognitiveComplexity));
  const maintainabilityIndex = calculateMaintainabilityIndex({
    loc,
    cyclomaticComplexity,
    functionCount: functions.length,
  });
  const layer = detectLayer(relativePath, config);

  return {
    path: relativePath,
    domain: detectDomain(relativePath, config),
    layer,
    loc,
    functions,
    classes,
    imports,
    metrics: {
      maintainabilityIndex,
      cyclomaticComplexity,
      cognitiveComplexity,
      fanIn: 0,
      fanOut: calculateFanOut(imports),
    },
    score: 100,
  };
}

function extractImports(cwd: string, filePath: string, source: string, allFiles: string[]): ImportAnalysis[] {
  const imports: ImportAnalysis[] = [];
  const importPattern = /import(?:[\s\S]*?)from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match = importPattern.exec(source);

  while (match) {
    const sourcePath = match[1] ?? match[2] ?? match[3] ?? '';
    const isRelative = sourcePath.startsWith('.');
    imports.push({
      source: sourcePath,
      resolvedPath: isRelative ? resolveRelativeImport(cwd, filePath, sourcePath, allFiles) : undefined,
      isRelative,
    });
    match = importPattern.exec(source);
  }

  return imports;
}

function resolveRelativeImport(cwd: string, filePath: string, sourcePath: string, allFiles: string[]): string | undefined {
  const absoluteBase = path.resolve(path.dirname(filePath), sourcePath);
  const candidates = [
    `${absoluteBase}.ts`,
    `${absoluteBase}.tsx`,
    path.join(absoluteBase, 'index.ts'),
    path.join(absoluteBase, 'index.tsx'),
  ];
  const found = candidates.find((candidate) => allFiles.includes(candidate));
  return found ? relativePosix(cwd, found) : undefined;
}

function extractFunctions(source: string): FunctionAnalysis[] {
  const functions: FunctionAnalysis[] = [];
  const pattern =
    /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(([\s\S]*?)\)\s*[^{};]*\{|(?:^|\n)\s*(?:public|private|protected|static|async|\s)*([A-Za-z_$][\w$]*)\s*\(([\s\S]*?)\)\s*[^{};]*\{/g;
  let match = pattern.exec(source);

  while (match) {
    const name = match[1] ?? match[3] ?? 'anonymous';
    if (CONTROL_NAMES.has(name)) {
      match = pattern.exec(source);
      continue;
    }

    const bodyStart = source.indexOf('{', match.index);
    const bodyEnd = findMatchingBrace(source, bodyStart);
    if (bodyEnd === -1) {
      match = pattern.exec(source);
      continue;
    }

    const body = source.slice(bodyStart, bodyEnd + 1);
    const lineStart = lineNumberAt(source, match.index);
    const lineEnd = lineNumberAt(source, bodyEnd);
    const parameters = splitParameters(match[2] ?? match[4] ?? '');
    const cyclomaticComplexity = calculateCyclomaticComplexity(body);

    functions.push({
      name,
      lineStart,
      lineEnd,
      loc: Math.max(1, lineEnd - lineStart + 1),
      cyclomaticComplexity,
      cognitiveComplexity: calculateCognitiveComplexity(body),
      npathComplexity: estimateNPathComplexity(body),
      parameterCount: parameters.length,
    });

    pattern.lastIndex = bodyEnd + 1;
    match = pattern.exec(source);
  }

  return [...functions, ...extractConstFunctions(source, functions)];
}

function extractConstFunctions(source: string, existing: FunctionAnalysis[]): FunctionAnalysis[] {
  const existingNames = new Set(existing.map((item) => item.name));
  const functions: FunctionAnalysis[] = [];
  const pattern =
    /(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\(([^)]*)\)|([A-Za-z_$][\w$]*))\s*=>\s*\{|(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*\(/g;
  let match = pattern.exec(source);

  while (match) {
    const name = match[1] ?? match[4] ?? 'anonymous';
    if (existingNames.has(name)) {
      match = pattern.exec(source);
      continue;
    }

    const bodyStart = source.indexOf('{', match.index);
    const bodyEnd = bodyStart === -1 ? match.index : findMatchingBrace(source, bodyStart);
    const body = bodyEnd === -1 ? source.slice(match.index, source.indexOf('\n', match.index)) : source.slice(bodyStart, bodyEnd + 1);
    const lineStart = lineNumberAt(source, match.index);
    const lineEnd = bodyEnd === -1 ? lineStart : lineNumberAt(source, bodyEnd);
    const parameters = splitParameters(match[2] ?? match[3] ?? '');

    functions.push({
      name,
      lineStart,
      lineEnd,
      loc: Math.max(1, lineEnd - lineStart + 1),
      cyclomaticComplexity: calculateCyclomaticComplexity(body),
      cognitiveComplexity: calculateCognitiveComplexity(body),
      npathComplexity: estimateNPathComplexity(body),
      parameterCount: parameters.length,
    });

    match = pattern.exec(source);
  }

  return functions;
}

function extractClasses(source: string): ClassAnalysis[] {
  const classes: ClassAnalysis[] = [];
  const pattern = /((?:@\w+(?:\([^)]*\))?\s*)*)export\s+class\s+([A-Za-z_$][\w$]*)|((?:@\w+(?:\([^)]*\))?\s*)*)class\s+([A-Za-z_$][\w$]*)/g;
  let match = pattern.exec(source);

  while (match) {
    const decoratorsSource = match[1] ?? match[3] ?? '';
    const name = match[2] ?? match[4] ?? 'AnonymousClass';
    const bodyStart = source.indexOf('{', match.index);
    const bodyEnd = bodyStart === -1 ? match.index : findMatchingBrace(source, bodyStart);
    const body = bodyEnd === -1 ? '' : source.slice(bodyStart, bodyEnd + 1);

    classes.push({
      name,
      decorators: [...decoratorsSource.matchAll(/@([A-Za-z_$][\w$]*)/g)].map((decorator) => decorator[1]),
      lineStart: lineNumberAt(source, match.index),
      lineEnd: bodyEnd === -1 ? lineNumberAt(source, match.index) : lineNumberAt(source, bodyEnd),
      methods: extractFunctions(body).map((method) => method.name),
    });

    match = pattern.exec(source);
  }

  return classes;
}

function findMatchingBrace(source: string, openIndex: number): number {
  let depth = 0;
  let inString: '"' | "'" | '`' | undefined;
  let escaped = false;

  for (let index = openIndex; index < source.length; index += 1) {
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
    if (char === '{') {
      depth += 1;
    }
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function splitParameters(parameters: string): string[] {
  if (!parameters.trim()) {
    return [];
  }
  return parameters.split(',').map((parameter) => parameter.trim()).filter(Boolean);
}

function lineNumberAt(source: string, index: number): number {
  return source.slice(0, index).split(/\r?\n/).length;
}

function countLoc(source: string): number {
  return source.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function sourceIdentity(filePath: string): string {
  return stripExtension(filePath);
}
