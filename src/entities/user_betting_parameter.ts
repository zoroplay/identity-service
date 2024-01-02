import {Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne,} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserBettingParameter {
    @PrimaryGeneratedColumn({ type: "bigint"})
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Index()
    @Column({ type: "varchar", length: 20, nullable: true, default: 'day' })
    period: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 0 })
    max_payout: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 100 })
    max_odd_length_single: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default:  1000000})
    max_odd_length_combi: number;

    @Index()
    @Column({ type: "int", nullable: true, default: 1 })
    min_ticket_size: number;

    @Index()
    @Column({ type: "int", nullable: true, default: 40 })
    max_ticket_size: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 100 })
    min_stake_single: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 5000 })
    max_stake_single: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 100 })
    min_stake_combi: number;

    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 10000 })
    max_stake_combi: number;

    @Index()
    @Column({ type: "int", nullable: true, default: 300 })
    max_cancel_time: number;

    @Index()
    @Column({ type: "int", nullable: true, default: 5 })
    daily_cancel_limit: number;
    
    @Index()
    @Column({ type: "decimal", precision: 20, scale: 2, nullable: true, default: 10000 })
    hold_bets: number;
    
    @Index()
    @CreateDateColumn()
    created: string;

    @Index()
    @UpdateDateColumn()
    updated: string;

}