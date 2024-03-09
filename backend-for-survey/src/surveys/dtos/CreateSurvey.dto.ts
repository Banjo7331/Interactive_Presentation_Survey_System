import { CreateQuestionDto } from "./CreateQuestion.dto";

export class CreateSurveyDto{
    title: string;
    
    createQuestionDtos: CreateQuestionDto[];
}