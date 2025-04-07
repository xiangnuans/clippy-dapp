import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 5471);
  
  // 应用全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // 设置全局前缀
  const apiBaseUrl = configService.get<string>('API_BASE_URL');
  if (apiBaseUrl) {
    // 如果设置了API_BASE_URL，则使用它作为全局前缀
    app.setGlobalPrefix('');
  }
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  if (apiBaseUrl) {
    console.log(`API base URL: ${apiBaseUrl}`);
  }
}
bootstrap(); 