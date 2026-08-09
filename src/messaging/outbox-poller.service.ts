import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { OutboxRelay } from '../@core/common/outbox/outbox-relay';

@Injectable()
export class OutboxPollerService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly outboxRelay: OutboxRelay) {}

  async onModuleInit(): Promise<void> {
    const intervalMs = Number(process.env.OUTBOX_POLL_INTERVAL_MS ?? 5000);

    await this.run();

    this.timer = setInterval(() => void this.run(), intervalMs);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async run(): Promise<void> {
    const batchSize = Number(process.env.OUTBOX_BATCH_SIZE ?? 10);

    try {
      const dispatched = await this.outboxRelay.dispatchPending(batchSize);
      if (dispatched > 0) {
        console.log(`[outbox] ${dispatched} evento(s) publicado(s).`);
      }
    } catch (error) {
      console.error('[outbox] falha ao despachar eventos:', error);
    }
  }
}
