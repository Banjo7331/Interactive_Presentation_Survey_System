import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserChoice } from "./UserChoice";
import { Survey } from "./Survey";
import { User } from "../userElm/User";


@Entity({ name: 'filled_surveys' })
export class FilledSurvey {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  name: string;
  
  @OneToMany(() => UserChoice, (userChoice) => userChoice.filledSurvey, { eager: true })
  userChoices: UserChoice[];

  @ManyToOne(() => Survey,{ eager: true })
  @JoinColumn({ name: 'surveyId' })
  survey: Survey;
  
}