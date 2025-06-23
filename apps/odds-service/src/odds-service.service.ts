import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import axios from 'axios';
import { Game } from './entities/game.entity';
import { GameResponseDto } from './dto/game.dto';

@Injectable()
export class OddsServiceService {
  constructor(
    @InjectRepository(Game)
    private gameRepo: Repository<Game>,
  ) {}

  async fetchOdds(): Promise<GameResponseDto[]> {
    const apiKey = process.env.ODDS_API_KEY;
    const sportKey = 'soccer_epl';

    const response = await axios.get<GameResponseDto[]>(
      `${process.env.ODDS_API_URL}/v4/sports/${sportKey}/odds`,
      {
        params: {
          apiKey,
          regions: 'eu',
          markets: 'h2h',
        },
      },
    );

    return response?.data || [];
  }

  async storeNewGames(games: GameResponseDto[]): Promise<Game[]> {
    const inserted: Game[] = [];
  
    const existing = await this.gameRepo.find({
      where: games.map(g => ({ externalId: g.id })),
      select: ['externalId'],
    });
  
    const existingIds = new Set(existing.map(e => e.externalId));
    const newGames = games.filter(g => !existingIds.has(g.id));
    const toInsert = newGames.map(dto =>
      this.gameRepo.create({
        externalId: dto.id,
        sportKey: dto.sport_key,
        teams: dto.teams,
        homeTeam: dto.home_team,
        commenceTime: dto.commence_time,
        bookmakers: dto.bookmakers,
      }),
    );
  
    if (toInsert.length > 0) {
      await this.gameRepo.save(toInsert);
      inserted.push(...toInsert);
    }
  
    return inserted;
  }
  

  async refreshOdds(): Promise<Game[]> {
    const fetched = await this.fetchOdds();

    return await this.storeNewGames(fetched);
  }

  async generateResults(): Promise<{ updated: number }> {
    const unfinishedGames = await this.gameRepo.find({
      where: { result: IsNull() },
    });
  
    for (const game of unfinishedGames) {
      const teams = game.teams;
      if (!teams || teams.length < 2) {
        continue;
      }

      const randomWinner = teams[Math.floor(Math.random() * teams.length)];
      game.result = randomWinner;
    }
  
    await this.gameRepo.save(unfinishedGames);
  
    return { updated: unfinishedGames.length };
  }

  async getGameResult(gameId: string): Promise<{ result: string | null }> {
    const game = await this.gameRepo.findOne({
      where: { externalId: gameId },
      select: ['result'],
    });
  
    return { result: game?.result ?? null };
  }

  async getAllGames(): Promise<Game[]> {
    return this.gameRepo.find({
      order: { commenceTime: 'ASC' },
    });
  }
}
