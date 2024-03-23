import { Question } from "src/typeorm/entities/surveyElm/Question";
import { CreateQuestionDto } from "./CreateQuestion.dto";

export class CreateUserChoiceDto {
  answer: string[];
  question: Question;
}