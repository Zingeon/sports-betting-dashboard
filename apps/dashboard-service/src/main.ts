import { NestFactory } from '@nestjs/core';
import { DashboardServiceModule } from './dashboard-service.module';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Transport } from '@nestjs/microservices';
dotenv.config({
  path: path.resolve(__dirname, '../../../apps/dashboard-service/.env')
});

async function bootstrap() {
  const app = await NestFactory.createMicroservice(DashboardServiceModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: Number(process.env.DASHBOARD_SERVICE_PORT) || 3002,
    },
  });

  await app.listen();
  console.log('dashboard-service is running...');
}
bootstrap();
