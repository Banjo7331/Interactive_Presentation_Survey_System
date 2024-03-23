import { User } from "src/typeorm/entities/userElm/User";
import { CreateUserChoiceDto } from "./CreateUserChoice.dto";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";

export class CreatedFilledSurveyDto {

  name: string;
  
  userChoices: CreateUserChoiceDto[];

  survey: Survey;
  
  user: User;

}