type MockQueryBuilder<T> = {
  innerJoinAndSelect: jest.Mock;
  innerJoin: jest.Mock;
  leftJoinAndSelect: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  orderBy: jest.Mock;
  addOrderBy: jest.Mock;
  skip: jest.Mock;
  take: jest.Mock;
  getManyAndCount: jest.Mock<
    Promise<[T[], number]>
  >;
};

export function createMockQueryBuilder<T>():
  MockQueryBuilder<T> {
  const queryBuilder = {
    innerJoinAndSelect: jest.fn(),
    innerJoin: jest.fn(),
    leftJoinAndSelect: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    orderBy: jest.fn(),
    addOrderBy: jest.fn(),
    skip: jest.fn(),
    take: jest.fn(),
    getManyAndCount: jest.fn(),
  } as MockQueryBuilder<T>;

  queryBuilder.innerJoinAndSelect.mockReturnValue(
    queryBuilder
  );
  queryBuilder.innerJoin.mockReturnValue(
    queryBuilder
  );
  queryBuilder.leftJoinAndSelect.mockReturnValue(
    queryBuilder
  );
  queryBuilder.where.mockReturnValue(queryBuilder);
  queryBuilder.andWhere.mockReturnValue(
    queryBuilder
  );
  queryBuilder.orderBy.mockReturnValue(
    queryBuilder
  );
  queryBuilder.addOrderBy.mockReturnValue(
    queryBuilder
  );
  queryBuilder.skip.mockReturnValue(queryBuilder);
  queryBuilder.take.mockReturnValue(queryBuilder);

  return queryBuilder;
}