import type { BillingService } from '../domain/billing.service';
import { formatCurrency } from '../shared/currency';

export class AppController {
  constructor(private readonly billingService: BillingService) {}

  summary(userId: string): string {
    return formatCurrency(this.billingService.totalFor(userId));
  }
}
