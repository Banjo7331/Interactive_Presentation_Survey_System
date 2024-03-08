import { SurveyService } from "../services/survey.service";
import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { SurveyWebSocketGateway } from "../websocket/websocket.gateway";
@Controller('surveys')
export class SurveyController {
  constructor(
    private readonly surveyService: SurveyService,
    private readonly surveyGateway: SurveyWebSocketGateway,
  ) {}

  @Post('create')
  @UseGuards() // Apply authentication guard if needed
  createSurvey(@Body() surveyData: any) {
    const createdSurvey = this.surveyService.createSurvey(surveyData);
    this.surveyGateway.handleSurveyCreation(createdSurvey);
    return createdSurvey;
  }

  @Get(':id')
  getSurvey(@Param('id',ParseIntPipe) surveyId:number) {
    const survey = this.surveyService.getSurveyById(surveyId);
    return survey;
  }

  @Post('submit')
  submitSurvey(@Param('id', ParseIntPipe) surveyId: number, @Body() submissionData: any) {
    const submittedSurvey = this.surveyService.submitSurvey(surveyId, submissionData);
    this.surveyGateway.handleSurveySubmission(submittedSurvey);
    return submittedSurvey;
  }
}