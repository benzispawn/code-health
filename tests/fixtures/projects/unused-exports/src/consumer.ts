import { UsedService } from './services/used.service';

function runConsumer(): string {
  return new UsedService().run();
}

runConsumer();
