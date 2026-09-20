import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { customAlphabet } from 'nanoid';
import { Website } from '../../models/website.model.js';
import { Business } from '../../models/business.model.js';
import { Template } from '../../models/template.model.js';
import { TemplatesService } from '../templates/templates.service.js';
import { CreateWebsiteDto } from './dto/create-website.dto.js';
import { UpdateWebsiteDto } from './dto/update-website.dto.js';

const generateSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

@Injectable()
export class WebsitesService {
  constructor(
    @InjectModel(Website) private readonly websiteModel: typeof Website,
    @InjectModel(Business) private readonly businessModel: typeof Business,
    @InjectModel(Template) private readonly templateModel: typeof Template,
    private readonly templatesService: TemplatesService,
  ) {}

  async create(userId: string, dto: CreateWebsiteDto): Promise<Website> {
    const business = await this.businessModel.findByPk(dto.business_id);
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== userId) throw new ForbiddenException('Not your business');

    const template = await this.templateModel.findByPk(dto.template_id);
    if (!template) throw new NotFoundException('Template not found');

    const hasAccess = await this.templatesService.hasAccess(template.id, userId);
    if (!hasAccess) throw new ForbiddenException('Purchase this template before use');

    const defaultContent: Record<string, string> = {};
    for (const placeholder of template.blocks) {
      defaultContent[placeholder.key] = placeholder.type === 'color' ? '#2E5AAC' : '';
    }

    return this.websiteModel.create({
      businessId: business.id,
      templateId: template.id,
      content: defaultContent,
      status: 'draft',
    } as any);
  }

  async findAllByUser(userId: string): Promise<Website[]> {
    const businesses = await this.businessModel.findAll({ where: { ownerId: userId } });
    const businessIds = businesses.map((b) => b.id);
    if (businessIds.length === 0) return [];
    return this.websiteModel.findAll({
      where: { businessId: { [Op.in]: businessIds } },
      include: [Template],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOwned(id: string, userId: string): Promise<Website> {
    const website = await this.websiteModel.findByPk(id, { include: [Business] });
    if (!website) throw new NotFoundException('Website not found');
    if (website.business.ownerId !== userId) throw new ForbiddenException('Not your website');
    return website;
  }

  async updateContent(id: string, userId: string, dto: UpdateWebsiteDto): Promise<Website> {
    const website = await this.findOwned(id, userId);
    website.content = { ...website.content, ...dto.content };
    await website.save();
    return website;
  }

  async publish(id: string, userId: string): Promise<Website> {
    const website = await this.findOwned(id, userId);
    if (!website.publishedSlug) {
      website.publishedSlug = generateSlug();
    }
    website.status = 'published';
    await website.save();
    return website;
  }

  async getPublic(slug: string): Promise<Website> {
    const website = await this.websiteModel.findOne({
      where: { publishedSlug: slug, status: 'published' },
      include: [Template],
    });
    if (!website) throw new NotFoundException('Website not found');
    return website;
  }
}
