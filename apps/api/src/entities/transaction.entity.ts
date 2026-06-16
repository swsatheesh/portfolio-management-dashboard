import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InvestmentEntity } from './investment.entity';

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'simple-enum',
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column('decimal', { precision: 18, scale: 4 })
  quantity!: number;

  @Column('decimal', { precision: 18, scale: 2 })
  price!: number;

  @Column()
  transactionDate!: Date;

  @ManyToOne(() => InvestmentEntity, (investment) => investment.transactions, {
    onDelete: 'CASCADE',
  })
  investment!: InvestmentEntity;

  @CreateDateColumn()
  createdAt!: Date;
}