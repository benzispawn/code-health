export interface SpecExpectation {
  name: string;
  kind: 'identifier' | 'method';
}

const IMPLEMENTATION_SECTIONS = new Set([
  'controllers',
  'services',
  'repositories',
  'providers',
  'dtos',
  'entities',
  'guards',
  'interceptors',
  'decorators',
  'pipes',
  'filters',
  'queues',
  'events',
  'cron',
  'useCases',
  'use-cases',
]);

export function extractSpecExpectations(specText: string): SpecExpectation[] {
  const expectations: SpecExpectation[] = [];
  const sectionStack: Array<{ indent: number; key: string }> = [];

  for (const rawLine of specText.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, '');
    if (!line.trim()) {
      continue;
    }

    const indent = line.search(/\S/);
    while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].indent >= indent) {
      sectionStack.pop();
    }

    const sectionMatch = line.match(/^\s*(?:-\s*)?([A-Za-z_-][\w-]*):\s*$/);
    if (sectionMatch) {
      sectionStack.push({ indent, key: sectionMatch[1] });
      continue;
    }

    const valueMatch = line.match(/^\s*(?:-\s*)?([A-Za-z_-][\w-]*):\s*([A-Za-z_$][\w$]*)\s*$/);
    if (!valueMatch) {
      continue;
    }

    const [, key, value] = valueMatch;
    const nearestSection = [...sectionStack].reverse()[0];
    const parentSection = [...sectionStack].reverse().find((section) => IMPLEMENTATION_SECTIONS.has(section.key));

    if (key === 'handler' && parentSection) {
      expectations.push({ name: value, kind: 'method' });
      continue;
    }

    if (key === 'name' && nearestSection?.key === 'methods' && parentSection) {
      expectations.push({ name: value, kind: 'method' });
      continue;
    }

    if (key === 'name' && parentSection) {
      expectations.push({ name: value, kind: 'identifier' });
    }
  }

  return dedupe(expectations);
}

function dedupe(expectations: SpecExpectation[]): SpecExpectation[] {
  const seen = new Set<string>();
  return expectations.filter((expectation) => {
    const key = `${expectation.kind}:${expectation.name}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
