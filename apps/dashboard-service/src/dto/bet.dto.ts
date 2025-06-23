import { IsString, IsNumber } from 'class-validator';

export class PlaceBetDto {
  @IsString()
  gameId: string;

  @IsString()
  userId: string;

  @IsNumber()
  amount: number;

  @IsString()
  pick: string;
}
