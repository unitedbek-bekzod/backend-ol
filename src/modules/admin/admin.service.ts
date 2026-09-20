import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from '../../models/user.model.js';
import { Business } from '../../models/business.model.js';
import { Template } from '../../models/template.model.js';
import { Transaction } from '../../models/transaction.model.js';
import { AiUsageLog } from '../../models/ai-usage-log.model.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { ModerateTemplateDto } from './dto/moderate-template.dto.js';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Business) private readonly businessModel: typeof Business,
    @InjectModel(Template) private readonly templateModel: typeof Template,
    @InjectModel(Transaction) private readonly transactionModel: typeof Transaction,
    @InjectModel(AiUsageLog) private readonly usageLogModel: typeof AiUsageLog,
  ) {}

  async stats() {
    const [totalUsers, totalTemplates, tokenUsage] = await Promise.all([
      this.userModel.count(),
      this.templateModel.count(),
      this.usageLogModel.sum('tokensUsed'),
    ]);
    return { totalUsers, totalTemplates, totalBusinesses: totalTemplates, tokenUsage: tokenUsage ?? 0 };
  }

  async listUsers(status?: string, q?: string) {
    const and: Record<string, unknown>[] = [];
    if (status) and.push({ status });
    if (q) {
      and.push({
        [Op.or]: [{ name: { [Op.iLike]: `%${q}%` } }, { email: { [Op.iLike]: `%${q}%` } }],
      });
    }
    return this.userModel.findAll({ where: and.length ? { [Op.and]: and } : {}, order: [['createdAt', 'DESC']] });
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');
    user.status = dto.status;
    await user.save();
    return user;
  }

  async listBusinesses(status?: string, q?: string) {
    const and: Record<string, unknown>[] = [];
    if (q) and.push({ name: { [Op.iLike]: `%${q}%` } });
    void status; // Business has no moderation status field yet; accepted for API parity.
    return this.businessModel.findAll({ where: and.length ? { [Op.and]: and } : {}, order: [['createdAt', 'DESC']] });
  }

  async listTemplates() {
    return this.templateModel.findAll({ order: [['createdAt', 'DESC']] });
  }

  async moderateTemplate(id: string, dto: ModerateTemplateDto) {
    const template = await this.templateModel.findByPk(id);
    if (!template) throw new NotFoundException('Template not found');
    template.status = dto.status;
    await template.save();
    return template;
  }

  async listPayments(from?: string, to?: string) {
    const and: Record<string, unknown>[] = [];
    if (from) and.push({ createdAt: { [Op.gte]: new Date(from) } });
    if (to) and.push({ createdAt: { [Op.lte]: new Date(to) } });
    return this.transactionModel.findAll({ where: and.length ? { [Op.and]: and } : {}, order: [['createdAt', 'DESC']] });
  }
}
