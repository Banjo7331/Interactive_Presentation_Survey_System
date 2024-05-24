import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  //app.use(new CorsMiddleware().use);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const corsOptions: CorsOptions = {
    origin: ['http://localhost:5173', 'http://172.17.34.190:5173'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };

  // Enable CORS with the defined options
  app.enableCors(corsOptions);
  
  await app.listen(3000);
}
bootstrap();
