import { Controller, Post } from '@nestjs/common';
import type { BillingService } from './billing.service';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('change-plan')
  changePlan(@CurrentUser() userId: string): string {
    return this.billingService.changePlan(userId);
  }
}
