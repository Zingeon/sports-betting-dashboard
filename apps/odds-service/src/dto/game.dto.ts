export class OutcomeDto {
    name: string;
    price: number;
  }
  
  export class MarketDto {
    key: string;
    outcomes: OutcomeDto[];
  }
  
  export class BookmakerDto {
    key: string;
    title: string;
    last_update: string;
    markets: MarketDto[];
  }
  
  export class GameResponseDto {
    id: string;
    sport_key: string;
    commence_time: string;
    home_team: string;
    teams: string[];
    bookmakers: BookmakerDto[];
  }
  