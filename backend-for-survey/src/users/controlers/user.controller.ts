import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, UseGuards ,Request} from "@nestjs/common";
import { UserService} from "../services/user.service";
import { JwtAuthGuard } from "src/authentication/guards/jwt.guard";

@Controller('users')
export class UserController {
    constructor(
      @Inject('USER_SERVICE') private readonly userService:UserService,
    ) {}
    @UseGuards(JwtAuthGuard)
    @Put('password')
    async updatePassword(@Request() req, @Body('newPassword') newPassword: string,@Body('oldPassword') oldPassword: string) {
      const user = req.user;
      return this.userService.updatePassword(user.id, oldPassword, newPassword);
    }

    @UseGuards(JwtAuthGuard)
    @Get('data')
    async getUser(@Request() req) {
      const user = req.user;
      return this.userService.findUserById(user.id);
    }
    
}