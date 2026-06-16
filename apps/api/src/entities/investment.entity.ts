import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { TransactionEntity } from './transaction.entity';

export enum AssetType {
  STOCK = 'STOCK',
  BOND = 'BOND',
  MUTUAL_FUND = 'MUTUAL_FUND',
  ETF = 'ETF',
  CASH = 'CASH',
}

@Entity('investments')
export class InvestmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  symbol!: string;

  @Column({
    type: 'simple-enum',
    enum: AssetType,
  })
  assetType!: AssetType;

  @Column('decimal', { precision: 18, scale: 4 })
  quantity!: number;

  @Column('decimal', { precision: 18, scale: 2 })
  purchasePrice!: number;

  @Column('decimal', { precision: 18, scale: 2 })
  currentPrice!: number;

  @ManyToOne(() => UserEntity, (user) => user.investments, {
    onDelete: 'CASCADE',
  })
  user!: UserEntity;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.investment)
  transactions!: TransactionEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}