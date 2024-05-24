import { User } from "src/typeorm/entities/userElm/User";
import { CreateQuestionDto } from "./CreateQuestion.dto";
import { ArrayMaxSize, ArrayMinSize, IsDefined, IsNotEmpty, IsString, Length, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateSurveyDto{
    @IsString({ message: 'Title must be a string.' })
    @IsNotEmpty({ message: 'Title cannot be empty.' })
    @Length(8, 20, { message: `Survey title must be between $constraint1 and $constraint2 characters.` })
    title: string;
    
    @Type(() => CreateQuestionDto)
    @ArrayMinSize(1, { message: 'There must be at least one questioon in Survey.' })
    @ArrayMaxSize(20,{ message: 'There can not be more than 20 questions in Survey'})
    @ValidateNested({ each: true })
    createQuestionDtos: CreateQuestionDto[];
    
    user: User;
}

