import { Module } from '@nestjs/common';
import { ExperimentsController } from './experiments.controller';
import { ExperimentsService } from './experiments.service';
import { ExperimentRepository } from './experiment.repository';
import { LlmService } from './llm.service';
import { MetricsService } from './metrics.service';

@Module({
  controllers: [ExperimentsController],
  providers: [
    ExperimentsService,
    ExperimentRepository,
    LlmService,
    MetricsService,
  ],
})
export class ExperimentsModule {}
