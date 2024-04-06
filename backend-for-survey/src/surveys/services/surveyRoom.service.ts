import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { SurveyRoom } from "../websocket/surveyRoom";
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class SurveyRoomService {
  private readonly rooms: Map<string, SurveyRoom>;

  constructor() {
    this.rooms = new Map();
  }

  createRoom(surveyId: string, surveyData: any,creatorId: string): SurveyRoom {
    const roomId = uuidv4();
    const link = `https://localhost:5731/survey-room/${surveyId}/${roomId}`;
    const room: SurveyRoom = {
      id: roomId,
      link: link,
      surveyId,
      surveyData,
      participants: new Set(),
      submissions: new Set(), // Add this line
      creatorId: creatorId,
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoomById(roomId: string): SurveyRoom {
    return this.rooms.get(roomId);
  }
  closeRoom(roomId: string, userId: string) {
    console.log(this.rooms);
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    if (room.creatorId !== userId) {
      throw new UnauthorizedException('Only the creator of the room can close it');
    }
    this.rooms.delete(roomId);
  }
  joinRoom(roomId: string, participantId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    room.participants.add(participantId);
  }
  // Add methods for managing participants, such as joining and leaving the room
}