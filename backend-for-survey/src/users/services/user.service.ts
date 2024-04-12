import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/typeorm/entities/userElm/User";
import { Repository } from "typeorm";
import { CreateUserDto } from "../dtos/CreateUser.dto";
import * as bcrypt from 'bcrypt'
import { CreateSurveyDto } from "src/surveys/dtos/CreateSurvey.dto";
import { Survey } from "src/typeorm/entities/surveyElm/Survey";
import { SurveyRoomResult } from "src/typeorm/entities/surveyElm/SurveyRoomResult";
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerUser(createUserData: CreateUserDto): Promise<User> {
    console.log('Registering user:', createUserData);
  
    const {username,email} = createUserData;
    const password = bcrypt.hashSync(createUserData.password, 10);
    
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      console.error('Username is already taken:', username);
      throw new Error('Username is already taken');
    }
    const existingUserWithSameEmail = await this.userRepository.findOne({ where: { email } });
    if (existingUserWithSameEmail) {
      console.error('Email is already in use:', email);
      throw new Error('Email is already in use');
    }
    const isVerified = true;
    const newUser = this.userRepository.create({ username, password,email,isVerified, createdAt: new Date() });
    console.log('New user:', newUser);
  
    return await this.userRepository.save(newUser);
    //console.log('Saved user:', savedUser);
  }
  async updateUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
  async findUserByUsername(username: string){
    return this.userRepository.findOne({ where: { username } });
  }
  async findUserById(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }
  async addSurveyToUser(userId: number, survey: Survey): Promise<User> {
    const id = userId
    const user = await this.userRepository.findOneBy({id});

    if (!user) {
      throw new Error('User not found');
    }
    if (!user.surveys) {
      user.surveys = [];
    }
    
    user.surveys.push(survey);

    // Save the user with the updated surveys array
    await this.userRepository.save(user);

    return user;
  }

  async isVerified(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
  
    if (!user) {
      throw new BadRequestException('User not found');
    }
  
    return user.isVerified;
  }

  
}
