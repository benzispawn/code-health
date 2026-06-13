import type { BService } from '../b/b.service';

export class AService {
  constructor(private readonly bService: BService) {}
}
