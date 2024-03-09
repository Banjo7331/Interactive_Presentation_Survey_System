import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "../dtos/CreateUser.dto";
import { UserService} from "../services/user.service";

@Controller('users')
export class UserController {
    constructor(
      @Inject('USER_SERVICE') private readonly userService:UserService,
    ) {}
  
    @Post('register')
    async registerUser(@Body() createUserDto: CreateUserDto){
      const user = await this.userService.registerUser(createUserDto);
    }

    @Post('login')
    loginUser() {
      // This route will be protected by the JWT authentication guard
      // Users need to provide a valid JWT token to access this route
    }
}