import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  // Intentionally permissive at login to avoid leaking password policy requirements
  @IsString()
  @MinLength(1)
  password: string;
}
