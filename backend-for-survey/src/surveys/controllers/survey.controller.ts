import { SurveyService } from "../services/survey.service";
import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post('create')
  @UseGuards() // Apply authentication guard if needed
  createSurvey(@Body() surveyData: any) {
    const createdSurvey = this.surveyService.createSurvey(surveyData);
    return createdSurvey;
  }

  @Get(':id')
  getSurvey(@Param('id',ParseIntPipe) surveyId:number) {
    const survey = this.surveyService.getSurveyById(surveyId);
    return survey;
  }
}