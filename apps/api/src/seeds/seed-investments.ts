import { DataSource } from 'typeorm';
import { InvestmentEntity } from '../entities/investment.entity';
import { UserEntity } from '../entities/user.entity';
import { investmentSeedData } from './investment-seed.data';
import { roundToTwoDecimals } from './seed.helpers';

const DEVELOPMENT_USER_EMAIL = 'admin@test.com';
const INVESTMENT_SEED_LIMIT = 50;

export async function seedInvestments(
  dataSource: DataSource
): Promise<InvestmentEntity[]> {
  if (process.env.NODE_ENV === 'production') {
    return [];
  }

  const investmentRepository =
    dataSource.getRepository(InvestmentEntity);

  const userRepository = dataSource.getRepository(UserEntity);

  const user = await userRepository.findOne({
    where: {
      email: DEVELOPMENT_USER_EMAIL,
    },
  });

  if (!user) {
    throw new Error(
      `Development user ${DEVELOPMENT_USER_EMAIL} must be seeded before investments`
    );
  }

  const existingInvestments = await investmentRepository.find({
    where: {
      user: {
        id: user.id,
      },
    },
  });

  if (existingInvestments.length > 0) {
    return existingInvestments;
  }

  const seedItems = investmentSeedData.slice(
    0,
    INVESTMENT_SEED_LIMIT
  );

  if (seedItems.length < INVESTMENT_SEED_LIMIT) {
    throw new Error(
      `Expected at least ${INVESTMENT_SEED_LIMIT} investment seed records, but received ${seedItems.length}`
    );
  }

  const investments = seedItems.map((item, index) => {
    const quantity = 5 + ((index * 7) % 46);

    const performancePercentage =
      ((index % 9) - 4) * 0.025;

    const purchasePrice = roundToTwoDecimals(
      item.price / (1 + performancePercentage)
    );

    return investmentRepository.create({
      name: item.name,
      symbol: item.symbol.toUpperCase(),
      assetType: item.assetType,
      quantity,
      purchasePrice,
      currentPrice: item.price,
      user,
    });
  });

  return investmentRepository.save(investments);
}