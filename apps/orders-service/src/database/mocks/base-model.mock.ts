import { Op } from 'sequelize';

export class BaseModelMock<T extends Record<string, any>> {
  protected data: T[];

  constructor(data: T[]) {
    this.data = data;
  }

  findAll = jest.fn(({ where }: { where?: Record<string, any> } = {}) => {
    let result = [...this.data];
    if (where) result = this.applyWhere(result, where);
    return Promise.resolve(result);
  });

  findOne = jest.fn(({ where }: { where?: Record<string, any> } = {}) => {
    let result = [...this.data];
    if (where) result = this.applyWhere(result, where);
    return Promise.resolve(result[0] ?? null);
  });

  findByPk = jest.fn((id: number) =>
    Promise.resolve(this.data.find((item) => item['id'] === id) ?? null),
  );

  findAndCountAll = jest.fn(
    ({ where, limit, offset }: { where?: any; limit?: number; offset?: number } = {}) => {
      let result = [...this.data];
      if (where) result = this.applyWhere(result, where);
      const count = result.length;
      if (offset !== undefined) result = result.slice(offset);
      if (limit !== undefined) result = result.slice(0, limit);
      return Promise.resolve({ rows: result, count });
    },
  );

  findOrCreate = jest.fn(({ where, defaults }: { where: any; defaults?: any }) => {
    const found = this.data.find((item) =>
      Object.keys(where).every((key) => item[key] === where[key]),
    );
    if (found) return Promise.resolve([found, false]);
    const created = { ...defaults } as T;
    this.data.push(created);
    return Promise.resolve([created, true]);
  });

  create = jest.fn((values: Partial<T>) => {
    const item = { id: this.data.length + 1, ...values } as unknown as T;
    this.data.push(item);
    return Promise.resolve(item);
  });

  update = jest.fn((values: Partial<T>, { where }: { where?: any } = {}) => {
    let result = [...this.data];
    if (where) result = this.applyWhere(result, where);
    result.forEach((item) => Object.assign(item, values));
    return Promise.resolve([result.length]);
  });

  destroy = jest.fn(() => Promise.resolve(1));

  private applyWhere(result: T[], where: Record<string, any>): T[] {
    return result.filter((item) =>
      Object.keys(where).every((key) => {
        const condition = where[key];
        if (condition !== null && typeof condition === 'object') {
          if (Op.ne  in condition && item[key] === condition[Op.ne])  return false;
          if (Op.gte in condition && !(item[key] >= condition[Op.gte])) return false;
          if (Op.lte in condition && !(item[key] <= condition[Op.lte])) return false;
          if (Op.gt  in condition && !(item[key] >  condition[Op.gt]))  return false;
          if (Op.lt  in condition && !(item[key] <  condition[Op.lt]))  return false;
          return true;
        }
        return item[key] === condition;
      }),
    );
  }
}
