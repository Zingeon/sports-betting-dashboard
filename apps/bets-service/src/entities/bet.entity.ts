import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
  } from 'typeorm';
  
  @Entity()
  export class Bet {
    @PrimaryGeneratedColumn("uuid")
    id: number;
  
    @Column()
    userId: string;
  
    @Column()
    gameId: string;
  
    @Column()
    pick: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;
  
    @Column({ default: 'pending' })
    status: 'pending' | 'won' | 'lost';
  
    @CreateDateColumn()
    createdAt: Date;
  }
  