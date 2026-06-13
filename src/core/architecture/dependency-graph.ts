import type {
  CircularDependency,
  DependencyGraph,
  FileAnalysis,
} from "../../shared/types/project-health";

export function buildDependencyGraph(files: FileAnalysis[]): DependencyGraph {
  const knownFiles = new Set(files.map((file) => file.path));
  const edges = files.flatMap((file) =>
    file.imports
      .filter(
        (imported) =>
          imported.resolvedPath && knownFiles.has(imported.resolvedPath),
      )
      .map((imported) => ({
        from: file.path,
        to: imported.resolvedPath as string,
      })),
  );

  return {
    nodes: [...knownFiles].sort(),
    edges: edges.sort((left, right) =>
      `${left.from}:${left.to}`.localeCompare(`${right.from}:${right.to}`),
    ),
  };
}

export function findCircularDependencies(
  graph: DependencyGraph,
): CircularDependency[] {
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

export function buildPackageDependencyGraph(
  graph: DependencyGraph,
): DependencyGraph {
  const nodes = new Set<string>();
  const edgeKeys = new Set<string>();

  for (const edge of graph.edges) {
    const from = packagePath(edge.from);
    const to = packagePath(edge.to);
    nodes.add(from);
    nodes.add(to);
    if (from !== to) {
      edgeKeys.add(`${from}->${to}`);
    }
  }

  return {
    nodes: [...nodes].sort(),
    edges: [...edgeKeys].sort().map((key) => {
      const [from, to] = key.split("->");
      return { from, to };
    }),
  };
}

function packagePath(filePath: string): string {
  const parts = filePath.split("/");
  if (parts.length <= 2) {
    return parts.slice(0, -1).join("/") || ".";
  }
  return parts.slice(0, -1).join("/");
}

export function calculateDependencyDepths(
  graph: DependencyGraph,
): Map<string, number> {
  const adjacency = new Map<string, string[]>();
  const memo = new Map<string, number>();

  for (const node of graph.nodes) {
    adjacency.set(node, []);
  }
  for (const edge of graph.edges) {
    adjacency.get(edge.from)?.push(edge.to);
  }

  for (const node of graph.nodes) {
    memo.set(node, dependencyDepth(node, adjacency, new Set(), memo));
  }

  return memo;
}

function dependencyDepth(
  node: string,
  adjacency: Map<string, string[]>,
  visiting: Set<string>,
  memo: Map<string, number>,
): number {
  const existing = memo.get(node);
  if (existing !== undefined) {
    return existing;
  }
  if (visiting.has(node)) {
    return 0;
  }

  visiting.add(node);
  const depth = Math.max(
    0,
    ...(adjacency.get(node) ?? []).map(
      (next) => 1 + dependencyDepth(next, adjacency, visiting, memo),
    ),
  );
  visiting.delete(node);
  memo.set(node, depth);
  return depth;
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
      cycles.set(cycle.join(">"), cycle);
      continue;
    }
    visit(start, next, adjacency, nextStack, cycles);
  }
}

function normalizeCycle(cycle: string[]): string[] {
  const minIndex = cycle.reduce(
    (best, value, index) => (value < cycle[best] ? index : best),
    0,
  );
  return [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)];
}
