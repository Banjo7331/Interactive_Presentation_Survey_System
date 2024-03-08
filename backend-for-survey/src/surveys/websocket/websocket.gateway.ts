import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/survey', transports: ['websocket'] })
export class SurveyWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  handleSurveyCreation(submittedData: any) {
    // Handle WebSocket event for survey submission
    // You can broadcast this event to all connected clients
    this.server.emit('surveyCreation', submittedData);
  }
  handleSurveySubmission(submittedData: any) {
    this.server.emit('surveyCreation', submittedData);
  }
}