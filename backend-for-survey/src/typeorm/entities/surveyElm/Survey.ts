import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'surveys' })
export class Survey {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  title: string;

  //@OneToMany(() => Question, (question) => question.survey, { cascade: true })
  //@JoinColumn({ name: 'survey_id' })
  //questions: Question[];

  // Add other properties or relationships as needed

  // ...
}