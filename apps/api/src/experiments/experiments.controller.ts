import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { ExperimentsService } from './experiments.service';

@Controller('experiments')
export class ExperimentsController {
  constructor(private readonly service: ExperimentsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: CreateExperimentDto) {
    return this.service.create(body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
