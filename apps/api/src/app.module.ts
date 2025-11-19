import { Module } from '@nestjs/common';
import { ExperimentsModule } from './experiments/experiments.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ExperimentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
