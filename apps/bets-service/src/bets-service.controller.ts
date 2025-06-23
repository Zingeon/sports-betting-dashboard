import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PlaceBetDto } from './dto/place-bet.dto';
import { BetsServiceService } from './bets-service.service';

@Controller()
export class BetsServiceController {
  constructor(private readonly betsService: BetsServiceService) {}

  @MessagePattern('place_bet')
  async placeBet(@Payload() payload: PlaceBetDto) {
    return this.betsService.placeBet(payload);
  }

  @MessagePattern('get_user_bets')
  async getUserBets(@Payload() userId: string) {
    return this.betsService.getUserBets(userId);
  }

  @MessagePattern('resolve_bets')
  async resolveBets() {
    return this.betsService.resolveBets();
  }

  @MessagePattern('get_all_bets')
  async handleGetAllBets() {
    return this.betsService.getAllResolvedBets();
  }
}
