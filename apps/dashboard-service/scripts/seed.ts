import { NestFactory } from '@nestjs/core';
import { DashboardServiceModule } from '../src/dashboard-service.module';
import { DashboardServiceService } from '../src/dashboard-service.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(DashboardServiceModule);
  const service = app.get(DashboardServiceService);
  await service.seedPlaceBetTab();
  await app.close();
}

bootstrap();
