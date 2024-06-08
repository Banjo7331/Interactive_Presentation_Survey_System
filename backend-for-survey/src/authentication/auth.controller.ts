import { BadRequestException, Body, Controller, Get, Inject, Post, Query, Req, UseGuards } from "@nestjs/common";
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
      await this.authService.checkUserExists(createUserDto.username, createUserDto.email);
      const token = await this.authService.generateVerificationToken(createUserDto);
      return await this.authService.sendVerificationEmail(createUserDto.email, token);
    }

    @Get('verify')
    async verifyEmail(@Query('token') token: string) {
      console.log('Token:', token);
      try {
        const createUserDto = await this.authService.verifyTempUser(token);
        
        console.log('User DTO:', createUserDto);
        if (createUserDto) {
          console.log('a')
          return await this.userService.registerUser(createUserDto);
        }
      } catch (error) {
        throw new BadRequestException('Invalid verification token.');
      }
    }

    @Get('is-verified')
    async isVerified(@Query('email') email: string) {
      
      const isVerified = await this.userService.isVerified(email);
      return { isVerified };
    }
}