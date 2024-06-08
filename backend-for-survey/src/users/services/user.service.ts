import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/typeorm/entities/userElm/User";
import { EntityManager, Repository } from "typeorm";
import { CreateUserDto } from "../dtos/CreateUser.dto";
import * as bcrypt from 'bcrypt'


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager
  ) {}
  async registerUser(createUserData: CreateUserDto): Promise<User> {
    return this.entityManager.transaction(async (transactionalEntityManager) => {
      const { username, email } = createUserData;
      const password = await bcrypt.hash(createUserData.password, 10);

      const existingUser = await transactionalEntityManager.findOne(User, { where: { username } });
      if (existingUser) {
        throw new ConflictException('Username is already taken', 'USERNAME_CONFLICT');
      }

      const existingUserWithSameEmail = await transactionalEntityManager.findOne(User, { where: { email } });
      if (existingUserWithSameEmail) {
        throw new ConflictException('Email is already in use', 'EMAIL_CONFLICT');
      }

      const isVerified = true;
      const newUser = transactionalEntityManager.create(User, { username, password, email, isVerified, createdAt: new Date() });

      return await transactionalEntityManager.save(newUser);
    });
  }
  async updateUser(user: User): Promise<User> {
    return this.entityManager.transaction(async (transactionalEntityManager) => {
      return await transactionalEntityManager.save(user);
    });
  }
  async updatePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    return this.entityManager.transaction(async (transactionalEntityManager) => {
      const user = await transactionalEntityManager.findOne(User, { where: { id } });

      if (!user) {
        throw new Error('User not found');
      }

      const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

      if (!isOldPasswordCorrect) {
        throw new Error('Old password is incorrect');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await transactionalEntityManager.update(User, id, { password: hashedPassword });
    });
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
