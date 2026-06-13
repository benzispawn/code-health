import { Controller } from '@nestjs/common';
import type { PlanRepository } from '@billing/repositories/plan.repository';

@Controller('billing')
export class BillingController {
  constructor(private readonly planRepository: PlanRepository) {}
}
