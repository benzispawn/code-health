import fs from 'node:fs';
import path from 'node:path';
import { Project, SourceFile } from 'ts-morph';

export function createTsMorphProject(cwd: string, sourceFiles: string[]): Project {
  const tsConfigFilePath = path.resolve(cwd, 'tsconfig.json');
  const project = fs.existsSync(tsConfigFilePath)
    ? new Project({
        tsConfigFilePath,
        skipAddingFilesFromTsConfig: true,
      })
    : new Project({
        compilerOptions: {
          allowJs: false,
          skipLibCheck: true,
        },
      });

  for (const filePath of sourceFiles) {
    project.addSourceFileAtPathIfExists(filePath);
  }

  return project;
}

export function getRequiredSourceFile(project: Project, filePath: string): SourceFile {
  const sourceFile = project.getSourceFile(filePath);
  if (!sourceFile) {
    throw new Error(`Unable to load source file: ${filePath}`);
  }
  return sourceFile;
}
