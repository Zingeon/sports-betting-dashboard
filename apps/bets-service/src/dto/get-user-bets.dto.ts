import { IsString } from 'class-validator';

export class GetUserBetsDto {
  @IsString()
  userId: string;
}
