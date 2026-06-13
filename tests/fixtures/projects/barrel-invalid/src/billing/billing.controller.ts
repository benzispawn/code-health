import { Controller } from '@nestjs/common';
import { PlanRepository } from './repositories';

@Controller('billing')
export class BillingController {
  constructor(private readonly planRepository: PlanRepository) {}
}
