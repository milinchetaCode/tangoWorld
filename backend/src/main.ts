import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL environment variable is not set in production');
  }

  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: allowedOrigin,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
