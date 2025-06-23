import { Module } from '@nestjs/common';
import { OddsServiceService } from './odds-service.service';
import { OddsServiceController } from './odds-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({
  path: path.resolve(__dirname, '../../../apps/odds-service/.env')
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
      entities: [Game],
      synchronize: true, // for dev only — auto-creates tables - for simplicity and not creating migrations (remove in prod)
    }),
    TypeOrmModule.forFeature([Game]),
  ],
  controllers: [OddsServiceController],
  providers: [OddsServiceService],
})
export class OddsServiceModule {}
