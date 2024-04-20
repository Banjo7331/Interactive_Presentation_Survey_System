import { IsNotEmpty, ValidateNested } from "class-validator";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { User } from "src/typeorm/entities/userElm/User";
import { CreateQuestionRoomResultDto } from "./CreateQuestionRoomResult.dto";

export class CreateSurveyRoomResultDto {

    
    survey: Survey;
    
    user: User;
    
    @IsNotEmpty()
    @ValidateNested({ each: true })
    questionRoomResultDto: CreateQuestionRoomResultDto[];

}