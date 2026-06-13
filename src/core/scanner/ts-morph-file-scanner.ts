import path from 'node:path';
import {
  ArrowFunction,
  CallExpression,
  ConstructorDeclaration,
  FunctionDeclaration,
  FunctionExpression,
  ImportDeclaration,
  MethodDeclaration,
  Node,
  Project,
  SourceFile,
  SyntaxKind,
  VariableDeclaration,
} from 'ts-morph';
import { CodeHealthConfig } from '../../shared/types/config';
import {
  ClassAnalysis,
  FileAnalysis,
  FunctionAnalysis,
  ImportAnalysis,
} from '../../shared/types/project-health';
import { relativePosix } from '../../shared/fs/path-utils';
import { detectDomain } from '../architecture/domain-boundary-rules';
import { detectLayer } from '../architecture/layer-rules';
import { calculateCyclomaticComplexity } from '../metrics/complexity/cyclomatic.metric';
import { calculateCognitiveComplexity } from '../metrics/complexity/cognitive.metric';
import { estimateNPathComplexity } from '../metrics/complexity/npath.metric';
import { calculateMaintainabilityIndex } from '../metrics/maintainability/maintainability-index.metric';
import { calculateFanOut } from '../metrics/coupling/fan-out.metric';
import { getRequiredSourceFile } from './ts-morph-project';

type FunctionLikeNode =
  | FunctionDeclaration
  | MethodDeclaration
  | ConstructorDeclaration
  | ArrowFunction
  | FunctionExpression
  | CallExpression;

const HTTP_ROUTE_DECORATORS = new Set(['Get', 'Post', 'Put', 'Patch', 'Delete', 'Options', 'Head', 'All']);

export function scanFileWithTsMorph(
  cwd: string,
  filePath: string,
  allFiles: string[],
  config: CodeHealthConfig,
  project: Project,
): FileAnalysis {
  const sourceFile = getRequiredSourceFile(project, filePath);
  const relativePath = relativePosix(cwd, filePath);
  const imports = extractImports(cwd, sourceFile, allFiles);
  const classes = extractClasses(sourceFile);
  const functions = extractFunctions(sourceFile);
  const source = sourceFile.getFullText();
  const loc = countLoc(source);
  const physicalLoc = countPhysicalLoc(source);
  const logicalLoc = countLogicalLoc(sourceFile);
  const commentLines = countCommentLines(source);
  const publicExportCount = countPublicExports(sourceFile);
  const controllerCount = classes.filter((item) => item.decorators.includes('Controller')).length;
  const endpointCount = functions.filter((item) => item.decorators.some((decorator) => HTTP_ROUTE_DECORATORS.has(decorator))).length;
  const cyclomaticComplexity = sum(functions.map((item) => item.cyclomaticComplexity));
  const cognitiveComplexity = sum(functions.map((item) => item.cognitiveComplexity));
  const npathComplexity = sum(functions.map((item) => item.npathComplexity ?? 0));
  const maintainabilityIndex = calculateMaintainabilityIndex({
    loc,
    cyclomaticComplexity,
    functionCount: functions.length,
  });

  return {
    path: relativePath,
    domain: detectDomain(relativePath, config),
    layer: detectLayer(relativePath, config),
    loc,
    functions,
    classes,
    imports,
    metrics: {
      maintainabilityIndex,
      cyclomaticComplexity,
      cognitiveComplexity,
      npathComplexity,
      physicalLoc,
      logicalLoc,
      commentLines,
      commentRatio: physicalLoc === 0 ? 0 : Math.round((commentLines / physicalLoc) * 100),
      duplicationPercent: 0,
      dependencyDepth: 0,
      publicExportCount,
      controllerCount,
      endpointCount,
      fanIn: 0,
      fanOut: calculateFanOut(imports),
    },
    score: 100,
  };
}

function extractImports(cwd: string, sourceFile: SourceFile, allFiles: string[]): ImportAnalysis[] {
  const imports: ImportAnalysis[] = [];

  for (const declaration of sourceFile.getImportDeclarations()) {
    const source = declaration.getModuleSpecifierValue();
    const resolvedPaths = resolveImportDeclarationPaths(declaration, allFiles);

    if (resolvedPaths.length === 0) {
      imports.push({
        source,
        resolvedPath: undefined,
        isRelative: source.startsWith('.'),
      });
      continue;
    }

    for (const resolvedPath of resolvedPaths) {
      imports.push({
        source,
        resolvedPath: resolveImport(cwd, resolvedPath, allFiles),
        isRelative: source.startsWith('.'),
      });
    }
  }

  for (const callExpression of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const expressionText = callExpression.getExpression().getText();
    if (expressionText !== 'require') {
      continue;
    }

    const firstArgument = callExpression.getArguments()[0];
    if (!firstArgument || !Node.isStringLiteral(firstArgument)) {
      continue;
    }

    const source = firstArgument.getLiteralText();
    imports.push({
      source,
      resolvedPath: resolveImport(cwd, resolveRelativeImport(sourceFile, source, allFiles), allFiles),
      isRelative: source.startsWith('.'),
    });
  }

  return imports;
}

function resolveImportDeclarationPaths(declaration: ImportDeclaration, allFiles: string[]): string[] {
  const namedImportPaths = declaration
    .getNamedImports()
    .flatMap((namedImport) => {
      const symbol = namedImport.getNameNode().getSymbol();
      const declarations = symbol?.getAliasedSymbol()?.getDeclarations() ?? symbol?.getDeclarations() ?? [];
      return declarations.map((item) => String(item.getSourceFile().getFilePath()));
    })
    .filter((filePath) => allFiles.includes(filePath));

  const moduleSpecifierSourceFile = declaration.getModuleSpecifierSourceFile();
  const resolvedPaths: string[] = namedImportPaths.length > 0
    ? namedImportPaths
    : moduleSpecifierSourceFile
      ? [String(moduleSpecifierSourceFile.getFilePath())]
      : [];

  return [...new Set(resolvedPaths)];
}

function resolveImport(cwd: string, resolvedPath: string | undefined, allFiles: string[]): string | undefined {
  if (!resolvedPath || !allFiles.includes(resolvedPath)) {
    return undefined;
  }
  return relativePosix(cwd, resolvedPath);
}

function resolveRelativeImport(sourceFile: SourceFile, source: string, allFiles: string[]): string | undefined {
  if (!source.startsWith('.')) {
    return undefined;
  }

  const absoluteBase = path.resolve(path.dirname(sourceFile.getFilePath()), source);
  const candidates = [
    `${absoluteBase}.ts`,
    `${absoluteBase}.tsx`,
    path.join(absoluteBase, 'index.ts'),
    path.join(absoluteBase, 'index.tsx'),
  ];

  return candidates.find((candidate) => allFiles.includes(candidate));
}

function extractClasses(sourceFile: SourceFile): ClassAnalysis[] {
  return sourceFile.getClasses().map((classDeclaration) => {
    const lineStart = lineAt(sourceFile, classDeclaration.getStart());
    const lineEnd = lineAt(sourceFile, classDeclaration.getEnd());
    const methods = classDeclaration.getMethods().map((method) => method.getName());

    return {
      name: classDeclaration.getName() ?? 'AnonymousClass',
      decorators: classDeclaration.getDecorators().map((decorator) => decorator.getName()),
      lineStart,
      lineEnd,
      loc: Math.max(1, lineEnd - lineStart + 1),
      methods,
      methodCount: methods.length,
    };
  });
}

function extractFunctions(sourceFile: SourceFile): FunctionAnalysis[] {
  return [
    ...sourceFile.getFunctions().map((declaration) =>
      createFunctionAnalysis(sourceFile, declaration, declaration.getName() ?? 'anonymous'),
    ),
    ...sourceFile.getClasses().flatMap((classDeclaration) => [
      ...classDeclaration.getConstructors().map((constructorDeclaration) =>
        createFunctionAnalysis(sourceFile, constructorDeclaration, 'constructor'),
      ),
      ...classDeclaration.getMethods().map((method) =>
        createFunctionAnalysis(sourceFile, method, method.getName(), method.getDecorators().map((decorator) => decorator.getName())),
      ),
    ]),
    ...extractTopLevelConstFunctions(sourceFile),
  ];
}

function extractTopLevelConstFunctions(sourceFile: SourceFile): FunctionAnalysis[] {
  const functions: FunctionAnalysis[] = [];

  for (const declaration of sourceFile.getVariableDeclarations()) {
    if (!isTopLevelVariableDeclaration(declaration)) {
      continue;
    }

    const initializer = declaration.getInitializer();
    if (!initializer) {
      continue;
    }

    if (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer) || Node.isCallExpression(initializer)) {
      functions.push(createFunctionAnalysis(sourceFile, initializer, declaration.getName()));
    }
  }

  return functions;
}

function isTopLevelVariableDeclaration(declaration: VariableDeclaration): boolean {
  const statement = declaration.getFirstAncestorByKind(SyntaxKind.VariableStatement);
  return statement?.getParentIfKind(SyntaxKind.SourceFile) !== undefined;
}

function createFunctionAnalysis(
  sourceFile: SourceFile,
  node: FunctionLikeNode,
  name: string,
  decorators: string[] = [],
): FunctionAnalysis {
  const text = node.getText();
  const lineStart = lineAt(sourceFile, node.getStart());
  const lineEnd = lineAt(sourceFile, node.getEnd());

  return {
    name,
    lineStart,
    lineEnd,
    loc: Math.max(1, lineEnd - lineStart + 1),
    decorators,
    cyclomaticComplexity: calculateCyclomaticComplexity(text),
    cognitiveComplexity: calculateCognitiveComplexity(text),
    npathComplexity: estimateNPathComplexity(text),
    parameterCount: getParameterCount(node),
  };
}

function countPublicExports(sourceFile: SourceFile): number {
  return sourceFile.getExportedDeclarations().size;
}

function getParameterCount(node: FunctionLikeNode): number {
  if (Node.isCallExpression(node)) {
    return node.getArguments().length;
  }
  return node.getParameters().length;
}

function lineAt(sourceFile: SourceFile, position: number): number {
  return sourceFile.getLineAndColumnAtPos(position).line;
}

function countLoc(source: string): number {
  return source.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
}

function countPhysicalLoc(source: string): number {
  if (!source) {
    return 0;
  }
  return source.split(/\r?\n/).length;
}

function countLogicalLoc(sourceFile: SourceFile): number {
  return sourceFile.getDescendants().filter((node) => isLogicalStatement(node.getKind())).length;
}

function isLogicalStatement(kind: SyntaxKind): boolean {
  switch (kind) {
    case SyntaxKind.VariableStatement:
    case SyntaxKind.ExpressionStatement:
    case SyntaxKind.ReturnStatement:
    case SyntaxKind.IfStatement:
    case SyntaxKind.ForStatement:
    case SyntaxKind.ForInStatement:
    case SyntaxKind.ForOfStatement:
    case SyntaxKind.WhileStatement:
    case SyntaxKind.DoStatement:
    case SyntaxKind.SwitchStatement:
    case SyntaxKind.TryStatement:
    case SyntaxKind.ThrowStatement:
    case SyntaxKind.BreakStatement:
    case SyntaxKind.ContinueStatement:
      return true;
    default:
      return false;
  }
}

function countCommentLines(source: string): number {
  const lines = source.split(/\r?\n/);
  let count = 0;
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (inBlockComment) {
      count += 1;
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
      continue;
    }

    if (trimmed.startsWith('//')) {
      count += 1;
      continue;
    }

    const blockStart = trimmed.indexOf('/*');
    if (blockStart !== -1) {
      count += 1;
      if (!trimmed.slice(blockStart + 2).includes('*/')) {
        inBlockComment = true;
      }
    }
  }

  return count;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
