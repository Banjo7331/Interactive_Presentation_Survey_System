import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/typeorm/entities/userElm/User';
import { UserService } from 'src/users/services/user.service';
import { AuthPayloadDto } from './dto/auth.dto';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { CreateUserDto } from 'src/users/dtos/CreateUser.dto';

interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

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
  async generateVerificationToken(createUserDto: CreateUserDto) {
    // Generate a unique token with the user's information encoded in it
    // This is just a placeholder implementation.
    const { username, email, password } = createUserDto;

    const payload = { username, email, password };

    const token = jwt.sign(payload, 'abc123', { expiresIn: '1d' });
  
    return token;
  }
  async checkUserExists(username: string, email: string) {
    const existingUser = await this.userService.findUserByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username is already taken', 'USERNAME_CONFLICT');
    }
    const existingUserWithSameEmail = await this.userService.findUserByEmail(email);
    if (existingUserWithSameEmail) {
      throw new ConflictException('Email is already in use', 'EMAIL_CONFLICT');
    }
  }
  async sendVerificationEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      port: 465,
      secure: true,
      service: 'gmail',
      host: 'smtp.gmail.com',
      logger: true,
      debug: true,
      secureConnection: false,
      auth: {
        user: 'surveycomptest@gmail.com',
        pass: 'gbfg dkop obwm xgaz',
      },
      tls: {
        rejectUnauthorized: false,
      }
    });

    const mailOptions = {
      from: 'surveycomptest@gmail.com',
      to: email,
      subject: 'Email Verification',
      html: `
        <h1>Email Verification</h1>
        <p>Please verify your email by clicking on the following button:</p>
        <a href="http://localhost:5173/verify-email?token=${token}" style="background-color: #4CAF50; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 12px;">Verify Email</a>
        <p>After verification, you will be redirected to:</p>
        <a href="http://localhost:5173">http://localhost:5173</a>
      `,
    };
    console.log("TOKENISKO",token);
    await transporter.sendMail(mailOptions);
  }

  async verifyTempUser(token: string) {
    try {
      // Verify the token and get the user's information
      const createUserDto = jwt.verify(token, 'abc123') as CreateUserDto;
      console.log("FAKIN USER ",createUserDto);
      return createUserDto;
    } catch (error) {
      console.log('Token verification failed:', error);
      return null;
    }
  }
}