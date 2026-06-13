import { Controller } from '@nestjs/common';
import { PlanRepository } from '@billing/repositories/plan.repository';

@Controller('billing')
export class BillingController {
  constructor(private readonly planRepository: PlanRepository) {}
}
