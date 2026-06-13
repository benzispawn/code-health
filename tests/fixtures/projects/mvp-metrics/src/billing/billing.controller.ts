import { BillingService } from './billing.service';

// Public API entry point for billing workflows.
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  changePlan(userId: string): string {
    if (!userId) {
      return 'missing-user';
    }

    return this.billingService.changePlan(userId);
  }
}
