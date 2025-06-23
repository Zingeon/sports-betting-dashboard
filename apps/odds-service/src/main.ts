import { NestFactory } from '@nestjs/core';
import { OddsServiceModule } from './odds-service.module';
import { Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({
  path: path.resolve(__dirname, '../../../apps/odds-service/.env')
});

async function bootstrap() {
  const app = await NestFactory.createMicroservice(OddsServiceModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: process.env.ODDS_SERVICE_PORT || 3003,
    },
  });

  await app.listen();
  console.log('odds-service microservice is running');
}
bootstrap();
