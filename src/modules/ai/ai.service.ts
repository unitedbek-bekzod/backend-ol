import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Template } from '../../models/template.model.js';
import { Website } from '../../models/website.model.js';
import { Business } from '../../models/business.model.js';
import { AiUsageLog } from '../../models/ai-usage-log.model.js';
import { AnthropicService } from './anthropic.service.js';
import { CustomizeDto } from './dto/customize.dto.js';
import { RegenerateDto } from './dto/regenerate.dto.js';

const MONTHLY_FREE_LIMIT = 3;

@Injectable()
export class AiService {
  constructor(
    @InjectModel(Template) private readonly templateModel: typeof Template,
    @InjectModel(Website) private readonly websiteModel: typeof Website,
    @InjectModel(Business) private readonly businessModel: typeof Business,
    @InjectModel(AiUsageLog) private readonly usageLogModel: typeof AiUsageLog,
    private readonly anthropicService: AnthropicService,
  ) {}

  async customize(templateId: string, userId: string, dto: CustomizeDto) {
    await this.assertUnderMonthlyLimit(userId);

    const template = await this.templateModel.findByPk(templateId);
    if (!template) throw new NotFoundException('Template not found');
    if (!template.aiCompatible) {
      throw new BadRequestException('This template does not support AI customization');
    }

    const website = await this.resolveWebsite(template, userId, dto);

    const { fields, tokensUsed } = await this.anthropicService.generateFields(
      {
        business_name: dto.business_name,
        description: dto.description,
        category: dto.category,
        tone: dto.tone,
      },
      template.blocks,
    );

    const content = this.applyFields(template, website.content, fields);
    if (dto.logo_url) {
      content.accent_color = await this.extractAccentColor(dto.logo_url, content.accent_color);
    }

    website.content = content;
    await website.save();

    await this.usageLogModel.create({ userId, templateId, tokensUsed } as any);

    return { website_id: website.id, template_id: template.id, content: website.content, status: website.status };
  }

  async regenerate(templateId: string, userId: string, dto: RegenerateDto) {
    await this.assertUnderMonthlyLimit(userId);

    const template = await this.templateModel.findByPk(templateId);
    if (!template) throw new NotFoundException('Template not found');

    const website = await this.websiteModel.findByPk(dto.website_id, { include: [Business] });
    if (!website) throw new NotFoundException('Website not found');
    if (website.business.ownerId !== userId) throw new ForbiddenException('Not your website');

    const placeholder = template.blocks.find((p) => p.key === dto.field);
    if (!placeholder) throw new BadRequestException(`Unknown field "${dto.field}" for this template`);

    const { fields, tokensUsed } = await this.anthropicService.generateFields(
      {
        business_name: website.content.business_name ?? 'Business',
        description: website.content.about_text ?? '',
        category: template.category,
        tone: 'professional',
      },
      [placeholder],
    );

    const value = fields[dto.field];
    if (value !== undefined) {
      website.content = { ...website.content, [dto.field]: this.truncate(value, placeholder.max_length) };
      await website.save();
    }

    await this.usageLogModel.create({ userId, templateId, tokensUsed } as any);

    return { website_id: website.id, field: dto.field, value: website.content[dto.field] };
  }

  async usage(userId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const used = await this.usageLogModel.count({
      where: { userId, createdAt: { [Op.gte]: startOfMonth } },
    });

    return { used, limit: MONTHLY_FREE_LIMIT, remaining: Math.max(0, MONTHLY_FREE_LIMIT - used) };
  }

  private async assertUnderMonthlyLimit(userId: string): Promise<void> {
    const { remaining } = await this.usage(userId);
    if (remaining <= 0) {
      throw new BadRequestException('Monthly free AI-customization limit reached');
    }
  }

  private async resolveWebsite(template: Template, userId: string, dto: CustomizeDto): Promise<Website> {
    if (dto.website_id) {
      const website = await this.websiteModel.findByPk(dto.website_id, { include: [Business] });
      if (!website) throw new NotFoundException('Website not found');
      if (website.business.ownerId !== userId) throw new ForbiddenException('Not your website');
      return website;
    }

    if (!dto.business_id) {
      throw new BadRequestException('Provide either website_id or business_id');
    }
    const business = await this.businessModel.findByPk(dto.business_id);
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== userId) throw new ForbiddenException('Not your business');

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

  private applyFields(
    template: Template,
    existingContent: Record<string, string>,
    fields: Record<string, string>,
  ): Record<string, string> {
    const content = { ...existingContent };
    for (const placeholder of template.blocks) {
      if (placeholder.type !== 'text') continue;
      const value = fields[placeholder.key];
      if (typeof value === 'string') {
        content[placeholder.key] = this.truncate(value, placeholder.max_length);
      }
    }
    return content;
  }

  private truncate(value: string, maxLength?: number): string {
    if (!maxLength || value.length <= maxLength) return value;
    const sliced = value.slice(0, maxLength);
    const lastSpace = sliced.lastIndexOf(' ');
    return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced).trim();
  }

  // Dominant color extraction from a logo is listed as a nice-to-have (structure.md §5.3
  // step 2); skipping the extra image-processing dependency for the hackathon and just
  // keeping whatever accent_color is already on the website (template default).
  private async extractAccentColor(_logoUrl: string, fallback: string): Promise<string> {
    return fallback;
  }
}
