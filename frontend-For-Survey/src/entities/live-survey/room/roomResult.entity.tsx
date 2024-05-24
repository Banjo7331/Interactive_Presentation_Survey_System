import { Question } from "../../survey-activities/survey.entity";

export interface QuestionRoomResult {
    id: string;
    question: Question;
    answer: string[][];
  }
  
export interface SurveyRoomResult {
    id: string;
    surveyId: string;
    questionRoomResult: QuestionRoomResult[];
    room: string;
  }