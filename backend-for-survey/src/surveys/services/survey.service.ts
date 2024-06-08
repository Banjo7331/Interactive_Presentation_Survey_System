import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/typeorm/entities/surveyElm/Question';
import { Survey } from 'src/typeorm/entities/surveyElm/Survey';
import { EntityManager, Like, Repository } from 'typeorm';
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
    private readonly entityManager: EntityManager
  ) {}
    
  async createSurvey(createSurveyData: CreateSurveyDto): Promise<Survey> {
    return this.entityManager.transaction(async (transactionalEntityManager) => {
      const createSurvey = createSurveyData;

      const survey = new Survey();
      survey.title = createSurvey.title;
      survey.user = createSurvey.user;
      
      const createdSurvey = await transactionalEntityManager.save(Survey, survey);

      if (createSurvey.createQuestionDtos && createSurvey.createQuestionDtos.length > 0) {
        const questionEntities = createSurvey.createQuestionDtos.map((questionData) => {
          return transactionalEntityManager.create(Question, {
            ...questionData,
            survey: createdSurvey,
          });
        });
    
        await transactionalEntityManager.save(Question, questionEntities);

        createdSurvey.questions = questionEntities;
      }
    
      return createdSurvey;
    });
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
    return this.entityManager.transaction(async (transactionalEntityManager) => {
      const survey = await transactionalEntityManager.findOne(Survey, { where: { id: surveyId }, relations: ['questions'] });

      if (!survey) {
        throw new NotFoundException('Survey not found');
      }

      const surveyRoomResults = await transactionalEntityManager.find(SurveyRoomResult, { where: { survey: { id: surveyId } } });

      for (const surveyRoomResult of surveyRoomResults) {
        await transactionalEntityManager.remove(QuestionRoomResult, surveyRoomResult.questionRoomResult);
        await transactionalEntityManager.remove(SurveyRoomResult, surveyRoomResult);
      }

      await transactionalEntityManager.remove(Question, survey.questions);

      await transactionalEntityManager.delete(Survey, surveyId);
    });
  }

  async submitSurvey(surveyId: number, createFilledSurveyData: CreatedFilledSurveyDto): Promise<FilledSurvey> {
    const survey = await this.surveyRepository.findOne({ where: { id: surveyId }, relations: ['questions'] });

    const surveyAttempt = new FilledSurvey();
    surveyAttempt.survey = survey;
    surveyAttempt.name = createFilledSurveyData.name;
  
    const createdFilledSurvey = surveyAttempt;

    if (createFilledSurveyData.userChoices && createFilledSurveyData.userChoices.length > 0) {
      const userAnswers = createFilledSurveyData.userChoices.map((userData, index) => {
          const question = survey.questions[index]; 
    
          if (question) {
              const userChoice = new UserChoice();
              Object.assign(userChoice, userData);
              userChoice.question = question;
              return userChoice;
          } else {
              return null;
          }
      });
    
      const filteredUserAnswers = userAnswers.filter((answer) => answer !== null);
    
      createdFilledSurvey.userChoices = filteredUserAnswers;
    }
    
    return createdFilledSurvey;
  }
  async getSurveys(userId: number): Promise<Survey[]> {
    const user = await this.userRepository.findOneBy({id: userId});
  
    if (!user) {
      throw new Error('User not found');
    }
  
    const surveys = await this.surveyRepository.find({ 
      where: { user: { id: userId } },
      relations: ['questions']
    });
  
    return surveys;
  }
  
  
}
