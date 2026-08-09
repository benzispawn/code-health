export class MixedResponsibilityService {
  private plans = new Map<string, string>();
  private usage = new Map<string, number>();
  private mailer = new Map<string, string>();

  currentPlan(accountId: string): string {
    return this.plans.get(accountId) ?? 'free';
  }

  recordUsage(accountId: string, units: number): number {
    const next = (this.usage.get(accountId) ?? 0) + units;
    this.usage.set(accountId, next);
    return next;
  }

  notificationTemplate(accountId: string): string {
    return this.mailer.get(accountId) ?? `plan:${accountId}`;
  }
}
