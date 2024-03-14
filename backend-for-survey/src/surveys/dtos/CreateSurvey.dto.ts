import { User } from "src/typeorm/entities/userElm/User";
import { CreateQuestionDto } from "./CreateQuestion.dto";

export class CreateSurveyDto{
    title: string;
    
    createQuestionDtos: CreateQuestionDto[];
    
    user: User;
}