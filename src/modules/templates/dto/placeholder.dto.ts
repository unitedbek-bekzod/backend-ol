import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PlaceholderDto {
  @IsString()
  key!: string;

  @IsIn(['text', 'color'])
  type!: 'text' | 'color';

  @IsOptional()
  @IsInt()
  @Min(1)
  max_length?: number;
}
