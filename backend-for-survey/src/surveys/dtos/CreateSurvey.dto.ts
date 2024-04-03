import { User } from "src/typeorm/entities/userElm/User";
import { CreateQuestionDto } from "./CreateQuestion.dto";
import { IsNotEmpty, ValidateNested } from "class-validator";

export class CreateSurveyDto{
    title: string;
    
    @IsNotEmpty()
    @ValidateNested({ each: true })
    createQuestionDtos: CreateQuestionDto[];
    
    user: User;
}