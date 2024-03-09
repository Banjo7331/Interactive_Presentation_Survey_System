import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/typeorm/entities/userElm/User";
import { UserController } from "./controlers/user.controller";
import { UserService } from "./services/user.service";
import { AuthService } from "src/authentication/auth.service";

@Module({
    imports: [TypeOrmModule.forFeature([User]),
    ],
    controllers: [UserController],
    providers: [
      {
        provide: 'USER_SERVICE',
        useClass: UserService,
      },
    ]
  })
  export class UsersModule {}