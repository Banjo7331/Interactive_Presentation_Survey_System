import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserService } from "src/users/services/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/typeorm/entities/userElm/User";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./LocalStrategy";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]), 
        PassportModule
    ],
    controllers: [AuthController],
    providers:[
        {
            provide: 'AUTH_SERVICE',
            useClass: AuthService,
        },
        {
            provide: 'USER_SERVICE',
            useClass: UserService,
        },
        LocalStrategy
    ],
})
export class AuthModule {};