import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./Question";
import { SurveyRoomResult } from "./SurveyRoomResult";

@Entity({ name: 'question_room_result' })
export class QuestionRoomResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionId' })
  question: Question; 

  @Column('jsonb')
  answer: string[][];

  @ManyToOne(() => SurveyRoomResult, (surveyRoomResult) => surveyRoomResult.questionRoomResult)
  @JoinColumn({ name: 'surveyRoomResultId' })
  surveyRoomResult: SurveyRoomResult;
}