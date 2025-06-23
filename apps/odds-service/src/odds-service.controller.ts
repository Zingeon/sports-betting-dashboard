import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OddsServiceService } from './odds-service.service';

@Controller()
export class OddsServiceController {
  constructor(private readonly oddsService: OddsServiceService) {}

  @MessagePattern('refresh_odds')
  async refreshOdds() {
    return this.oddsService.refreshOdds();
  }

  @MessagePattern('generate_results')
  async generateResults() {
    return this.oddsService.generateResults();
  }

  @MessagePattern('get_game_result')
  async getGameResult(@Payload() gameId: string) {
    return this.oddsService.getGameResult(gameId);
  }

  @MessagePattern('get_all_games')
  async getAllGames() {
    return this.oddsService.getAllGames();
  }
}
