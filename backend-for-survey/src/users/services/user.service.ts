import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
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
    console.log('Registering user:', createUserData);
  
    const {username,email} = createUserData;
    const password = bcrypt.hashSync(createUserData.password, 10);
    
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      console.error('Username is already taken:', username);
      throw new ConflictException('Username is already taken', 'USERNAME_CONFLICT');
    }
    const existingUserWithSameEmail = await this.userRepository.findOne({ where: { email } });
    if (existingUserWithSameEmail) {
      console.error('Email is already in use:', email);
      throw new ConflictException('Email is already in use', 'EMAIL_CONFLICT');
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
  async updatePassword(id: number, oldPassword: string,newPassword: string): Promise<void> {
    const user = await this.userRepository.findOneBy({id});

    if (!user) {
      throw new Error('User not found');
    }

    const isOldPasswordCorrect = bcrypt.compareSync(oldPassword, user.password);

    if (!isOldPasswordCorrect) {
      throw new Error('Old password is incorrect');
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await this.userRepository.update(id, { password: hashedPassword });
  }
  async findUserByUsername(username: string){
    return this.userRepository.findOne({ where: { username } });
  }
  async findUserByEmail(email: string){
    return this.userRepository.findOne({ where: { email } });
  }
  async findUserById(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }
  
  async isVerified(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
  
    if (!user) {
      throw new BadRequestException('User not found');
    }
  
    return user.isVerified;
  }

  
}
