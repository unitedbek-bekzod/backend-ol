import { IsUUID } from 'class-validator';

export class CreateWebsiteDto {
  @IsUUID()
  business_id!: string;

  @IsUUID()
  template_id!: string;
}
