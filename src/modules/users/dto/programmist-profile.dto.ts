import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class ProgrammistProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  skills?: string[];

  @IsOptional()
  @IsArray()
  portfolioLinks?: string[];

  @IsOptional()
  @IsObject()
  extra?: Record<string, unknown>;
}
