import { Controller, Post } from "@nestjs/common";

@Controller("billing")
export class BillingController {
  @Post("change-plan")
  changePlan(): string {
    return "changed";
  }
}
