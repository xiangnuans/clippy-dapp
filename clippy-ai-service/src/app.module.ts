import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalysisController } from './controllers/analysis.controller';
import { DeepseekService } from './services/deepseek.service';
import { InternalApiService } from './services/internal-api.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AnalysisController],
  providers: [DeepseekService, InternalApiService],
})
export class AppModule {} 