import { Question } from "src/typeorm/entities/surveyElm/Question";
import { CreateQuestionDto } from "./CreateQuestion.dto";
import { ArrayMaxSize, IsArray } from "class-validator";

export class CreateUserChoiceDto {

  @IsArray()
  @ArrayMaxSize(8,{ message: 'There can not be more than 8 possibleChoices'})
  answer: string[];
  
  question: Question;
}