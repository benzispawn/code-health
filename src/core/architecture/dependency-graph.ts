import { CircularDependency, DependencyGraph, FileAnalysis } from '../../shared/types/project-health';

export function buildDependencyGraph(files: FileAnalysis[]): DependencyGraph {
  const knownFiles = new Set(files.map((file) => file.path));
  const edges = files.flatMap((file) =>
    file.imports
      .filter((imported) => imported.resolvedPath && knownFiles.has(imported.resolvedPath))
      .map((imported) => ({
        from: file.path,
        to: imported.resolvedPath as string,
      })),
  );

  return {
    nodes: [...knownFiles].sort(),
    edges: edges.sort((left, right) => `${left.from}:${left.to}`.localeCompare(`${right.from}:${right.to}`)),
  };
}

export function findCircularDependencies(graph: DependencyGraph): CircularDependency[] {
  const adjacency = new Map<string, string[]>();
  for (const node of graph.nodes) {
    adjacency.set(node, []);
  }
  for (const edge of graph.edges) {
    adjacency.get(edge.from)?.push(edge.to);
  }

  const cycles = new Map<string, string[]>();

  for (const node of graph.nodes) {
    visit(node, node, adjacency, [], cycles);
  }

  return [...cycles.values()].map((files) => ({ files }));
}

function visit(
  start: string,
  current: string,
  adjacency: Map<string, string[]>,
  stack: string[],
  cycles: Map<string, string[]>,
): void {
  if (stack.includes(current)) {
    return;
  }

  const nextStack = [...stack, current];
  for (const next of adjacency.get(current) ?? []) {
    if (next === start && nextStack.length > 1) {
      const cycle = normalizeCycle(nextStack);
      cycles.set(cycle.join('>'), cycle);
      continue;
    }
    visit(start, next, adjacency, nextStack, cycles);
  }
}

function normalizeCycle(cycle: string[]): string[] {
  const minIndex = cycle.reduce((best, value, index) => (value < cycle[best] ? index : best), 0);
  return [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)];
}
