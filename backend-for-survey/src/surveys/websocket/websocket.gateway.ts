import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway()
export class SurveyWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('surveyCreation')
  handleSurveyCreation(client: Socket, submittedData: any) {
    // Handle WebSocket event for survey creation
    // You can broadcast this event to all connected clients
    this.server.emit('surveyCreated', submittedData);
  }

  // Optionally, you can handle survey submission separately
  @SubscribeMessage('surveySubmission')
  handleSurveySubmission(client: Socket, submittedData: any) {
    // Handle WebSocket event for survey submission
    // You can broadcast this event to all connected clients
    console.log(submittedData)
    this.server.emit('surveySubmitted', submittedData);
  }
}