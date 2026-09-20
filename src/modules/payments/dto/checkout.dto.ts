import { IsIn, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CheckoutDto {
  @IsIn(['product', 'template'])
  targetType!: 'product' | 'template';

  @IsUUID()
  targetId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
