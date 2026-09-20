import { IsIn, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name!: string;

  @IsIn(['group', 'channel'])
  type!: 'group' | 'channel';
}
