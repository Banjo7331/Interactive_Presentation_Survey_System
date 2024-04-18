import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/typeorm/entities/surveyElm/Question';
import { Survey } from 'src/typeorm/entities/surveyElm/Survey';
import { Like, Repository } from 'typeorm';
import { CreateSurveyDto } from '../dtos/CreateSurvey.dto';
import { User } from 'src/typeorm/entities/userElm/User';
import { UserService } from 'src/users/services/user.service';
import { CreatedFilledSurveyDto } from '../dtos/CreateFilledSurvey.dto';
import { FilledSurvey, UserChoice } from 'src/typeorm/entities/userElm/UserResponseForSurvey';
import { SurveyRoomResult } from 'src/typeorm/entities/surveyElm/SurveyRoomResult';
import { QuestionRoomResult } from 'src/typeorm/entities/surveyElm/QuestionRoomResult';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SurveyRoomResult)
    private readonly surveyRoomResultRepository: Repository<SurveyRoomResult>,
    @InjectRepository(QuestionRoomResult)
    private readonly questionRoomResultRepository: Repository<QuestionRoomResult>,
    @Inject('USER_SERVICE') private readonly userService:UserService,
  ) {}
    
  async createSurvey(createSurveyData: CreateSurveyDto): Promise<Survey> {
    const createSurvey = createSurveyData;

    const survey = new Survey();
    survey.title = createSurvey.title;
    survey.user = createSurvey.user;
    
    const createdSurvey = await this.surveyRepository.save(survey);

    if (createSurvey.createQuestionDtos && createSurvey.createQuestionDtos.length > 0) {
      const questionEntities = createSurvey.createQuestionDtos.map((questionData) => {
        return this.questionRepository.create({
          ...questionData,
          survey: createdSurvey,
        });
      });
  
      await this.questionRepository.save(questionEntities);

      createdSurvey.questions = questionEntities;
      this.userService.addSurveyToUser(createSurvey.user.id, createdSurvey);
    }
  
    return createdSurvey;
  }

  async getSurveyById(surveyId: number): Promise<Survey | undefined> {
    const id = surveyId;
    const survey = await this.surveyRepository.findOne({ where: { id },  relations: ['questions'] });
    return survey;
  }
  async getSurveysByName(name: string, userId: number): Promise<Survey[]> {
    const surveys = await this.surveyRepository.find({ 
      where: { 
        title: Like(`${name}%`), 
        user: { id: userId }
      }, 
      relations: ['questions', 'user'], 
      take: 4
    });
    return surveys;
  }
  async deleteSurvey(surveyId: number): Promise<void> {
    const id = surveyId;
    const survey = await this.surveyRepository.findOne({ where: { id },  relations: ['questions'] });

    // If the survey doesn't exist, throw an error or handle accordingly
    if (!survey) {
      throw new NotFoundException('Survey not found');
    }
    const surveyRoomResults = await this.surveyRoomResultRepository.find({ where: { survey: { id: surveyId } } });

    for (const surveyRoomResult of surveyRoomResults) {
      await this.questionRoomResultRepository.remove(surveyRoomResult.questionRoomResult);
      await this.surveyRoomResultRepository.remove(surveyRoomResult);
    }
    // Delete the associated questions
    await this.questionRepository.remove(survey.questions);

    // Delete the survey
    await this.surveyRepository.delete(surveyId);
  }

  async submitSurvey(surveyId: number, createFilledSurveyData: CreatedFilledSurveyDto): Promise<FilledSurvey> {
    // Get the survey with its associated questions
    const survey = await this.surveyRepository.findOne({ where: { id: surveyId }, relations: ['questions'] });

    const surveyAttempt = new FilledSurvey();
    surveyAttempt.survey = survey;
    surveyAttempt.user = createFilledSurveyData.user;
    surveyAttempt.name = createFilledSurveyData.name;
  
    // Don't save the surveyAttempt to the database
    const createdFilledSurvey = surveyAttempt;

    if (createFilledSurveyData.userChoices && createFilledSurveyData.userChoices.length > 0) {
      const userAnswers = createFilledSurveyData.userChoices.map((userData, index) => {
          const question = survey.questions[index]; // Pobierz pytanie na podstawie indeksu
    
          // Sprawdź, czy pytanie zostało znalezione
          if (question) {
              const userChoice = new UserChoice();
              Object.assign(userChoice, userData);
              userChoice.question = question;
              return userChoice;
          } else {
              // Jeśli pytanie nie zostało znalezione, zwróć null
              return null;
          }
      });
    
      // Usuń ewentualne wartości null z tablicy
      const filteredUserAnswers = userAnswers.filter((answer) => answer !== null);
    
      // Zaktualizuj dane użytkownika, aby zawierały powiązane pytania
      createdFilledSurvey.userChoices = filteredUserAnswers;
    }
    
    return createdFilledSurvey;
  }
  async getSurveys(userId: number): Promise<Survey[]> {
    // Check if the user exists
    const user = await this.userRepository.findOneBy({id: userId});
  
    if (!user) {
      throw new Error('User not found');
    }
  
    // Get the surveys for the user
    const surveys = await this.surveyRepository.find({ 
      where: { user: { id: userId } },
      relations: ['questions']
    });
  
    return surveys;
  }
  
  
}
