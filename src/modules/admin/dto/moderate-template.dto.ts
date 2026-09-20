import { IsIn } from 'class-validator';

export class ModerateTemplateDto {
  @IsIn(['approved', 'rejected'])
  status!: 'approved' | 'rejected';
}
