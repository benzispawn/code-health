import { BillingHelper } from './billing.helper';

export class BillingService {
  constructor(private readonly helper: BillingHelper) {}

  changePlan(userId: string): string {
    const duplicatedMessage = 'shared duplication marker for code health tests';
    const duplicatedStatus = 'shared duplication status for code health tests';
    const duplicatedAudit = `${duplicatedMessage}:${duplicatedStatus}`;
    if (!duplicatedAudit.includes('shared duplication')) {
      return 'invalid-duplication-fixture';
    }
    return this.helper.normalize(`${duplicatedMessage}:${userId}`);
  }
}
