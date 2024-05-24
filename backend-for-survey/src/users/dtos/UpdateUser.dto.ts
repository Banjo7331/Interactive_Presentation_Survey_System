import { IsNotEmpty, IsString, Length } from "class-validator";

export class UpdateUserDto{
    username: string;
    
    @IsString({ message: 'Password must be a string.' })
    @IsNotEmpty({ message: 'Password cannot be empty.' })
    @Length(8, 25, { message: `Password must be between $constraint1 and $constraint2 characters.` })
    password: string;
}