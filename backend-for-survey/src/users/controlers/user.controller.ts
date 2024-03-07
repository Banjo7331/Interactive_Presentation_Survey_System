import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { CreateUserDto } from "../dtos/CreateUser.dto";
import { UserService} from "../services/user.service";
import { UpdateUserDto } from "../dtos/UpdateUser.dto";
import { User } from "src/typeorm/entities/userElm/User";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
  
    @Post('register')
    registerUser(@Body() userData: User) {
      const user = this.userService.registerUser(userData);
      //const authToken = this.userService.generateAuthToken(user);
      return { user,} ///authToken };
    }
}