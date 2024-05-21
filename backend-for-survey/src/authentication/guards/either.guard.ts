import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt.guard";
import { DeviceGuard } from "./device.guard";
@Injectable()
export class EitherGuard implements CanActivate {
  constructor(private readonly jwtGuard: JwtAuthGuard, private readonly deviceGuard: DeviceGuard) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    try {
      const result = await Promise.resolve(this.jwtGuard.canActivate(context));
      if (result) {
        return true;
      }
    } catch (error) {
      // JwtAuthGuard failed, try DeviceGuard
    }

    try {
      const result = await Promise.resolve(this.deviceGuard.canActivate(context));
      if (result) {
        return true;
      }
    } catch (error) {
      // DeviceGuard also failed
    }

    return false;
  }
}