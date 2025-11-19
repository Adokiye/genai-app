import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Experiment } from './types';

@Injectable()
export class ExperimentRepository {
  private readonly dirPath = join(__dirname, '..', '..', 'data');
  private readonly filePath = join(this.dirPath, 'experiments.json');

  private async ensureFile() {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.mkdir(this.dirPath, { recursive: true });
      await fs.writeFile(this.filePath, '[]', 'utf-8');
    }
  }

  async findAll(): Promise<Experiment[]> {
    await this.ensureFile();
    const raw = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(raw);
  }

  async saveAll(experiments: Experiment[]): Promise<void> {
    await this.ensureFile();
    await fs.writeFile(
      this.filePath,
      JSON.stringify(experiments, null, 2),
      'utf-8',
    );
  }
}
