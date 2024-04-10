import { Question } from "src/typeorm/entities/surveyElm/Question";

export class CreateQuestionRoomResultDto{
    title: string;

    type: string;

    question: Question; 

    answer: string[][];
}