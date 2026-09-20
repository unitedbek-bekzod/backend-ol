import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Business } from '../../models/business.model.js';
import { Transaction } from '../../models/transaction.model.js';
import { User } from '../../models/user.model.js';
import { CreateBusinessDto } from './dto/create-business.dto.js';
import { UpdateBusinessDto } from './dto/update-business.dto.js';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(Business) private readonly businessModel: typeof Business,
    @InjectModel(Transaction) private readonly transactionModel: typeof Transaction,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async listForOwner(ownerId: string): Promise<Business[]> {
    return this.businessModel.findAll({ where: { ownerId } });
  }

  async create(ownerId: string, dto: CreateBusinessDto): Promise<Business> {
    return this.businessModel.create({ ownerId, ...dto } as any);
  }

  async findOwned(id: string, ownerId: string): Promise<Business> {
    const business = await this.businessModel.findByPk(id);
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== ownerId) throw new ForbiddenException('Not your business');
    return business;
  }

  async update(id: string, ownerId: string, dto: UpdateBusinessDto): Promise<Business> {
    const business = await this.findOwned(id, ownerId);
    Object.assign(business, dto);
    await business.save();
    return business;
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const business = await this.findOwned(id, ownerId);
    await business.destroy();
  }

  async analytics(id: string, ownerId: string) {
    await this.findOwned(id, ownerId);
    const transactions = await this.transactionModel.findAll({
      where: { toBusinessId: id, status: 'success' },
      order: [['createdAt', 'ASC']],
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalOrders = transactions.length;

    const dayTotals = new Map<string, number>();
    for (const t of transactions) {
      const day = t.createdAt.toISOString().slice(0, 10);
      dayTotals.set(day, (dayTotals.get(day) ?? 0) + Number(t.amount));
    }
    const revenueByDay = [...dayTotals.entries()]
      .map(([date, amount]) => ({ date, amount }))
      .slice(-14);

    const now = Date.now();
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const sumInRange = (start: number, end: number) =>
      transactions
        .filter((t) => t.createdAt.getTime() >= start && t.createdAt.getTime() < end)
        .reduce((sum, t) => sum + Number(t.amount), 0);
    const thisWeek = sumInRange(now - WEEK_MS, now);
    const lastWeek = sumInRange(now - 2 * WEEK_MS, now - WEEK_MS);
    const growthPercent = lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Number((((thisWeek - lastWeek) / lastWeek) * 100).toFixed(1));

    return { totalRevenue, totalOrders, growthPercent, revenueByDay };
  }

  async customers(id: string, ownerId: string): Promise<{ userId: string; name: string; totalSpent: number }[]> {
    await this.findOwned(id, ownerId);
    const transactions = await this.transactionModel.findAll({
      where: { toBusinessId: id, status: 'success' },
    });
    if (!transactions.length) return [];

    const spentByUser = new Map<string, number>();
    for (const t of transactions) {
      spentByUser.set(t.fromUserId, (spentByUser.get(t.fromUserId) ?? 0) + Number(t.amount));
    }
    const users = await this.userModel.findAll({ where: { id: [...spentByUser.keys()] } });
    const nameById = new Map(users.map((u) => [u.id, u.name]));

    return [...spentByUser.entries()].map(([userId, totalSpent]) => ({
      userId,
      name: nameById.get(userId) ?? 'Unknown',
      totalSpent,
    }));
  }
}
