import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/typeorm/entities/surveyElm/Question';
import { Survey } from 'src/typeorm/entities/surveyElm/Survey';
import { Repository } from 'typeorm';
import { CreateSurveyDto } from '../dtos/CreateSurvey.dto';
import { User } from 'src/typeorm/entities/userElm/User';
import { UserService } from 'src/users/services/user.service';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
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
    return await this.surveyRepository.findOneBy({id});
  }
  async deleteSurvey(surveyId: number): Promise<void> {
    const id = surveyId;
    const survey = await this.surveyRepository.findOne({ where: { id },  relations: ['questions'] });

    // If the survey doesn't exist, throw an error or handle accordingly
    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    // Delete the associated questions
    await this.questionRepository.remove(survey.questions);

    // Delete the survey
    await this.surveyRepository.delete(surveyId);
  }

  async submitSurvey(surveyId: number, submissionData: any): Promise<any> {
    // Get the survey with its associated questions
    const survey = await this.surveyRepository.findOne({ where: { id: surveyId }, relations: ['questions'] });


    // Process the valid submission
    const processedSubmission = this.processSubmission(survey.questions, submissionData);

    // Your logic to store or process the submission data in the database

    return processedSubmission;
  }

  private processSubmission(questions: Question[], submissionData: any): any {
    // Process the submission, for example, store it in the database
    // This can vary based on your application requirements

    // For illustration purposes, assuming you want to associate each question with its selected choice
    const processedSubmission = questions.map((question) => ({
      questionId: question.id,
      selectedChoice: submissionData[question.id],
    }));

    return processedSubmission;
  }
}
