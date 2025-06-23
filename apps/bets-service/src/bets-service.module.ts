import { Module } from '@nestjs/common';
import { BetsServiceService } from './bets-service.service';
import { Bet } from './entities/bet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { BetsServiceController } from './bets-service.controller';
import * as path from 'path';
dotenv.config({
  path: path.resolve(__dirname, '../../../apps/bets-service/.env')
});

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [Bet],
      synchronize: true, // for dev only — auto-creates tables - for simplicity and not creating migrations (remove in prod)
    }),
    TypeOrmModule.forFeature([Bet]),
  ],
  controllers: [BetsServiceController],
  providers: [BetsServiceService],
})
export class BetsServiceModule {}
