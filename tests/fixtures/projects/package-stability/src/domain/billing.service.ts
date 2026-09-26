import { cents } from '../shared/currency';

export class BillingService {
  totalFor(userId: string): number {
    return cents(userId.length);
  }
}
