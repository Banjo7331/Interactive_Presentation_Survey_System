import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Survey } from "./Survey";
import { User } from "../userElm/User";
import { UserChoice } from "./UserChoice";

@Entity({ name: 'filled_surveys' })
export class FilledSurvey {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;
  
  @ManyToOne(() => Survey)
  @JoinColumn({ name: 'surveyId' })
  survey: Survey;
  
  @Column()
  userId: User;

  @OneToMany(() => UserChoice, (question) => question.filledSurvey)
  choices: UserChoice[];
}