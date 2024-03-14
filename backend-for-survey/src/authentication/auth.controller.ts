import { Body, Controller, Get, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { AuthPayloadDto } from "./dto/auth.dto";
import { AuthService } from "./auth.service";
import { LocalGuard } from "./guards/local.guard";
import { Request } from "express";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { CreateUserDto } from "src/users/dtos/CreateUser.dto";
import { UserService } from "src/users/services/user.service";

@Controller('auth')
export class AuthController{

    constructor(
        @Inject('AUTH_SERVICE') private readonly authService: AuthService,
        @Inject('USER_SERVICE') private readonly userService:UserService,
    ){}
    @UseGuards(LocalGuard)
    @Post('login')
    login(@Req() req: Request){
        return req.user;
    }

    @Get('status')
    @UseGuards(JwtAuthGuard)
    status(@Req() req: Request){
    }
    
    @Post('register')
    async registerUser(@Body() createUserDto: CreateUserDto){
      const user = await this.userService.registerUser(createUserDto);
    }
}