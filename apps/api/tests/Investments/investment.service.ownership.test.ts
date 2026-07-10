import { Repository } from 'typeorm';
import { AssetType, InvestmentEntity } from '../../src/entities/investment.entity';
import { UserEntity } from '../../src/entities/user.entity';
import { NotFoundError } from '../../src/errors/api-error';
import { InvestmentService } from '../../src/investments/investment.service';
import { createMockQueryBuilder } from '../mocks/query-builder.mock';

type MockRepository<T> = {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
  createQueryBuilder: jest.Mock;
};

describe('InvestmentService - ownership checks', () => {
  let investmentRepository: MockRepository<InvestmentEntity>;
  let userRepository: Pick<MockRepository<UserEntity>, 'findOne'>;
  let service: InvestmentService;

  beforeEach(() => {
    investmentRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn()
    };

    userRepository = {
      findOne: jest.fn(),
    };

    service = new InvestmentService(
      investmentRepository as unknown as Repository<InvestmentEntity>,
      userRepository as unknown as Repository<UserEntity>
    );
  });

  describe('InvestmentService - pagination', () => {
    it('returns paginated investments owned by the user', async () => {
      const queryBuilder = createMockQueryBuilder<InvestmentEntity>();

      const investments = [
        {
          id: 'investment-1',
          symbol: 'AAPL',
        },
        {
          id: 'investment-2',
          symbol: 'MSFT',
        },
      ] as InvestmentEntity[];

      queryBuilder.getManyAndCount.mockResolvedValue([investments, 12]);

      investmentRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      const result = await service.findAll(
        'user-1',
        {
          page: 2,
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        }
      );

      expect(investmentRepository.createQueryBuilder).toHaveBeenCalledWith('investment');

      expect(queryBuilder.where).toHaveBeenCalledWith('user.id = :userId', { userId: 'user-1' });

      expect(queryBuilder.skip).toHaveBeenCalledWith(5);

      expect(queryBuilder.take).toHaveBeenCalledWith(5);

      expect(result).toEqual({
        data: investments,
        pagination: {
          page: 2,
          limit: 5,
          total: 12,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      });
    });

    it('filters investments by search and asset type', async () => {
      const queryBuilder = createMockQueryBuilder<InvestmentEntity>();

      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      investmentRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      await service.findAll('user-1', {
        page: 1,
        limit: 10,
        search: 'apple',
        assetType: AssetType.STOCK,
        sortBy: 'name',
        sortOrder: 'ASC',
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining("LOWER(investment.name)"),
        {
          search: "%apple%",
        },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'investment.assetType = :assetType',
        {
          assetType: AssetType.STOCK,
        }
      );

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'investment.name',
        'ASC'
      );
    });
  });

  describe('update', () => {
    it('updates an investment owned by the authenticated user', async () => {
      const investment = {
        id: 'investment-1',
        symbol: 'AAPL',
        currentPrice: 195,
      } as InvestmentEntity;

      investmentRepository.findOne.mockResolvedValue(investment);
      investmentRepository.save.mockImplementation(
        async (value: InvestmentEntity) => value
      );

      const result = await service.update('user-1', 'investment-1', {
        currentPrice: 200,
      });

      expect(investmentRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'investment-1',
          user: {
            id: 'user-1',
          },
        },
      });

      expect(investmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'investment-1',
          currentPrice: 200,
        })
      );

      expect(result.currentPrice).toBe(200);
    });

    it('throws NotFoundError when updating another user’s investment', async () => {
      investmentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('user-1', 'another-users-investment', {
          currentPrice: 200,
        })
      ).rejects.toThrow(new NotFoundError('Investment not found'));

      expect(investmentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes an investment owned by the authenticated user', async () => {
      const investment = {
        id: 'investment-1',
      } as InvestmentEntity;

      investmentRepository.findOne.mockResolvedValue(investment);
      investmentRepository.remove.mockResolvedValue(investment);

      const result = await service.delete('user-1', 'investment-1');

      expect(investmentRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'investment-1',
          user: {
            id: 'user-1',
          },
        },
      });

      expect(investmentRepository.remove).toHaveBeenCalledWith(investment);
      expect(result).toBe(true);
    });

    it('throws NotFoundError when deleting another user’s investment', async () => {
      investmentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.delete('user-1', 'another-users-investment')
      ).rejects.toThrow(new NotFoundError('Investment not found'));

      expect(investmentRepository.remove).not.toHaveBeenCalled();
    });
  });
});