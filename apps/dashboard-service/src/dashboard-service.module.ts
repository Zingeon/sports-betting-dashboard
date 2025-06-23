import { Module } from '@nestjs/common';
import { DashboardServiceService } from './dashboard-service.service';
import { DashboardServiceController } from './dashboard-service.controller';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({
  path: path.resolve(__dirname, '../../../apps/dashboard-service/.env')
});

@Module({
  controllers: [DashboardServiceController],
  providers: [DashboardServiceService],
})
export class DashboardServiceModule {}
