import { Injectable, OnModuleInit } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';
import { Game } from 'apps/odds-service/src/entities/game.entity';
import * as path from 'path';
import { PlaceBetDto } from './dto/bet.dto';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

@Injectable()
export class DashboardServiceService implements OnModuleInit {
  @Client({
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: Number(process.env.BETS_SERVICE_PORT || 3001),
    },
  })
  private readonly betsClient: ClientProxy;

  @Client({
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: Number(process.env.ODDS_SERVICE_PORT || 3003),
    },
  })
  private readonly oddsClient: ClientProxy;

  private sheetsClient: sheets_v4.Sheets;
  private sheetId: string;

  async onModuleInit() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = (await auth.getClient()) as JWT;
    this.sheetsClient = google.sheets({ version: 'v4', auth: authClient });
    this.sheetId = process.env.GOOGLE_SHEET_ID!;
  }

  async readTab(tabName: string): Promise<string[][]> {
    const res = await this.sheetsClient.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: `${tabName}`,
    });

    return res.data.values || [];
  }

  async writeTab(tabName: string, values: string[][]) {
    return await this.sheetsClient.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range: `${tabName}`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });
  }

  async syncGamesToSheet(): Promise<void> {
    const games = await firstValueFrom(
      this.oddsClient.send<Game[]>('get_all_games', {}),
    );

    const values: string[][] = [
      ['gameId', 'homeTeam', 'teams', 'commenceTime', 'odds'],
    ];

    for (const game of games) {
      values.push([
        game.externalId,
        game.homeTeam,
        game.teams?.join(', ') || '',
        game.commenceTime,
        game.odds ? JSON.stringify(game.odds) : '',
      ]);
    }

    await this.writeTab('games', values);
    console.log(`Synced ${games.length} games to Google Sheets`);
  }

  async processPlaceBetTab(): Promise<PlaceBetDto[]> {
    const rows = await this.readTab('place_bet');
    console.log('place_bet tab rows:', rows);
    const [header, ...data] = rows;
  
    const result: PlaceBetDto[] = [];
  
    for (const row of data) {
      const [gameId, userId, amount, pick] = row;
  
      result.push({
        gameId,
        userId,
        amount: Number(amount),
        pick,
      });
    }
  
    return result;
  }

  async syncBetsFromSheet() {
    const bets = await this.processPlaceBetTab();

    return await Promise.all(
      bets.map(async (bet) => {
        try {
          return await firstValueFrom(
            this.betsClient.send('place_bet', bet).pipe(timeout(3000)),
          );
        } catch (err) {
          console.error(`Failed to place bet for ${bet.userId} - ${bet.gameId}`, err);
        }
      }),
    );
  }

  async seedPlaceBetTab() {
    const values: string[][] = [
      ['gameId', 'userId', 'amount', 'pick'],
      ['game-ext-1', 'user1', '50', 'Team A'],
      ['game-ext-2', 'user2', '30', 'Team B'],
      ['game-ext-3', 'user3', '20', 'Team B'],
    ];

    console.log('Seeding place_bet tab with test data');
  
    return await this.writeTab('place_bet', values);
  }

  async syncUserResultsToSheet() {
    const bets = await firstValueFrom(
      this.betsClient.send('get_all_bets', {}),
    );
  
    const values: string[][] = [
      ['userId', 'gameId', 'pick', 'amount', 'result', 'status'],
    ];
  
    for (const bet of bets) {
      values.push([
        bet.userId,
        bet.gameId,
        bet.pick,
        String(bet.amount),
        bet.result,
        bet.status,
      ]);
    }
  
    return await this.writeTab('user_results', values);
  }
}
