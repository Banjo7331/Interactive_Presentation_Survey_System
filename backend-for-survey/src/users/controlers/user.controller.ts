import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "../dtos/CreateUser.dto";
import { UserService} from "../services/user.service";
import { AuthGuard } from "@nestjs/passport";

@Controller('users')
export class UserController {
    constructor(
      @Inject('USER_SERVICE') private readonly userService:UserService,
    ) {}
  

}