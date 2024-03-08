import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./Question";

@Entity({ name: 'surveys' })
export class Survey {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  title: string;

  @OneToMany(() => Question, (question) => question.survey)
  questions: Question[];
}

