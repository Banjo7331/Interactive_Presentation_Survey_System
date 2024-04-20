import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { QuestionType } from "src/enums/question-type.enum";

export class CreateQuestionDto{
    @IsNotEmpty()
    @IsString()
    title: string;
    
    @IsEnum(QuestionType)
    @IsNotEmpty()
    @IsString()
    type: string;
    
    @IsArray()
    @ArrayMaxSize(8,{ message: 'There can not be more than 8 possibleChoices'})
    possibleChoices?: string[];
}