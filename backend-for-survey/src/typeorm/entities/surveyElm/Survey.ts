import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./Question";
import { User } from "../userElm/User";

@Entity({ name: 'surveys' })
export class Survey {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  title: string;

  @OneToMany(() => Question, (question) => question.survey)
  questions: Question[];
  
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, user => user.surveys, { nullable: true })
  user: User; 
}

