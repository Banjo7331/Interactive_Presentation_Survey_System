import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SurveyRoomService } from '../services/surveyRoom.service';
import { CreateSurveyRoomResultDto } from '../dtos/CreateSurveyRoomResult.dto';

@Injectable()
@WebSocketGateway()
export class SurveyWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly socketRoomMap = new Map<string, string>();
  private readonly socketUserMap = new Map<string, string>();

  constructor(private readonly surveyRoomService: SurveyRoomService) {  
  }
  @SubscribeMessage('joiningUser')
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.server.emit('userJoined'); // Emit 'userJoined' event when a new connection is established
  }

  @SubscribeMessage('roomCreation')
  handleRoomCreation(client: Socket, { roomId, userId }: { roomId: string, userId: string }) {
    this.socketRoomMap.set(client.id, roomId);
    console.log("room creation in webosckegateway  userId: ", userId, "roomId: ", roomId);
    this.socketUserMap.set(client.id, userId);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const roomId = this.socketRoomMap.get(client.id);
    const userId = this.socketUserMap.get(client.id);
    console.log(roomId, userId);
    if (roomId && userId) {
      const room = await this.surveyRoomService.getRoomById(roomId);
      if (room) {
        const surveyId = null; // Null value
        const surveyRoomResultDto: CreateSurveyRoomResultDto = {
          survey: null, // or default value
          user: null, // or default value
          questionRoomResultDto: null, // or default value
        };
        this.surveyRoomService.closeRoom(roomId, userId, surveyRoomResultDto, surveyId);
      };
    }
    this.socketRoomMap.delete(client.id);
    this.socketUserMap.delete(client.id);
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