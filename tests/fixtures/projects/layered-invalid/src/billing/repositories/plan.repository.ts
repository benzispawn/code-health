import { Injectable } from '@nestjs/common';

@Injectable()
export class PlanRepository {
  findActiveSubscription(userId: string): string {
    return userId;
  }
}
