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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'testuser',
      password: 'testuser123',
      database: 'post_db4',
      entities: [
        User,
        Survey,
        Question,
        FilledSurvey,
        UserChoice
      ],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    SurveyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
