import { IsObject } from 'class-validator';

export class UpdateWebsiteDto {
  @IsObject()
  content!: Record<string, string>;
}
