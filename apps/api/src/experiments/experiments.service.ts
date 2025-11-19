import { BadRequestException, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import {
  Experiment,
  ParameterSet,
  ResponseVariant,
} from './types';
import {
  CreateExperimentDto,
  expandRange,
  normalizeRange,
} from './dto/create-experiment.dto';
import { ExperimentRepository } from './experiment.repository';
import { LlmService } from './llm.service';
import { MetricsService } from './metrics.service';

@Injectable()
export class ExperimentsService {
  constructor(
    private readonly repo: ExperimentRepository,
    private readonly llm: LlmService,
    private readonly metrics: MetricsService,
  ) {}

  async list(): Promise<Experiment[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<Experiment | undefined> {
    const experiments = await this.repo.findAll();
    return experiments.find((item) => item.id === id);
  }

  async create(dto: CreateExperimentDto): Promise<Experiment> {
    if (!dto.prompt || !dto.prompt.trim()) {
      throw new BadRequestException('Prompt is required');
    }
    const experiments = await this.repo.findAll();
    const normalizedTemp = normalizeRange(dto.temperatureRange);
    const normalizedTopP = normalizeRange(dto.topPRange);

    const temperatures = expandRange(normalizedTemp);
    const topPs = expandRange(normalizedTopP);

    const variantsPerCombo = Math.min(Math.max(dto.variantsPerCombo, 1), 4);
    const maxTokens = Math.min(Math.max(dto.maxTokens, 120), 800);

    const responses: ResponseVariant[] = [];

    temperatures.forEach((temperature) => {
      topPs.forEach((topP) => {
        const params: ParameterSet = { temperature, topP, maxTokens };
        for (let variantIndex = 0; variantIndex < variantsPerCombo; variantIndex++) {
          const text = this.llm.generate(dto.prompt, params);
          const metrics = this.metrics.evaluate(dto.prompt, text);
          responses.push({
            id: nanoid(10),
            parameters: params,
            text,
            metrics,
            analysis: this.buildAnalysis(metrics, params),
          });
        }
      });
    });

    responses.sort((a, b) => b.metrics.overall - a.metrics.overall);

    const summary = this.buildExperimentSummary(responses);

    const experiment: Experiment = {
      id: nanoid(12),
      prompt: dto.prompt,
      createdAt: new Date().toISOString(),
      temperatures,
      topPs,
      variantsPerCombo,
      maxTokens,
      summary,
      responses,
    };

    await this.repo.saveAll([experiment, ...experiments]);

    return experiment;
  }

  async delete(id: string): Promise<void> {
    const experiments = await this.repo.findAll();
    await this.repo.saveAll(experiments.filter((item) => item.id !== id));
  }

  private buildAnalysis(metrics: ResponseVariant['metrics'], params: ParameterSet) {
    const mode = metrics.structure > 0.7 ? 'structured' : 'narrative';
    const tone = params.temperature > 0.6 ? 'imaginative' : 'precise';
    return `Balances ${tone} reasoning with ${mode} formatting. Coverage ${(metrics.coverage * 100).toFixed(0)}% and vocab richness ${(metrics.richness * 100).toFixed(0)}%.`;
  }

  private buildExperimentSummary(responses: ResponseVariant[]) {
    if (!responses.length) {
      return 'No responses generated';
    }

    const top = responses[0];
    const avgOverall =
      responses.reduce((sum, item) => sum + item.metrics.overall, 0) /
      responses.length;

    return `Best overall score ${(top.metrics.overall * 100).toFixed(
      1,
    )}% using T=${top.parameters.temperature.toFixed(2)}, top_p=${top.parameters.topP.toFixed(
      2,
    )}. Average quality ${(avgOverall * 100).toFixed(1)}%.`;
  }
}
