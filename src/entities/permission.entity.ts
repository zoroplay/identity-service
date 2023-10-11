import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'permissions' })
export class Permission {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 300, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    description: string;

    @Column()
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}