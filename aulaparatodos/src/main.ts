import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { environment } from './config/enviroment';
import { connectionSource } from './config/typeorm';

async function bootstrap() {
  await connectionSource.initialize();
  
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

const loggerMiddleware = new LoggerMiddleware()
app.use(loggerMiddleware.use)

const PORT = environment.PORT;
const HOST = environment. HOST;

  

  console.log(`Server online on http://${HOST}:${PORT}/`);

}
bootstrap();
