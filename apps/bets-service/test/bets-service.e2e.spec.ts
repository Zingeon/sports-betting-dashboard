import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { Transport, ClientProxyFactory, ClientProxy } from '@nestjs/microservices';
import { BetsServiceModule } from './../src/bets-service.module';
import { PlaceBetDto } from './../src/dto/place-bet.dto';
import { firstValueFrom } from 'rxjs';

describe('BetsServiceController (e2e)', () => {
  let app: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BetsServiceModule],
    }).compile();

    app = moduleFixture.createNestMicroservice({
      transport: Transport.TCP,
      options: { host: '127.0.0.1', port: Number(process.env.TEST_BETS_SERVICE_PORT || 3010) },
    });

    await app.listen();

    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: '127.0.0.1', port: Number(process.env.TEST_BETS_SERVICE_PORT || 3010) },
    });
  });

  afterAll(async () => {
    await app.close();
    if (client) {
      await client.close();
    }
  });

  describe('Sanity Check', () => {
    it('should run a test', () => {
      expect(1 + 1).toBe(2);
    });
  });

  it('should place a bet', async () => {
    const payload: PlaceBetDto = {
      gameId: 'test-game-id',
      userId: 'test-user-id',
      pick: 'Team A',
      amount: 100,
    };

    const result = await firstValueFrom(client.send('place_bet', payload));
    expect(result).toHaveProperty('id');
    expect(result.userId).toBe(payload.userId);
    expect(result.pick).toBe(payload.pick);
  });

  it('should get user bets', async () => {
    const result = await firstValueFrom(client.send('get_user_bets', 'test-user-id'));
    expect(Array.isArray(result)).toBe(true);
  });

  it('should resolve bets', async () => {
    const result = await firstValueFrom(client.send('resolve_bets', {}));
    expect(result).toHaveProperty('resolved');
    expect(typeof result.resolved).toBe('number');
  });

  it('should return all resolved bets', async () => {
    const result = await firstValueFrom(client.send('get_all_bets', {}));
    expect(Array.isArray(result)).toBe(true);
  });
});
