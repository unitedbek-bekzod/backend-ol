import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsArray()
  links?: string[];
}
