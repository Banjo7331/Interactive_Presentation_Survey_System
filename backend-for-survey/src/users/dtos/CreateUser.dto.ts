import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateUserDto{
    @IsString({ message: 'Title must be a string.' })
    @IsNotEmpty({ message: 'Title cannot be empty.' })
    @Length(3, 25, { message: `Title for Question must be between $constraint1 and $constraint2 characters.` })
    
    username: string;
    
    password: string;
    
    @IsString({ message: 'Title must be a string.' })
    @IsNotEmpty({ message: 'Username cannot be empty.' })
    email: string;
}