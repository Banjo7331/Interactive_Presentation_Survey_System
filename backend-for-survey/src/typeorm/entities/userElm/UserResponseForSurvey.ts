import { Question } from "../surveyElm/Question";
import { Survey } from "../surveyElm/Survey";
import { User } from "./User";

export class UserChoice {
    id: number;
    question: Question;
    answer: string[];
    filledSurvey: FilledSurvey;
  }
  
  export class FilledSurvey {
    id: number;
    name: string;
    userChoices: UserChoice[];
    survey: Survey;
    user: User;
}