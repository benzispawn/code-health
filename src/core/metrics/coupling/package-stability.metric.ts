import type {
  DependencyGraph,
  PackageStabilityAnalysis,
} from '../../../shared/types/project-health';

export function calculatePackageStability(
  graph: DependencyGraph,
): PackageStabilityAnalysis[] {
  const incoming = new Map<string, Set<string>>();
  const outgoing = new Map<string, Set<string>>();

  for (const node of graph.nodes) {
    incoming.set(node, new Set());
    outgoing.set(node, new Set());
  }

  for (const edge of graph.edges) {
    outgoing.get(edge.from)?.add(edge.to);
    incoming.get(edge.to)?.add(edge.from);
  }

  return graph.nodes.map((packagePath) => {
    const afferentCoupling = incoming.get(packagePath)?.size ?? 0;
    const efferentCoupling = outgoing.get(packagePath)?.size ?? 0;
    const total = afferentCoupling + efferentCoupling;

    return {
      packagePath,
      afferentCoupling,
      efferentCoupling,
      instability:
        total === 0 ? 0 : Number((efferentCoupling / total).toFixed(2)),
    };
  });
}

export function packagePathForFile(filePath: string): string {
  const parts = filePath.split('/');
  if (parts.length <= 2) {
    return parts.slice(0, -1).join('/') || '.';
  }
  return parts.slice(0, -1).join('/');
}
