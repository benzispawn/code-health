import type { AService } from '../a/a.service';

export class BService {
  constructor(private readonly aService: AService) {}
}
