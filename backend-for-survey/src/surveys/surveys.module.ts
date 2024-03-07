import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { SurveyService } from "./services/survey.service";
import { SurveyController } from "./controllers/survey.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Survey])],
    providers: [SurveyService],
    controllers: [SurveyController],
  })
  export class SurveyModule {}