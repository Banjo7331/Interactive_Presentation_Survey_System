import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./Question";
import { FilledSurvey } from "./FilledSurvey";

Entity({ name: 'user_choice' })
export class UserChoice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionId' })
  question: Question; 

  @Column()
  quizAttemptId: number;

  @Column('jsonb')
  answer: string[];

  @ManyToOne(() => FilledSurvey, (filledSurvey) => filledSurvey.choices)
  filledSurvey: FilledSurvey;
}

