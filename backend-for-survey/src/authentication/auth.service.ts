import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/userElm/User';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/users/services/user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly userService:UserService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findUserByUsername(username);
    if(user && user.password === password){

        console.log(user);
        return user;
    }
    return null;
  }
}