import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './typeorm/entities/userElm/User';
import { UsersModule } from './users/users.module';
import { SurveyModule } from './surveys/surveys.module';
import { Survey } from './typeorm/entities/surveyElm/Survey';
import { Question } from './typeorm/entities/surveyElm/Question';
import { FilledSurvey } from './typeorm/entities/surveyElm/FilledSurvey';
import { UserChoice } from './typeorm/entities/surveyElm/UserChoice';
import { AuthModule } from './authentication/auth.module';
import { SocketIoAdapter } from './surveys/websocket/socketAdapter';
import { SurveyRoomResult } from './typeorm/entities/surveyElm/SurveyRoomResult';
import { QuestionRoomResult } from './typeorm/entities/surveyElm/QuestionRoomResult';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'testuser',
      password: 'testuser123',
      database: 'post_db5',
      entities: [
        User,
        Survey,
        Question,
        SurveyRoomResult,
        QuestionRoomResult
      ],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    SurveyModule,
  ],
  controllers: [],
  providers: [
   // { provide: 'PORT', useValue: 3000 }, // Port serwera socket.io
   // { provide: 'SOCKET_IO_OPTIONS', useValue: {} }, // Opcjonalne dodatkowe opcje socket.io
   // { provide: 'SOCKET_IO_ADAPTER', useClass: SocketIoAdapter } // Użyj adaptera socket.io
  ],
})
export class AppModule {}
