import { Survey } from "../../survey-activities/survey.entity";

export interface FilledSurvey {
    name: string;
    userChoices: UserChoice[];
    survey: Survey;
    user: any; 
  }

export interface UserChoice {
    answer: any[]; 
}