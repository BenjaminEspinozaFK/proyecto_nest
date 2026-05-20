import { PrismaService } from 'src/prisma.service';

export abstract class BaseRepository<T> {
  protected modelName: string;

  constructor(protected prisma: PrismaService) {}

  findAll(skip?: number, take?: number): Promise<T[]> {
    return this.prisma[this.modelName].findMany({ skip, take });
  }

  findById(id: string): Promise<T | null> {
    return this.prisma[this.modelName].findUnique({ where: { id } });
  }

  create(data: any): Promise<T> {
    return this.prisma[this.modelName].create({ data });
  }

  update(id: string, data: any): Promise<T> {
    return this.prisma[this.modelName].update({ where: { id }, data });
  }

  delete(id: string): Promise<T> {
    return this.prisma[this.modelName].delete({ where: { id } });
  }

  findOne(where: any): Promise<T | null> {
    return this.prisma[this.modelName].findFirst({ where });
  }

  findMany(where: any, skip?: number, take?: number): Promise<T[]> {
    return this.prisma[this.modelName].findMany({ where, skip, take });
  }

  count(where?: any): Promise<number> {
    return this.prisma[this.modelName].count({ where });
  }
}
