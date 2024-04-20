import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Injectable, NestMiddleware, ValidationPipe } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  }
}

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
