import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { SurveyService } from "./services/survey.service";
import { SurveyController } from "./controllers/survey.controller";
import { SurveyWebSocketGateway } from "./websocket/websocket.gateway";
import { Question } from "src/typeorm/entities/surveyElm/Question";
import { UserChoice } from "src/typeorm/entities/surveyElm/UserChoice";
import { User } from "src/typeorm/entities/userElm/User";
import { FilledSurvey } from "../typeorm/entities/surveyElm/FilledSurvey";
import { UserService } from "src/users/services/user.service";
import { SurveyRoomService } from "./services/surveyRoom.service";
import { SurveyRoomResult } from "src/typeorm/entities/surveyElm/SurveyRoomResult";
import { QuestionRoomResult } from "src/typeorm/entities/surveyElm/QuestionRoomResult";
@Module({
  imports: [TypeOrmModule.forFeature([Survey,Question,User,SurveyRoomResult,QuestionRoomResult])],
  providers: [SurveyService, 
    SurveyRoomService,
    SurveyWebSocketGateway,
    {
      provide: 'USER_SERVICE',
      useClass: UserService,
    },
  ],
  controllers: [SurveyController],
})
export class SurveyModule {}