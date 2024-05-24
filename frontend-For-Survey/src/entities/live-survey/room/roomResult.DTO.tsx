import { Question } from "../../survey-activities/survey.entity";

export interface SurveyRoomResultDto {
    questionRoomResultDto: QuestionRoomResultDto[];
  }

export interface QuestionRoomResultDto {
    title: string;
    type: string;
    question: Question;
    answer: string[][];
}
  
  