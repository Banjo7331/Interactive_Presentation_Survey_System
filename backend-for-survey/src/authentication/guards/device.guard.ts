import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class DeviceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const deviceId = request.headers['device-id'];
    
    if (!deviceId) {
      throw new HttpException('Device ID is required', HttpStatus.BAD_REQUEST);
    }

    return true;
  }
}