import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedersService } from './seeders.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seedersService = app.get(SeedersService);

    await seedersService.seed();
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error('Error al ejecutar los seeders:', error);
  process.exitCode = 1;
});