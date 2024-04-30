import { ArrayMaxSize, ArrayMinSize } from "class-validator";
import { Question } from "src/typeorm/entities/surveyElm/Question";

export class CreateQuestionRoomResultDto{
    title: string;

    type: string;

    question: Question; 
    
    @ArrayMinSize(1,{ message: 'There can not be more than 8 answerss'})
    answer: string[][];
}