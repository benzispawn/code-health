import path from 'node:path';
import type {
  ClassDeclaration,
  ExportSpecifier,
  FunctionDeclaration,
  Project,
  SourceFile,
  VariableDeclaration,
} from 'ts-morph';
import { Node, SyntaxKind } from 'ts-morph';
import { relativePosix } from '../../shared/fs/path-utils';
import type { UnusedExportAnalysis } from '../../shared/types/project-health';

const AMBIGUOUS_EXPORT_DECORATORS = new Set([
  'Controller',
  'Injectable',
  'Module',
  'Resolver',
]);

export function analyzeUnusedExports(
  project: Project,
  sourceFiles: string[],
  cwd: string,
): UnusedExportAnalysis[] {
  const sourceFileSet = new Set(sourceFiles);
  const candidateKeys = new Set<string>();
  const candidates = new Map<string, UnusedExportAnalysis>();
  const usedKeys = new Set<string>();
  const ambiguousFiles = new Set<string>();

  for (const filePath of sourceFiles) {
    const sourceFile = getLoadedSourceFile(project, filePath);
    markAmbiguousFiles(sourceFile, sourceFileSet, ambiguousFiles);

    for (const candidate of collectExportCandidates(sourceFile, cwd)) {
      const key = candidateKey(candidate.file, candidate.exportName);
      candidateKeys.add(key);
      candidates.set(key, candidate);
    }
  }

  for (const filePath of sourceFiles) {
    const sourceFile = getLoadedSourceFile(project, filePath);

    for (const declaration of sourceFile.getImportDeclarations()) {
      const moduleFile = declaration.getModuleSpecifierSourceFile();
      if (!moduleFile || !sourceFileSet.has(moduleFile.getFilePath())) {
        continue;
      }

      if (
        declaration.getDefaultImport() ||
        declaration.getNamespaceImport() ||
        declaration.isTypeOnly()
      ) {
        ambiguousFiles.add(moduleFile.getFilePath());
      }

      for (const namedImport of declaration.getNamedImports()) {
        const symbol = namedImport.getNameNode().getSymbol();
        const declarations =
          symbol?.getAliasedSymbol()?.getDeclarations() ??
          symbol?.getDeclarations() ??
          [];

        for (const item of declarations) {
          const origin = item.getSourceFile().getFilePath();
          if (!sourceFileSet.has(origin)) {
            continue;
          }

          const exportName = resolveExportName(item, namedImport);
          usedKeys.add(
            candidateKey(relativePosix(cwd, origin), exportName),
          );
        }
      }
    }
  }

  return [...candidates.values()]
    .filter((candidate) => !ambiguousFiles.has(path.resolve(cwd, candidate.file)))
    .filter((candidate) => !usedKeys.has(candidateKey(candidate.file, candidate.exportName)))
    .sort(
      (left, right) =>
        left.file.localeCompare(right.file) ||
        left.exportName.localeCompare(right.exportName),
    );
}

function collectExportCandidates(
  sourceFile: SourceFile,
  cwd: string,
): UnusedExportAnalysis[] {
  const file = relativePosix(cwd, sourceFile.getFilePath());
  const candidates: UnusedExportAnalysis[] = [];

  for (const [exportName, declarations] of sourceFile.getExportedDeclarations()) {
    if (exportName === 'default') {
      continue;
    }

    for (const declaration of declarations) {
      if (declaration.getSourceFile() !== sourceFile) {
        continue;
      }
      const candidate = createCandidate(file, exportName, declaration);
      if (candidate) {
        candidates.push(candidate);
      }
    }
  }

  return candidates;
}

function createCandidate(
  file: string,
  exportName: string,
  declaration: Node,
): UnusedExportAnalysis | undefined {
  if (Node.isClassDeclaration(declaration)) {
    if (hasAmbiguousDecorator(declaration)) {
      return undefined;
    }
    return {
      file,
      exportName,
      kind: 'class',
      reason: 'Named export has no internal named-import consumers',
    };
  }

  if (Node.isFunctionDeclaration(declaration)) {
    return {
      file,
      exportName,
      kind: 'function',
      reason: 'Named export has no internal named-import consumers',
    };
  }

  if (Node.isVariableDeclaration(declaration)) {
    return {
      file,
      exportName,
      kind: 'const',
      reason: 'Named export has no internal named-import consumers',
    };
  }

  return undefined;
}

function hasAmbiguousDecorator(declaration: ClassDeclaration): boolean {
  return declaration
    .getDecorators()
    .some((decorator) => AMBIGUOUS_EXPORT_DECORATORS.has(decorator.getName()));
}

function markAmbiguousFiles(
  sourceFile: SourceFile,
  sourceFileSet: Set<string>,
  ambiguousFiles: Set<string>,
): void {
  for (const exportDeclaration of sourceFile.getExportDeclarations()) {
    if (!exportDeclaration.isNamespaceExport()) {
      continue;
    }
    const moduleFile = exportDeclaration.getModuleSpecifierSourceFile();
    if (moduleFile && sourceFileSet.has(moduleFile.getFilePath())) {
      ambiguousFiles.add(moduleFile.getFilePath());
    }
  }
}

function resolveExportName(
  declaration: Node,
  namedImport: ExportSpecifier | { getName(): string },
): string {
  if (
    Node.isClassDeclaration(declaration) ||
    Node.isFunctionDeclaration(declaration) ||
    Node.isVariableDeclaration(declaration)
  ) {
    return declaration.getSymbol()?.getName() ?? namedImport.getName();
  }

  return namedImport.getName();
}

function candidateKey(file: string, exportName: string): string {
  return `${file}::${exportName}`;
}

function getLoadedSourceFile(project: Project, filePath: string): SourceFile {
  const sourceFile = project.getSourceFile(filePath);
  if (!sourceFile) {
    throw new Error(`Unable to load source file: ${filePath}`);
  }
  return sourceFile;
}
