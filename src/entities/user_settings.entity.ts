import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_settings' })
export class UserSetting {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column('decimal', { precision: 8, scale: 2 })
    daily_deposit_limit: number;

    @Column('decimal', { precision: 8, scale: 2 })
    weekly_deposit_limit: number;

    @Column('decimal', { precision: 8, scale: 2 })
    monthly_deposit_limit: number;

    @Column()
    self_exclusion_period: string;

    @Column()
    exclude_from: string;

    @Column({ type: 'tinyint', width: 1, default: 1 })
    email_communication: number;

    @Column({ type: 'tinyint', width: 1, default: 1 })
    sms_communications: number;

    @Column({ type: 'tinyint', width: 1, default: 1 })
    promotional_pop_up: number;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;


}