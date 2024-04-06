import { SurveyService } from "../services/survey.service";
import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards, Request, UnauthorizedException, Delete, UsePipes, ValidationPipe, InternalServerErrorException, HttpException, HttpStatus } from "@nestjs/common";
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
    console.log(user);
    createSurveyData.user = user;
    const createdSurvey = this.surveyService.createSurvey(createSurveyData);
    this.surveyGateway.handleSurveyCreation(null,createdSurvey);
    return createdSurvey;
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getSurvey(@Param('id',ParseIntPipe) surveyId:number,@Request() req) {
    const user = req.user;
    console.log(user);
    const survey = this.surveyService.getSurveyById(surveyId);
    return survey;
  }
  
  @Delete(':id')
  async deleteSurvey(@Param('id',ParseIntPipe) surveyId:number) {
    await this.surveyService.deleteSurvey(surveyId);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post(':surveyId/:roomId/submit')
  async submitSurvey(@Request() req,@Param('roomId') roomId: string, @Param('surveyId', ParseIntPipe) surveyId: number, @Body() createSurveyAnswerData: CreatedFilledSurveyDto): Promise<FilledSurvey> {
    const user = req.user;
    createSurveyAnswerData.user = user;
    const room = this.roomService.getRoomById(roomId);
    console.log("w srodku")
    if (room.submissions.has(user.id)) {
      throw new HttpException('You have already submitted this survey', HttpStatus.FORBIDDEN);
    }

    const submittedSurvey = await this.surveyService.submitSurvey(surveyId, createSurveyAnswerData);
    
    // Update the room session
    room.submissions.add(user.id);
    
    await this.surveyGateway.handleSurveySubmission(null,submittedSurvey);
    console.log(submittedSurvey);
    return submittedSurvey;
  }
  @UseGuards(JwtAuthGuard)
  @Post(':id/create-room')
  createRoom(@Param('id') surveyId: string, @Body() surveyData: any,@Request() req) {
    const userId = req.user.id;
    return this.roomService.createRoom(surveyId, surveyData, userId);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id/close-room')
  closeRoom(@Param('id') roomId: string, @Request() req: any) {
    const userId = req.user.id; // Get the user's ID from the request
    this.roomService.closeRoom(roomId, userId);
    return { message: 'Room closed successfully' };
  }
  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinRoom(@Param('id') roomId: string, @Request() req: any) {
  try {
    const participantId = req.user.id; // Get the participant's ID from the request

    // Get the room
    const room = this.roomService.getRoomById(roomId);

    // Check if the participant has already submitted their survey
    if (room.submissions.has(participantId)) {
      throw new HttpException('You have already submitted your survey and cannot rejoin the room', HttpStatus.FORBIDDEN);
    }
    this.roomService.joinRoom(roomId, participantId);
    return { message: 'Joined room successfully' };
  } catch (error) {
    console.error('Error joining room:', error);
    throw new InternalServerErrorException('Error joining room');
  }
}
}