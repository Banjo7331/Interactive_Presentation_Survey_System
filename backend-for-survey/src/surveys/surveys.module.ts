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
@Module({
  imports: [TypeOrmModule.forFeature([Survey,Question,FilledSurvey,User,UserChoice,])],
  providers: [SurveyService, SurveyWebSocketGateway],
  controllers: [SurveyController],
})
export class SurveyModule {}