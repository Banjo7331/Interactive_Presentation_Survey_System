import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/typeorm/entities/userElm/User";
import { UserController } from "./controlers/user.controller";
import { UserService } from "./services/user.service";
import { AuthService } from "src/authentication/auth.service";
import { Question } from "src/typeorm/entities/surveyElm/Question";
import { SurveyRoomResult } from "src/typeorm/entities/surveyElm/SurveyRoomResult";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { QuestionRoomResult } from "src/typeorm/entities/surveyElm/QuestionRoomResult";

@Module({
    imports: [TypeOrmModule.forFeature([User]),
    ],
    controllers: [UserController],
    providers: [
      {
        provide: 'USER_SERVICE',
        useClass: UserService,
      },
    ]
  })
  export class UsersModule {}