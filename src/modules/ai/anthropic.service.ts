import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type { TemplatePlaceholder } from '../../models/template.model.js';

export interface CustomizeContext {
  prompt?: string;
  business_name?: string;
  description?: string;
  category?: string;
  tone?: string;
}

const SYSTEM_PROMPT =
  "Sen OL platformasi uchun website matnlarini yozuvchi copywriter'san. Foydalanuvchi bergan prompt va talablar asosida barcha JSON kalitlar uchun ta'sirchan, zamonaviy va professional matn yoz. Javobing FAQAT valid JSON bo'lishi kerak, boshqa hech qanday izoh yozma.";

@Injectable()
export class AnthropicService {
  private readonly logger = new Logger('AnthropicService');
  private readonly client: Anthropic | null;
  readonly isEnabled: boolean;

  constructor(private readonly config: ConfigService) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    this.isEnabled = Boolean(apiKey);
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
  }

  async generateFields(
    context: CustomizeContext,
    placeholders: TemplatePlaceholder[],
  ): Promise<{ fields: Record<string, string>; tokensUsed: number }> {
    const textPlaceholders = placeholders.filter((p) => p.type === 'text');

    if (!this.client) {
      return { fields: this.mockGenerate(context, textPlaceholders), tokensUsed: 0 };
    }

    const fieldList = textPlaceholders
      .map((p) => `${p.key}${p.max_length ? ` (${p.max_length})` : ''}`)
      .join(', ');

    let userMessage = '';
    if (context.prompt) {
      userMessage = `Foydalanuvchining loyiha bo'yicha erkin prompti:\n"${context.prompt}"\n\nQo'shimcha ma'lumotlar: Nom: ${context.business_name || 'Nomaʼlum'}, Kategoriya: ${context.category || 'Website'}\n\nQuyidagi JSON kalitlarni yuqoridagi prompt asosida to'liq va sifatli qilib to'ldir:\n${fieldList}`;
    } else {
      userMessage = `Biznes: ${context.business_name}\nTavsif: ${context.description}\nKategoriya: ${context.category}\nOhang: ${context.tone}\n\nQuyidagi kalitlarni to'ldir (belgilangan max_length'dan oshmasin):\n${fieldList}`;
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await this.client.messages.create({
          model: 'claude-sonnet-5',
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        });

        const textBlock = response.content.find((block) => block.type === 'text');
        if (!textBlock || textBlock.type !== 'text') throw new Error('No text content in response');

        const jsonText = textBlock.text.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
        const parsed = JSON.parse(jsonText) as Record<string, string>;
        const tokensUsed = (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);
        return { fields: parsed, tokensUsed };
      } catch (error) {
        this.logger.warn(`Claude generation attempt ${attempt + 1} failed: ${(error as Error).message}`);
      }
    }

    this.logger.warn('Falling back to mock generator after failed Claude attempts');
    return { fields: this.mockGenerate(context, textPlaceholders), tokensUsed: 0 };
  }

  private mockGenerate(
    context: CustomizeContext,
    placeholders: TemplatePlaceholder[],
  ): Record<string, string> {
    const fields: Record<string, string> = {};
    for (const placeholder of placeholders) {
      fields[placeholder.key] = this.mockValueFor(placeholder.key, context, placeholder.max_length);
    }
    return fields;
  }

  private mockValueFor(key: string, context: CustomizeContext, maxLength?: number): string {
    const prompt = context.prompt?.trim();
    const name = context.business_name || (prompt ? prompt.slice(0, 30) : 'My Brand');
    const desc = context.description || prompt || 'Sifatli va zamonaviy xizmatlar';
    const cat = context.category || 'Loyihalar';

    // Parse keywords from prompt if provided
    let heroTitle = `${name} — ${cat}`;
    let heroSub = desc;
    let about = `Biz mijozlarimizga eng yaxshi tajribani taqdim etishga intilamiz. ${desc}`;
    let feat1Title = 'Tezkor va sifatli';
    let feat1Desc = 'Barcha xizmatlar va mahsulotlar yuqori standartlarga javob beradi.';
    let feat2Title = 'Kafolatlangan natija';
    let feat2Desc = 'Mijozlarimiz ishonchi va qulayligi biz uchun birinchi oʻrinda.';
    let cta = 'Batafsil maʼlumot';

    if (prompt) {
      const lower = prompt.toLowerCase();
      heroTitle = prompt.length > 50 ? prompt.slice(0, 48) + '…' : prompt;
      heroSub = `Siz uchun maxsus: ${prompt}`;
      about = `Biz haqimizda: ${prompt}. Tajribali jamoamiz siz kutgan eng yuqori natijani taqdim etadi.`;

      if (lower.includes('food') || lower.includes('osh') || lower.includes('restoran') || lower.includes('taom') || lower.includes('burger')) {
        feat1Title = 'Mazali va issiq taomlar';
        feat1Desc = 'Eng saralangan masalliqlar va professional oshpazlar mahorati.';
        feat2Title = 'Tez yetkazib berish';
        feat2Desc = 'Buyurtmangiz 30 daqiqa ichida yetib boradi.';
        cta = 'Buyurtma berish';
      } else if (lower.includes('kurs') || lower.includes('ta\'lim') || lower.includes('academy') || lower.includes('maktab') || lower.includes('dars')) {
        feat1Title = 'Amaliy loyihalar';
        feat1Desc = 'Nazariyadan toʻgʻridan-toʻgʻri real keyslarga oʻtish imkoniyati.';
        feat2Title = 'Mentorlar koʻmagi';
        feat2Desc = 'Soha mutaxassislaridan individual maslahat va tahlillar.';
        cta = 'Kursga yozilish';
      } else if (lower.includes('do\'kon') || lower.includes('store') || lower.includes('shop') || lower.includes('kiyim') || lower.includes('tovar')) {
        feat1Title = 'Keng assortiment';
        feat1Desc = 'Barcha zamonaviy va sifatli tovarlar bir joyda.';
        feat2Title = 'Xavfsiz toʻlov';
        feat2Desc = 'Istalgan toʻlov usuli va kafolatlangan yetkazish.';
        cta = 'Xarid qilish';
      }
    }

    const templates: Record<string, string> = {
      hero_title: heroTitle,
      hero_subtitle: heroSub,
      about_text: about,
      feature_1_title: feat1Title,
      feature_1_desc: feat1Desc,
      feature_2_title: feat2Title,
      feature_2_desc: feat2Desc,
      cta_text: cta,
    };

    const value = templates[key] ?? `${name} ${key.replace(/_/g, ' ')}`;
    return this.truncate(value, maxLength);
  }

  private truncate(value: string, maxLength?: number): string {
    if (!maxLength || value.length <= maxLength) return value;
    const sliced = value.slice(0, maxLength);
    const lastSpace = sliced.lastIndexOf(' ');
    return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced).trim();
  }
}
