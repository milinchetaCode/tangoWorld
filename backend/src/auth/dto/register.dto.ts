import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsString()
  city: string;

  @IsIn(['male', 'female'])
  gender: string;

  @IsOptional()
  @IsString()
  dietaryNeeds?: string;
}
