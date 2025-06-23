import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Index,
  } from 'typeorm';
  
  @Entity()
  export class Game {
    @PrimaryGeneratedColumn("uuid")
    id: number;
  
    @Index({ unique: true })
    @Column()
    externalId: string;
  
    @Column()
    sportKey: string;
  
    @Column("text", { array: true, nullable: true })
    teams: string[];
  
    @Column()
    homeTeam: string;
  
    @Column()
    commenceTime: string;

    @Column("jsonb", { nullable: true })
    odds: any;
  
    @Column('jsonb')
    bookmakers: any;
  
    @Column({ nullable: true })
    result: string;
  }
  