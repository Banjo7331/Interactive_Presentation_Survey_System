import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { SurveyService } from "./services/survey.service";
import { SurveyController } from "./controllers/survey.controller";
import { SurveyWebSocketGateway } from "./websocket/websocket.gateway";
import { Question } from "src/typeorm/entities/surveyElm/Question";
import { FilledSurvey } from "src/typeorm/entities/surveyElm/FilledSurvey";
import { UserChoice } from "src/typeorm/entities/surveyElm/UserChoice";
@Module({
  imports: [TypeOrmModule.forFeature([Survey,Question,FilledSurvey,UserChoice])],
  providers: [SurveyService, SurveyWebSocketGateway],
  controllers: [SurveyController],
})
export class SurveyModule {}