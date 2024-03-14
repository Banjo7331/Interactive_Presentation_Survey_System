import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/typeorm/entities/userElm/User';
import { UserService } from 'src/users/services/user.service';
import { AuthPayloadDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly userService:UserService,
    private jwtService: JwtService)
  {}

  async validateUser({username, password}: AuthPayloadDto){
    const userF = await this.userService.findUserByUsername(username);
    if(userF && bcrypt.compareSync(password, userF.password)){
      console.log(userF);
      const {password, ...user} = userF
      return this.jwtService.sign(user)
    }
  }

}