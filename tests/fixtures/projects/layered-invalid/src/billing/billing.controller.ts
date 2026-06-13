import { Controller, Post } from '@nestjs/common';
import { BillingService } from './billing.service';
import { PlanRepository } from './repositories/plan.repository';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly planRepository: PlanRepository,
  ) {}

  @Post('change-plan')
  changePlan(@CurrentUser() userId: string): string {
    return this.billingService.changePlan(userId);
  }
}
