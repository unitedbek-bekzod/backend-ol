import { IsString, IsUUID } from 'class-validator';

export class RegenerateDto {
  @IsUUID()
  website_id!: string;

  @IsString()
  field!: string;
}
