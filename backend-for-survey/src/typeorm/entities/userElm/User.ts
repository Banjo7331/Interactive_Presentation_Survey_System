import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Survey } from "../surveyElm/Survey";

@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn({type: 'bigint'})
    id:number;
    @Column({unique: true})
    username: string;
    @Column({unique: true})
    email: string;
    @Column()
    password: string;
    @Column()
    createdAt: Date;

    @OneToMany(() => Survey, survey => survey.user)
    surveys: Survey[];
}
