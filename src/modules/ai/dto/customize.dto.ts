import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class CustomizeDto {
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  business_name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['professional', 'playful', 'minimal', 'friendly', 'bold'])
  tone?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsUUID()
  website_id?: string;

  @IsOptional()
  @IsUUID()
  business_id?: string;
}
