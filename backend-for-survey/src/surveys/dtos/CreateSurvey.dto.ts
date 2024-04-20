import { User } from "src/typeorm/entities/userElm/User";
import { CreateQuestionDto } from "./CreateQuestion.dto";
import { ArrayMinSize, IsDefined, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateSurveyDto{
    @IsString({ message: 'Title must be a string.' })
    @IsNotEmpty({ message: 'Title cannot be empty.' })
    title: string;
    
    @Type(() => CreateQuestionDto)
    @ArrayMinSize(1, { message: 'There must be at least one questioon in Survey.' })
    @ValidateNested({ each: true })
    createQuestionDtos: CreateQuestionDto[];
    
    user: User;
}