import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'elbet_users' })
export class ElbetUser {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    elbet_id: number;

    @Column({ nullable: true })
    agency_name: string;

    @Column({ nullable: true })
    agency_address: string;

    @Column({ nullable: true })
    agency_city: string;

    @Column({ nullable: true })
    agency_code: string;

    @Column({ width: 1, default: 1 })
    agency_active: boolean;

    @Column({ width: 1, default: 1 })
    shop_worker_money_in_out: string;

    @Column({ nullable: true })
    timezone: number;

    @Column({ width: 1, default: 1 })
    use_limit: boolean;

    @Column({ width: 1, default: 0 })
    zero_type: boolean;

    @Column({ nullable: true })
    parent_user: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

}