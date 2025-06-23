import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet } from './entities/bet.entity';
import { PlaceBetDto } from './dto/place-bet.dto';
import { firstValueFrom } from 'rxjs';
import { Client, ClientProxy } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { BetStatus } from './types/bets.type';

@Injectable()
export class BetsServiceService {
  constructor(
    @InjectRepository(Bet)
    private readonly betRepo: Repository<Bet>,
  ) {}

  
  @Client({
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: Number(process.env.ODDS_SERVICE_PORT || 3003),
    },
  })
  private readonly oddsClient: ClientProxy;

  async placeBet(dto: PlaceBetDto): Promise<Bet> {
    if (!dto.amount || dto.amount <= 0) {
      throw new Error('Invalid bet amount');
    }

    const bet = this.betRepo.create({
      userId: dto.userId,
      gameId: dto.gameId,
      pick: dto.pick,
      amount: dto.amount,
    });

    return this.betRepo.save(bet);
  }

  async getUserBets(userId: string): Promise<Bet[]> {
    return this.betRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async resolveBets(): Promise<{ resolved: number }> {
    const pendingBets = await this.betRepo.find({
      where: { status: 'pending' },
    });
  
    const resolvedBets: Bet[] = [];
  
    await Promise.all(
      pendingBets.map(async (bet) => {
        try {
          const { result } = await firstValueFrom(
            this.oddsClient.send<{ result: string | null }, string>(
              'get_game_result',
              bet.gameId,
            ),
          );
  
          if (!result) return;
  
          bet.status = bet.pick === result ? 'won' : 'lost';
          resolvedBets.push(bet);
        } catch (err) {
          console.error(`Error resolving bet ${bet.id}:`, err.message);
        }
      }),
    );
  
    if (resolvedBets.length > 0) {
      await this.betRepo.save(resolvedBets);
    }
  
    return { resolved: resolvedBets.length };
  }

  async getAllResolvedBets(): Promise<any[]> {
    const bets = await this.betRepo.find();
  
    const enrichedBets = await Promise.all(
      bets.map(async (bet) => {
        try {
          const { result } = await firstValueFrom(
            this.oddsClient.send<{ result: string | null }, string>(
              'get_game_result',
              bet.gameId,
            ),
          );
  
          return {
            userId: bet.userId,
            gameId: bet.gameId,
            pick: bet.pick,
            amount: bet.amount,
            result: result ?? BetStatus.PENDING,
            status: result
              ? result === bet.pick
                ? BetStatus.WIN
                : BetStatus.LOSE
              : BetStatus.PENDING,
          };
        } catch (error) {
          console.error(`Failed to fetch result for game ${bet.gameId}`, error);
          return {
            userId: bet.userId,
            gameId: bet.gameId,
            pick: bet.pick,
            amount: bet.amount,
            result: BetStatus.PENDING,
            status: BetStatus.PENDING,
          };
        }
      }),
    );
  
    return enrichedBets;
  }
}
