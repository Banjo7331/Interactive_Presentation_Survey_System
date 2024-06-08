import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { SurveyRoom } from "../websocket/surveyRoom";
import { v4 as uuidv4 } from 'uuid';
import { CreateSurveyRoomResultDto } from "../dtos/CreateSurveyRoomResult.dto";
import { SurveyRoomResult } from "src/typeorm/entities/surveyElm/SurveyRoomResult";
import { InjectRepository } from "@nestjs/typeorm";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { EntityManager, Repository } from "typeorm";
import { QuestionRoomResult } from "src/typeorm/entities/surveyElm/QuestionRoomResult";
import { User } from "src/typeorm/entities/userElm/User";
@Injectable()
export class SurveyRoomService {
  private readonly rooms: Map<string, SurveyRoom>;

  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    @InjectRepository(SurveyRoomResult)
    private readonly surveyRoomResultRepository: Repository<SurveyRoomResult>,
    @InjectRepository(QuestionRoomResult)
    private readonly questionRoomResultRepository: Repository<QuestionRoomResult>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager
  ) {
    this.rooms = new Map();
    
  }

  createRoom(surveyId: string, surveyData: any,creatorId: string,maxUsers: number): SurveyRoom {
    const roomId = uuidv4();
    const link = `https://localhost:5731/survey-room/${surveyId}/${roomId}`;
    const room: SurveyRoom = {
      id: roomId,
      link: link,
      maxUsers: maxUsers,
      surveyId,
      surveyData,
      participants: new Set(),
      submissions: new Set(), 
      creatorId: creatorId,
    };
    this.rooms.set(roomId, room);

    return roomId;
  }

  getRoomById(roomId: string): SurveyRoom {
    const room = this.rooms.get(roomId);
    console.log(room);
    return this.rooms.get(roomId);
  }
  closeRoom(roomId: string, userId: string, surveyRoomResultDto : CreateSurveyRoomResultDto, surveyId: number) {
    console.log("in close room method");
    console.log(this.rooms);
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    if (room.creatorId !== userId) {
      throw new UnauthorizedException('Only the creator of the room can close it');
    }
    this.submitSurveyRoomResults(roomId,surveyId, surveyRoomResultDto);
    this.rooms.delete(roomId);
  }
  async deleteSurveyRoomResult(roomId: number): Promise<void> {
    const id = roomId;
    const surveyRoomResults = await this.surveyRoomResultRepository.findOne({ where: { id },  relations: ['questionRoomResult'] });

    if (!surveyRoomResults) {
      throw new NotFoundException('Survey not found');
    }

    await this.questionRoomResultRepository.remove(surveyRoomResults.questionRoomResult);

    await this.surveyRoomResultRepository.delete(roomId);
  }
  async submitSurveyRoomResults(roomId: string, surveyId: number, surveyRoomResultDto: CreateSurveyRoomResultDto) {
    return this.entityManager.transaction(async (transactionalEntityManager) => {
      const survey = await transactionalEntityManager.findOne(Survey, { where: { id: surveyId }, relations: ['questions'] });

      if (!survey) {
        throw new Error('Survey not found');
      }

      const surveyRoomResultAttempt = new SurveyRoomResult();
      surveyRoomResultAttempt.survey = survey;
      surveyRoomResultAttempt.user = surveyRoomResultDto.user;
      surveyRoomResultAttempt.room = roomId;

      const createdSurveyRoomResult = await transactionalEntityManager.save(SurveyRoomResult, surveyRoomResultAttempt);
      createdSurveyRoomResult.questionRoomResult = [];

      if (surveyRoomResultDto.questionRoomResultDto && surveyRoomResultDto.questionRoomResultDto.length > 0) {
        const roomAnswers = await Promise.all(surveyRoomResultDto.questionRoomResultDto.map(async (roomAnswersData, index) => {
          const question = survey.questions[index];

          if (question) {
            const questionRoomResult = transactionalEntityManager.create(QuestionRoomResult, {
              ...roomAnswersData,
              surveyRoomResult: createdSurveyRoomResult,
              question: question,
            });

            const savedQuestionRoomResult = await transactionalEntityManager.save(QuestionRoomResult, questionRoomResult);
            createdSurveyRoomResult.questionRoomResult.push(savedQuestionRoomResult);

            return savedQuestionRoomResult;
          } else {
            return null;
          }
        }));

        const filteredUserAnswers = roomAnswers.filter((answer) => answer !== null);
        createdSurveyRoomResult.questionRoomResult = filteredUserAnswers;

        await transactionalEntityManager.save(SurveyRoomResult, createdSurveyRoomResult);
      }

      const id = createdSurveyRoomResult.id;
      const submittedSurveyRoomResult = await transactionalEntityManager.findOne(SurveyRoomResult, { where: { id }, relations: ['questionRoomResult'] });

      return submittedSurveyRoomResult;
    });
  }
  joinRoom(roomId: string, participantId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    room.participants.add(participantId);
  }
  async getSurveyResults(userId: number): Promise<SurveyRoomResult[]> {
    const user = await this.userRepository.findOneBy({id: userId});
  
    if (!user) {
      throw new Error('User not found');
    }
  
    const surveyResults = await this.surveyRoomResultRepository.find({ 
      where: { user: { id: userId } },
      relations: ['questionRoomResult']
    });
  
    return surveyResults;
  }
}