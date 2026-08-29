import { prisma } from '../config/database.js';

export class FoodService {
  static async create(data) {
    return await prisma.food.create({ data });
  }

  static async findAll(filters = {}) {
    const { season, category } = filters;
    return await prisma.food.findMany({
      where: {
        ...(season && { season }),
        ...(category && { category })
      }
    });
  }

  static async findById(id) {
    return await prisma.food.findUnique({ where: { id } });
  }

  static async update(id, data) {
    return await prisma.food.update({
      where: { id },
      data
    });
  }

  static async delete(id) {
    return await prisma.food.delete({ where: { id } });
  }
}