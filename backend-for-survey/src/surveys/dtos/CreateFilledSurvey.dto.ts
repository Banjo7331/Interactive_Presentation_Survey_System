import { User } from "src/typeorm/entities/userElm/User";
import { CreateUserChoiceDto } from "./CreateUserChoice.dto";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { ArrayMaxSize, ArrayMinSize, IsNotEmpty, IsString, Length, ValidateNested } from "class-validator";

export class CreatedFilledSurveyDto {

  @IsString()
  @IsNotEmpty()
  @Length(3, 15, { message: `Name for Quiz must be between $constraint1 and $constraint2 characters.` })
  name: string;
  
  @IsNotEmpty()
  @ArrayMinSize(1, { message: 'There must be at least one answer for survey in FilledSurvey.' })
  @ArrayMaxSize(20,{ message: 'There can not be more than 20 answer for survey in FilledSurvey'})
  @ValidateNested({ each: true })
  userChoices: CreateUserChoiceDto[];
  
  survey: Survey;
  
  //user: User;
  

}