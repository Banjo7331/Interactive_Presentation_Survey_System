import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserChoice } from "./UserChoice";
import { Survey } from "./Survey";
import { User } from "../userElm/User";
import { QuestionRoomResult } from "./QuestionRoomResult";


@Entity({ name: 'survey_room_results' })
export class SurveyRoomResult {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  room: string;
  
  @OneToMany(() => QuestionRoomResult, (questionRoomResult) => questionRoomResult.surveyRoomResult, { eager: true })
  questionRoomResult: QuestionRoomResult[];

  @ManyToOne(() => Survey,{ eager: true })
  @JoinColumn({ name: 'surveyId' })
  survey: Survey;
  
  @ManyToOne(() => User,{ eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;
}