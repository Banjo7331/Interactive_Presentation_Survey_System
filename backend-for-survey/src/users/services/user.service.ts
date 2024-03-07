import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/typeorm/entities/userElm/User";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerUser(userData: any): Promise<User> {
    const { username, password } = userData;
    
    // Check if the username is already taken
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('Username is already taken');
    }

    // If not, create a new user
    const newUser = this.userRepository.create({ username, password, createdAt: new Date() });
    return await this.userRepository.save(newUser);
  }

  generateAuthToken(user: User): string {
    // Implement your logic for generating an authentication token (JWT or any other method)
    // Example: Using a simple timestamp as a token
    return new Date().getTime().toString();
  }
}

