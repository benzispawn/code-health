export function calculateMaintainabilityIndex(input: {
  loc: number;
  cyclomaticComplexity: number;
  functionCount: number;
}): number {
  const volumeProxy = Math.max(
    1,
    input.loc * Math.log2(Math.max(2, input.functionCount + 1)),
  );
  const raw =
    171 -
    5.2 * Math.log(volumeProxy) -
    0.23 * input.cyclomaticComplexity -
    16.2 * Math.log(Math.max(1, input.loc));
  return clamp(Math.round((raw * 100) / 171), 0, 100);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
