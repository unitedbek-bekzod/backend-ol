import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { PlaceholderDto } from './placeholder.dto.js';
import type { TemplateKey } from '../../../models/template.model.js';

const TEMPLATE_KEYS: TemplateKey[] = ['landing', 'portfolio', 'store', 'course'];

export class CreateTemplateDto {
  @IsString()
  title!: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsIn(TEMPLATE_KEYS)
  templateKey?: TemplateKey;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  previewUrl?: string;

  @IsBoolean()
  aiCompatible!: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaceholderDto)
  blocks!: PlaceholderDto[];
}
