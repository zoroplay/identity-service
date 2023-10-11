import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_details' })
export class UserDetail {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column()
    phone_number: string;

    @Column({ nullable: false })
    country: string;

    @Column({ nullable: false })
    state: string;

    @Column({ nullable: false })
    city: string;

    @Column({ nullable: false })
    address: string;

    @Column({ nullable: false })
    gender: string;

    @Column({ nullable: false })
    date_of_birth: string;

    @Column({ default: 0 })
    status: number;

    @Column()
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

}