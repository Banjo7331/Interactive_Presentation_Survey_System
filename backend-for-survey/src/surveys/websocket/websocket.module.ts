import { Module } from '@nestjs/common';
import { SurveyWebSocketGateway } from './websocket.gateway';

@Module({
  providers: [SurveyWebSocketGateway],
})
export class WebSocketModule {}