export class DiInjectedBillingService {
  constructor(
    private readonly plans: Map<string, string>,
    private readonly usage: Map<string, number>,
  ) {}

  currentSnapshot(accountId: string): string {
    const plan = this.plans.get(accountId) ?? 'free';
    const units = this.usage.get(accountId) ?? 0;
    return `${plan}:${units}`;
  }

  setSnapshot(accountId: string, plan: string, units: number): void {
    this.plans.set(accountId, plan);
    this.usage.set(accountId, units);
  }

  hasSnapshot(accountId: string): boolean {
    return this.plans.has(accountId) && this.usage.has(accountId);
  }
}
