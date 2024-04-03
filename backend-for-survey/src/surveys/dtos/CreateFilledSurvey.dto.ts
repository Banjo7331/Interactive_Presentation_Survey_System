import { User } from "src/typeorm/entities/userElm/User";
import { CreateUserChoiceDto } from "./CreateUserChoice.dto";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { IsNotEmpty, IsString, Length, ValidateNested } from "class-validator";

export class CreatedFilledSurveyDto {

  @IsString()
  @IsNotEmpty()
  @Length(3, 15, { message: `Name for Quiz must be between $constraint1 and $constraint2 characters.` })
  name: string;
  
  @IsNotEmpty()
  @ValidateNested({ each: true })
  userChoices: CreateUserChoiceDto[];

  survey: Survey;
  
  user: User;

}