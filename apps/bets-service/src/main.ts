import { NestFactory } from '@nestjs/core';
import { BetsServiceModule } from './bets-service.module';
import { Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({
  path: path.resolve(__dirname, '../../../apps/bets-service/.env')
});

async function bootstrap() {
  const app = await NestFactory.createMicroservice(BetsServiceModule, {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: Number(process.env.BETS_SERVICE_PORT) || 3001,
    },
  });

  await app.listen();
  console.log('bets-service is running...');
}
bootstrap();
