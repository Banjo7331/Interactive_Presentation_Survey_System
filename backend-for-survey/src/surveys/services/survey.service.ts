import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Survey } from 'src/typeorm/entities/surveyElm/Survey';
import { Repository } from 'typeorm';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
  ) {}
    
  async createSurvey(title: string): Promise<Survey> {
    const newSurvey = this.surveyRepository.create({ title });
    return await this.surveyRepository.save(newSurvey);
  }

  async getSurveyById(surveyId: number): Promise<Survey | undefined> {
    const id = surveyId;
    return await this.surveyRepository.findOneBy({id});
  }
}
