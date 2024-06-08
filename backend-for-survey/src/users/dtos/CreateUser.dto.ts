import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateUserDto{
    @IsString({ message: 'UserName must be a string.' })
    @IsNotEmpty({ message: 'UserName cannot be empty.' })
    @Length(8, 25, { message: `UserName must be between $constraint1 and $constraint2 characters.` })
    username: string;

    @IsString({ message: 'Password must be a string.' })
    @IsNotEmpty({ message: 'Password cannot be empty.' })
    @Length(8, 25, { message: `Password must be between $constraint1 and $constraint2 characters.` })
    password: string;
    
    @IsString({ message: 'Title must be a string.' })
    @IsNotEmpty({ message: 'Username cannot be empty.' })
    email: string;
}