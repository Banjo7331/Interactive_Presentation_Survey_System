import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserService } from "src/users/services/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/typeorm/entities/userElm/User";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { SurveyRoomService } from "src/surveys/services/surveyRoom.service";

@Module({
    imports:[
        TypeOrmModule.forFeature([User]), 
        PassportModule,
        JwtModule.register({
            secret: 'abc123',
            signOptions: {expiresIn: '1h'}
        })
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
        LocalStrategy,
        JwtStrategy
    ],
})
export class AuthModule {};