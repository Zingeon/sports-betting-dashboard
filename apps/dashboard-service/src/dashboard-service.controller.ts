import { Controller, Get } from '@nestjs/common';
import { DashboardServiceService } from './dashboard-service.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('dashboard-service')
export class DashboardServiceController {
  constructor(private readonly dashboardService: DashboardServiceService) {}

  @Get('games')
  async getGamesFromSheet() {
    const rows = await this.dashboardService.readTab('games');
    return { rows };
  }

  @MessagePattern('sync_games_to_sheet')
  async syncGames() {
    await this.dashboardService.syncGamesToSheet();
    return { success: true };
  }

  @MessagePattern('sync_bets_from_sheet')
  async handleSyncBets() {
    return await this.dashboardService.syncBetsFromSheet();
  }

  @MessagePattern('seed_place_bet')
  async handleSeedPlaceBet() {
    return this.dashboardService.seedPlaceBetTab();
  }

  @MessagePattern('sync_user_results')
  async handleUserResults() {
    return this.dashboardService.syncUserResultsToSheet();
  }
}
