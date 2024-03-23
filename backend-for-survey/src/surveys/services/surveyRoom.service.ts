import { Injectable } from "@nestjs/common";
import { SurveyRoom } from "../websocket/surveyRoom";
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class SurveyRoomService {
  private readonly rooms: Map<string, SurveyRoom>;

  constructor() {
    this.rooms = new Map();
  }

  createRoom(surveyId: string, surveyData: any): SurveyRoom {
    const roomId = uuidv4();
    const room: SurveyRoom = {
      id: roomId,
      surveyId,
      surveyData,
      participants: new Set(),
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoomById(roomId: string): SurveyRoom {
    return this.rooms.get(roomId);
  }

  // Add methods for managing participants, such as joining and leaving the room
}