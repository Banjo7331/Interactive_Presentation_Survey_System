import { ArrayMaxSize, ArrayMinSize, IsNotEmpty, ValidateNested } from "class-validator";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { User } from "src/typeorm/entities/userElm/User";
import { CreateQuestionRoomResultDto } from "./CreateQuestionRoomResult.dto";

export class CreateSurveyRoomResultDto {

    
    survey: Survey;
    
    user: User;
    
    @ArrayMinSize(1, { message: 'There must be at least one questioon in Survey.' })
    @ArrayMaxSize(20,{ message: 'There can not be more than 20 questions in Survey'})
    @ValidateNested({ each: true })
    questionRoomResultDto: CreateQuestionRoomResultDto[];

}