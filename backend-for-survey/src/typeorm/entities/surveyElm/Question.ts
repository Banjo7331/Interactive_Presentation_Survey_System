import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Survey } from "./Survey";

@Entity({name: 'question'})
export class Question{
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    title: string;

    @Column()
    type: string;

    @Column('jsonb', { nullable: true })
    possibleChoices?: string[];

    @ManyToOne(() =>Survey, (quiz) => quiz.questions)
    @JoinColumn({ name: 'surveyId' })
    survey: Survey;

}