import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PlaceBetDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsNotEmpty()
  pick: string;

  @IsNumber()
  amount: number;
}
