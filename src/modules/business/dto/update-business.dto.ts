import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
