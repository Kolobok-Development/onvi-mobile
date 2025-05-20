import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { StartPosUseCase } from '../start-pos.use-case';

@Processor('pos-process')
export class StartPosProcess extends WorkerHost {
  constructor(private readonly startPosUseCase: StartPosUseCase) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    await this.startPosUseCase.execute(job.data.orderId);
  }
}
