import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class DeviceGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const deviceId = request.headers['device-id'];

    if (!deviceId) {
      throw new ForbiddenException('No device-id header in request');
    }

    return true;
  }
}