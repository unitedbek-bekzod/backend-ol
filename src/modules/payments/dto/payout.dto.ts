import { IsNumber, IsUUID, Min } from 'class-validator';

export class PayoutDto {
  @IsUUID()
  businessId!: string;

  @IsNumber()
  @Min(1)
  amount!: number;
}
