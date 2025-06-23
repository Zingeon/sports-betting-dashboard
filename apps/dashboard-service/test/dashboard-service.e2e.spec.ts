import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, INestMicroservice } from '@nestjs/common';
import { Transport, ClientProxyFactory, ClientProxy } from '@nestjs/microservices';
import { DashboardServiceModule } from './../src/dashboard-service.module';
import * as request from 'supertest';
import { firstValueFrom } from 'rxjs';

describe('DashboardServiceController (e2e)', () => {
  let app: INestApplication;
  let microservice: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DashboardServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    microservice = app.connectMicroservice({
      transport: Transport.TCP,
      options: { host: '127.0.0.1', port: Number(process.env.TEST_DASHBOARD_SERVICE_PORT || 3012) },
    });

    await microservice.listen();

    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: '127.0.0.1', port: Number(process.env.TEST_DASHBOARD_SERVICE_PORT || 3012) },
    });
  });

  afterAll(async () => {
    await app.close();
    if (client) {
      await client.close();
    }
  });

  it('should return rows from games tab (HTTP)', async () => {
    const response = await request(app.getHttpServer()).get('/dashboard-service/games');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('rows');
    expect(Array.isArray(response.body.rows)).toBe(true);
  });

  it('should sync games to sheet', async () => {
    const result = await firstValueFrom(client.send('sync_games_to_sheet', {}));
    expect(result).toEqual({ success: true });
  });

  it('should seed place_bet tab', async () => {
    const result = await firstValueFrom(client.send('seed_place_bet', {}));
    expect(result).toHaveProperty('size');
    expect(typeof result.size).toBe('number');
  });

  it('should sync bets from sheet', async () => {
    const result = await firstValueFrom(client.send('sync_bets_from_sheet', {}));
    expect(Array.isArray(result)).toBe(true); 
  });

  it('should sync user results to sheet', async () => {
    const result = await firstValueFrom(client.send('sync_user_results', {}));
    expect(result).toHaveProperty('size');
    expect(typeof result.size).toBe('number');
  });
});
