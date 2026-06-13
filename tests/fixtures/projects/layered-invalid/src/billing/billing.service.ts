import { Injectable } from "@nestjs/common";

@Injectable()
export class BillingService {
  changePlan(userId: string): string {
    if (!userId) {
      return "missing-user";
    }

    return "changed";
  }
}
