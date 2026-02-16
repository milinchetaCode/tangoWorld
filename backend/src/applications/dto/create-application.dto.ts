import { IsString, IsOptional, IsNumber, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApplicationDto {
  @IsOptional()
  @IsString()
  @IsIn(['full_food', 'full_accommodation', 'full_both', 'daily_food', 'daily_no_food'])
  pricingOption?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  numberOfDays?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  totalPrice?: number;
}
