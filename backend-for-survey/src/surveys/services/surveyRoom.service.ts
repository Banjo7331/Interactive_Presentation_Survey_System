import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { SurveyRoom } from "../websocket/surveyRoom";
import { v4 as uuidv4 } from 'uuid';
import { CreateSurveyRoomResultDto } from "../dtos/CreateSurveyRoomResult.dto";
import { SurveyRoomResult } from "src/typeorm/entities/surveyElm/SurveyRoomResult";
import { InjectRepository } from "@nestjs/typeorm";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { Repository } from "typeorm";
import { QuestionRoomResult } from "src/typeorm/entities/surveyElm/QuestionRoomResult";
import { CreateQuestionDto } from "../dtos/CreateQuestion.dto";
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
  ) {
    this.rooms = new Map();
    
  }

  createRoom(surveyId: string, surveyData: any,creatorId: string): SurveyRoom {
    const roomId = uuidv4();
    const link = `https://localhost:5731/survey-room/${surveyId}/${roomId}`;
    const room: SurveyRoom = {
      id: roomId,
      link: link,
      surveyId,
      surveyData,
      participants: new Set(),
      submissions: new Set(), // Add this line
      creatorId: creatorId,
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoomById(roomId: string): SurveyRoom {
    return this.rooms.get(roomId);
  }
  closeRoom(roomId: string, userId: string, surveyRoomResultDto : CreateSurveyRoomResultDto, surveyId: number) {
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
  async submitSurveyRoomResults(roomId: string, surveyId:number, surveyRoomResultDto : CreateSurveyRoomResultDto){
    const survey = await this.surveyRepository.findOne({ where: { id: surveyId }, relations: ['questions'] });

    const surveyRoomResultAttempt = new SurveyRoomResult();
    surveyRoomResultAttempt.survey = survey;
    surveyRoomResultAttempt.user = surveyRoomResultDto.user;
    surveyRoomResultAttempt.room = roomId
  
    const createdSurveyRoomResult = await this.surveyRoomResultRepository.save(surveyRoomResultAttempt);
    createdSurveyRoomResult.questionRoomResult = [];
    console.log('przeslane dane:', surveyRoomResultDto);
    console.log('createdSurveyRoomResult after save:', createdSurveyRoomResult);
    if (surveyRoomResultDto.questionRoomResultDto && surveyRoomResultDto.questionRoomResultDto.length > 0) {
      const roomAnswers = await Promise.all(surveyRoomResultDto.questionRoomResultDto.map(async (roomAnswersData, index) => {
          const question = survey.questions[index]; // Pobierz pytanie na podstawie indeksu
  
          // Sprawdź, czy pytanie zostało znalezione
          if (question) {
              const questionRoomResult = this.questionRoomResultRepository.create({
                  ...roomAnswersData,
                  surveyRoomResult: createdSurveyRoomResult,
                  question: question, // Powiąż pytanie z odpowiedzią użytkownika
              });
  
              // Zapisz questionRoomResult do bazy danych
              const savedQuestionRoomResult = await this.questionRoomResultRepository.save(questionRoomResult);
  
              // Dodaj savedQuestionRoomResult do createdSurveyRoomResult.questionRoomResult
              createdSurveyRoomResult.questionRoomResult.push(savedQuestionRoomResult);
  
              return savedQuestionRoomResult;
          } else {
              // Jeśli pytanie nie zostało znalezione, zwróć null
              return null;
          }
      }));
  
      console.log('roomAnswers:', roomAnswers);
      // Usuń ewentualne wartości null z tablicy
      const filteredUserAnswers = roomAnswers.filter((answer) => answer !== null);
      console.log('filteredUserAnswers:', filteredUserAnswers);
  
      // Zaktualizuj dane użytkownika, aby zawierały powiązane pytania
      createdSurveyRoomResult.questionRoomResult = filteredUserAnswers;
  
      // Zaktualizuj createdSurveyRoomResult w bazie danych
      await this.surveyRoomResultRepository.save(createdSurveyRoomResult);
  }

    //return createdFilledSurvey;

    const id = createdSurveyRoomResult.id;
    const submitedSurveyRoomResult = await this.surveyRoomResultRepository.findOne({ where: { id },  relations: ['questionRoomResult'] });
    //console.log(submitedSurvey)
    console.log('submitedSurveyRoomResult:', submitedSurveyRoomResult);
    return submitedSurveyRoomResult;
  }
  joinRoom(roomId: string, participantId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    room.participants.add(participantId);
  }
  // Add methods for managing participants, such as joining and leaving the room
}