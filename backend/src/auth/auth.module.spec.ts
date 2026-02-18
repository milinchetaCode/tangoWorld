import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import configuration from '../config/configuration';
import { validationSchema } from '../config/validation.schema';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
          validationSchema: validationSchema,
          validationOptions: {
            allowUnknown: true,
            abortEarly: false,
          },
        }),
        AuthModule,
        UsersModule,
        PrismaModule,
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should compile without circular dependency errors', async () => {
    // If we get here without errors, the circular dependency is resolved
    // Verify AuthService can be retrieved from the module
    const authService = module.get(AuthService);
    expect(authService).toBeDefined();
  });
});
