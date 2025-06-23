import { INestMicroservice } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OddsServiceModule } from './../src/odds-service.module';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

describe('OddsServiceController (e2e)', () => {
  let app: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OddsServiceModule],
    }).compile();

    app = moduleFixture.createNestMicroservice({
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: Number(process.env.TEST_ODDS_SERVICE_PORT || 3012),
      },
    });

    await app.listen();

    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: Number(process.env.TEST_ODDS_SERVICE_PORT || 3012),
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  afterAll(async () => {
    await app.close();
    if (client) {
      await client.close();
    }
  });

  it('refresh_odds - should fetch and store odds', async () => {
    const response = await firstValueFrom(client.send('refresh_odds', {}));
    expect(Array.isArray(response)).toBe(true);
  });

  it('generate_results - should assign results to unresolved games', async () => {
    const response = await firstValueFrom(client.send('generate_results', {}));
    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('updated');
  });

  it('get_all_games - should return list of games', async () => {
    const games = await firstValueFrom(client.send('get_all_games', {}));
    expect(Array.isArray(games)).toBe(true);
    if (games.length) {
      expect(games[0]).toHaveProperty('externalId');
    }
  });

  it('get_game_result - should return result for a known game', async () => {
    const games = await firstValueFrom(client.send('get_all_games', {}));
    const knownGameId = games[0]?.externalId;
    if (!knownGameId) return;

    const result = await firstValueFrom(
      client.send('get_game_result', knownGameId),
    );
    expect(result).toHaveProperty('result');
  });
});
