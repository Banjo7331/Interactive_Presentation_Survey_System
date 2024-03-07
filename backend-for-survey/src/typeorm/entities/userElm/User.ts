import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn({type: 'bigint'})
    id:number;
    @Column({unique: true})
    username: string;
    @Column()
    password: string;
    @Column()
    createdAt: Date;
    @Column({nullable: true})
    authStrategy: string;

}
