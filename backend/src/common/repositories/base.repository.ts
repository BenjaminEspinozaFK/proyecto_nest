import { PrismaService } from 'src/prisma.service';

export abstract class BaseRepository<T> {
  protected modelName: string;

  constructor(protected prisma: PrismaService) {}

  async findAll(skip?: number, take?: number): Promise<T[]> {
    return this.prisma[this.modelName].findMany({ skip, take });
  }

  async findById(id: string): Promise<T | null> {
    return this.prisma[this.modelName].findUnique({ where: { id } });
  }

  async create(data: any): Promise<T> {
    return this.prisma[this.modelName].create({ data });
  }

  async update(id: string, data: any): Promise<T> {
    return this.prisma[this.modelName].update({ where: { id }, data });
  }

  async delete(id: string): Promise<T> {
    return this.prisma[this.modelName].delete({ where: { id } });
  }

  async findOne(where: any): Promise<T | null> {
    return this.prisma[this.modelName].findFirst({ where });
  }

  async findMany(where: any, skip?: number, take?: number): Promise<T[]> {
    return this.prisma[this.modelName].findMany({ where, skip, take });
  }

  async count(where?: any): Promise<number> {
    return this.prisma[this.modelName].count({ where });
  }
}
