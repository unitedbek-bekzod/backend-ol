import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { PlaceholderDto } from './placeholder.dto.js';

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  previewUrl?: string;

  @IsOptional()
  @IsBoolean()
  aiCompatible?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaceholderDto)
  blocks?: PlaceholderDto[];
}
