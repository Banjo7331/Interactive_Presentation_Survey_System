import { SurveyService } from "../services/survey.service";
import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards, Request, UnauthorizedException, Delete } from "@nestjs/common";
import { SurveyWebSocketGateway } from "../websocket/websocket.gateway";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { CreateSurveyDto } from "../dtos/CreateSurvey.dto";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "src/authentication/guards/jwt.guard";
@Controller('surveys')
export class SurveyController {
  constructor(
    private readonly surveyService: SurveyService,
    private readonly surveyGateway: SurveyWebSocketGateway,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createSurvey(@Request() req,@Body() createSurveyData: CreateSurveyDto ): Promise<Survey> { 
    const user = req.user;
    createSurveyData.user = user;
    const createdSurvey = this.surveyService.createSurvey(createSurveyData);
    this.surveyGateway.handleSurveyCreation(createdSurvey);
    return createdSurvey;
  }

  @Get(':id')
  getSurvey(@Param('id',ParseIntPipe) surveyId:number) {
    const survey = this.surveyService.getSurveyById(surveyId);
    return survey;
  }
  
  @Delete(':id')
  async deleteSurvey(@Param('id',ParseIntPipe) surveyId:number) {
    await this.surveyService.deleteSurvey(surveyId);
  }

  @Post('submit')
  submitSurvey(@Param('id', ParseIntPipe) surveyId: number, @Body() submissionData: any) {
    const submittedSurvey = this.surveyService.submitSurvey(surveyId, submissionData);
    this.surveyGateway.handleSurveySubmission(submittedSurvey);
    return submittedSurvey;
  }
}