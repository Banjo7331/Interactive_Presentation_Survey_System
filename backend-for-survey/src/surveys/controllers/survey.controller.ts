import { SurveyService } from "../services/survey.service";
import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards, Request, UnauthorizedException, Delete, UsePipes, ValidationPipe, InternalServerErrorException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { SurveyWebSocketGateway } from "../websocket/websocket.gateway";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { CreateSurveyDto } from "../dtos/CreateSurvey.dto";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "src/authentication/guards/jwt.guard";
import { SurveyRoomService } from "../services/surveyRoom.service";
import { CreatedFilledSurveyDto } from "../dtos/CreateFilledSurvey.dto";
import { FilledSurvey } from "src/typeorm/entities/surveyElm/FilledSurvey";
import { QuestionTypeValidationPipe } from "../pipes/question-type-validation.pipe";
import { SurveyRoomResult } from "src/typeorm/entities/surveyElm/SurveyRoomResult";
import { CreateSurveyRoomResultDto } from "../dtos/CreateSurveyRoomResult.dto";
import { DeviceGuard } from "src/authentication/guards/device.guard";
import { v4 as uuidv4 } from 'uuid';
import { EitherGuard } from "src/authentication/guards/either.guard";


@Controller('surveys')
export class SurveyController {
  constructor(
    private readonly surveyService: SurveyService,
    private readonly surveyGateway: SurveyWebSocketGateway,
    private readonly roomService: SurveyRoomService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createSurvey(@Request() req,@Body() createSurveyData: CreateSurveyDto ): Promise<Survey> { 
    const user = req.user;
    console.log(user);
    createSurveyData.user = user;
    const createdSurvey = await this.surveyService.createSurvey(createSurveyData);
    await this.surveyGateway.server.emit('surveyCreation', createdSurvey);

    return createdSurvey;
  }
  @UseGuards(EitherGuard)
  @Get(':id')
  getSurveyById(@Param('id',ParseIntPipe) surveyId:number,@Request() req) {
    //const user = req.user;
    //console.log(user);
    const survey = this.surveyService.getSurveyById(surveyId);
    return survey;
  }
  @UseGuards(JwtAuthGuard)
  @Get('search/:name')
  async getSurveysByName(@Param('name') name: string, @Request() req) {
    const user = req.user;
    console.log(user);
    const surveys = await this.surveyService.getSurveysByName(name, user.id);
    return surveys;
  }
  
  @UseGuards(JwtAuthGuard)
  @Delete('survey/:id')
  async deleteSurvey(@Param('id',ParseIntPipe) surveyId:number) {
    await this.surveyService.deleteSurvey(surveyId);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('surveyRoomResult/:id')
  async deleteSurveyRoomResult(@Param('id',ParseIntPipe) roomId:number) {
    await this.roomService.deleteSurveyRoomResult(roomId);
  }
  @UseGuards(DeviceGuard)
  @Post(':surveyId/:roomId/submit')
  async submitSurvey(@Request() req,@Param('roomId') roomId: string, @Param('surveyId', ParseIntPipe) surveyId: number, @Body() createSurveyAnswerData: CreatedFilledSurveyDto): Promise<FilledSurvey> {
    const deviceId = req.headers['device-id'];
    //createSurveyAnswerData.user = deviceId;
    const room = this.roomService.getRoomById(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }
    console.log("w srodku")
    if (room.submissions.has(deviceId)) {
      throw new HttpException('You have already submitted this survey', HttpStatus.FORBIDDEN);
    }

    const submittedSurvey = await this.surveyService.submitSurvey(surveyId, createSurveyAnswerData);
    
    // Update the room session
    room.submissions.add(deviceId);
    
    await this.surveyGateway.handleSurveySubmission(null,submittedSurvey);
    console.log(submittedSurvey);
    return submittedSurvey;
  }
  @UseGuards(JwtAuthGuard)
  @Post(':id/create-room')
  async createRoom(@Param('id') surveyId: string, @Body() surveyData: any,@Request() req) {
    const userId = req.user.id;
    const roomId = await this.roomService.createRoom(surveyId, surveyData, userId);
    this.surveyGateway.server.emit('roomCreation', { roomId, userId });
    return { roomId, userId };
  }
  @Get('get-room/:id')
  async getRoom(@Param('id') roomId: string) {
    return this.roomService.getRoomById(roomId);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':surveyId/:roomId/close-room')
  closeRoom(@Param('roomId') roomId: string, @Param('surveyId', ParseIntPipe) surveyId: number, @Request() req: any, @Body() surveyRoomResultDto: CreateSurveyRoomResultDto) {
    const userId = req.user.id; // Get the user's ID from the request
    surveyRoomResultDto.user = userId;
    this.roomService.closeRoom(roomId, userId,surveyRoomResultDto, surveyId);
    return { message: 'Room closed successfully' };
  }
  @UseGuards(DeviceGuard)
  @Post(':id/join')
  async joinRoom(@Param('id') roomId: string, @Request() req: any) {
  try {
    const deviceId = req.headers['device-id']; // Get the participant's ID from the request

    // Get the room
    const room = this.roomService.getRoomById(roomId);

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }
    if (room.participants.has(deviceId)) {
      return { message: 'You have already joined this room' };
    }
    // Check if the participant has already submitted their survey
    if (room.submissions.has(deviceId)) {
      throw new HttpException('You have already submitted your survey and cannot rejoin the room', HttpStatus.FORBIDDEN);
    }
    this.roomService.joinRoom(roomId, deviceId);
    this.surveyGateway.server.emit('userJoined');
    return { message: 'Joined room successfully' };
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    } else {
      throw new InternalServerErrorException('Error joining room');
    }
  }
  }
    @UseGuards(JwtAuthGuard)
    @Get('user/surveys')
    async getSurveys(@Request() req: any) {
        const userId = req.user.id;
        return this.surveyService.getSurveys(userId);
    }
    @UseGuards(JwtAuthGuard)
    @Get('user/survey-results')
    async getSurveyResults(@Request() req: any) {
        const userId = req.user.id;
        return this.roomService.getSurveyResults(userId);
    }
}