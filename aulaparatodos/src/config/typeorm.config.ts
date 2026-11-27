import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {

  const port = Number(configService.getOrThrow<string>('DB_PORT'));

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT debe ser un puerto entre 1 y 65535.');
  }

  return {
    type: 'postgres',
    host: configService.getOrThrow<string>('DB_HOST'),
    port,
    username: configService.getOrThrow<string>('DB_USERNAME'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_NAME'),

    autoLoadEntities: true,
    synchronize: false,
    logging: true,
    dropSchema: false,
    retryAttempts: 1,
  };
};