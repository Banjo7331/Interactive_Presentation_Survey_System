import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/typeorm/entities/userElm/User";
import { Repository } from "typeorm";
import { CreateUserDto } from "../dtos/CreateUser.dto";
import * as bcrypt from 'bcrypt'
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerUser(createUserData: CreateUserDto): Promise<User> {
    const {username} = createUserData;
    const password = bcrypt.hashSync(createUserData.password, 10);
    
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('Username is already taken');
    }
    // If not, create a new user
    const newUser = this.userRepository.create({ username, password, createdAt: new Date() });

    return await this.userRepository.save(newUser);
  }

  findUserByUsername(username: string){
    return this.userRepository.findOne({ where: { username } });
  }
}

