import { SurveyService } from "../services/survey.service";
import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards, Request, UnauthorizedException, Delete, UsePipes, ValidationPipe } from "@nestjs/common";
import { SurveyWebSocketGateway } from "../websocket/websocket.gateway";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { CreateSurveyDto } from "../dtos/CreateSurvey.dto";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "src/authentication/guards/jwt.guard";
import { SurveyRoomService } from "../services/surveyRoom.service";
import { CreatedFilledSurveyDto } from "../dtos/CreateFilledSurvey.dto";
import { FilledSurvey } from "src/typeorm/entities/surveyElm/FilledSurvey";
import { QuestionTypeValidationPipe } from "../pipes/question-type-validation.pipe";

@Controller('surveys')
export class SurveyController {
  constructor(
    private readonly surveyService: SurveyService,
    private readonly surveyGateway: SurveyWebSocketGateway,
    private readonly roomService: SurveyRoomService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe(),
    new QuestionTypeValidationPipe(),
  )
  @Post('create')
  async createSurvey(@Request() req,@Body() createSurveyData: CreateSurveyDto ): Promise<Survey> { 
    const user = req.user;
    createSurveyData.user = user;
    const createdSurvey = this.surveyService.createSurvey(createSurveyData);
    this.surveyGateway.handleSurveyCreation(null,createdSurvey);
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

  @Post(':id/submit')
  async submitSurvey(@Request() req,@Param('id', ParseIntPipe) surveyId: number, @Body() createSurveyAnswerData: CreatedFilledSurveyDto): Promise<FilledSurvey> {
    const user = req.user;
    createSurveyAnswerData.user = user;
    const submittedSurvey = await this.surveyService.submitSurvey(surveyId, createSurveyAnswerData);
    await this.surveyGateway.handleSurveySubmission(null,submittedSurvey);
    console.log(submittedSurvey);
    return submittedSurvey;
  }
  @Post(':id/create-room')
  createRoom(@Param('id') surveyId: string, @Body() surveyData: any) {
    return this.roomService.createRoom(surveyId, surveyData);
  }
}