import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Role, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @Column()
    code: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    username: string;

    @Column({ length: 100, nullable: true })
    password: string;

    @Column({ nullable: true })
    lastLogin: string;

    @Column({ nullable: true })
    auth_code: string;

    @Column({ nullable: true })
    virtual_token: string;

    @Column({ nullable: true })
    registration_source: string;

    @Column({ default: false })
    verified: boolean;

    @Column({ default: 0 })
    status: number;

    @Column()
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

}