import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './typeorm/entities/userElm/User';
import { WebSocketModule } from './surveys/websocket/websocket.module';
import { UsersModule } from './users/users.module';
import { SurveyModule } from './surveys/surveys.module';
import { Survey } from './typeorm/entities/surveyElm/Survey';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'testuser',
      password: 'testuser123',
      database: 'post_db2',
      entities: [User,Survey],
      synchronize: true,
    }),
    WebSocketModule,
    UsersModule,
    SurveyModule

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
