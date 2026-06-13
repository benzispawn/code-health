import { Injectable } from "@nestjs/common";

@Injectable()
export class BillingService {
  changePlan(userId: string): string {
    return userId;
  }
}
