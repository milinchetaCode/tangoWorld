import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule, UsersModule, PrismaModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should compile without circular dependency errors', async () => {
    // If we get here without errors, the circular dependency is resolved
    expect(module.get(AuthModule)).toBeDefined();
  });
});
